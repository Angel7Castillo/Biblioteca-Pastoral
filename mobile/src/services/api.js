// Servicio de API Móvil para Biblioteca Pastoral (Proxmox + Offline-First)

const API_BASE_URL = 'http://192.168.1.200/api/v1';

export const getVaultId = () => {
  return localStorage.getItem('bp_mobile_vault_id') || '';
};

export const setVaultId = (vaultId) => {
  if (vaultId) {
    localStorage.setItem('bp_mobile_vault_id', vaultId);
  } else {
    localStorage.removeItem('bp_mobile_vault_id');
  }
};

export const linkDeviceWithCode = async (rawCode, deviceName = 'Smartphone Android') => {
  const code = rawCode.replace(/\D/g, '');
  if (code.length !== 6) {
    throw new Error('El código debe contener exactamente 6 dígitos.');
  }

  const response = await fetch(`${API_BASE_URL}/sincronizacion/vincular`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      code,
      device_name: deviceName,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'No se pudo vincular el dispositivo.');
  }

  if (data.vault_id) {
    setVaultId(data.vault_id);
  }

  return data;
};

export const fetchMobileSermons = async (search = '', status = '') => {
  const vaultId = getVaultId();
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/sermones?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'X-Vault-Id': vaultId,
      },
    });

    if (!response.ok) throw new Error('Error al conectar con Proxmox');

    const data = await response.json();
    const sermons = data.data || [];

    // Guardar en almacenamiento local para offline-first
    localStorage.setItem('bp_mobile_cached_sermons', JSON.stringify(sermons));
    return { sermons, isOffline: false };
  } catch (err) {
    console.warn('Servidor offline, cargando sermones desde almacenamiento local...');
    const cached = localStorage.getItem('bp_mobile_cached_sermons');
    const sermons = cached ? JSON.parse(cached) : getMockMobileSermons();
    return { sermons, isOffline: true };
  }
};

const getMockMobileSermons = () => [
  {
    id: 101,
    title: 'La Gracia que Transforma Vidas',
    passage: 'Efesios 2:8-10',
    status: 'listo',
    series: 'Fundamentos de la Fe',
    tags: ['Gracia', 'Salvación', 'Dominical'],
    date: '2026-09-20',
    content: `
      <h2>I. La Naturaleza Inmerecida de la Gracia (v. 8)</h2>
      <p>Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios.</p>
      <p>La gracia no es algo que ganamos con esfuerzos humanos o méritos personales, sino un regalo divino inmerecido.</p>
      
      <h2>II. El Peligro del Orgullo Humano (v. 9)</h2>
      <p>No por obras, para que nadie se gloríe.</p>
      <p>Dios diseñó la salvación de tal manera que toda la gloria sea únicamente para Él. Ningún creyente puede jactarse.</p>

      <h2>III. Diseñados para Buenas Obras (v. 10)</h2>
      <p>Porque somos hechura suya, creados en Cristo Jesús para buenas obras, las cuales Dios preparó de antemano.</p>
      <p>No somos salvos por buenas obras, sino creados para realizar buenas obras que reflejen su luz en la comunidad.</p>
    `
  },
  {
    id: 102,
    title: 'Permaneciendo Firmes en la Tormenta',
    passage: 'Mateo 7:24-27',
    status: 'idea',
    series: 'Sermón del Monte',
    tags: ['Fe', 'Esperanza'],
    date: '2026-09-21',
    content: `
      <h2>I. La Roca Firme</h2>
      <p>Cualquiera que me oye estas palabras y las hace, le compararé a un hombre prudente que edificó su casa sobre la roca.</p>
      <h2>II. La Lluvia y los Vientos</h2>
      <p>Vinieron ríos y soplaron vientos y dieron con ímpetu contra aquella casa; y no cayó.</p>
    `
  }
];
