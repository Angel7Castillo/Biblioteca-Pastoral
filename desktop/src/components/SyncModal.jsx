import React, { useState, useEffect } from 'react';
import { X, QrCode, Smartphone, Laptop, CheckCircle2, RefreshCw, AlertCircle, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { generatePairCode, linkDeviceWithCode, checkPairCodeStatus } from '../services/api';

export function SyncModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('generate'); // 'generate' (PC) | 'input' (Móvil)
  
  // State for Generate Mode
  const [codeData, setCodeData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [loadingCode, setLoadingCode] = useState(false);
  const [isLinkedSuccess, setIsLinkedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // State for Input Mode
  const [inputCode, setInputCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [inputError, setInputError] = useState(null);
  const [inputSuccess, setInputSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'generate') {
      handleGenerate();
    }
  }, [isOpen, mode]);

  // Countdown timer & status polling
  useEffect(() => {
    let timer = null;
    let pollTimer = null;

    if (isOpen && codeData && timeLeft > 0 && !isLinkedSuccess) {
      timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);

      // Poll every 3 seconds to check if phone linked
      pollTimer = setInterval(async () => {
        if (codeData.code) {
          const res = await checkPairCodeStatus(codeData.code);
          if (res.is_linked) {
            setIsLinkedSuccess(true);
          }
        }
      }, 3000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [isOpen, codeData, timeLeft, isLinkedSuccess]);

  const handleGenerate = async () => {
    setLoadingCode(true);
    setIsLinkedSuccess(false);
    const data = await generatePairCode();
    setCodeData(data);
    setTimeLeft(data.expires_in_seconds || 600);
    setLoadingCode(false);
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setLinking(true);
    setInputError(null);
    setInputSuccess(false);

    const res = await linkDeviceWithCode(inputCode);
    setLinking(false);

    if (res.success) {
      setInputSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setInputError(res.message || 'Código inválido o expirado.');
    }
  };

  const copyToClipboard = () => {
    if (!codeData?.code) return;
    navigator.clipboard.writeText(codeData.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-blue-500/30 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                Vinculación PC ↔ Móvil
              </h2>
              <p className="text-xs text-slate-400">
                Sincronización instantánea sin correo ni contraseña
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

        {/* Mode Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setMode('generate')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              mode === 'generate'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Laptop className="w-4 h-4" />
            1. Mostrar Código en PC
          </button>
          <button
            onClick={() => setMode('input')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              mode === 'input'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            2. Ingresar Código en Celular
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">

          {/* MODE 1: GENERATE CODE (PC DISPLAY) */}
          {mode === 'generate' && (
            <div className="flex flex-col items-center text-center space-y-4">
              
              {isLinkedSuccess ? (
                <div className="py-8 space-y-3 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-300">¡Celular Vinculado con Éxito!</h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    Tu teléfono y esta PC ahora comparten la misma bóveda de sermones. La sincronización se realizará en segundo plano.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
                  >
                    Entendido
                  </button>
                </div>
              ) : loadingCode ? (
                <div className="py-12 space-y-2 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-400" />
                  <p className="text-xs">Generando código seguro de vinculación...</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-300">
                    Abre la aplicación **Biblioteca Pastoral** en tu teléfono móvil o tablet y selecciona <strong>"Vincular con PC"</strong>.
                  </p>

                  {/* 6-Digit Display Box */}
                  <div className="bg-slate-950 border-2 border-blue-500/40 rounded-2xl p-4 w-full max-w-sm space-y-2 shadow-inner">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Código de Vinculación de 6 Dígitos
                    </span>
                    <div className="flex items-center justify-center space-x-2 text-3xl sm:text-4xl font-mono font-extrabold tracking-widest text-blue-300 py-1 select-all">
                      {codeData?.formatted_code || '--- ---'}
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                      <span className="flex items-center gap-1">
                        ⏱️ Expira en: <strong className="text-amber-400 font-mono">{formatCountdown(timeLeft)}</strong>
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedCode ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  {/* Polling Indicator */}
                  <div className="flex items-center justify-center gap-2 text-xs text-blue-400 bg-blue-950/40 border border-blue-800/40 px-3 py-1.5 rounded-xl w-full max-w-sm">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>Esperando conexión desde tu celular...</span>
                  </div>

                  {/* Regenerate Button */}
                  {timeLeft === 0 && (
                    <button
                      onClick={handleGenerate}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Generar nuevo código
                    </button>
                  )}
                </>
              )}

            </div>
          )}

          {/* MODE 2: INPUT CODE (MOBILE RECEIVER) */}
          {mode === 'input' && (
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 text-center">
                Escribe los 6 dígitos que aparecen en la pantalla de la computadora para emparejar tu teléfono.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block text-center">
                  Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  maxLength={7}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Ej: 749 201"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-blue-500 rounded-xl text-center text-2xl sm:text-3xl font-mono font-bold tracking-widest text-blue-300 py-3 focus:outline-none"
                />
              </div>

              {inputError && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{inputError}</span>
                </div>
              )}

              {inputSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>¡Vinculación completada con éxito! Sincronizando datos...</span>
                </div>
              )}

              <button
                type="submit"
                disabled={linking || inputCode.length < 6}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition ${
                  linking || inputCode.length < 6
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                }`}
              >
                {linking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Vinculando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Vincular este Dispositivo
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1 text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            Bóveda Única Pastor: {codeData?.vault_id || localStorage.getItem('pastor_vault_id') || 'Auto-Generada'}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
