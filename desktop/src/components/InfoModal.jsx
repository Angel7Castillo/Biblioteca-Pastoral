import React, { useState } from 'react';
import { BookOpen, Info, HeartHandshake, ShieldCheck, Mail, Code2, Code, ExternalLink, X, CheckCircle2, User, Sparkles } from 'lucide-react';

export default function InfoModal({ onClose, isDarkMode = true }) {
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'collaborate', 'legal'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in no-print">
      <div 
        className={`w-full max-w-2xl rounded-xl shadow-2xl border flex flex-col overflow-hidden transition-all max-h-[90vh] ${
          isDarkMode ? 'bg-[#1A1D27] border-[#2A2E3E] text-white' : 'bg-white border-gray-300 text-gray-900'
        }`}
      >
        {/* Header Modal */}
        <div className={`p-4 px-6 border-b flex items-center justify-between select-none ${
          isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-500 rounded-lg border border-blue-500/30">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-wide flex items-center gap-2">
                BIBLIOTECA PASTORAL
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v2.0
                </span>
              </h2>
              <p className="text-xs opacity-70">Plataforma Teológica y Homilética para Pastores y Predicadores</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-gray-500/20 transition-all cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b text-xs font-bold select-none ${
          isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-gray-50 border-gray-200'
        }`}>
          <button 
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-3 px-4 text-center transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'about' ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Info size={14} />
            <span>Acerca del Proyecto</span>
          </button>

          <button 
            onClick={() => setActiveTab('collaborate')}
            className={`flex-1 py-3 px-4 text-center transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'collaborate' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <HeartHandshake size={14} />
            <span>Colaborar & Contacto</span>
          </button>

          <button 
            onClick={() => setActiveTab('legal')}
            className={`flex-1 py-3 px-4 text-center transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'legal' ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Términos & Privacidad</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1">
          
          {/* TAB 1: ACERCA DEL PROYECTO */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-4 rounded-lg border space-y-2 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-blue-50/50 border-blue-200'}`}>
                <h3 className="font-bold text-sm text-blue-500 flex items-center gap-1.5">
                  <Sparkles size={16} /> Propósito e Identidad
                </h3>
                <p>
                  <strong>Biblioteca Pastoral</strong> es una solución tecnológica integral de código abierto diseñada para asistir a ministros, pastores y estudiosos bíblicos en la redacción homilética, consulta multiversión e investigación teológica de forma rápida, privada y sin distracciones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-lg border space-y-1.5 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="font-bold text-xs text-blue-400 flex items-center gap-1">
                    <User size={14} /> Desarrollo & Autoría
                  </span>
                  <p className="font-semibold text-sm">Ángel Castillo</p>
                  <p className="opacity-80 text-[11px]">Diseño de arquitectura, motor teológico y desarrollo de software.</p>
                </div>

                <div className={`p-3.5 rounded-lg border space-y-1.5 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1">
                    <Code size={14} /> Tecnologías Utilizadas
                  </span>
                  <p className="font-semibold text-xs">Laravel 11 • React • Vite • SQLite FTS5</p>
                  <p className="opacity-80 text-[11px]">Diseñado bajo principios Offline-First para uso local e insular.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Características Principales v2.0:</h4>
                <ul className="space-y-1.5 list-disc list-inside opacity-90 pl-1">
                  <li><strong>Visor Bíblico Multiversión:</strong> Consulta simultánea de versiones (RVR1960, NVI, TLA).</li>
                  <li><strong>Editor Homilético A4:</strong> Generación e impresión de sermones sin encabezados molestos.</li>
                  <li><strong>Notas por Versículo:</strong> Sistema de anotaciones teológicas vinculadas a cada pasaje.</li>
                  <li><strong>Modo Predicador:</strong> Interfaz limpia de oratoria a pantalla completa con cronómetro.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: COLABORAR Y CONTACTO */}
          {activeTab === 'collaborate' && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-4 rounded-lg border space-y-2 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-emerald-50/50 border-emerald-200'}`}>
                <h3 className="font-bold text-sm text-emerald-500 flex items-center gap-1.5">
                  <HeartHandshake size={16} /> Comunidad & Colaboración Open Source
                </h3>
                <p>
                  Si eres desarrollador, diseñador, traductor o teólogo y deseas contribuir a mejorar esta herramienta para la iglesia, ¡tu colaboración es enormemente bienvenida!
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">¿Cómo puedes colaborar?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border space-y-1 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-gray-50 border-gray-200'}`}>
                    <span className="font-bold text-xs text-blue-400">💻 Código Fuente & GitHub</span>
                    <p className="text-[11px] opacity-80">Aporta correcciones, mejoras de UI o nuevas características en el repositorio principal.</p>
                  </div>
                  <div className={`p-3 rounded-lg border space-y-1 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-gray-50 border-gray-200'}`}>
                    <span className="font-bold text-xs text-amber-400">💡 Sugerencias & Biblias</span>
                    <p className="text-[11px] opacity-80">Reporta sugerencias para incorporar nuevas versiones bíblicas, comentarios o diccionarios.</p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border space-y-3 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-gray-100 border-gray-300'}`}>
                <h4 className="font-bold text-xs text-blue-400">Canales Directos de Contacto:</h4>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="https://github.com/Angel7Castillo/Biblioteca-Pastoral" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold transition-all border border-gray-600 shadow-sm"
                  >
                    <Code2 size={14} /> GitHub Repositorio <ExternalLink size={12} />
                  </a>

                  <a 
                    href="mailto:contact@angelcastillo.dev" 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-all shadow-sm"
                  >
                    <Mail size={14} /> Enviar Mensaje / Contactar
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TÉRMINOS Y PRIVACIDAD */}
          {activeTab === 'legal' && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-4 rounded-lg border space-y-2 ${isDarkMode ? 'bg-[#151720] border-[#2A2E3E]' : 'bg-amber-50/50 border-amber-200'}`}>
                <h3 className="font-bold text-sm text-amber-500 flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Privacidad 100% Garantizada
                </h3>
                <p>
                  Tus sermones, notas, bosquejos e investigaciones son de <strong>tu propiedad absoluta</strong>. La aplicación opera de forma privada en tu red o equipo local sin enviar tus escritos a servidores comerciales de terceros.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-blue-400">1. Licencia de Uso Ministerial</h4>
                  <p className="opacity-80">
                    Este software se distribuye de manera gratuita para el equipamiento del ministerio cristiano, iglesias, seminarios y uso personal.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-blue-400">2. Versiones Bíblicas & Derechos de Autor</h4>
                  <p className="opacity-80">
                    Las versiones de la Biblia incluidas (Reina-Valera 1960, NVI, TLA, etc.) son utilizadas con fines de consulta, estudio y cita homilética dentro de la aplicación. Todos los derechos morales de los textos bíblicos corresponden a sus respectivas Sociedades Bíblicas y editoriales.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-blue-400">3. Exención de Responsabilidad</h4>
                  <p className="opacity-80">
                    El software se provee "tal cual", diseñado para maximizar la estabilidad y autonomía offline. Se recomienda mantener respaldos periódicos de la base de datos de sermones.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className={`p-3 px-6 border-t flex items-center justify-between select-none text-xs ${
          isDarkMode ? 'bg-[#151720] border-[#2A2E3E] text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-700'
        }`}>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <CheckCircle2 size={13} className="text-green-500" /> Sistema Operativo & Sincronizado
          </span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-all shadow-sm cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
