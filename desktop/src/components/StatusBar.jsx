import React, { useState } from 'react';
import { Wifi, WifiOff, FileText, Clock, CheckCircle, RefreshCw, Info } from 'lucide-react';

export default function StatusBar({ wordCount = 0, isOffline = false, activeSermonTitle = '', saveStatus = 'Guardado', onUpdateProxmox = null, isUpdating = false }) {
  const [showInfo, setShowInfo] = useState(false);
  // Estimar minutos de predicación basados en ~130 palabras por minuto
  const estimatedMinutes = Math.ceil(wordCount / 130);

  return (
    <div className="h-7 bg-[#151720] border-t border-[#2A2E3E] text-[11px] text-[#A6ACCD] flex items-center px-4 justify-between select-none z-10 relative">
      
      {/* Left Status: Active file & save status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-blue-400 font-medium">
          <FileText size={12} />
          <span className="truncate max-w-xs">{activeSermonTitle || 'Sin archivo'}</span>
        </div>
        <div className="w-px h-3 bg-[#2A2E3E]"></div>
        <div className="flex items-center gap-1 text-gray-400">
          <CheckCircle size={12} className="text-green-400" />
          <span>{saveStatus}</span>
        </div>
      </div>

      {/* Right Status: Statistics & Connection */}
      <div className="flex items-center gap-5 font-mono">
        <div className="flex items-center gap-1 text-gray-300">
          <span>{wordCount} palabras</span>
        </div>
        
        {/* Estimación de tiempo con Icono de Información y Popover explicativo */}
        <div className="flex items-center gap-1.5 text-blue-300 relative">
          <Clock size={12} />
          <span>~{estimatedMinutes} min predica</span>
          
          <button 
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            className="text-blue-400 hover:text-blue-200 transition-colors p-0.5 rounded focus:outline-none flex items-center justify-center"
            title="¿Cómo se calcula el tiempo de predicación?"
          >
            <Info size={13} />
          </button>

          {/* Popover Explicativo Flotante */}
          {showInfo && (
            <div className="absolute right-0 bottom-8 w-72 p-3 bg-[#1A1D27] border border-[#2A2E3E] text-white rounded-lg shadow-2xl z-50 font-sans text-xs space-y-2 pointer-events-auto">
              <div className="flex items-center gap-1.5 font-bold text-blue-400 border-b border-[#2A2E3E] pb-1.5">
                <Clock size={14} />
                <span>Tiempo Estimado de Predicación</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Calculado automáticamente según un ritmo de oratoria promedio de <strong>~130 palabras por minuto</strong> en el púlpito (incluyendo pausas, lecturas y énfasis).
              </p>
              <div className="bg-[#151720] p-2 rounded border border-[#2A2E3E] text-[10px] space-y-1 text-gray-300 font-mono">
                <div className="flex justify-between">
                  <span>• 1,300 palabras:</span>
                  <span className="font-bold text-blue-400">~10 min predica</span>
                </div>
                <div className="flex justify-between">
                  <span>• 3,900 palabras:</span>
                  <span className="font-bold text-blue-400">~30 min predica</span>
                </div>
                <div className="flex justify-between">
                  <span>• 5,200 palabras:</span>
                  <span className="font-bold text-blue-400">~40 min predica</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-3 bg-[#2A2E3E]"></div>
        <div className="flex items-center gap-1.5">
          {isOffline ? (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-sans font-semibold">
              <WifiOff size={12} /> Modo Offline
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-sans font-semibold">
              <Wifi size={12} /> Proxmox API (192.168.1.200)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
