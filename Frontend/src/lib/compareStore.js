const KEY = 'compareItems.v1';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('compare:changed'));
}

export function getItems() {
  return read();
}

export function addItem(item) {
  const list = read();
  if (list.some(x => String(x.fdcId) === String(item.fdcId))) return false;
  // simpan info minimal; boleh sertakan macrosPer100g jika tersedia
  list.push({
    fdcId: String(item.fdcId),
    description: item.description,
    grams: item.grams ?? 100,
    macrosPer100g: item.macrosPer100g ?? null,
    servingInfo: item.servingInfo ?? null,
  });
  write(list);
  return true;
}

export function removeItem(fdcId) {
  const list = read().filter(x => String(x.fdcId) !== String(fdcId));
  write(list);
}

export function clear() {
  write([]);
}

export function subscribe(cb) {
  const h = () => cb(getItems());
  window.addEventListener('compare:changed', h);
  return () => window.removeEventListener('compare:changed', h);
}