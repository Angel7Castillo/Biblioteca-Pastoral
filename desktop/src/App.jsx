import React, { useState, useEffect } from 'react';
import { 
  Book, Edit3, Search, Sun, Moon, LayoutPanelTop, 
  Plus, Copy, Trash2, Play, BookOpen, RefreshCw, CheckCircle2, AlertCircle, Save, Type, MoveVertical, Printer
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TurndownService from 'turndown';
import { marked } from 'marked';

import { 
  getSermons, createSermon, updateSermon, deleteSermon, duplicateSermon, 
  getBibleVerses, searchBible, getBibleBooks, getBibleChapters, updateProxmoxServer, getSystemStatus
} from './services/api';
import PreacherMode from './components/PreacherMode';
import StatusBar from './components/StatusBar';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('explorer'); // 'explorer', 'bible', 'search'
  const [showBiblePanel, setShowBiblePanel] = useState(true);
  const [isPreacherMode, setIsPreacherMode] = useState(false);
  const [isUpdatingServer, setIsUpdatingServer] = useState(false);
  const [serverNotice, setServerNotice] = useState(null);
  const [serverCommit, setServerCommit] = useState('');

  // Estados de Sermones
  const [sermons, setSermons] = useState([]);
  const [activeSermon, setActiveSermon] = useState(null);
  const [sermonHtml, setSermonHtml] = useState('');
  const [saveStatus, setSaveStatus] = useState('Guardado');
  const [isOffline, setIsOffline] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [sermonSearchQuery, setSermonSearchQuery] = useState('');

  // Estados de Metadatos
  const [sermonTitle, setSermonTitle] = useState('');
  const [sermonStatus, setSermonStatus] = useState('borrador');
  const [sermonDate, setSermonDate] = useState('');
  const [sermonLocation, setSermonLocation] = useState('');
  const [sermonPassage, setSermonPassage] = useState('');

  // Estados de Biblia Multiversión (RVR1960, NVI, TLA)
  const [bibleVersion, setBibleVersion] = useState('RVR1960');
  const [currentBook, setCurrentBook] = useState(43); // 43 = Juan
  const [currentChapter, setCurrentChapter] = useState(3);
  const [currentVerseFilter, setCurrentVerseFilter] = useState('');
  const [booksList, setBooksList] = useState([]);
  const [chaptersList, setChaptersList] = useState([]);
  const [verses, setVerses] = useState([]);

  // Estados de Búsqueda
  const [bibleQuery, setBibleQuery] = useState('');
  const [searchVersionFilter, setSearchVersionFilter] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Preferencias de Lectura y Escritura (Accesibilidad / Tamaño de Texto y Ventana)
  const [bibleFontSize, setBibleFontSize] = useState(() => parseInt(localStorage.getItem('bibleFontSize')) || 16);
  const [editorFontSize, setEditorFontSize] = useState(() => parseInt(localStorage.getItem('editorFontSize')) || 16);
  const [biblePanelHeight, setBiblePanelHeight] = useState(() => localStorage.getItem('biblePanelHeight') || '50%');

  useEffect(() => {
    localStorage.setItem('bibleFontSize', bibleFontSize);
  }, [bibleFontSize]);

  useEffect(() => {
    localStorage.setItem('editorFontSize', editorFontSize);
  }, [editorFontSize]);

  useEffect(() => {
    localStorage.setItem('biblePanelHeight', biblePanelHeight);
  }, [biblePanelHeight]);

  // Aplicar clase .light al elemento raíz
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Asignar tooltips explicativos a los botones de la barra de herramientas del editor
  useEffect(() => {
    const timer = setTimeout(() => {
      const bq = document.querySelector('.ql-blockquote');
      if (bq) bq.setAttribute('title', 'Cita / Bloque de Cita Bíblica');
      const b = document.querySelector('.ql-bold');
      if (b) b.setAttribute('title', 'Negrita');
      const i = document.querySelector('.ql-italic');
      if (i) i.setAttribute('title', 'Cursiva');
      const u = document.querySelector('.ql-underline');
      if (u) u.setAttribute('title', 'Subrayado');
      const ol = document.querySelector('.ql-list[value="ordered"]');
      if (ol) ol.setAttribute('title', 'Lista Numerada');
      const ul = document.querySelector('.ql-list[value="bullet"]');
      if (ul) ul.setAttribute('title', 'Lista con Viñetas');
      const cl = document.querySelector('.ql-clean');
      if (cl) cl.setAttribute('title', 'Limpiar Formato');
    }, 500);
    return () => clearTimeout(timer);
  }, [activeSermon]);

  // 1. Cargar Lista de Libros al cambiar de versión
  useEffect(() => {
    const fetchBooks = async () => {
      const list = await getBibleBooks(bibleVersion);
      setBooksList(list);
    };
    fetchBooks();
  }, [bibleVersion]);

  // 2. Cargar Lista de Capítulos al cambiar de libro
  useEffect(() => {
    const fetchChapters = async () => {
      const list = await getBibleChapters(currentBook, bibleVersion);
      setChaptersList(list);
    };
    fetchChapters();
  }, [currentBook, bibleVersion]);

  // 3. Cargar Sermones de la API / Cache
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
    const fetchStatus = async () => {
      const res = await getSystemStatus();
      if (res && res.commit) {
        setServerCommit(res.commit);
      }
    };
    fetchStatus();
  }, []);

  // 4. Seleccionar Sermón
  const selectSermon = (sermon) => {
    setActiveSermon(sermon);
    setSermonTitle(sermon.title || '');
    setSermonHtml(sermon.content_html || marked.parse(sermon.content_markdown || ''));
    setSermonStatus(sermon.status || 'borrador');
    setSermonDate(sermon.preach_date || '');
    setSermonLocation(sermon.location || '');
    setSermonPassage(sermon.main_passage || '');
  };

  // 5. Autoguardado con Debounce (1 segundo)
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

  // 5b. Guardar Sermón Manualmente al hacer clic en el botón Guardar
  const handleManualSave = async () => {
    if (!activeSermon) return;
    setSaveStatus('Guardando...');
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
    setSaveStatus('¡Guardado!');
    setTimeout(() => setSaveStatus('Guardado'), 3000);

    setSermons(prev => prev.map(s => s.id === activeSermon.id ? { ...s, ...payload } : s));
  };

  // 6. Cargar TODO el capítulo bíblico (para mantener el contexto completo)
  useEffect(() => {
    const fetchVerses = async () => {
      const res = await getBibleVerses(currentBook, currentChapter, bibleVersion);
      setVerses(res.data);
    };
    fetchVerses();
  }, [currentBook, currentChapter, bibleVersion]);

  // Autodesplazamiento suave al versículo seleccionado cuando se especifica un filtro
  useEffect(() => {
    if (currentVerseFilter && verses.length > 0) {
      const el = document.getElementById(`verse-${currentVerseFilter}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  }, [currentVerseFilter, verses]);

  // 7. Crear Nuevo Sermón
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

  // 8. Duplicar / Reutilizar Sermón
  const handleDuplicateSermon = async () => {
    if (!activeSermon) return;
    const cloned = await duplicateSermon(activeSermon.id);
    if (cloned) {
      setSermons([cloned, ...sermons]);
      selectSermon(cloned);
    }
  };

  // 9. Eliminar Sermón
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

  // 10. Inserción de Versículo en 1 Clic (Incluyendo la versión elegida)
  const insertVerseToSermon = (bookName, verseNum, text, verName = bibleVersion) => {
    if (!activeSermon) return;
    const verseQuote = `<blockquote class="border-l-4 border-blue-500 pl-3 my-2 italic font-serif"><strong>${bookName} ${currentChapter}:${verseNum} (${verName})</strong> - "${text}"</blockquote><p></p>`;
    setSermonHtml(prev => prev + verseQuote);
  };

  // 11. Búsqueda Bíblica (por palabra o referencia "Juan 3:16")
  const handleBibleSearch = async (e) => {
    e.preventDefault();
    if (!bibleQuery) return;
    const res = await searchBible(bibleQuery, searchVersionFilter);
    setSearchResults(res);
  };

  // 12. Ir directamente a un pasaje desde los resultados de búsqueda
  const jumpToSearchResult = (result) => {
    if (result.version) {
      setBibleVersion(result.version);
    }
    setCurrentBook(result.book_number);
    setCurrentChapter(result.chapter);
    setCurrentVerseFilter(result.verse);
    setShowBiblePanel(true);
  };

  // 13. Buscar e Instalar Actualización del Servidor Proxmox
  const handleUpdateProxmox = async () => {
    setIsUpdatingServer(true);
    setServerNotice({ type: 'info', text: 'Buscando actualizaciones...' });
    const res = await updateProxmoxServer();
    setIsUpdatingServer(false);
    if (res.success) {
      setServerNotice({ 
        type: 'success', 
        text: '¡El sistema se encuentra actualizado a la última versión!' 
      });
      setTimeout(() => setServerNotice(null), 5000);
    } else {
      setServerNotice({ 
        type: 'error', 
        text: 'El sistema ya se encuentra en la versión más reciente.' 
      });
      setTimeout(() => setServerNotice(null), 5000);
    }
  };

  // 14. Imprimir Sermón en Formato A4 / Exportar a PDF
  const handlePrintSermon = () => {
    if (!activeSermon) return;
    window.print();
  };

  const currentBookName = booksList.find(b => b.book_number === currentBook)?.book_name || 'Juan';

  const filteredSermons = sermons.filter(s => {
    if (!sermonSearchQuery.trim()) return true;
    const q = sermonSearchQuery.toLowerCase().trim();
    const matchTitle = (s.title || '').toLowerCase().includes(q);
    const matchPassage = (s.main_passage || '').toLowerCase().includes(q);
    const matchTopic = (s.location || '').toLowerCase().includes(q);
    const matchContent = (s.content_markdown || s.content_html || '').toLowerCase().includes(q);
    return matchTitle || matchPassage || matchTopic || matchContent;
  });

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
      
      {/* Floating System Notice Banner */}
      {serverNotice && (
        <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md select-none z-50 ${serverNotice.type === 'success' ? 'bg-emerald-600 text-white' : serverNotice.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white animate-pulse'}`}>
          <div className="flex items-center gap-2">
            {serverNotice.type === 'success' && <CheckCircle2 size={16} />}
            {serverNotice.type === 'error' && <AlertCircle size={16} />}
            {serverNotice.type === 'info' && <RefreshCw size={16} className="animate-spin" />}
            <span>{serverNotice.text}</span>
          </div>
          <button onClick={() => setServerNotice(null)} className="opacity-80 hover:opacity-100 font-bold px-2">✕</button>
        </div>
      )}

      {/* Top IDE Window Bar */}
      <div className={`h-10 border-b flex items-center px-4 justify-between text-xs font-semibold select-none ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-white' : 'bg-[#EFECE6] border-[#D5D1C6] text-gray-900'}`}>
        <div className="flex items-center space-x-3">
          <span className="font-bold tracking-wider text-blue-600 dark:text-blue-400">BIBLIOTECA PASTORAL</span>
          <span className="text-[10px] px-2 py-0.5 rounded font-sans font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20" title="Versión 2.0 (Última versión disponible)">
            v2.0 • Última versión
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleUpdateProxmox}
            disabled={isUpdatingServer}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all shadow-sm ${isUpdatingServer ? 'bg-blue-600/50 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 active:scale-95'}`}
            title="Buscar e instalar la última versión disponible desde GitHub"
          >
            <RefreshCw size={12} className={isUpdatingServer ? 'animate-spin' : ''} />
            <span>{isUpdatingServer ? 'Buscando actualización...' : '⚡ Buscar actualización'}</span>
          </button>
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
            className={`p-2 rounded-lg transition-colors bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold`}
            title="Mis Sermones y Apuntes"
          >
            <Edit3 size={22} />
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

        {/* Primary Side Panel (Sermones y Apuntes) */}
        <div className={`w-64 border-r flex flex-col ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E]' : 'bg-[#EFECE6] border-[#D5D1C6]'}`}>
          <div className={`h-10 px-4 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'border-[#2A2E3E] text-gray-400' : 'border-[#D5D1C6] text-gray-700'}`}>
            <span>Sermones y Apuntes</span>
            <button 
              onClick={handleCreateSermon}
              className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded transition-colors"
              title="Nuevo Sermón"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Buscador de Sermones y Apuntes (por título o versículo/pasaje) */}
          <div className={`p-2.5 border-b ${isDarkMode ? 'border-[#2A2E3E]' : 'border-[#D5D1C6]'}`}>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 opacity-50" />
              <input 
                type="text"
                placeholder="Buscar por título, verso o tema..."
                value={sermonSearchQuery}
                onChange={(e) => setSermonSearchQuery(e.target.value)}
                className={`w-full border rounded pl-8 pr-6 py-1.5 text-xs focus:outline-none ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-white placeholder-gray-500' : 'bg-white border-[#D5D1C6] text-gray-900 placeholder-gray-400'}`}
              />
              {sermonSearchQuery && (
                <button 
                  onClick={() => setSermonSearchQuery('')}
                  className="absolute right-2 top-1.5 opacity-60 hover:opacity-100 text-xs font-bold px-1"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-2">
            {filteredSermons.length > 0 ? (
              filteredSermons.map(s => (
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
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] opacity-90">
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${s.status === 'borrador' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : s.status === 'listo' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-green-500/20 text-green-600 dark:text-green-400'}`}>
                      {s.status}
                    </span>
                    {s.main_passage && <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[100px]">📖 {s.main_passage}</span>}
                    {s.location && <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[90px] bg-emerald-500/10 px-1 rounded">🏷️ {s.location}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs opacity-50 text-center py-6 italic select-none">
                No se encontraron sermones o apuntes para "{sermonSearchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Central Split Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Split 1: Visor Bíblico Multiversión (Top Split) */}
          {showBiblePanel && (
            <div 
              style={{ height: biblePanelHeight }}
              className={`border-b flex flex-col relative transition-all duration-150 ${isDarkMode ? 'bg-[#0F111A] border-[#2A2E3E]' : 'bg-[#F8F6F0] border-[#D5D1C6]'}`}
            >
              {/* Header Navegador Bíblico Directo e Intuitivo */}
              <div className={`p-2 px-4 flex flex-wrap items-center justify-between gap-3 border-b text-xs select-none ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-white' : 'bg-[#EFECE6] border-[#D5D1C6] text-gray-900'}`}>
                
                {/* Filtros Separados Fijos (Versión, Libro, Capítulo, Versículo) */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <BookOpen size={16} /> Biblia:
                  </span>

                  {/* 1. Versión */}
                  <select 
                    value={bibleVersion}
                    onChange={(e) => setBibleVersion(e.target.value)}
                    className={`border rounded px-2 py-1 font-bold text-xs focus:outline-none ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-blue-400' : 'bg-white border-[#D5D1C6] text-blue-700'}`}
                    title="Seleccionar Versión Bíblica"
                  >
                    <option value="RVR1960">RVR1960</option>
                    <option value="NVI">NVI</option>
                    <option value="TLA">TLA</option>
                  </select>

                  {/* 2. Libro (66 Libros) */}
                  <select 
                    value={currentBook}
                    onChange={(e) => { 
                      setCurrentBook(parseInt(e.target.value)); 
                      setCurrentChapter(1); 
                      setCurrentVerseFilter(''); 
                    }}
                    className={`border rounded px-2.5 py-1 font-bold text-xs focus:outline-none max-w-[150px] ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}
                    title="Seleccionar Libro"
                  >
                    {booksList.length > 0 ? (
                      booksList.map(b => (
                        <option key={b.book_number} value={b.book_number}>{b.book_name}</option>
                      ))
                    ) : (
                      <>
                        <option value={1}>Génesis</option>
                        <option value={19}>Salmos</option>
                        <option value={40}>Mateo</option>
                        <option value={43}>Juan</option>
                        <option value={45}>Romanos</option>
                        <option value={66}>Apocalipsis</option>
                      </>
                    )}
                  </select>

                  {/* 3. Capítulo con Botones - y + */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => { setCurrentChapter(prev => Math.max(1, prev - 1)); setCurrentVerseFilter(''); }}
                      className={`border px-2 py-0.5 rounded font-bold ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white hover:bg-gray-800' : 'bg-white border-[#D5D1C6] text-gray-900 hover:bg-gray-100'}`}
                      title="Capítulo anterior"
                    >-</button>
                    <select 
                      value={currentChapter}
                      onChange={(e) => { setCurrentChapter(parseInt(e.target.value)); setCurrentVerseFilter(''); }}
                      className={`border rounded px-2 py-1 font-bold text-xs focus:outline-none text-center ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}
                      title="Seleccionar Capítulo"
                    >
                      {(chaptersList.length > 0 ? chaptersList : Array.from({ length: 50 }, (_, i) => i + 1)).map(ch => (
                        <option key={ch} value={ch}>Cap. {ch}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => { setCurrentChapter(prev => prev + 1); setCurrentVerseFilter(''); }}
                      className={`border px-2 py-0.5 rounded font-bold ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white hover:bg-gray-800' : 'bg-white border-[#D5D1C6] text-gray-900 hover:bg-gray-100'}`}
                      title="Capítulo siguiente"
                    >+</button>
                  </div>

                  {/* 4. Versículo Especifico (Opcional) */}
                  <select 
                    value={currentVerseFilter}
                    onChange={(e) => setCurrentVerseFilter(e.target.value)}
                    className={`border rounded px-2 py-1 text-xs focus:outline-none ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}
                    title="Resaltar Versículo Especifico"
                  >
                    <option value="">Todo el capítulo</option>
                    {Array.from({ length: verses.length || 50 }, (_, i) => i + 1).map(v => (
                      <option key={v} value={v}>Versículo {v}</option>
                    ))}
                  </select>

                  {currentVerseFilter && (
                    <button 
                      onClick={() => setCurrentVerseFilter('')}
                      className="text-amber-500 hover:text-red-500 font-bold text-xs flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded"
                      title="Quitar resalte"
                    >
                      🎯 Ver todo ✕
                    </button>
                  )}
                </div>

                {/* Formulario de Búsqueda por Palabra y Ajustes de Vista Biblia */}
                <div className="flex items-center gap-2.5 flex-1 min-w-[280px] justify-end flex-wrap">
                  
                  {/* Ajustes de Lectura: Tamaño de Letra y Altura del Panel */}
                  <div className="flex items-center gap-1.5 border-r border-gray-500/20 pr-2">
                    
                    {/* Control A- / A+ Letra Biblia */}
                    <div className={`flex items-center gap-1 border rounded px-1.5 py-0.5 ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E]' : 'bg-white border-[#D5D1C6]'}`} title="Ajustar tamaño de letra para lectura bíblica">
                      <Type size={12} className="text-blue-500 dark:text-blue-400" />
                      <button 
                        type="button"
                        onClick={() => setBibleFontSize(prev => Math.max(12, prev - 2))}
                        className="px-1 font-bold hover:text-blue-500 text-xs cursor-pointer select-none"
                        title="Disminuir tamaño de letra de la Biblia"
                      >A-</button>
                      <span className="font-mono text-[11px] font-bold text-blue-500 dark:text-blue-400 px-0.5">{bibleFontSize}px</span>
                      <button 
                        type="button"
                        onClick={() => setBibleFontSize(prev => Math.min(32, prev + 2))}
                        className="px-1 font-bold hover:text-blue-500 text-xs cursor-pointer select-none"
                        title="Aumentar tamaño de letra de la Biblia"
                      >A+</button>
                    </div>

                    {/* Selector de Altura del Visor Bíblico */}
                    <div className={`flex items-center gap-1 border rounded px-1.5 py-0.5 ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E]' : 'bg-white border-[#D5D1C6]'}`} title="Ajustar la altura del panel de la Biblia">
                      <MoveVertical size={12} className="text-emerald-500 dark:text-emerald-400" />
                      <select 
                        value={biblePanelHeight}
                        onChange={(e) => setBiblePanelHeight(e.target.value)}
                        className={`bg-transparent text-[11px] font-bold focus:outline-none cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        <option value="35%">Alto: 35%</option>
                        <option value="50%">Alto: 50%</option>
                        <option value="65%">Alto: 65%</option>
                        <option value="80%">Alto: 80%</option>
                      </select>
                    </div>

                  </div>

                  {/* Campo de Búsqueda Teológica */}
                  <form onSubmit={handleBibleSearch} className="flex items-center gap-1.5">
                    <div className="relative w-full max-w-[200px]">
                      <Search size={13} className="absolute left-2.5 top-2.5 opacity-50" />
                      <input 
                        type="text"
                        placeholder="Buscar palabra..."
                        value={bibleQuery}
                        onChange={(e) => setBibleQuery(e.target.value)}
                        className={`w-full border rounded pl-8 pr-2 py-1 text-xs focus:outline-none ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-bold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Buscar</span>
                    </button>
                  </form>
                </div>

              </div>

              {/* Drawer de Resultados de Búsqueda por Palabra */}
              {searchResults.length > 0 && (
                <div className={`p-3 border-b max-h-48 overflow-y-auto z-20 shadow-lg ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-[#EFECE6] border-[#D5D1C6]'}`}>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-500/20 text-xs font-bold">
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      🔍 Resultados para "{bibleQuery}": {searchResults.length} versículos
                    </span>
                    <button 
                      onClick={() => setSearchResults([])}
                      className="text-gray-400 hover:text-red-400 text-xs font-bold px-1.5 py-0.5 rounded bg-gray-500/10"
                    >
                      Cerrar resultados ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {searchResults.map((r, i) => (
                      <div key={i} className={`p-2 rounded border space-y-1 ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E]' : 'bg-white border-[#D5D1C6] text-gray-900 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {r.book_name} {r.chapter}:{r.verse}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-blue-500/20 text-blue-600 dark:text-blue-400">
                            {r.version || bibleVersion}
                          </span>
                        </div>
                        <p className="italic opacity-90 line-clamp-2">{r.scripture}</p>
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-500/10 text-[10px]">
                          <button 
                            type="button"
                            onClick={() => insertVerseToSermon(r.book_name, r.verse, r.scripture, r.version || bibleVersion)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                          >
                            + Insertar
                          </button>
                          <span>•</span>
                          <button 
                            type="button"
                            onClick={() => { jumpToSearchResult(r); setSearchResults([]); }}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                          >
                            📖 Ir al pasaje en contexto
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visor de Versículos (Muestra todo el capítulo con el versículo objetivo resaltado) */}
              <div 
                style={{ fontSize: `${bibleFontSize}px`, lineHeight: 1.6 }}
                className="flex-1 p-4 overflow-y-auto space-y-2 leading-relaxed"
              >
                {verses.length > 0 ? (
                  verses.map(v => {
                    const isHighlighted = currentVerseFilter && parseInt(currentVerseFilter) === v.verse;
                    return (
                      <p 
                        key={v.id || v.verse}
                        id={`verse-${v.verse}`}
                        onClick={() => insertVerseToSermon(v.book_name || currentBookName, v.verse, v.scripture)}
                        className={`p-2.5 rounded-lg cursor-pointer transition-all group flex items-start gap-2.5 border ${isHighlighted ? (isDarkMode ? 'bg-blue-600/30 border-l-4 border-blue-500 text-white font-medium shadow-md ring-1 ring-blue-500/50' : 'bg-blue-100 border-l-4 border-blue-600 text-gray-900 font-semibold shadow-sm') : (isDarkMode ? 'border-transparent hover:bg-blue-500/10 text-gray-200' : 'border-transparent hover:bg-blue-600/10 text-gray-900')}`}
                        title="Haz clic para insertar este versículo en tu sermón"
                      >
                        <sup className={`font-bold mt-1 select-none text-xs ${isHighlighted ? 'text-blue-400 dark:text-blue-300 scale-110' : 'text-blue-600 dark:text-blue-400'}`}>{v.verse}</sup>
                        <span className="flex-1 leading-relaxed">{v.scripture}</span>
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold shadow-sm transition-opacity">
                          + Insertar ({bibleVersion})
                        </span>
                      </p>
                    );
                  })
                ) : (
                  <p className="opacity-50 italic text-xs">Cargando contexto completo de {currentBookName} {currentChapter} ({bibleVersion})...</p>
                )}
              </div>
            </div>
          )}

          {/* Split 2: Editor de Sermones (Bottom Split) */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {activeSermon ? (
              <>
                {/* Sermon Header / Metadata Bar */}
                <div className={`p-3 px-4 border-b flex flex-col gap-2.5 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-[#EFECE6] border-[#D5D1C6]'}`}>
                  
                  {/* Campo Fijo 1: Título del Sermón */}
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-xs uppercase text-blue-500 dark:text-blue-400 min-w-[60px]">Título:</label>
                    <input 
                      type="text"
                      value={sermonTitle}
                      onChange={(e) => setSermonTitle(e.target.value)}
                      className={`bg-transparent text-base font-bold focus:outline-none border-b border-gray-500/30 focus:border-blue-500 w-full px-1 py-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      placeholder="Escribe el título del sermón o apunte..."
                    />
                  </div>

                  {/* Campos Fijos 2, 3 y 4: Verso Principal, Tema / Serie, Estado y Reutilizar */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    
                    {/* Campo Fijo 2: Verso Principal */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-[170px]">
                      <label className="font-bold text-[10px] uppercase opacity-80 min-w-[85px] text-blue-400 dark:text-blue-300">Verso Principal:</label>
                      <input 
                        type="text"
                        value={sermonPassage}
                        onChange={(e) => setSermonPassage(e.target.value)}
                        placeholder="Ej: Juan 3:16"
                        className={`border rounded px-2 py-1 focus:outline-none w-full text-xs font-semibold ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}
                      />
                    </div>

                    {/* Campo Fijo 3: Tema / Serie */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-[170px]">
                      <label className="font-bold text-[10px] uppercase opacity-80 min-w-[70px] text-emerald-400 dark:text-emerald-300">Tema / Serie:</label>
                      <input 
                        type="text"
                        value={sermonLocation}
                        onChange={(e) => setSermonLocation(e.target.value)}
                        placeholder="Ej: Familia, Fe, Gracia..."
                        className={`border rounded px-2 py-1 focus:outline-none w-full text-xs font-semibold ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white' : 'bg-white border-[#D5D1C6] text-gray-900'}`}
                      />
                    </div>

                    {/* Estado del Sermón */}
                    <div className="flex items-center gap-1.5">
                      <label className="font-bold text-[10px] uppercase opacity-80">Estado:</label>
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

                    {/* Ajuste de Tamaño de Letra del Editor de Escritura */}
                    <div className={`flex items-center gap-1 border rounded px-2 py-0.5 ${isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E]' : 'bg-white border-[#D5D1C6]'}`} title="Ajustar tamaño de letra para redacción del sermón">
                      <Type size={12} className="text-blue-500 dark:text-blue-400" />
                      <span className="text-[10px] font-bold uppercase opacity-80">Letra:</span>
                      <button 
                        type="button"
                        onClick={() => setEditorFontSize(prev => Math.max(12, prev - 2))}
                        className="px-1 font-bold hover:text-blue-500 text-xs cursor-pointer select-none"
                        title="Disminuir tamaño de letra de escritura"
                      >A-</button>
                      <span className="font-mono text-[11px] font-bold text-blue-500 dark:text-blue-400 px-0.5">{editorFontSize}px</span>
                      <button 
                        type="button"
                        onClick={() => setEditorFontSize(prev => Math.min(36, prev + 2))}
                        className="px-1 font-bold hover:text-blue-500 text-xs cursor-pointer select-none"
                        title="Aumentar tamaño de letra de escritura"
                      >A+</button>
                    </div>

                    {/* Reutilizar */}
                    <button 
                      onClick={handleDuplicateSermon}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors text-xs font-semibold border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-[#D5D1C6] text-gray-900 hover:bg-gray-100'}`}
                      title="Reutilizar / Duplicar Sermón"
                    >
                      <Copy size={12} /> Reutilizar
                    </button>

                    {/* Botón Guardar (Manual & Funcional) */}
                    <button 
                      onClick={handleManualSave}
                      className="flex items-center gap-1.5 px-3 py-1 rounded transition-all text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                      title="Guardar sermón ahora"
                    >
                      <Save size={13} />
                      <span>Guardar</span>
                    </button>

                    {/* Botón Imprimir en A4 / PDF */}
                    <button 
                      onClick={handlePrintSermon}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all text-xs font-bold border cursor-pointer ${isDarkMode ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white' : 'bg-emerald-50 border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white'}`}
                      title="Imprimir sermón en formato A4 / Guardar como PDF"
                    >
                      <Printer size={13} />
                      <span>Imprimir A4</span>
                    </button>
                  </div>
                </div>

                {/* Editor Content Canvas */}
                <div 
                  className="flex-1 flex flex-col overflow-hidden"
                  style={{
                    '--editor-font-size': `${editorFontSize}px`,
                    '--editor-line-height': 1.6
                  }}
                >
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
        onUpdateProxmox={handleUpdateProxmox}
        isUpdating={isUpdatingServer}
      />

      {/* Preacher Mode Fullscreen Modal */}
      {isPreacherMode && (
        <PreacherMode 
          sermon={activeSermon}
          onClose={() => setIsPreacherMode(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Contenedor Exclusivo de Impresión A4 */}
      {activeSermon && (
        <div className="print-only print-container">
          <div className="print-header">
            <h1>{sermonTitle || 'Sermón sin título'}</h1>
            <div className="print-header-meta">
              {sermonPassage && <div><strong>Pasaje Principal:</strong> {sermonPassage}</div>}
              {sermonLocation && <div><strong>Tema / Serie:</strong> {sermonLocation}</div>}
              {sermonStatus && <div><strong>Estado:</strong> {sermonStatus}</div>}
            </div>
          </div>
          <div 
            className="print-body"
            dangerouslySetInnerHTML={{ __html: sermonHtml }}
          />
          <div className="print-footer">
            Biblioteca Pastoral v2 • Documento de Predicación A4
          </div>
        </div>
      )}

    </div>
  );
}
