// Mock data
const mealOrder = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'lunch', label: 'Almuerzo' },
  { key: 'snack', label: 'Merienda' },
];

const todayMenu = {
  breakfast: {
    time: '07:30',
    title: 'Avena con fruta',
    items: ['Avena cocida', 'Yogur natural', 'Platano', 'Nueces'],
    ingredients: ['avena', 'yogur', 'platano', 'nueces'],
  },
  lunch: {
    time: '13:30',
    title: 'Bowl mediterraneo',
    items: ['Arroz integral', 'Pollo a la plancha', 'Tomate', 'Aceite de oliva'],
    ingredients: ['arroz', 'pollo', 'tomate', 'aceite de oliva'],
  },
  snack: {
    time: '18:00',
    title: 'Snack suave',
    items: ['Pan tostado', 'Aguacate', 'Queso fresco', 'Te'],
    ingredients: ['pan', 'aguacate', 'queso fresco', 'te'],
  },
};

// Local storage
const STORAGE_KEY = 'dieta.preferences';

function loadPreferences() {
  const defaults = {
    breakfast: true,
    lunch: true,
    snack: true,
  };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaults };
    return { ...defaults, ...JSON.parse(stored) };
  } catch {
    return { ...defaults };
  }
}

function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore
  }
}

// App state
let state = {
  preferences: loadPreferences(),
};

// Render function
function render() {
  const root = document.getElementById('root');
  const today = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const enabledMeals = mealOrder.filter((meal) => state.preferences[meal.key]);
  const ingredients = Array.from(
    new Set(enabledMeals.flatMap((meal) => todayMenu[meal.key].ingredients))
  ).sort();

  root.innerHTML = `
    <div class="app">
      <header class="app-header">
        <div>
          <p class="app-eyebrow">Plan diario</p>
          <h1>Dieta App</h1>
          <p class="app-subtitle">Menu de hoy · ${today}</p>
        </div>
        <div class="app-pill">PWA lista</div>
      </header>

      <section class="panel">
        <div class="panel-header">
          <h2>Menu de hoy</h2>
          <p>Version ligera para energia estable.</p>
        </div>
        <div class="menu-grid">
          ${mealOrder
            .map((meal) => {
              const data = todayMenu[meal.key];
              const isActive = state.preferences[meal.key];
              return `
            <article class="menu-card ${isActive ? '' : 'is-muted'}">
              <div class="menu-card-header">
                <h3>${meal.label}</h3>
                <span class="menu-tag">${data.time}</span>
              </div>
              <p class="menu-title">${data.title}</p>
              <ul>
                ${data.items.map((item) => `<li>${item}</li>`).join('')}
              </ul>
            </article>
          `;
            })
            .join('')}
        </div>
      </section>

      <section class="panel panel-split">
        <div>
          <div class="panel-header">
            <h2>Ingredientes del dia</h2>
            <p>Lista corta segun tus preferencias.</p>
          </div>
          <ul class="ingredient-list">
            ${ingredients.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div>
          <div class="panel-header">
            <h2>Preferencias</h2>
            <p>Activa o desactiva comidas.</p>
          </div>
          <div class="preference-list">
            ${mealOrder
              .map(
                (meal) => `
              <label class="preference-item">
                <input 
                  type="checkbox" 
                  ${state.preferences[meal.key] ? 'checked' : ''}
                  data-key="${meal.key}"
                />
                <span>${meal.label}</span>
              </label>
            `
              )
              .join('')}
          </div>
        </div>
      </section>
    </div>
  `;

  // Add event listeners
  document.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      const key = e.target.dataset.key;
      state.preferences[key] = e.target.checked;
      savePreferences(state.preferences);
      render();
    });
  });
}

// Register service worker
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore errors
    });
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  render();
  registerServiceWorker();
});
