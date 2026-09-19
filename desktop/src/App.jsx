import React, { useState, useEffect } from 'react';
import { 
  Book, Edit3, Search, Sun, Moon, LayoutPanelTop, 
  Plus, Copy, Trash2, Play, BookOpen
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TurndownService from 'turndown';
import { marked } from 'marked';

import { 
  getSermons, createSermon, updateSermon, deleteSermon, duplicateSermon, 
  getBibleVerses, searchBible 
} from './services/api';
import PreacherMode from './components/PreacherMode';
import StatusBar from './components/StatusBar';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('explorer'); // 'explorer', 'bible', 'search'
  const [showBiblePanel, setShowBiblePanel] = useState(true);
  const [isPreacherMode, setIsPreacherMode] = useState(false);

  // Estados de Sermones
  const [sermons, setSermons] = useState([]);
  const [activeSermon, setActiveSermon] = useState(null);
  const [sermonHtml, setSermonHtml] = useState('');
  const [saveStatus, setSaveStatus] = useState('Guardado');
  const [isOffline, setIsOffline] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Estados de Metadatos
  const [sermonTitle, setSermonTitle] = useState('');
  const [sermonStatus, setSermonStatus] = useState('borrador');
  const [sermonDate, setSermonDate] = useState('');
  const [sermonLocation, setSermonLocation] = useState('');
  const [sermonPassage, setSermonPassage] = useState('');

  // Estados de Biblia Multiversión (RVR1960, NVI, TLA)
  const [bibleVersion, setBibleVersion] = useState('RVR1960');
  const [currentBook, setCurrentBook] = useState(43); // 43 = Juan, 1 = Génesis, 45 = Romanos, 19 = Salmos
  const [currentChapter, setCurrentChapter] = useState(3);
  const [verses, setVerses] = useState([]);
  const [bibleQuery, setBibleQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Aplicar clase .light al elemento raíz
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // 1. Cargar Sermones de la API / Cache
  const loadSermons = async () => {
    const res = await getSermons();
    setSermons(res.data);
    setIsOffline(res.isOffline);
    if (res.data.length > 0 && !activeSermon) {
      selectSermon(res.data[0]);
    }
  };

  useEffect(() => {
    loadSermons();
  }, []);

  // 2. Seleccionar Sermón
  const selectSermon = (sermon) => {
    setActiveSermon(sermon);
    setSermonTitle(sermon.title || '');
    setSermonHtml(sermon.content_html || marked.parse(sermon.content_markdown || ''));
    setSermonStatus(sermon.status || 'borrador');
    setSermonDate(sermon.preach_date || '');
    setSermonLocation(sermon.location || '');
    setSermonPassage(sermon.main_passage || '');
  };

  // 3. Autoguardado con Debounce (1 segundo)
  useEffect(() => {
    if (!activeSermon) return;

    setSaveStatus('Guardando...');
    const timer = setTimeout(async () => {
      const turndownService = new TurndownService({ headingStyle: 'atx' });
      const markdown = turndownService.turndown(sermonHtml);
      
      const textOnly = sermonHtml.replace(/<[^>]*>/g, ' ');
      const words = textOnly.trim().split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);

      const payload = {
        title: sermonTitle,
        content_markdown: markdown,
        content_html: sermonHtml,
        status: sermonStatus,
        preach_date: sermonDate || null,
        location: sermonLocation || null,
        main_passage: sermonPassage || null
      };

      await updateSermon(activeSermon.id, payload);
      setSaveStatus('Guardado');

      setSermons(prev => prev.map(s => s.id === activeSermon.id ? { ...s, ...payload } : s));
    }, 1000);

    return () => clearTimeout(timer);
  }, [sermonHtml, sermonTitle, sermonStatus, sermonDate, sermonLocation, sermonPassage, activeSermon]);

  // 4. Cargar Versículos Bíblicos según Versión, Libro y Capítulo
  useEffect(() => {
    const fetchVerses = async () => {
      const res = await getBibleVerses(currentBook, currentChapter, bibleVersion);
      setVerses(res.data);
    };
    fetchVerses();
  }, [currentBook, currentChapter, bibleVersion]);

  // 5. Crear Nuevo Sermón
  const handleCreateSermon = async () => {
    const name = prompt("Título del nuevo sermón / apunte:");
    if (!name) return;
    const newSermon = await createSermon({
      title: name,
      content_markdown: `# ${name}\n\nEscribe tu bosquejo aquí...`,
      content_html: `<h1>${name}</h1><p>Escribe tu bosquejo aquí...</p>`,
      status: 'borrador'
    });
    setSermons([newSermon, ...sermons]);
    selectSermon(newSermon);
  };

  // 6. Duplicar / Reutilizar Sermón
  const handleDuplicateSermon = async () => {
    if (!activeSermon) return;
    const cloned = await duplicateSermon(activeSermon.id);
    if (cloned) {
      setSermons([cloned, ...sermons]);
      selectSermon(cloned);
    }
  };

  // 7. Eliminar Sermón
  const handleDeleteSermon = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar este sermón permanentemente?")) return;
    await deleteSermon(id);
    const updated = sermons.filter(s => s.id !== id);
    setSermons(updated);
    if (activeSermon?.id === id) {
      setActiveSermon(updated.length > 0 ? updated[0] : null);
    }
  };

  // 8. Inserción de Versículo en 1 Clic (Incluyendo la versión elegida)
  const insertVerseToSermon = (bookName, verseNum, text) => {
    if (!activeSermon) return;
    const verseQuote = `<blockquote class="border-l-4 border-blue-500 pl-3 my-2 italic font-serif"><strong>${bookName} ${currentChapter}:${verseNum} (${bibleVersion})</strong> - "${text}"</blockquote><p></p>`;
    setSermonHtml(prev => prev + verseQuote);
  };

  // 9. Búsqueda Bíblica
  const handleBibleSearch = async (e) => {
    e.preventDefault();
    if (!bibleQuery) return;
    const res = await searchBible(bibleQuery, bibleVersion);
    setSearchResults(res);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDarkMode ? 'bg-[#0F111A] text-[#A6ACCD]' : 'bg-[#F8F6F0] text-[#374151]'}`}>
      
      {/* Top IDE Window Bar */}
      <div className={`h-10 border-b flex items-center px-4 justify-between text-xs font-semibold select-none ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-white' : 'bg-[#EFECE6] border-[#D5D1C6] text-gray-900'}`}>
        <div className="flex items-center space-x-4">
          <span className="font-bold tracking-wider text-blue-600 dark:text-blue-400">BIBLIOTECA PASTORAL v2</span>
          <span className="opacity-40">|</span>
          <span className="hover:text-blue-500 cursor-pointer">Archivo</span>
          <span className="hover:text-blue-500 cursor-pointer">Sermones</span>
          <span className="hover:text-blue-500 cursor-pointer">Biblia</span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowBiblePanel(!showBiblePanel)}
            className={`p-1 rounded transition-colors ${showBiblePanel ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-500/20'}`}
            title="Mostrar / Ocultar Visor Bíblico"
          >
            <LayoutPanelTop size={15} />
          </button>
          {activeSermon && (
            <button 
              onClick={() => setIsPreacherMode(true)}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-bold transition-all shadow-sm"
              title="Iniciar Modo Predicador"
            >
              <Play size={12} /> Modo Predicador
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Activity Bar Left */}
        <div className={`w-14 flex flex-col items-center py-4 border-r space-y-6 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-[#E4E1D8] border-[#D5D1C6]'}`}>
          <button 
            onClick={() => setActiveTab('explorer')}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'explorer' ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            title="Explorador de Sermones"
          >
            <Edit3 size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('bible')}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'bible' ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            title="Librería Bíblica"
          >
            <Book size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'search' ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            title="Buscador Bíblico"
          >
            <Search size={22} />
          </button>

          <div className="flex-1"></div>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-indigo-600 hover:text-indigo-800'}`}
            title="Cambiar Tema (Oscuro / Claro)"
          >
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>

        {/* Primary Side Panel */}
        <div className={`w-64 border-r flex flex-col ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E]' : 'bg-[#EFECE6] border-[#D5D1C6]'}`}>
          <div className={`h-10 px-4 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'border-[#2A2E3E] text-gray-400' : 'border-[#D5D1C6] text-gray-700'}`}>
            <span>{activeTab === 'explorer' ? 'Sermones y Apuntes' : activeTab === 'bible' ? 'Librería Bíblica' : 'Buscador'}</span>
            {activeTab === 'explorer' && (
              <button 
                onClick={handleCreateSermon}
                className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded transition-colors"
                title="Nuevo Sermón"
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-2">
            {activeTab === 'explorer' && (
              sermons.map(s => (
                <div 
                  key={s.id}
                  onClick={() => selectSermon(s)}
                  className={`group p-2.5 rounded-lg cursor-pointer transition-all flex flex-col gap-1 border ${activeSermon?.id === s.id ? (isDarkMode ? 'bg-[#202433] border-blue-500/50 text-white' : 'bg-white border-blue-500 text-gray-900 shadow-sm') : (isDarkMode ? 'border-transparent hover:bg-gray-800/30 text-gray-300' : 'border-transparent hover:bg-gray-300/40 text-gray-800')}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{s.title}</span>
                    <button 
                      onClick={(e) => handleDeleteSermon(e, s.id)}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${s.status === 'borrador' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : s.status === 'listo' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-green-500/20 text-green-600 dark:text-green-400'}`}>
                      {s.status}
                    </span>
                    {s.main_passage && <span className="truncate opacity-75">{s.main_passage}</span>}
                  </div>
                </div>
              ))
            )}

            {activeTab === 'bible' && (
              <div className="text-xs space-y-3">
                {/* Selector de Versión Bíblica (RVR1960, NVI, TLA) */}
                <div className="flex flex-col gap-1">
                  <label className={`font-bold uppercase text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Versión Bíblica:</label>
                  <select 
                    value={bibleVersion}
                    onChange={(e) => setBibleVersion(e.target.value)}
                    className={`border rounded p-1.5 focus:outline-none font-bold ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-blue-400' : 'bg-white border-[#D5D1C6] text-blue-700'}`}
                  >
                    <option value="RVR1960">Reina Valera 1960 (RVR1960)</option>
                    <option value="NVI">Nueva Versión Internacional (NVI)</option>
                    <option value="TLA">Lenguaje Actual (TLA)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`font-bold uppercase text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Libro:</label>
                  <select 
                    value={currentBook}
                    onChange={(e) => { setCurrentBook(parseInt(e.target.value)); setCurrentChapter(1); }}
                    className={`border rounded p-1.5 focus:outline-none ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}
                  >
                    <option value={1}>Génesis</option>
                    <option value={19}>Salmos</option>
                    <option value={43}>Juan</option>
                    <option value={45}>Romanos</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`font-bold uppercase text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Capítulo:</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentChapter(prev => Math.max(1, prev - 1))} className={`border px-2.5 py-1 rounded font-bold ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}>-</button>
                    <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentChapter}</span>
                    <button onClick={() => setCurrentChapter(prev => prev + 1)} className={`border px-2.5 py-1 rounded font-bold ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}>+</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <form onSubmit={handleBibleSearch} className="space-y-3">
                <input 
                  type="text"
                  placeholder="Buscar versículo o palabra (ej: fe)..."
                  value={bibleQuery}
                  onChange={(e) => setBibleQuery(e.target.value)}
                  className={`w-full border rounded p-2 text-xs focus:outline-none ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}
                />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded text-xs font-bold">
                  Buscar en {bibleVersion}
                </button>

                <div className="space-y-2 mt-3">
                  {searchResults.map((r, i) => (
                    <div key={i} className={`p-2 rounded border text-xs space-y-1 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-white border-[#D5D1C6] text-gray-900'}`}>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{r.book_name} {r.chapter}:{r.verse} ({r.version || bibleVersion})</span>
                      <p className="italic opacity-85">{r.scripture}</p>
                    </div>
                  ))}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Central Split Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Split 1: Visor Bíblico Multiversión (Top Split) */}
          {showBiblePanel && (
            <div className={`h-1/2 border-b flex flex-col ${isDarkMode ? 'bg-[#0F111A] border-[#2A2E3E]' : 'bg-[#F8F6F0] border-[#D5D1C6]'}`}>
              <div className={`h-8 px-4 flex items-center justify-between border-b text-xs font-semibold ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-blue-400' : 'bg-[#EFECE6] border-[#D5D1C6] text-blue-700'}`}>
                <span className="flex items-center gap-1.5"><BookOpen size={14} /> Biblia Versión: <strong>{bibleVersion}</strong></span>
                <span className="text-[10px] opacity-75">Haz clic en un versículo para insertarlo en el sermón</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-2 text-sm leading-relaxed">
                {verses.length > 0 ? (
                  verses.map(v => (
                    <p 
                      key={v.id || v.verse}
                      onClick={() => insertVerseToSermon(v.book_name || 'Juan', v.verse, v.scripture)}
                      className={`p-1.5 rounded cursor-pointer transition-colors group flex items-start gap-2 ${isDarkMode ? 'hover:bg-blue-500/10 text-gray-200' : 'hover:bg-blue-600/10 text-gray-900'}`}
                      title="Haz clic para insertar en el sermón"
                    >
                      <sup className="text-blue-600 dark:text-blue-400 font-bold mt-1 select-none">{v.verse}</sup>
                      <span className="flex-1">{v.scripture}</span>
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                        + Insertar ({bibleVersion})
                      </span>
                    </p>
                  ))
                ) : (
                  <p className="opacity-50 italic text-xs">Cargando versículos de la versión {bibleVersion}...</p>
                )}
              </div>
            </div>
          )}

          {/* Split 2: Editor de Sermones (Bottom Split) */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {activeSermon ? (
              <>
                {/* Sermon Header / Metadata Bar */}
                <div className={`p-4 border-b flex flex-wrap gap-4 items-center justify-between ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-[#EFECE6] border-[#D5D1C6]'}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    <input 
                      type="text"
                      value={sermonTitle}
                      onChange={(e) => setSermonTitle(e.target.value)}
                      className={`bg-transparent text-lg font-bold focus:outline-none border-b border-transparent focus:border-blue-500 w-full ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      placeholder="Título del Sermón..."
                    />
                  </div>

                  {/* Metadata Fields */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <label className="uppercase font-bold text-[10px] opacity-75">Estado:</label>
                      <select 
                        value={sermonStatus}
                        onChange={(e) => setSermonStatus(e.target.value)}
                        className={`border rounded px-2 py-1 focus:outline-none text-xs font-semibold ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}
                      >
                        <option value="borrador">Borrador</option>
                        <option value="listo">Listo para Predicar</option>
                        <option value="predicado">Predicado</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="uppercase font-bold text-[10px] opacity-75">Pasaje:</label>
                      <input 
                        type="text"
                        value={sermonPassage}
                        onChange={(e) => setSermonPassage(e.target.value)}
                        placeholder="Ej: Juan 3:16"
                        className={`border rounded px-2 py-1 focus:outline-none w-28 text-xs ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}
                      />
                    </div>

                    <button 
                      onClick={handleDuplicateSermon}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors text-xs font-semibold border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-[#D5D1C6] text-gray-900 hover:bg-gray-100'}`}
                      title="Reutilizar / Duplicar Sermón"
                    >
                      <Copy size={12} /> Reutilizar
                    </button>
                  </div>
                </div>

                {/* Editor Content Canvas */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ReactQuill 
                    theme="snow"
                    value={sermonHtml}
                    onChange={setSermonHtml}
                    modules={quillModules}
                    placeholder="Redacta los puntos principales de tu sermón aquí..."
                    className="flex-1 flex flex-col h-full"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center opacity-50 italic text-sm">
                Selecciona o crea un sermón en el explorador para comenzar.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Status Bar Bottom */}
      <StatusBar 
        wordCount={wordCount}
        isOffline={isOffline}
        activeSermonTitle={sermonTitle}
        saveStatus={saveStatus}
      />

      {/* Preacher Mode Fullscreen Modal */}
      {isPreacherMode && (
        <PreacherMode 
          sermon={activeSermon}
          onClose={() => setIsPreacherMode(false)}
          isDarkMode={isDarkMode}
        />
      )}

    </div>
  );
}
