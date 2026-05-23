// DOM manipulatie en rendering

import { isFavourite, toggleFavourite, getFavourites, getPrefs } from './storage.js';

// ===== DOM SELECTORS =====
// Implementeert: DOM manipulatie – elementen selecteren
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

export const els = {
  grid:         () => $('#pokemonGrid'),
  listBody:     () => $('#listBody'),
  resultCount:  () => $('#resultCount'),
  favCount:     () => $('#favCount'),
  favList:      () => $('#favList'),
  modal:        () => $('#modal'),
  modalContent: () => $('#modalContent'),
  loading:      () => $('#loadingState'),
  error:        () => $('#errorState'),
  listView:     () => $('#listView'),
};

// ===== HULPFUNCTIES =====

/**
 * Geeft de kleur-CSS-class terug voor een type-badge.
 * Implementeert: template literals
 */
const typeBadge = (type) =>
  `<span class="type-badge type-${type}">${type}</span>`;

/**
 * Formatteer een Pokédex-nummer met voorloopnullen.
 * Implementeert: template literals, String.padStart
 */
const formatNum = (id) => `#${String(id).padStart(3, '0')}`;

/**
 * Berekent een kleur voor een statbalk (groen → oranje → rood).
 * Implementeert: ternary operator
 */
const statColor = (val) =>
  val >= 100 ? '#3d9e3d' : val >= 60 ? '#d4a017' : '#e63946';

// Callback voor het koppelen van IntersectionObserver-effecten
// Implementeert: Observer API, callback functions
const observerCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Eenmalig animeren
    }
  });
};

// Implementeert: Observer API (IntersectionObserver)
const cardObserver = new IntersectionObserver(observerCallback, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px',
});

// ===== KAARTWEERGAVE =====

/**
 * Maakt één Pokémon-kaart aan als HTML-element.
 * Implementeert: DOM manipulatie – elementen aanmaken en manipuleren,
 *                template literals, events koppelen, ternary operator
 */
const createCard = (pokemon, onOpenModal, onToggleFav) => {
  const fav = isFavourite(pokemon.id);
  const div = document.createElement('div');
  div.className = 'pokemon-card card-observe';
  div.setAttribute('data-id', pokemon.id);

  // Template literal voor de innerHTML
  div.innerHTML = `
    <button class="fav-btn ${fav ? 'active' : ''}" data-id="${pokemon.id}" aria-label="Favoriet toggle" title="${fav ? 'Verwijder favoriet' : 'Voeg toe aan favorieten'}">♥</button>
    <span class="card-num">${formatNum(pokemon.id)}</span>
    <div class="card-img-wrap">
      <img src="${pokemon.sprite}" alt="${pokemon.name}" loading="lazy" />
    </div>
    <h3 class="card-name">${pokemon.name}</h3>
    <div class="card-types">${pokemon.types.map(typeBadge).join('')}</div>
    <div class="card-stats">
      <div class="stat-item"><span class="stat-val">${pokemon.stats.hp}</span>HP</div>
      <div class="stat-item"><span class="stat-val">${pokemon.stats.attack}</span>Aanval</div>
      <div class="stat-item"><span class="stat-val">${pokemon.stats.speed}</span>Speed</div>
    </div>
  `;

  // Events koppelen aan elementen
  // Implementeert: events koppelen
  div.addEventListener('click', (e) => {
    if (e.target.closest('.fav-btn')) return; // bubblen stoppen
    onOpenModal(pokemon);
  });

  div.querySelector('.fav-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const added = onToggleFav(pokemon.id);
    const btn = e.currentTarget;
    btn.classList.toggle('active', added);
    btn.title = added ? 'Verwijder favoriet' : 'Voeg toe aan favorieten';
  });

  // Koppel aan IntersectionObserver
  cardObserver.observe(div);
  return div;
};

/**
 * Rendert alle kaarten in het grid.
 * Implementeert: DOM manipulatie, iteratie over arrays (forEach)
 */
export const renderGrid = (pokemonList, onOpenModal, onToggleFav) => {
  const grid = els.grid();
  grid.innerHTML = ''; // DOM manipulatie – element leegmaken

  // Iteratie via forEach (Array methode)
  pokemonList.forEach(p => {
    grid.appendChild(createCard(p, onOpenModal, onToggleFav));
  });
};

// ===== LIJSTWEERGAVE =====

/**
 * Rendert de tabellijst met min. 6 kolommen (vereiste opdracht).
 * Implementeert: DOM manipulatie, template literals, iteratie, Array methodes
 */
export const renderList = (pokemonList, onOpenModal, onToggleFav) => {
  const tbody = els.listBody();
  // Template literals + Array.map + join voor efficiënte HTML-opbouw
  tbody.innerHTML = pokemonList.map(p => {
    const fav = isFavourite(p.id);
    return `
      <tr data-id="${p.id}">
        <td><span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted)">${formatNum(p.id)}</span></td>
        <td><img src="${p.spritePixel ?? p.sprite}" alt="${p.name}" /></td>
        <td><span class="table-name">${p.name}</span></td>
        <td><div class="table-types">${p.types.map(typeBadge).join('')}</div></td>
        <td><span class="stat-num">${p.stats.hp}</span></td>
        <td><span class="stat-num">${p.stats.attack}</span></td>
        <td><span class="stat-num">${p.stats.defense}</span></td>
        <td><span class="stat-num">${p.stats.spAtk}</span></td>
        <td><span class="stat-num">${p.stats.spDef}</span></td>
        <td><span class="stat-num">${p.stats.speed}</span></td>
        <td><button class="table-fav-btn ${fav ? 'active' : ''}" data-id="${p.id}" aria-label="Favoriet">♥</button></td>
      </tr>
    `;
  }).join('');

  // Events aan tabelrijen koppelen via event delegation
  tbody.querySelectorAll('tr').forEach(row => {
    const id = Number(row.dataset.id);
    const poke = pokemonList.find(p => p.id === id);

    row.addEventListener('click', (e) => {
      if (e.target.closest('.table-fav-btn')) return;
      onOpenModal(poke);
    });

    row.querySelector('.table-fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const added = onToggleFav(id);
      e.currentTarget.classList.toggle('active', added);
    });
  });
};

// ===== MODAL =====

/**
 * Opent de detail-modal voor een Pokémon.
 * Implementeert: DOM manipulatie, template literals, Array methodes
 */
export const openModal = (pokemon) => {
  const modal = els.modal();
  const fav = isFavourite(pokemon.id);

  const mainType = pokemon.types[0];
  const typeColorMap = {
    fire: '#e84e1b', water: '#4a90d9', grass: '#3d9e3d', electric: '#d4a017',
    psychic: '#e0406b', ice: '#5aade0', dragon: '#4b4be0', dark: '#4b3e35',
    fairy: '#d06f9b', normal: '#9da0aa', fighting: '#c04b1a', poison: '#9b4f9b',
    ground: '#c6a855', flying: '#6d8dc5', bug: '#6a9e1c', rock: '#9e8c4f',
    ghost: '#4b4b8a', steel: '#8a8fb0',
  };
  const accentColor = typeColorMap[mainType] ?? '#e63946';

  // Statbars via Array.map
  const statRows = [
    ['HP',        pokemon.stats.hp],
    ['Aanval',    pokemon.stats.attack],
    ['Verdediging', pokemon.stats.defense],
    ['Sp. Aanval', pokemon.stats.spAtk],
    ['Sp. Verd.', pokemon.stats.spDef],
    ['Snelheid',  pokemon.stats.speed],
  ].map(([label, val]) => `
    <div class="stat-bar-row">
      <span>${label}</span>
      <span>${val}</span>
      <div class="stat-bar-track">
        <div class="stat-bar-fill" style="width:${Math.min(100, (val/255)*100).toFixed(1)}%;background:${statColor(val)}"></div>
      </div>
    </div>
  `).join('');

  els.modalContent().innerHTML = `
    <div class="modal-hero">
      <div class="modal-hero-bg" style="background:${accentColor}"></div>
      <img src="${pokemon.sprite}" alt="${pokemon.name}" />
      <p class="modal-num">${formatNum(pokemon.id)}</p>
      <h2 class="modal-name" id="modalName">${pokemon.name}</h2>
      <div class="card-types">${pokemon.types.map(typeBadge).join('')}</div>
    </div>
    <div class="modal-body">
      <div class="modal-section">
        <p class="modal-section-title">Info</p>
        <div class="modal-info-grid">
          <div class="info-chip"><label>Hoogte</label><span>${(pokemon.height / 10).toFixed(1)} m</span></div>
          <div class="info-chip"><label>Gewicht</label><span>${(pokemon.weight / 10).toFixed(1)} kg</span></div>
          <div class="info-chip"><label>Basis EXP</label><span>${pokemon.baseExp ?? '—'}</span></div>
          <div class="info-chip"><label>Generatie</label><span>${getGeneration(pokemon.id)}</span></div>
        </div>
      </div>
      <div class="modal-section">
        <p class="modal-section-title">Stats</p>
        <div class="stat-bar-list">${statRows}</div>
      </div>
      <div class="modal-section">
        <p class="modal-section-title">Abilities</p>
        <div class="abilities-list">${pokemon.abilities.map(a => `<span class="ability-chip">${a}</span>`).join('')}</div>
      </div>
      <button class="modal-fav-btn ${fav ? 'active' : ''}" id="modalFavBtn">
        ${fav ? '♥ Verwijder uit favorieten' : '♥ Voeg toe aan favorieten'}
      </button>
    </div>
  `;

  // Event koppelen aan modal-favorietenknop
  $('#modalFavBtn').addEventListener('click', () => {
    const added = toggleFavourite(pokemon.id);
    const btn = $('#modalFavBtn');
    btn.classList.toggle('active', added);
    btn.textContent = added ? '♥ Verwijder uit favorieten' : '♥ Voeg toe aan favorieten';
    updateFavCount();
    // Sync de kaart in het grid ook
    const gridCard = $(`.pokemon-card[data-id="${pokemon.id}"] .fav-btn`);
    if (gridCard) gridCard.classList.toggle('active', added);
    const tableBtn = $(`.table-fav-btn[data-id="${pokemon.id}"]`);
    if (tableBtn) tableBtn.classList.toggle('active', added);
  });

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

export const closeModal = () => {
  els.modal().classList.add('hidden');
  document.body.style.overflow = '';
};

// ===== FAVORIETEN PANEL =====

export const renderFavPanel = (allPokemon, onOpenModal) => {
  const favIds = getFavourites();
  const favList = els.favList();

  if (favIds.length === 0) {
    favList.innerHTML = `<p class="fav-empty">Nog geen favorieten.<br>Klik op ♥ bij een Pokémon.</p>`;
    return;
  }

  // Array methode: filter + map
  const favPokemon = allPokemon.filter(p => favIds.includes(p.id));

  favList.innerHTML = favPokemon.map(p => `
    <div class="fav-item" data-id="${p.id}">
      <img src="${p.spritePixel ?? p.sprite}" alt="${p.name}" />
      <div>
        <p class="fav-item-name">${p.name}</p>
        <p class="fav-item-num">${formatNum(p.id)}</p>
      </div>
      <button class="fav-remove" data-id="${p.id}" aria-label="Verwijder">✕</button>
    </div>
  `).join('');

  // Events koppelen
  favList.querySelectorAll('.fav-item').forEach(item => {
    const id = Number(item.dataset.id);
    const poke = allPokemon.find(p => p.id === id);
    item.addEventListener('click', (e) => {
      if (e.target.closest('.fav-remove')) return;
      onOpenModal(poke);
    });
    item.querySelector('.fav-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavourite(id);
      updateFavCount();
      renderFavPanel(allPokemon, onOpenModal);
    });
  });
};

// ===== HULPFUNCTIES UI =====

export const updateFavCount = () => {
  const count = getFavourites().length;
  els.favCount().textContent = count;
};

export const updateResultCount = (count, total) => {
  els.resultCount().textContent = `${count} / ${total} Pokémon`;
};

export const showLoading = (show) => {
  els.loading().classList.toggle('hidden', !show);
};

export const showError = (show) => {
  els.error().classList.toggle('hidden', !show);
};

export const showContent = (view) => {
  const grid = els.grid();
  const list = els.listView();
  if (view === 'grid') {
    grid.classList.remove('hidden');
    list.classList.add('hidden');
  } else {
    grid.classList.add('hidden');
    list.classList.remove('hidden');
  }
};

// Bepaal generatie op basis van Pokédex-nummer
const getGeneration = (id) => {
  if (id <= 151)  return 'Gen I';
  if (id <= 251)  return 'Gen II';
  if (id <= 386)  return 'Gen III';
  if (id <= 493)  return 'Gen IV';
  return 'Gen V+';
};

/**
 * Vult het type-filter-dropdown met opties.
 * Implementeert: DOM manipulatie – elementen aanmaken en toevoegen
 */
export const populateTypeFilter = (types) => {
  const select = $('#typeFilter');
  // Iteratie via forEach – array methode
  types.forEach(type => {
    const option = document.createElement('option'); // Element aanmaken
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    select.appendChild(option); // Element toevoegen aan DOM
  });
};
