const API_BASE_URL = 'http://192.168.1.200/api/v1';

async function fetchWithTimeout(url, options = {}, timeout = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const vaultId = localStorage.getItem('pastor_vault_id') || '';
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Vault-Id': vaultId,
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ----------------------------------------------------
// API SERMONES
// ----------------------------------------------------
export async function getSermons(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithTimeout(`${API_BASE_URL}/sermones${query ? `?${query}` : ''}`);
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('cached_sermons', JSON.stringify(data.data));
      return { data: data.data, isOffline: false };
    }
    throw new Error('Error en API');
  } catch (err) {
    let cached = JSON.parse(localStorage.getItem('cached_sermons') || '[]');
    if (params.series) {
      cached = cached.filter(s => s.series_name === params.series);
    }
    if (params.tag) {
      cached = cached.filter(s => Array.isArray(s.tags) && s.tags.includes(params.tag));
    }
    return { data: cached, isOffline: true };
  }
}

export async function getSermonSeriesList() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/sermones/series`);
    const data = await res.json();
    if (data.success) return data.data;
  } catch (err) {
    // Fallback
  }
  const cached = JSON.parse(localStorage.getItem('cached_sermons') || '[]');
  const counts = {};
  cached.forEach(s => {
    if (s.series_name) {
      counts[s.series_name] = (counts[s.series_name] || 0) + 1;
    }
  });
  return Object.keys(counts).map(name => ({ series_name: name, count: counts[name] }));
}

export async function getSermonTagsList() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/sermones/etiquetas`);
    const data = await res.json();
    if (data.success) return data.data;
  } catch (err) {
    // Fallback
  }
  const cached = JSON.parse(localStorage.getItem('cached_sermons') || '[]');
  const counts = {};
  cached.forEach(s => {
    const tags = Array.isArray(s.tags) ? s.tags : [];
    tags.forEach(t => {
      const trimmed = t.trim();
      if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
    });
  });
  return Object.keys(counts).map(name => ({ name, count: counts[name] }));
}

export async function createSermon(sermonData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/sermones`, {
      method: 'POST',
      body: JSON.stringify(sermonData)
    });
    const data = await res.json();
    return data.data;
  } catch (err) {
    const newSermon = {
      id: Date.now(),
      title: sermonData.title || 'Nuevo Sermón',
      slug: 'local-' + Date.now(),
      content_markdown: sermonData.content_markdown || '# ' + sermonData.title,
      content_html: sermonData.content_html || '<h1>' + sermonData.title + '</h1>',
      status: sermonData.status || 'borrador',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const cached = JSON.parse(localStorage.getItem('cached_sermons') || '[]');
    cached.unshift(newSermon);
    localStorage.setItem('cached_sermons', JSON.stringify(cached));
    return newSermon;
  }
}

export async function updateSermon(id, sermonData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/sermones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sermonData)
    });
    const data = await res.json();
    return data.data;
  } catch (err) {
    const cached = JSON.parse(localStorage.getItem('cached_sermons') || '[]');
    const updated = cached.map(item => item.id === id ? { ...item, ...sermonData } : item);
    localStorage.setItem('cached_sermons', JSON.stringify(updated));
    return sermonData;
  }
}

export async function deleteSermon(id) {
  try {
    await fetchWithTimeout(`${API_BASE_URL}/sermones/${id}`, { method: 'DELETE' });
  } catch (err) {
    const cached = JSON.parse(localStorage.getItem('cached_sermons') || '[]');
    const filtered = cached.filter(item => item.id !== id);
    localStorage.setItem('cached_sermons', JSON.stringify(filtered));
  }
}

export async function duplicateSermon(id) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/sermones/${id}/reutilizar`, { method: 'POST' });
    const data = await res.json();
    return data.data;
  } catch (err) {
    const cached = JSON.parse(localStorage.getItem('cached_sermons') || '[]');
    const original = cached.find(item => item.id === id);
    if (!original) return null;
    const copy = {
      ...original,
      id: Date.now(),
      title: original.title + ' (Copia)',
      status: 'borrador',
      preach_date: null,
      location: null
    };
    cached.unshift(copy);
    localStorage.setItem('cached_sermons', JSON.stringify(cached));
    return copy;
  }
}

// ----------------------------------------------------
// API BIBLIA MULTIVERSIÓN (RVR1960, NVI, TLA)
// ----------------------------------------------------
export async function getBibleBooks(version = 'RVR1960') {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/biblia/libros?version=${version}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    return [
      { book_number: 1, book_name: 'Génesis' },
      { book_number: 2, book_name: 'Éxodo' },
      { book_number: 19, book_name: 'Salmos' },
      { book_number: 40, book_name: 'Mateo' },
      { book_number: 43, book_name: 'Juan' },
      { book_number: 45, book_name: 'Romanos' },
      { book_number: 66, book_name: 'Apocalipsis' }
    ];
  }
}

export async function getBibleChapters(bookNumber = 1, version = 'RVR1960') {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/biblia/${bookNumber}/capitulos?version=${version}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    return Array.from({ length: 50 }, (_, i) => i + 1);
  }
}

export async function getBibleVerses(bookNumber = 1, chapter = 1, version = 'RVR1960', verse = null) {
  try {
    const verseParam = verse ? `&verse=${verse}` : '';
    const res = await fetchWithTimeout(`${API_BASE_URL}/biblia/${bookNumber}/${chapter}?version=${version}${verseParam}`);
    const data = await res.json();
    return { data: data.data || [], isOffline: false };
  } catch (err) {
    return {
      data: [
        { verse: 1, scripture: 'En el principio creó Dios los cielos y la tierra.' },
        { verse: 2, scripture: 'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo.' }
      ],
      isOffline: true
    };
  }
}

export async function searchBible(query, version = '') {
  try {
    const queryStr = `q=${encodeURIComponent(query)}${version ? `&version=${version}` : ''}`;
    const res = await fetchWithTimeout(`${API_BASE_URL}/biblia/buscar?${queryStr}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    return [];
  }
}

// ----------------------------------------------------
// AUTO-DESPLIEGUE Y MANTENIMIENTO DEL SERVIDOR PROXMOX
// ----------------------------------------------------
export async function updateProxmoxServer() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/sistema/actualizar`, {
      method: 'POST'
    }, 15000);
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      message: 'No se pudo conectar con el servidor Proxmox (' + err.message + ').'
    };
  }
}

export async function getSystemStatus() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/sistema/estado`);
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, commit: 'Modo Offline' };
  }
}

// ----------------------------------------------------
// API NOTAS BÍBLICAS POR VERSÍCULO
// ----------------------------------------------------
export async function getBibleNotes(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithTimeout(`${API_BASE_URL}/notas${query ? `?${query}` : ''}`);
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('cached_bible_notes', JSON.stringify(data.data));
      return { data: data.data, isOffline: false };
    }
    throw new Error('Error en API');
  } catch (err) {
    const cached = localStorage.getItem('cached_bible_notes');
    return { data: cached ? JSON.parse(cached) : [], isOffline: true };
  }
}

export async function getNotesByChapter(bookNumber, chapter) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/notas/capitulo?book=${bookNumber}&chapter=${chapter}`);
    const data = await res.json();
    if (data.success) {
      return { data: data.data, isOffline: false };
    }
    throw new Error('Error en API');
  } catch (err) {
    const cached = JSON.parse(localStorage.getItem('cached_bible_notes') || '[]');
    const filtered = cached.filter(n => n.book_number === parseInt(bookNumber) && n.chapter === parseInt(chapter));
    return { data: filtered, isOffline: true };
  }
}

export async function saveBibleNote(noteData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/notas`, {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
    const data = await res.json();
    const cached = JSON.parse(localStorage.getItem('cached_bible_notes') || '[]');
    const existingIndex = cached.findIndex(n => n.book_number === noteData.book_number && n.chapter === noteData.chapter && n.verse === noteData.verse);
    if (existingIndex >= 0) {
      cached[existingIndex] = { ...cached[existingIndex], ...data.data };
    } else {
      cached.unshift(data.data);
    }
    localStorage.setItem('cached_bible_notes', JSON.stringify(cached));
    return data.data;
  } catch (err) {
    const cached = JSON.parse(localStorage.getItem('cached_bible_notes') || '[]');
    const existingIndex = cached.findIndex(n => n.book_number === noteData.book_number && n.chapter === noteData.chapter && n.verse === noteData.verse);
    const newNote = {
      id: existingIndex >= 0 ? cached[existingIndex].id : Date.now(),
      ...noteData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      cached[existingIndex] = newNote;
    } else {
      cached.unshift(newNote);
    }
    localStorage.setItem('cached_bible_notes', JSON.stringify(cached));
    return newNote;
  }
}

export async function deleteBibleNote(id) {
  try {
    await fetchWithTimeout(`${API_BASE_URL}/notas/${id}`, { method: 'DELETE' });
  } catch (err) {
    // ignore
  }
  const cached = JSON.parse(localStorage.getItem('cached_bible_notes') || '[]');
  const filtered = cached.filter(n => n.id !== id);
  localStorage.setItem('cached_bible_notes', JSON.stringify(filtered));
}

// ----------------------------------------------------
// API DICCIONARIO STRONG Y TEOLÓGICO
// ----------------------------------------------------
const FALLBACK_STRONG = [
  { code: 'G4151', original_word: 'πνεῦμα', transliteration: 'pneuma', pronunciation: "pnoy'-mah", definition: 'Viento, aliento, espíritu. Se refiere al Espíritu Santo, espíritu humano o seres espirituales.', type: 'greek' },
  { code: 'G3056', original_word: 'λόγος', transliteration: 'logos', pronunciation: "log'-os", definition: 'Palabra, discurso, pensamiento revelado. Jesucristo como la Palabra encarnada (Juan 1:1).', type: 'greek' },
  { code: 'G26', original_word: 'ἀγάπη', transliteration: 'agape', pronunciation: "ag-ah'-pay", definition: 'Amor divino, incondicional, sacrificial y voluntario. El amor supremo de Dios.', type: 'greek' },
  { code: 'G5485', original_word: 'χάρις', transliteration: 'charis', pronunciation: "khar'-ece", definition: 'Gracia, favor inmerecido, benevolencia divina otorgando salvación gratuita.', type: 'greek' },
  { code: 'G4102', original_word: 'πίστις', transliteration: 'pistis', pronunciation: "pis'-tis", definition: 'Fe, convicción firme y confianza personal en Dios y sus promesas.', type: 'greek' },
  { code: 'H1254', original_word: 'בָּרָא', transliteration: 'bara', pronunciation: "baw-raw'", definition: 'Crear de la nada (ex nihilo). Verbo cuyo sujeto divino exclusivo es Dios (Génesis 1:1).', type: 'hebrew' },
  { code: 'H430', original_word: 'אֱלֹהִים', transliteration: 'Elohim', pronunciation: "el-o-heem'", definition: 'Dios, Creador Soberano, Juez Supremo. Plural de majestad y plenitud de atributos divinos.', type: 'hebrew' },
  { code: 'H3068', original_word: 'יְהוָה', transliteration: 'Yahweh / YHWH', pronunciation: "yeh-ho-vaw'", definition: 'EL SEÑOR. El nombre propio de Dios en el pacto ("Yo Soy el que Soy").', type: 'hebrew' },
  { code: 'H7965', original_word: 'שָׁלוֹם', transliteration: 'shalom', pronunciation: "shaw-lome'", definition: 'Paz, plenitud, integridad, salud y prosperidad espiritual integral.', type: 'hebrew' }
];

const FALLBACK_THEOLOGICAL = [
  { term: 'Justificación', category: 'Soteriología', definition: 'Declaración judicial por la cual Dios declara justo al pecador sobre la base de la justicia impecable de Jesucristo imputada únicamente mediante la fe.', cross_references: 'Romanos 3:24-26, Romanos 5:1' },
  { term: 'Santificación', category: 'Soteriología', definition: 'Proceso continuo impulsado por el Espíritu Santo mediante el cual el creyente es transformado progresivamente a la imagen de Cristo.', cross_references: '1 Tesalonicenses 4:3, Filipenses 1:6' },
  { term: 'Redención', category: 'Soteriología', definition: 'Rescate y liberación de la esclavitud del pecado pagado con la sangre preciosa de Cristo.', cross_references: 'Efesios 1:7, 1 Pedro 1:18-19' },
  { term: 'Propiciación', category: 'Cristología / Expiación', definition: 'El acto sustitutivo de Cristo en la cruz mediante el cual se aplaca la justa ira de Dios contra el pecado.', cross_references: '1 Juan 2:2, Romanos 3:25' },
  { term: 'Escatología', category: 'Teología Sistemática', definition: 'Estudio bíblico de los tiempos finales: Segunda Venida, resurrección, juicio final y Reino eterno.', cross_references: 'Apocalipsis 21-22, 1 Tesalonicenses 4:13-18' }
];

export async function getStrongByCode(code) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/diccionario/strong/${code.toUpperCase()}`);
    const data = await res.json();
    if (data.success) return { data: data.data, isOffline: false };
  } catch (err) {
    // Fallback
  }
  const codeUpper = code.toUpperCase();
  const match = FALLBACK_STRONG.find(s => s.code === codeUpper);
  return { data: match || null, isOffline: true };
}

export async function searchStrongDictionary(query = '', type = '') {
  try {
    const queryParams = new URLSearchParams();
    if (query) queryParams.append('q', query);
    if (type) queryParams.append('type', type);
    const res = await fetchWithTimeout(`${API_BASE_URL}/diccionario/strong/buscar?${queryParams.toString()}`);
    const data = await res.json();
    if (data.success) return { data: data.data, isOffline: false };
  } catch (err) {
    // Fallback
  }
  let filtered = FALLBACK_STRONG;
  if (type) filtered = filtered.filter(s => s.type === type);
  if (query) {
    const qLower = query.toLowerCase();
    filtered = filtered.filter(s =>
      s.code.toLowerCase().includes(qLower) ||
      s.transliteration.toLowerCase().includes(qLower) ||
      s.definition.toLowerCase().includes(qLower) ||
      s.original_word.includes(query)
    );
  }
  return { data: filtered, isOffline: true };
}

export async function searchTheologicalDictionary(query = '') {
  try {
    const queryParams = new URLSearchParams();
    if (query) queryParams.append('q', query);
    const res = await fetchWithTimeout(`${API_BASE_URL}/diccionario/teologico?${queryParams.toString()}`);
    const data = await res.json();
    if (data.success) return { data: data.data, isOffline: false };
  } catch (err) {
    // Fallback
  }
  let filtered = FALLBACK_THEOLOGICAL;
  if (query) {
    const qLower = query.toLowerCase();
    filtered = filtered.filter(t =>
      t.term.toLowerCase().includes(qLower) ||
      (t.category && t.category.toLowerCase().includes(qLower)) ||
      t.definition.toLowerCase().includes(qLower)
    );
  }
  return { data: filtered, isOffline: true };
}

// ----------------------------------------------------
// API VINCULACIÓN DE DISPOSITIVOS (PC ↔ MÓVIL)
// ----------------------------------------------------
export async function generatePairCode() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/sincronizacion/generar-codigo`, {
      method: 'POST',
      body: JSON.stringify({ vault_id: localStorage.getItem('pastor_vault_id') || '' })
    });
    const data = await res.json();
    if (data.success && data.vault_id) {
      localStorage.setItem('pastor_vault_id', data.vault_id);
    }
    return data;
  } catch (err) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const vaultId = localStorage.getItem('pastor_vault_id') || ('VAULT-LOCAL-' + Date.now());
    localStorage.setItem('pastor_vault_id', vaultId);
    return {
      success: true,
      code,
      formatted_code: code.slice(0, 3) + ' ' + code.slice(3),
      vault_id: vaultId,
      expires_in_seconds: 600,
      isOffline: true
    };
  }
}

export async function linkDeviceWithCode(code) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/sincronizacion/vincular`, {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (data.success && data.vault_id) {
      localStorage.setItem('pastor_vault_id', data.vault_id);
    }
    return data;
  } catch (err) {
    return {
      success: false,
      message: 'No se pudo conectar con el servidor para la vinculación. Revisa tu conexión Wi-Fi.'
    };
  }
}

export async function checkPairCodeStatus(code) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/sincronizacion/estado?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, is_linked: false };
  }
}




