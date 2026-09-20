import React, { useState, useEffect } from 'react';
import PairingScreen from './components/PairingScreen';
import MobileSermonList from './components/MobileSermonList';
import MobileSermonViewer from './components/MobileSermonViewer';
import MobilePreacherMode from './components/MobilePreacherMode';
import { getVaultId, setVaultId } from './services/api';

export default function App() {
  const [vaultId, setVaultState] = useState('');
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [preachingSermon, setPreachingSermon] = useState(null);

  useEffect(() => {
    const currentVault = getVaultId();
    setVaultState(currentVault);
  }, []);

  const handlePairedSuccess = (newVaultId) => {
    setVaultId(newVaultId);
    setVaultState(newVaultId);
  };

  const handleUnlink = () => {
    if (window.confirm('¿Deseas desvincular este teléfono de tu PC?')) {
      setVaultId('');
      setVaultState('');
      setSelectedSermon(null);
      setPreachingSermon(null);
    }
  };

  // 1. Si no está vinculado, mostrar pantalla de vinculación
  if (!vaultId) {
    return <PairingScreen onPairedSuccess={handlePairedSuccess} />;
  }

  // 2. Si está en Modo Predicador
  if (preachingSermon) {
    return (
      <MobilePreacherMode
        sermon={preachingSermon}
        onClose={() => setPreachingSermon(null)}
      />
    );
  }

  // 3. Si seleccionó un sermón para leer
  if (selectedSermon) {
    return (
      <MobileSermonViewer
        sermon={selectedSermon}
        onBack={() => setSelectedSermon(null)}
        onStartPreaching={(sermon) => setPreachingSermon(sermon)}
      />
    );
  }

  // 4. Pantalla Principal: Lista de Sermones
  return (
    <MobileSermonList
      onSelectSermon={(sermon) => setSelectedSermon(sermon)}
      onUnlink={handleUnlink}
    />
  );
}
