import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, BookMarked, PlusCircle, Check, Sparkles, Layers } from 'lucide-react';
import { searchStrongDictionary, searchTheologicalDictionary } from '../services/api';

export function DictionaryModal({ isOpen, onClose, onInsertDefinition }) {
  const [activeTab, setActiveTab] = useState('strong'); // 'strong' | 'teologico'
  
  // Strong State
  const [strongQuery, setStrongQuery] = useState('');
  const [strongTypeFilter, setStrongTypeFilter] = useState(''); // '' | 'hebrew' | 'greek'
  const [strongResults, setStrongResults] = useState([]);
  const [loadingStrong, setLoadingStrong] = useState(false);

  // Theological State
  const [theoQuery, setTheoQuery] = useState('');
  const [theoResults, setTheoResults] = useState([]);
  const [loadingTheo, setLoadingTheo] = useState(false);

  // Insertion state feedback
  const [insertedId, setInsertedId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchStrong();
      fetchTheological();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'strong') {
      const timer = setTimeout(() => fetchStrong(), 300);
      return () => clearTimeout(timer);
    }
  }, [strongQuery, strongTypeFilter]);

  useEffect(() => {
    if (isOpen && activeTab === 'teologico') {
      const timer = setTimeout(() => fetchTheological(), 300);
      return () => clearTimeout(timer);
    }
  }, [theoQuery]);

  const fetchStrong = async () => {
    setLoadingStrong(true);
    const { data } = await searchStrongDictionary(strongQuery, strongTypeFilter);
    setStrongResults(data || []);
    setLoadingStrong(false);
  };

  const fetchTheological = async () => {
    setLoadingTheo(true);
    const { data } = await searchTheologicalDictionary(theoQuery);
    setTheoResults(data || []);
    setLoadingTheo(false);
  };

  const handleInsertStrong = (entry) => {
    const textToInsert = `\n> **[Strong ${entry.code}] ${entry.original_word} (${entry.transliteration})** - *Pronunciación:* /${entry.pronunciation || ''}/\n> ${entry.definition}\n`;
    onInsertDefinition(textToInsert);
    setInsertedId(entry.code);
    setTimeout(() => setInsertedId(null), 2000);
  };

  const handleInsertTheological = (entry) => {
    const refs = entry.cross_references ? ` *(Pasajes: ${entry.cross_references})*` : '';
    const textToInsert = `\n> **[Diccionario Teológico] ${entry.term}** (${entry.category || 'Teología'})${refs}\n> ${entry.definition}\n`;
    onInsertDefinition(textToInsert);
    setInsertedId(entry.term);
    setTimeout(() => setInsertedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-xl">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-200 flex items-center gap-2">
                Diccionario Teológico & Concordancia Strong
              </h2>
              <p className="text-xs text-slate-400">
                Consulta los términos originales en Hebreo, Griego y conceptos teológicos profundos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 space-x-2">
          <button
            onClick={() => setActiveTab('strong')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-medium text-sm transition ${
              activeTab === 'strong'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            Concordancia Strong (Hebreo & Griego)
          </button>
          <button
            onClick={() => setActiveTab('teologico')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-medium text-sm transition ${
              activeTab === 'teologico'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Diccionario Teológico
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: STRONG CONCORDANCE */}
          {activeTab === 'strong' && (
            <div className="space-y-4">
              
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={strongQuery}
                    onChange={(e) => setStrongQuery(e.target.value)}
                    placeholder="Buscar por código (ej: G4151, H1254), palabra o definición..."
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                  <button
                    onClick={() => setStrongTypeFilter('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      strongTypeFilter === ''
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setStrongTypeFilter('hebrew')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      strongTypeFilter === 'hebrew'
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Hebreo (H)
                  </button>
                  <button
                    onClick={() => setStrongTypeFilter('greek')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      strongTypeFilter === 'greek'
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Griego (G)
                  </button>
                </div>
              </div>

              {/* Results */}
              {loadingStrong ? (
                <div className="py-12 text-center text-slate-400 text-sm">Cargando código Strong...</div>
              ) : strongResults.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No se encontraron concordancias para "{strongQuery}".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strongResults.map((item) => (
                    <div
                      key={item.code}
                      className="bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 p-4 rounded-xl space-y-3 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                            item.type === 'hebrew'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                          }`}>
                            {item.code} • {item.type === 'hebrew' ? 'Hebreo' : 'Griego'}
                          </span>
                          <span className="text-2xl font-serif text-amber-300">
                            {item.original_word}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-400 space-x-2">
                          <span className="font-semibold text-slate-200">{item.transliteration}</span>
                          {item.pronunciation && (
                            <span className="italic text-slate-500">/{item.pronunciation}/</span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                          {item.definition}
                        </p>
                      </div>

                      <button
                        onClick={() => handleInsertStrong(item)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                          insertedId === item.code
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {insertedId === item.code ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            ¡Insertado en el Sermón!
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            Insertar definición en el Sermón
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: THEOLOGICAL DICTIONARY */}
          {activeTab === 'teologico' && (
            <div className="space-y-4">
              
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={theoQuery}
                  onChange={(e) => setTheoQuery(e.target.value)}
                  placeholder="Buscar término teológico (ej: Justificación, Santificación, Redención...)"
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Results */}
              {loadingTheo ? (
                <div className="py-12 text-center text-slate-400 text-sm">Buscando términos teológicos...</div>
              ) : theoResults.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No se encontraron términos para "{theoQuery}".
                </div>
              ) : (
                <div className="space-y-3">
                  {theoResults.map((item) => (
                    <div
                      key={item.term}
                      className="bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 p-4 rounded-xl space-y-2 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-bold text-amber-200">{item.term}</h3>
                          {item.category && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-700/40">
                              {item.category}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleInsertTheological(item)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                            insertedId === item.term
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {insertedId === item.term ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              ¡Insertado!
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" />
                              Insertar en Sermón
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.definition}
                      </p>

                      {item.cross_references && (
                        <p className="text-[11px] text-amber-400/80 italic pt-1 border-t border-slate-800/60">
                          Pasajes Bíblicos Clave: {item.cross_references}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-amber-400/90">
            <Sparkles className="w-3.5 h-3.5" />
            Recurso Exegético Pastoral Integrado
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
