// Favorieten en voorkeuren via LocalStorage

const FAVS_KEY = 'pokedex_favourites';
const PREFS_KEY = 'pokedex_preferences';

// ===== FAVORIETEN =====

/**
 * Geeft de array van opgeslagen favorieten terug.
 * Implementeert: LocalStorage, JSON manipulatie
 */
export const getFavourites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVS_KEY)) ?? [];
  } catch {
    return [];
  }
};

/**
 * Controleert of een Pokémon in de favorieten staat.
 * Implementeert: Array.includes, arrow function
 */
export const isFavourite = (id) => getFavourites().includes(id);

/**
 * Voegt een Pokémon toe aan of verwijdert hem uit de favorieten.
 * Implementeert: Array methodes (includes, filter, push), LocalStorage
 * @returns {boolean} true als toegevoegd, false als verwijderd
 */
export const toggleFavourite = (id) => {
  const favs = getFavourites();
  const alreadyFav = favs.includes(id);
  const updated = alreadyFav
    ? favs.filter(fid => fid !== id)   // ternary + array filter
    : [...favs, id];                    // spread operator
  localStorage.setItem(FAVS_KEY, JSON.stringify(updated));
  return !alreadyFav;
};

// ===== GEBRUIKERSVOORKEUREN =====

const defaultPrefs = {
  theme: 'light',
  view: 'grid',
  sort: 'id-asc',
  typeFilter: '',
  genFilter: '',
};

/**
 * Haalt de opgeslagen gebruikersvoorkeuren op.
 * Implementeert: LocalStorage, JSON, spread operator
 */
export const getPrefs = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY)) ?? {};
    return { ...defaultPrefs, ...saved }; // Merge met defaults
  } catch {
    return { ...defaultPrefs };
  }
};

/**
 * Slaat een specifieke voorkeur op.
 * Implementeert: LocalStorage, JSON, computed property names
 */
export const setPref = (key, value) => {
  const prefs = getPrefs();
  prefs[key] = value;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
};
