import React from 'react';
import { Wifi, WifiOff, FileText, Clock, CheckCircle, RefreshCw } from 'lucide-react';

export default function StatusBar({ wordCount = 0, isOffline = false, activeSermonTitle = '', saveStatus = 'Guardado', onUpdateProxmox = null, isUpdating = false }) {
  // Estimar minutos de predicación basados en ~130 palabras por minuto
  const estimatedMinutes = Math.ceil(wordCount / 130);

  return (
    <div className="h-7 bg-[#151720] border-t border-[#2A2E3E] text-[11px] text-[#A6ACCD] flex items-center px-4 justify-between select-none z-10">
      
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
        <div className="flex items-center gap-1 text-blue-300" title="Tiempo estimado de predicación (~130 pal/min)">
          <Clock size={12} />
          <span>~{estimatedMinutes} min predica</span>
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
          {onUpdateProxmox && (
            <button 
              onClick={onUpdateProxmox}
              disabled={isUpdating}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-sans font-bold text-xs transition-all shadow-sm ${isUpdating ? 'bg-blue-600/50 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95'}`}
              title="Sincronizar y Actualizar Servidor Proxmox en 1 Clic sin consola"
            >
              <RefreshCw size={11} className={isUpdating ? 'animate-spin' : ''} />
              <span>{isUpdating ? 'Actualizando...' : '⚡ Actualizar Proxmox'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
