// src/js/main.js
// Hoofdbestand: koppelt alle modules en beheert de app-staat

import { fetchAllPokemon, fetchTypes } from './api.js';
import { applyFilters } from './filters.js';
import {
  renderGrid, renderList, openModal, closeModal,
  renderFavPanel, updateFavCount, updateResultCount,
  showLoading, showError, showContent, populateTypeFilter,
  els,
} from './ui.js';
import { getPrefs, setPref, toggleFavourite } from './storage.js';

// ===== APP-STAAT =====
// Implementeert: gebruik van constanten (const)
const state = {
  allPokemon: [],     // Volledige dataset (gecached)
  filtered: [],       // Na filters toegepast
  view: 'grid',       // 'grid' | 'list'
  query: '',
  type: '',
  gen: '',
  sort: 'id-asc',
};

// ===== FORMULIERVALIDATIE =====
// Implementeert: formuliervalidatie
const validateSearchInput = (value) => {
  // Max 50 tekens, geen HTML-tags
  const trimmed = value.trim().slice(0, 50);
  const sanitized = trimmed.replace(/<[^>]*>/g, '');
  return sanitized;
};

// ===== RENDER CYCLUS =====

/**
 * Past de filters toe en rendert de juiste weergave.
 * Implementeert: arrow functions, Array methodes
 */
const render = () => {
  state.filtered = applyFilters(state.allPokemon, {
    query: state.query,
    type:  state.type,
    gen:   state.gen,
    sort:  state.sort,
  });

  updateResultCount(state.filtered.length, state.allPokemon.length);

  // Conditional: kies grid of lijst
  if (state.view === 'grid') {
    renderGrid(state.filtered, handleOpenModal, handleToggleFav);
  } else {
    renderList(state.filtered, handleOpenModal, handleToggleFav);
  }

  showContent(state.view);
};

// ===== EVENT HANDLERS =====
// Implementeert: callback functions, events koppelen

const handleToggleFav = (id) => {
  const added = toggleFavourite(id);
  updateFavCount();
  return added;
};

const handleOpenModal = (pokemon) => {
  openModal(pokemon);
};

// ===== EVENTS KOPPELEN =====

// Zoekfunctie met debounce
// Implementeert: callback functions, setTimeout (Promise-gebaseerd patroon)
let searchTimer;
document.querySelector('#searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.query = validateSearchInput(e.target.value);
    setPref('query', state.query);
    render();
  }, 280); // 280ms debounce
});

// Type-filter
document.querySelector('#typeFilter').addEventListener('change', (e) => {
  state.type = e.target.value;
  setPref('typeFilter', state.type);
  render();
});

// Sortering
document.querySelector('#sortSelect').addEventListener('change', (e) => {
  state.sort = e.target.value;
  setPref('sort', state.sort);
  render();
});

// Generatie-filter
document.querySelector('#genFilter').addEventListener('change', (e) => {
  state.gen = e.target.value;
  setPref('genFilter', state.gen);
  render();
});

// Filters wissen
document.querySelector('#clearFilters').addEventListener('click', () => {
  state.query = '';
  state.type  = '';
  state.gen   = '';
  state.sort  = 'id-asc';

  // DOM manipulatie – elementen manipuleren
  document.querySelector('#searchInput').value  = '';
  document.querySelector('#typeFilter').value   = '';
  document.querySelector('#sortSelect').value   = 'id-asc';
  document.querySelector('#genFilter').value    = '';

  render();
});

// Weergave wisselen: grid / lijst
document.querySelector('#viewGrid').addEventListener('click', () => {
  state.view = 'grid';
  setPref('view', 'grid');
  document.querySelector('#viewGrid').classList.add('active');
  document.querySelector('#viewList').classList.remove('active');
  render();
});

document.querySelector('#viewList').addEventListener('click', () => {
  state.view = 'list';
  setPref('view', 'list');
  document.querySelector('#viewList').classList.add('active');
  document.querySelector('#viewGrid').classList.remove('active');
  render();
});

// Modal sluiten
document.querySelector('#modalClose').addEventListener('click', closeModal);
document.querySelector('#modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal(); // Klik op overlay
});

// Escape-toets sluit modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Favorieten-panel openen/sluiten
document.querySelector('#showFavourites').addEventListener('click', () => {
  renderFavPanel(state.allPokemon, handleOpenModal);
  document.querySelector('#favouritesPanel').classList.remove('hidden');
});

document.querySelector('#closeFavPanel').addEventListener('click', () => {
  document.querySelector('#favouritesPanel').classList.add('hidden');
});

// Thema-toggle
// Implementeert: LocalStorage (via setPref), DOM manipulatie
document.querySelector('#themeToggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') ?? 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  setPref('theme', next);
});

// Retry-knop bij fout
document.querySelector('#retryBtn').addEventListener('click', () => init());

// ===== INITIALISATIE =====

/**
 * Start de applicatie: laad data, herstel voorkeuren, render.
 * Implementeert: async/await, Promises, try/catch
 */
const init = async () => {
  showLoading(true);
  showError(false);
  document.querySelector('#pokemonGrid').classList.add('hidden');
  document.querySelector('#listView').classList.add('hidden');

  try {
    // Herstel gebruikersvoorkeuren uit LocalStorage
    const prefs = getPrefs();
    state.view = prefs.view;
    state.sort = prefs.sort;
    state.type = prefs.typeFilter;
    state.gen  = prefs.genFilter;

    // Herstel thema
    document.documentElement.setAttribute('data-theme', prefs.theme);

    // Herstel sort-dropdown
    document.querySelector('#sortSelect').value = prefs.sort;
    document.querySelector('#typeFilter').value = prefs.typeFilter;
    document.querySelector('#genFilter').value  = prefs.genFilter;

    // Herstel view-knoppen
    if (prefs.view === 'list') {
      document.querySelector('#viewList').classList.add('active');
      document.querySelector('#viewGrid').classList.remove('active');
    }

    // Data ophalen: beide Promises parallel starten
    // Implementeert: Promise.all, async/await
    const [pokemon, types] = await Promise.all([
      fetchAllPokemon(151),
      fetchTypes(),
    ]);

    state.allPokemon = pokemon;

    // Type-filter opties invullen
    populateTypeFilter(types);

    updateFavCount();
    render();

  } catch (err) {
    console.error('Fout bij laden:', err);
    showError(true);
  } finally {
    // finally-blok: altijd uitgevoerd, ook bij fout
    showLoading(false);
  }
};

// App opstarten
init();
