import { useState, useEffect, useRef } from 'react';
import { Book, Edit3, Settings, Library, Search, Sun, Moon, LayoutPanelTop, Heading1, Heading2, Bold, Italic, List, Quote, Printer, Copy } from 'lucide-react';
import { marked } from 'marked';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TurndownService from 'turndown';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('explorer'); // 'explorer', 'library'
  const [showBible, setShowBible] = useState(true);
  
  const [verses, setVerses] = useState([]);
  const [currentBook, setCurrentBook] = useState(1);
  const [currentChapter, setCurrentChapter] = useState(1);

  // Estados del Editor de Sermones
  const [sermonList, setSermonList] = useState([]);
  const [activeSermon, setActiveSermon] = useState('');
  const [sermonContent, setSermonContent] = useState('');
  const [sermonHtml, setSermonHtml] = useState('');
  const [sermonDate, setSermonDate] = useState('');
  const [sermonLocation, setSermonLocation] = useState('');
  const [sermonStatus, setSermonStatus] = useState('borrador');
  const [saveStatus, setSaveStatus] = useState('');

  // Funciones de gestión de archivos
  const handleCreateSermon = () => {
    const name = prompt("Nombre del nuevo sermón (sin .md):");
    if (!name) return;
    const filename = name.endsWith('.md') ? name : `${name}.md`;
    fetch('http://localhost:3000/api/sermones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setSermonList([...sermonList, { filename, isDraft: true }]);
        setActiveSermon(filename);
      } else {
        alert(data.error || "Error al crear");
      }
    })
    .catch(err => console.error("Error al crear:", err));
  };

  const handleReuseSermon = () => {
    if (!activeSermon) return;
    const name = prompt("Nombre de la nueva versión (sin .md):", activeSermon.replace('.md', ' (Copia)'));
    if (!name) return;
    const newFilename = name.endsWith('.md') ? name : `${name}.md`;
    fetch(`http://localhost:3000/api/sermones/reutilizar/${activeSermon}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName: newFilename })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setSermonList([...sermonList, { filename: newFilename, isDraft: true }]);
        setActiveSermon(newFilename);
      } else {
        alert(data.error || "Error al reutilizar");
      }
    })
    .catch(err => console.error("Error al reutilizar:", err));
  };

  const handleDeleteSermon = (e, filename) => {
    e.stopPropagation();
    if (!window.confirm(`¿Borrar permanentemente "${filename}"?`)) return;
    fetch(`http://localhost:3000/api/sermones/${filename}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const newList = sermonList.filter(f => f.filename !== filename);
        setSermonList(newList);
        if (activeSermon === filename) {
          setActiveSermon(newList.length > 0 ? newList[0].filename : '');
          if (newList.length === 0) setSermonContent('');
        }
      }
    })
    .catch(err => console.error("Error al borrar:", err));
  };

  const insertMarkdown = (prefix, suffix = '') => {
    if (!activeSermon) return;
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = sermonContent;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    setSermonContent(newText);
    
    // Devolvemos el foco al textarea después de actualizar el estado
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handlePrint = () => {
    if (!sermonContent) return;
    const htmlContent = marked.parse(sermonContent);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${activeSermon.replace('.md', '')}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Georgia', serif; line-height: 1.6; color: #000; background: #fff; padding: 20px; }
            h1, h2, h3 { font-family: 'Helvetica', sans-serif; color: #111; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            p { margin-bottom: 1em; }
            blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 1em; font-style: italic; color: #555; }
            ul, ol { margin-bottom: 1em; padding-left: 2em; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 1. Cargar lista de sermones
  useEffect(() => {
    fetch('http://localhost:3000/api/sermones')
      .then(res => res.json())
      .then(data => {
        if (data.files && data.files.length > 0) {
          setSermonList(data.files);
          setActiveSermon(data.files[0].filename);
        }
      })
      .catch(err => console.error("Error al cargar lista de sermones:", err));
  }, []);

  // 2. Cargar contenido cuando cambia el sermón activo
  useEffect(() => {
    if (!activeSermon) return;
    fetch(`http://localhost:3000/api/sermones/${activeSermon}`)
      .then(res => res.json())
      .then(data => {
        if (data.content !== undefined) {
          setSermonContent(data.content);
          setSermonHtml(marked.parse(data.content));
          setSermonDate(data.metadata?.fecha || '');
          setSermonLocation(data.metadata?.lugar || '');
          setSermonStatus(data.metadata?.status || 'borrador');
          setSaveStatus('Guardado');
        }
      })
      .catch(err => console.error("Error al cargar sermón:", err));
  }, [activeSermon]);

  // 3. Autoguardado (Debounce de 1 segundo)
  useEffect(() => {
    if (!activeSermon || sermonHtml === '') return;
    
    setSaveStatus('Guardando...');
    const timer = setTimeout(() => {
      const turndownService = new TurndownService({ headingStyle: 'atx' });
      const markdown = turndownService.turndown(sermonHtml);
      
      fetch(`http://localhost:3000/api/sermones/${activeSermon}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: markdown,
          metadata: { fecha: sermonDate, lugar: sermonLocation, status: sermonStatus }
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSermonContent(markdown);
          setSaveStatus('Guardado');
          setSermonList(prev => prev.map(item => item.filename === activeSermon ? { ...item, isDraft: sermonStatus === 'borrador' } : item));
        }
      })
      .catch(err => setSaveStatus('Error al guardar'));
    }, 1000);

    return () => clearTimeout(timer);
  }, [sermonHtml, activeSermon, sermonDate, sermonLocation, sermonStatus]);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }]
    ],
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  return (
    <div className="flex flex-col h-screen bg-ide-bg text-ide-text transition-colors duration-300">
      
      {/* Top Menu Bar */}
      <div 
        className="h-10 bg-ide-activity border-b border-ide-border flex items-center px-4 justify-between text-xs font-semibold transition-colors duration-300"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <div className="flex space-x-4" style={{ WebkitAppRegion: 'no-drag' }}>
          <span className="text-ide-light cursor-pointer">Archivo</span>
          <span className="hover:text-ide-light cursor-pointer transition-colors">Edición</span>
          <span className="hover:text-ide-light cursor-pointer transition-colors">Vista</span>
        </div>
        <div className="text-ide-text opacity-50 flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          Biblioteca Pastoral IDE
          <button 
            onClick={() => setShowBible(!showBible)}
            className="hover:text-ide-light ml-4 p-1 rounded bg-ide-hover"
            title="Mostrar/Ocultar Biblia"
          >
            <LayoutPanelTop size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Activity Bar */}
        <div className="w-14 bg-ide-activity flex flex-col items-center py-4 border-r border-ide-border space-y-6 transition-colors duration-300">
          <button 
            className={`transition-colors ${activeTab === 'explorer' ? 'text-ide-accent' : 'text-ide-text hover:text-ide-light'}`}
            title="Editor / Explorador"
            onClick={() => setActiveTab('explorer')}
          >
            <Edit3 size={24} />
          </button>
          <button 
            className={`transition-colors ${activeTab === 'library' ? 'text-ide-accent' : 'text-ide-text hover:text-ide-light'}`}
            title="Biblioteca de Recursos"
            onClick={() => setActiveTab('library')}
          >
            <Library size={24} />
          </button>
          
          <div className="flex-1"></div>
          
          <button 
            className="text-ide-text hover:text-ide-light transition-colors" 
            title="Cambiar Tema"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button className="text-ide-text hover:text-ide-light transition-colors" title="Configuración">
            <Settings size={24} />
          </button>
        </div>

        {/* Primary Side Panel (Explorer / Library) */}
        <div className="w-64 bg-ide-sidebar border-r border-ide-border flex flex-col transition-colors duration-300">
          <div className="h-10 flex items-center px-4 border-b border-ide-border text-xs font-bold text-ide-light tracking-wider uppercase">
            {activeTab === 'explorer' ? 'Explorador de Sermones' : 'Biblioteca de Referencias'}
          </div>
          <div className="p-4 text-sm space-y-2 overflow-y-auto">
            {activeTab === 'explorer' ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-ide-textMuted uppercase">Mis Archivos</span>
                  <button onClick={handleCreateSermon} className="text-ide-light hover:text-white bg-ide-hover px-2 py-1 rounded text-xs transition-colors">+ Nuevo</button>
                </div>
                {sermonList.map(item => (
                  <div 
                    key={item.filename}
                    onClick={() => setActiveSermon(item.filename)}
                    className={`group px-2 py-1.5 rounded cursor-pointer transition-colors flex justify-between items-center ${activeSermon === item.filename ? 'text-ide-accent bg-ide-hover' : 'hover:bg-ide-hover'}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.isDraft && <span className="bg-yellow-600/30 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Borrador</span>}
                      <span className="truncate">{item.filename}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteSermon(e, item.filename)}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Borrar"
                    >×</button>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="text-xs font-semibold text-ide-textMuted mb-2 uppercase">Módulos Instalados</div>
                <div className="hover:bg-ide-hover px-2 py-1 rounded cursor-pointer transition-colors">📖 Reina Valera 1960 (e-Sword)</div>
                <div className="hover:bg-ide-hover px-2 py-1 rounded cursor-pointer transition-colors">📖 Nueva Versión Internacional</div>
                <div className="hover:bg-ide-hover px-2 py-1 rounded cursor-pointer transition-colors">📚 Diccionario Strong</div>
              </>
            )}
          </div>
        </div>

        {/* Editor Area (Split) */}
        <div className="flex-1 flex flex-col bg-ide-bg transition-colors duration-300">
          
          {/* Split 1: Biblia (Visible según el estado) */}
          {showBible && (
            <div className="h-1/2 border-b border-ide-border flex flex-col">
              {/* Tabs */}
              <div className="flex h-10 bg-ide-sidebar transition-colors duration-300">
                <div className="px-4 flex items-center border-t-2 border-ide-accent bg-ide-bg text-ide-light text-xs font-semibold">
                  📖 Reina Valera 1960
                </div>
                <div className="px-4 flex items-center border-t-2 border-transparent hover:bg-ide-hover text-xs cursor-pointer transition-colors">
                  NVI
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto text-sm leading-relaxed">
                <div className="flex justify-between items-center mb-4">
                  <select 
                    className="bg-ide-sidebar border border-ide-border rounded px-2 py-1 text-ide-light focus:outline-none transition-colors"
                    value={currentBook}
                    onChange={(e) => { setCurrentBook(parseInt(e.target.value)); setCurrentChapter(1); }}
                  >
                    <option value={1}>Génesis</option>
                    <option value={45}>Romanos</option>
                  </select>
                </div>
                {verses.length > 0 ? (
                  verses.map(v => (
                    <p key={v.Verse} className="mb-2">
                      <sup className="text-ide-accent mr-1 font-bold">{v.Verse}</sup>
                      {v.Scripture}
                    </p>
                  ))
                ) : (
                  <p className="text-ide-text opacity-50 italic">Cargando texto bíblico...</p>
                )}
              </div>
            </div>
          )}

          {/* Split 2: Editor */}
          <div className={showBible ? "h-1/2 flex flex-col relative" : "flex-1 flex flex-col relative"}>
            {/* Tabs */}
            <div className="flex justify-between items-center h-10 bg-ide-sidebar transition-colors duration-300 pr-4">
              <div className="px-4 h-full flex items-center border-t-2 border-ide-accent bg-ide-bg text-ide-light text-xs font-semibold">
                {activeSermon || 'Sin archivo abierto'}
              </div>
              <div className="text-xs text-ide-textMuted opacity-60 flex items-center gap-4">
                {saveStatus}
                <button onClick={handleReuseSermon} className="flex items-center gap-1 px-2 py-0.5 text-ide-light bg-ide-sidebar hover:bg-ide-hover border border-ide-border rounded transition-colors text-xs font-semibold shadow-sm" title="Crear copia limpia">
                  <Copy size={12} /> Reutilizar
                </button>
                <button onClick={handlePrint} className="flex items-center gap-1 px-2 py-0.5 text-white bg-ide-accent hover:bg-blue-600 rounded transition-colors text-xs font-semibold shadow-sm" title="Exportar a PDF / Imprimir">
                  <Printer size={12} /> PDF
                </button>
              </div>
            </div>

            {/* Metadata Bar */}
            {activeSermon && (
              <div className="flex bg-ide-bg px-6 py-2 gap-4 border-b border-ide-border items-center">
                <div className="flex items-center gap-2 mr-2">
                  <input 
                    type="checkbox" 
                    id="isDraft"
                    className="accent-ide-accent cursor-pointer w-4 h-4"
                    checked={sermonStatus === 'borrador'}
                    onChange={(e) => setSermonStatus(e.target.checked ? 'borrador' : 'listo')}
                  />
                  <label htmlFor="isDraft" className="text-xs text-ide-textMuted font-semibold uppercase cursor-pointer select-none">Borrador</label>
                </div>
                <div className="w-px h-4 bg-ide-border"></div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ide-textMuted font-semibold uppercase">📅 Fecha:</span>
                  <input 
                    type="date" 
                    className="bg-ide-sidebar border border-ide-border rounded px-2 py-1 text-xs text-ide-light focus:outline-none disabled:opacity-50"
                    value={sermonDate}
                    onChange={(e) => setSermonDate(e.target.value)}
                    disabled={sermonStatus === 'borrador'}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ide-textMuted font-semibold uppercase">📍 Lugar:</span>
                  <input 
                    type="text" 
                    placeholder={sermonStatus === 'borrador' ? "Sermón en proceso..." : "Iglesia Central..."}
                    className="bg-ide-sidebar border border-ide-border rounded px-2 py-1 text-xs text-ide-light focus:outline-none w-48 disabled:opacity-50"
                    value={sermonLocation}
                    onChange={(e) => setSermonLocation(e.target.value)}
                    disabled={sermonStatus === 'borrador'}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
              {activeSermon ? (
                <ReactQuill 
                  theme="snow" 
                  value={sermonHtml} 
                  onChange={setSermonHtml}
                  modules={quillModules}
                  placeholder="Escribe tu sermón aquí (Formato Visual)..."
                  className="flex-1 flex flex-col h-full"
                />
              ) : (
                <div className="p-6 text-ide-textMuted opacity-50 italic">Selecciona o crea un archivo en el explorador.</div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
