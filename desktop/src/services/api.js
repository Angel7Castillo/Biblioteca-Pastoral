const API_BASE_URL = 'http://192.168.1.200/api/v1';

async function fetchWithTimeout(url, options = {}, timeout = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
    const cached = localStorage.getItem('cached_sermons');
    return { data: cached ? JSON.parse(cached) : [], isOffline: true };
  }
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
export async function getBibleVerses(bookNumber = 1, chapter = 1, version = 'RVR1960') {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/biblia/${bookNumber}/${chapter}?version=${version}`);
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
