import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Type, Clock, MapPin, Calendar, BookOpen } from 'lucide-react';

export default function PreacherMode({ sermon, onClose, isDarkMode }) {
  const [fontSize, setFontSize] = useState(20); // px
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sermon) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#0F111A] text-white' : 'bg-[#F5F3ED] text-[#1A1A1C]'}`}>
      
      {/* Top Preacher Controls Bar */}
      <div className={`h-16 px-8 border-b flex items-center justify-between ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-[#EBE9E2] border-[#D0CEC5]'}`}>
        
        {/* Left: Sermon Info */}
        <div className="flex items-center gap-4">
          <span className="bg-blue-600/30 text-blue-400 font-bold px-2.5 py-1 rounded text-xs uppercase tracking-wider">
            Modo Predicador
          </span>
          <h1 className="font-bold text-lg truncate max-w-xs md:max-w-md">{sermon.title}</h1>
        </div>

        {/* Center: Chronometer / Timer */}
        <div className="flex items-center gap-3 bg-[#1A1D27]/80 px-4 py-1.5 rounded-full border border-blue-500/30 shadow-lg">
          <Clock size={18} className="text-blue-400 animate-pulse" />
          <span className="font-mono text-xl font-bold tracking-widest text-blue-300">
            {formatTime(seconds)}
          </span>
          <button 
            onClick={() => setIsActive(!isActive)}
            className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-transform active:scale-95"
            title={isActive ? "Pausar" : "Iniciar Prédica"}
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button 
            onClick={() => { setSeconds(0); setIsActive(false); }}
            className="p-1.5 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            title="Reiniciar Cronómetro"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Right: Font Controls & Close */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800/40 px-3 py-1 rounded border border-gray-700/40">
            <Type size={16} className="text-gray-400" />
            <button onClick={() => setFontSize(prev => Math.max(14, prev - 2))} className="px-2 py-0.5 rounded hover:bg-gray-700 font-bold text-sm">-</button>
            <span className="text-xs font-mono">{fontSize}px</span>
            <button onClick={() => setFontSize(prev => Math.min(36, prev + 2))} className="px-2 py-0.5 rounded hover:bg-gray-700 font-bold text-sm">+</button>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
            title="Salir del Modo Predicador"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Sermon Metadata Highlights */}
      {(sermon.main_passage || sermon.location || sermon.preach_date) && (
        <div className={`px-12 py-3 border-b flex items-center gap-6 text-xs font-semibold ${isDarkMode ? 'bg-[#1A1D27]/50 border-[#2A2E3E] text-gray-400' : 'bg-[#E0DECZ]/50 border-[#D0CEC5] text-gray-600'}`}>
          {sermon.main_passage && (
            <div className="flex items-center gap-1.5 text-blue-400 font-bold">
              <BookOpen size={14} /> Pasaje: {sermon.main_passage}
            </div>
          )}
          {sermon.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} /> Lugar: {sermon.location}
            </div>
          )}
          {sermon.preach_date && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} /> Fecha: {sermon.preach_date}
            </div>
          )}
        </div>
      )}

      {/* Main Reading Canvas */}
      <div className="flex-1 overflow-y-auto px-12 md:px-24 py-8 leading-relaxed max-w-5xl mx-auto w-full">
        <div 
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          className="prose dark:prose-invert max-w-none select-text"
          dangerouslySetInnerHTML={{ __html: sermon.content_html || '<p className="italic opacity-50">Sermón sin contenido.</p>' }}
        />
      </div>
    </div>
  );
}
