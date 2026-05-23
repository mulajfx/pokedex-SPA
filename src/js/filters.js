// src/js/filters.js
// Alle filter-, zoek- en sorteerfuncties

/**
 * Generatielimieten voor de gen-filter.
 * Implementeert: constanten (const)
 */
const GEN_RANGES = {
  '1': [1, 151],
  '2': [152, 251],
  '3': [252, 386],
  '4': [387, 493],
};

/**
 * Filtert en sorteert de Pokémonlijst op basis van de gegeven opties.
 * Implementeert: arrow functions, Array methodes (filter, sort, includes),
 *                ternary operator, destructuring, template literals
 * @param {Array}  pokemon  - volledige dataset
 * @param {Object} options  - { query, type, gen, sort }
 * @returns {Array} gefilterde en gesorteerde array
 */
export const applyFilters = (pokemon, { query = '', type = '', gen = '', sort = 'id-asc' }) => {
  // Stap 1: filter op zoekopdracht (naam of nummer)
  const q = query.toLowerCase().trim();
  let result = pokemon.filter(p => {
    const matchName = p.name.includes(q);
    const matchNum  = `#${p.id}`.includes(q) || String(p.id).includes(q);
    return matchName || matchNum;
  });

  // Stap 2: filter op type
  if (type) {
    result = result.filter(p => p.types.includes(type));
  }

  // Stap 3: filter op generatie
  if (gen && GEN_RANGES[gen]) {
    const [min, max] = GEN_RANGES[gen];
    result = result.filter(p => p.id >= min && p.id <= max);
  }

  // Stap 4: sorteren
  // Implementeert: callback functions, ternary operator
  result = [...result].sort((a, b) => {
    switch (sort) {
      case 'id-asc':      return a.id - b.id;
      case 'id-desc':     return b.id - a.id;
      case 'name-asc':    return a.name.localeCompare(b.name);
      case 'name-desc':   return b.name.localeCompare(a.name);
      case 'hp-desc':     return b.stats.hp - a.stats.hp;
      case 'attack-desc': return b.stats.attack - a.stats.attack;
      default:            return a.id - b.id;
    }
  });

  return result;
};
