// src/js/api.js
const BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_KEY = 'pokedex_cache_v2';
const CACHE_TTL = 1000 * 60 * 60 * 6;

const getCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    return Date.now() - timestamp > CACHE_TTL ? null : data;
  } catch { return null; }
};

const setCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { console.warn('Cache mislukt'); }
};

const fetchOnePokemon = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP fout: ${response.status}`);
  return response.json();
};

export const fetchAllPokemon = async (limit = 151) => {
  const cached = getCache();
  if (cached && cached.length >= limit) return cached.slice(0, limit);

  const listRes = await fetch(`${BASE_URL}/pokemon?limit=${limit}`);
  if (!listRes.ok) throw new Error('Kon lijst niet ophalen');
  const listData = await listRes.json();

  const detailPromises = listData.results.map(p => fetchOnePokemon(p.url));
  const pokemonDetails = await Promise.all(detailPromises);

  const processed = pokemonDetails.map(p => ({
    id: p.id,
    name: p.name,
    sprite: p.sprites.other['official-artwork']?.front_default ?? p.sprites.front_default,
    spritePixel: p.sprites.front_default,
    types: p.types.map(t => t.type.name),
    stats: {
      hp:      p.stats.find(s => s.stat.name === 'hp')?.base_stat ?? 0,
      attack:  p.stats.find(s => s.stat.name === 'attack')?.base_stat ?? 0,
      defense: p.stats.find(s => s.stat.name === 'defense')?.base_stat ?? 0,
      spAtk:   p.stats.find(s => s.stat.name === 'special-attack')?.base_stat ?? 0,
      spDef:   p.stats.find(s => s.stat.name === 'special-defense')?.base_stat ?? 0,
      speed:   p.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0,
    },
    abilities: p.abilities.map(a => a.ability.name),
    height: p.height,
    weight: p.weight,
    baseExp: p.base_experience,
  }));

  setCache(processed);
  return processed;
};

export const fetchTypes = async () => {
  try {
    const res = await fetch(`${BASE_URL}/type?limit=20`);
    const data = await res.json();
    return data.results
      .map(t => t.name)
      .filter(n => n !== 'unknown' && n !== 'shadow');
  } catch { return []; }
};