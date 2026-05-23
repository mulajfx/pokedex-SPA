# PokéDex SPA

Een interactieve Single Page Application gebouwd met de [PokéAPI](https://pokeapi.co/) als mijn eindproject voor Web advanced.

---

## Functionaliteiten

- **151 Pokémon** geladen van de PokéAPI (Gen I)
- **Raster- én lijstweergave** (lijst toont 11 kolommen)
- **Zoeken** op naam of nummer (met debounce)
- **Filteren** op type, generatie
- **Sorteren** op nummer, naam, HP of aanval
- **Favorieten** opslaan en beheren (persisteert tussen sessies)
- **Gebruikersvoorkeuren** opslaan: thema (donker/licht), weergave, filters
- **API-cache** in LocalStorage (6 uur geldig, vermindert API-calls)
- **Detail-modal** met stats, abilities, info per Pokémon
- **Responsive design** (werkt op mobiel en desktop)
- **Donker/licht thema** met één klik

---

## Technische vereisten – implementatieoverzicht

### DOM manipulatie
| Concept | Bestand | Regels |
|---|---|---|
| Elementen selecteren | `src/js/ui.js` | 12–13 (`$`, `$$`) |
| Elementen manipuleren | `src/js/ui.js` | 90, 176 (innerHTML, classList) |
| Events koppelen | `src/js/ui.js` | 98–108, `src/js/main.js` 65–130 |

### Modern JavaScript
| Concept | Bestand | Regels |
|---|---|---|
| Constanten (`const`) | overal | alle `const` declaraties |
| Template literals | `src/js/ui.js` | 72, 88, 114–168 |
| Iteratie over arrays | `src/js/ui.js` | 85 (forEach), `src/js/filters.js` 43 |
| Array methodes | `src/js/api.js` | 57 (map, find, filter), `src/js/filters.js` 30–50 |
| Arrow functions | overal | alle `=>` functies |
| Ternary operator | `src/js/ui.js` | 68 (`?? `), `src/js/filters.js` 43 |
| Callback functions | `src/js/filters.js` | 43 (sort-callback), `src/js/main.js` 65 |
| Promises | `src/js/api.js` | 38 (Promise.all), 29 (response.json()) |
| Async & Await | `src/js/api.js` | 33, 47, `src/js/main.js` 135 |
| Observer API | `src/js/ui.js` | 43–49 (IntersectionObserver) |

### Data & API
| Concept | Bestand | Regels |
|---|---|---|
| Fetch | `src/js/api.js` | 29–31, 42–43 |
| JSON manipuleren | `src/js/api.js` | 55–72, `src/js/storage.js` 16–18 |

### Opslag & validatie
| Concept | Bestand | Regels |
|---|---|---|
| Formuliervalidatie | `src/js/main.js` | 31–35 (validateSearchInput) |
| LocalStorage | `src/js/storage.js` | 16–18, 28–32, `src/js/api.js` 20–27 |

### Styling & layout
| Concept | Bestand |
|---|---|
| CSS Grid + Flexbox | `src/css/style.css` – `.pokemon-grid`, `.filter-row`, `.modal-info-grid` |
| Gebruiksvriendelijke elementen | Verwijderknoppen in favorieten-panel, type-badges, stat-balken |

### Tooling & structuur
- Project opgezet met **Vite**
- Mappenstructuur: `src/js/`, `src/css/`, `index.html`, `dist/` (na build)
- Gescheiden HTML, CSS en JS bestanden

---

## Gebruikte API

- **PokéAPI** – https://pokeapi.co/
  - Endpoint: `https://pokeapi.co/api/v2/pokemon?limit=151`
  - Documentatie: https://pokeapi.co/docs/v2

---

## Installatie

```bash
# 1. Clone de repository
git clone https://github.com/JOUW-USERNAME/pokedex-spa.git
cd pokedex-spa

# 2. Installeer dependencies
npm install

# 3. Start de development server
npm run dev

# 4. Of build voor productie
npm run build
npm run preview
```

---

## Screenshots

*(Voeg hier screenshots toe na het draaien van de app)*

---

## Gebruikte bronnen

- [PokéAPI documentatie](https://pokeapi.co/docs/v2)
- [MDN Web Docs – Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Web Docs – IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
- [MDN Web Docs – LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Vite documentatie](https://vitejs.dev/guide/)
- AI chatlog: gegenereerd met Claude (Anthropic) – zie bijgevoegde chatlog

---

## Projectstructuur

```
pokedex-spa/
├── index.html
├── package.json
├── vite.config.js (optioneel)
├── src/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js      ← startpunt, event-handlers
│       ├── api.js       ← API-calls, caching
│       ├── filters.js   ← filter- en sorteerfuncties
│       ├── storage.js   ← LocalStorage (favorieten + voorkeuren)
│       └── ui.js        ← DOM-manipulatie, rendering
└── dist/                ← gegenereerd door `npm run build`
```
## Auteur
mulajfx
