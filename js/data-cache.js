// ============================================
// DataCache - Shared fetch with dedup + in-memory cache
// ============================================

const cache = new Map();

async function fetchJSON(url) {
  if (cache.has(url)) return cache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

export async function getChampions() {
  const data = await fetchJSON('data/champions.json');
  return data.champions;
}

export async function getRegions() {
  const data = await fetchJSON('data/regions.json');
  return data.regions;
}

export async function getFactions() {
  const data = await fetchJSON('data/factions.json');
  return data.factions;
}

export async function getShops() {
  const data = await fetchJSON('data/shops.json');
  return data.shops;
}

export function clearCache() {
  cache.clear();
}
