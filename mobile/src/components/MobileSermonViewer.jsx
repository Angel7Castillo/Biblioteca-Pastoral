import React, { useState } from 'react';
import { ArrowLeft, Play, Type, Sun, Moon, BookOpen, Layers, Tag, Share2 } from 'lucide-react';

export default function MobileSermonViewer({ sermon, onBack, onStartPreaching }) {
  const [fontSize, setFontSize] = useState(16); // px
  const [theme, setTheme] = useState('dark'); // 'dark' | 'sepia' | 'light'

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 14));

  const THEME_STYLES = {
    dark: 'bg-[#090d16] text-gray-100',
    sepia: 'bg-[#fbf0d9] text-[#433422]',
    light: 'bg-white text-gray-900',
  };

  const CARD_THEME_STYLES = {
    dark: 'bg-gray-900/90 border-gray-800 text-gray-200',
    sepia: 'bg-[#f4e4c1] border-[#e2cf9f] text-[#433422]',
    light: 'bg-gray-100 border-gray-200 text-gray-900',
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${THEME_STYLES[theme]} pb-24`}>
      {/* Navbar Superior */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between transition-colors ${
        theme === 'dark' ? 'bg-gray-950/90 border-gray-800' : theme === 'sepia' ? 'bg-[#f4e4c1]/90 border-[#e2cf9f]' : 'bg-white/90 border-gray-200 shadow-sm'
      }`}>
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-black/10 hover:bg-black/20 flex items-center gap-1 text-sm font-semibold transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        {/* Controles de Lectura */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-black/10 rounded-xl p-0.5">
            <button
              onClick={decreaseFontSize}
              className="px-2.5 py-1 text-xs font-bold rounded-lg hover:bg-black/10 transition-all"
              title="Disminuir letra"
            >
              A-
            </button>
            <span className="text-xs font-mono font-bold px-1">{fontSize}</span>
            <button
              onClick={increaseFontSize}
              className="px-2.5 py-1 text-xs font-bold rounded-lg hover:bg-black/10 transition-all"
              title="Aumentar letra"
            >
              A+
            </button>
          </div>

          {/* Selector de Tema */}
          <div className="flex items-center bg-black/10 rounded-xl p-0.5">
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'opacity-60'}`}
              title="Tema Oscuro"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-lg transition-all ${theme === 'sepia' ? 'bg-amber-700 text-white' : 'opacity-60'}`}
              title="Tema Sepia"
            >
              <span className="text-xs font-bold">📜</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? 'bg-gray-800 text-white' : 'opacity-60'}`}
              title="Tema Claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 p-5 max-w-2xl mx-auto w-full space-y-5">
        {/* Encabezado del Sermón */}
        <div className={`p-5 rounded-3xl border shadow-lg ${CARD_THEME_STYLES[theme]}`}>
          <h1 className="text-2xl font-extrabold mb-3 leading-tight tracking-tight">
            {sermon.title}
          </h1>

          {sermon.passage && (
            <div className="inline-flex items-center gap-2 text-sm font-bold bg-indigo-500/15 text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-500/30 mb-3">
              <BookOpen className="w-4 h-4" />
              <span>{sermon.passage}</span>
            </div>
          )}

          {sermon.series && (
            <div className="flex items-center gap-1.5 text-xs opacity-80 mt-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Serie: <strong>{sermon.series}</strong></span>
            </div>
          )}
        </div>

        {/* Cuerpo del Sermón */}
        <div
          className="prose max-w-none leading-relaxed font-sans space-y-4"
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: sermon.content || '<p className="italic text-gray-500">Este sermón no tiene contenido escrito todavía.</p>' }}
        />
      </main>

      {/* Barra Flotante Inferior de Modo Predicador */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
        <button
          onClick={() => onStartPreaching(sermon)}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-2xl shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-2.5 text-base active:scale-[0.98] transition-all border border-indigo-400/30"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Iniciar Modo Predicador</span>
        </button>
      </div>
    </div>
  );
}
