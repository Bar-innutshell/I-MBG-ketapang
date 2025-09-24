// AI-generated helper for interacting with backend API.
// Base URL relies on CRA proxy (set in package.json) or falls back to localhost:3000.
const BASE = ''; // relative; CRA proxy will forward to backend

async function handle(res) {
  if (!res.ok) {
    let text;
    try { text = await res.text(); } catch (_) { /* ignore */ }
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

// ---------- Artikel ----------
export const artikelAPI = {
  list: () => fetch(`${BASE}/artikel`).then(handle),
  get: (id) => fetch(`${BASE}/artikel/${id}`).then(handle),
  create: (data) => {
    const fd = new FormData();
    fd.append('judul', data.judul || '');
    fd.append('isi', data.isi || '');
    if (data.gambar instanceof File) fd.append('gambar', data.gambar);
    return fetch(`${BASE}/artikel`, { method: 'POST', body: fd }).then(handle);
  },
  update: (id, data) => {
    const hasFile = data.gambar instanceof File;
    if (hasFile) {
      const fd = new FormData();
      if (data.judul !== undefined) fd.append('judul', data.judul);
      if (data.isi !== undefined) fd.append('isi', data.isi);
      fd.append('gambar', data.gambar);
      return fetch(`${BASE}/artikel/${id}`, { method: 'PATCH', body: fd }).then(handle);
    }
    return fetch(`${BASE}/artikel/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handle);
  },
  remove: (id) => fetch(`${BASE}/artikel/${id}`, { method: 'DELETE' }).then(handle)
};

// ---------- Resep ----------
export const resepAPI = {
  list: () => fetch(`${BASE}/resep`).then(handle),
  get: (id) => fetch(`${BASE}/resep/${id}`).then(handle),
  create: (data) => {
    const fd = new FormData();
    const fields = ['judul','deskripsi','porsi','durasiMenit','tingkatKesulitan','perkiraanBiaya'];
    fields.forEach(f => { if (data[f] !== undefined && data[f] !== null) fd.append(f, data[f]); });
    // Arrays/objects must be stringified
    if (data.ingredients) fd.append('ingredients', JSON.stringify(data.ingredients));
    if (data.langkahMasak) fd.append('langkahMasak', JSON.stringify(data.langkahMasak));
    if (data.nutrisi) fd.append('nutrisi', JSON.stringify(data.nutrisi));
    if (data.tags) fd.append('tags', JSON.stringify(data.tags));
    if (data.gambar instanceof File) fd.append('gambar', data.gambar);
    return fetch(`${BASE}/resep`, { method: 'POST', body: fd }).then(async (res) => {
      // backend currently expects raw arrays; if server does not parse JSON automatically,
      // you'll need middleware to JSON.parse. For now we send string; adjust server if needed.
      return handle(res);
    });
  },
  update: (id, data) => {
    const hasFile = data.gambar instanceof File;
    if (hasFile) {
      const fd = new FormData();
      const scalar = ['judul','deskripsi','porsi','durasiMenit','tingkatKesulitan','perkiraanBiaya'];
      scalar.forEach(f => { if (data[f] !== undefined) fd.append(f, data[f]); });
      if (data.ingredients) fd.append('ingredients', JSON.stringify(data.ingredients));
      if (data.langkahMasak) fd.append('langkahMasak', JSON.stringify(data.langkahMasak));
      if (data.nutrisi) fd.append('nutrisi', JSON.stringify(data.nutrisi));
      if (data.tags) fd.append('tags', JSON.stringify(data.tags));
      fd.append('gambar', data.gambar);
      return fetch(`${BASE}/resep/${id}`, { method: 'PATCH', body: fd }).then(handle);
    }
    // JSON update path
    const body = { ...data };
    return fetch(`${BASE}/resep/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handle);
  },
  remove: (id) => fetch(`${BASE}/resep/${id}`, { method: 'DELETE' }).then(handle)
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function searchGizi({ query, page = 1, pageSize = 10, dataType = '' }) {
  const qs = new URLSearchParams({
    query,
    page: String(page),
    pageSize: String(pageSize),
  });
  if (dataType) qs.set('dataType', dataType);

  const res = await fetch(`${API_BASE}/gizi/search?${qs.toString()}`);
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || 'Gagal memuat data gizi');
  }
  return res.json(); // { data, pagination }
}

export async function getFoodDetail(fdcId) {
  const res = await fetch(`${API_BASE}/gizi/${fdcId}`);
  if (!res.ok) throw new Error('Gagal memuat detail gizi');
  return res.json();
}

export async function fetchResep({ search = '', page = 1, limit = 10 } = {}) {
  const qs = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(`${API_BASE}/resep?${qs.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat resep');
  return res.json(); // { data, pagination }
}

export async function fetchArtikel({ search = '', page = 1, limit = 10 } = {}) {
  const qs = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(`${API_BASE}/artikel?${qs.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat artikel');
  return res.json(); // { data, pagination }
}

export function imageUrl(fileName) {
  if (!fileName) return null;
  return `/uploads/${fileName}`;
}
