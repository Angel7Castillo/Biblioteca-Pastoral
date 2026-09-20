import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Tag, Calendar, Wifi, WifiOff, RefreshCw, Smartphone, ChevronRight, Plus, Sparkles, BookMarked, Layers } from 'lucide-react';
import { fetchMobileSermons } from '../services/api';

const STATUS_FILTERS = [
  { id: '', label: 'Todos' },
  { id: 'idea', label: '💡 Idea' },
  { id: 'borrador', label: '📝 Borrador' },
  { id: 'listo', label: '✅ Listo' },
  { id: 'predicado', label: '🎙️ Predicado' },
];

const STATUS_BADGES = {
  idea: { label: '💡 Idea', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  borrador: { label: '📝 Borrador', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  listo: { label: '✅ Listo', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  predicado: { label: '🎙️ Predicado', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
};

export default function MobileSermonList({ onSelectSermon, onUnlink }) {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchMobileSermons(search, selectedStatus);
      setSermons(res.sermons);
      setIsOffline(res.isOffline);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedStatus]);

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col pb-20">
      {/* App Header */}
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
            📖
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">Biblioteca Pastoral</h1>
            <div className="flex items-center gap-1.5 text-[11px]">
              {isOffline ? (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <WifiOff className="w-3 h-3" /> Modo Offline
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Wifi className="w-3 h-3" /> Proxmox Sync
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onUnlink}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl border border-gray-700 flex items-center gap-1 transition-all active:scale-95"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Vincular</span>
        </button>
      </header>

      {/* Buscador táctil */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, pasaje o etiqueta..."
            className="w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 text-sm text-white pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>

        {/* Chips de filtro por Estado */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedStatus === st.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Sermones */}
      <div className="flex-1 px-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-indigo-500" />
            <span className="text-xs font-medium">Cargando sermones...</span>
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/50 border border-gray-800/80 rounded-3xl p-6">
            <BookMarked className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">No se encontraron sermones</h3>
            <p className="text-xs text-gray-400">Intenta cambiar los filtros de búsqueda o crea uno nuevo en tu PC.</p>
          </div>
        ) : (
          sermons.map((sermon) => {
            const statusInfo = STATUS_BADGES[sermon.status] || STATUS_BADGES.borrador;
            return (
              <div
                key={sermon.id}
                onClick={() => onSelectSermon(sermon)}
                className="bg-gray-900/90 border border-gray-800/80 hover:border-indigo-500/50 rounded-2xl p-4 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-black/20"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${statusInfo.bg}`}>
                    {statusInfo.label}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>{sermon.date || 'Reciente'}</span>
                  </div>
                </div>

                <h2 className="text-base font-bold text-white mb-1.5 leading-snug hover:text-indigo-300 transition-colors">
                  {sermon.title}
                </h2>

                {sermon.passage && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 mb-3">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{sermon.passage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800/60">
                  <div className="flex items-center gap-1.5 truncate max-w-[75%]">
                    {sermon.series && (
                      <span className="flex items-center gap-1 text-gray-400 truncate">
                        <Layers className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{sermon.series}</span>
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
