import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Clock, BookOpen, ChevronUp, ChevronDown } from 'lucide-react';

export default function MobilePreacherMode({ sermon, onClose }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [fontSize, setFontSize] = useState(20);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden">
      {/* Top Preaching Control Bar */}
      <div className="bg-gray-950/95 border-b border-gray-800 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 transition-all active:scale-95 border border-gray-800"
            title="Salir del Modo Predicador"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Modo Predicador</span>
            <h2 className="text-sm font-extrabold text-white truncate max-w-[180px]">
              {sermon.title}
            </h2>
          </div>
        </div>

        {/* Cronómetro de Predicación */}
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-2xl shadow-inner">
          <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-mono text-base font-extrabold text-white tracking-wider">
            {formatTime(seconds)}
          </span>
          <button
            onClick={toggleTimer}
            className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 ml-1"
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
          <button
            onClick={resetTimer}
            className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preaching Body View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full">
        {/* Pasaje Bíblico Destacado */}
        {sermon.passage && (
          <div className="bg-indigo-950/40 border-2 border-indigo-500/40 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <span className="text-lg font-extrabold text-indigo-200">{sermon.passage}</span>
            </div>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-lg">
              Pasaje Clave
            </span>
          </div>
        )}

        {/* Contenido del Sermón con Fuente Grande Adaptada */}
        <div
          className="prose prose-invert max-w-none font-sans leading-relaxed tracking-wide text-gray-100"
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{
            __html: sermon.content || '<p className="text-gray-500 italic">No hay notas redactadas para este sermón.</p>',
          }}
        />
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-950/90 border-t border-gray-900 px-6 py-3 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Tamaño letra:</span>
          <button
            onClick={() => setFontSize((prev) => Math.max(prev - 2, 16))}
            className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xs font-bold hover:bg-gray-800"
          >
            -
          </button>
          <span className="text-xs font-mono font-bold text-indigo-400">{fontSize}px</span>
          <button
            onClick={() => setFontSize((prev) => Math.min(prev + 2, 32))}
            className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xs font-bold hover:bg-gray-800"
          >
            +
          </button>
        </div>

        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Pantalla Encendida</span>
        </div>
      </div>
    </div>
  );
}
