const STORAGE_KEY = 'dailyIntake.v1';

function todayKey() {
  // YYYY-MM-DD (lokal)
  return new Date().toLocaleDateString('sv-SE');
}

function read() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function write(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('intake:changed'));
}

export function getTodayItems() {
  const s = read(); return s[todayKey()] || [];
}

export function addItemToday(item) {
  const s = read(); const key = todayKey();
  const list = s[key] || [];
  if (list.some(x => String(x.fdcId) === String(item.fdcId))) return false;
  s[key] = [...list, { fdcId: String(item.fdcId), description: item.description, grams: item.grams ?? 100 }];
  write(s); return true;
}

export function updateItemGrams(fdcId, grams) {
  const s = read(); const key = todayKey(); const list = s[key] || [];
  s[key] = list.map(x => String(x.fdcId) === String(fdcId) ? { ...x, grams: Number(grams) || 0 } : x);
  write(s);
}

export function removeItemToday(fdcId) {
  const s = read(); const key = todayKey(); const list = s[key] || [];
  s[key] = list.filter(x => String(x.fdcId) !== String(fdcId));
  write(s);
}

export function clearToday() {
  const s = read(); const key = todayKey(); delete s[key]; write(s);
}

export function subscribe(cb) {
  const handler = () => cb();
  window.addEventListener('intake:changed', handler);
  return () => window.removeEventListener('intake:changed', handler);
}