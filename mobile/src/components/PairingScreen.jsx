import React, { useState } from 'react';
import { QrCode, Smartphone, KeyRound, CheckCircle2, AlertCircle, RefreshCw, Server } from 'lucide-react';
import { linkDeviceWithCode } from '../services/api';

export default function PairingScreen({ onPairedSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await linkDeviceWithCode(code);
      setSuccessMsg('¡Dispositivo vinculado con éxito a tu Biblioteca Pastoral!');
      setTimeout(() => {
        onPairedSuccess(res.vault_id);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Error al intentar vincular. Verifica que el código sea correcto y no haya expirado en tu PC.');
    } finally {
      setLoading(false);
    }
  };

  const simulateQrScan = async () => {
    setScannerActive(true);
    setError('');
    // Simular escaneo de cámara QR
    setTimeout(async () => {
      setScannerActive(false);
      setCode('611068');
    }, 1500);
  };

  const formattedCode = code.length > 3 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        {/* Header Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-3 shadow-lg shadow-indigo-500/10">
            <Smartphone className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vincular Dispositivo Móvil</h1>
          <p className="text-sm text-gray-400 mt-1">
            Conecta tu teléfono con Biblioteca Pastoral en tu PC sin necesidad de crear cuenta ni ingresar correo.
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 animate-pulse">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Formulario de Código de 6 Dígitos */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 text-center">
              Código de 6 dígitos generado en tu PC
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={handleInputChange}
                placeholder="000 000"
                className="w-full bg-gray-950/80 border-2 border-indigo-500/40 focus:border-indigo-400 text-center text-3xl font-mono tracking-[0.4em] text-white py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-700 font-bold"
              />
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-600 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-base active:scale-[0.98]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Vinculando...</span>
              </>
            ) : (
              <span>Vincular con PC</span>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <span className="relative bg-gray-900 px-3 text-xs text-gray-500 uppercase tracking-wider font-medium">
            O escanea el código
          </span>
        </div>

        {/* Escáner QR */}
        <button
          type="button"
          onClick={simulateQrScan}
          disabled={scannerActive}
          className="w-full py-3 bg-gray-800/80 hover:bg-gray-800 text-gray-300 font-semibold rounded-2xl border border-gray-700/60 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
        >
          <QrCode className="w-5 h-5 text-indigo-400" />
          <span>{scannerActive ? "Escaneando QR con Cámara..." : "Escanear Código QR"}</span>
        </button>

        {/* Footer info servidor */}
        <div className="mt-6 pt-4 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Servidor: 192.168.1.200</span>
          </div>
          <span className="text-gray-600">Zero-Friction Vault</span>
        </div>
      </div>
    </div>
  );
}
