const selectedDishes = { soup: null, main: null, starter: null, dessert: null, drink: null };
const activeFilters = { soup: null, main: null, starter: null, dessert: null, drink: null };

// --- ВСЕ ФУНКЦИИ ОТРИСОВКИ, ФИЛЬТРАЦИИ И ВЫБОРА (как раньше) ---
function getSortedDishesByCategory(category) {
  return dishes.filter(d => d.category === category).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}
function getFilteredDishesByCategory(category) {
  const kind = activeFilters[category];
  return kind
    ? dishes.filter(d => d.category === category && d.kind === kind).sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    : getSortedDishesByCategory(category);
}
function createDishCard(dish) {
  const card = document.createElement('div');
  card.className = 'dish-card';
  card.dataset.dish = dish.keyword;
  card.dataset.kind = dish.kind;
  card.innerHTML = `
    <img src="${dish.image}" alt="${dish.name}" />
    <p class="price">${dish.price}₽</p>
    <p class="name">${dish.name}</p>
    <p class="weight">${dish.count}</p>
    <button class="add-button">Добавить</button>
  `;
  card.querySelector('.add-button').addEventListener('click', () => selectDish(dish));
  return card;
}
function renderDishesForCategory(category) {
  const container = document.querySelector(`#${category}-section .dishes-grid`);
  if (!container) return;
  container.innerHTML = '';
  getFilteredDishesByCategory(category).forEach(d => container.appendChild(createDishCard(d)));
  const selected = selectedDishes[category];
  if (selected) {
    const card = container.querySelector(`.dish-card[data-dish="${selected.keyword}"]`);
    if (card) card.style.border = '2px solid tomato';
  }
}
function renderAllDishes() {
  ['soup','main','starter','dessert','drink'].forEach(renderDishesForCategory);
}

// --- ОСНОВНАЯ ЛОГИКА ВЫБОРА ---
function selectDish(dish) {
  // Снимаем выделение
  document.querySelectorAll(`#${dish.category}-section .dish-card`).forEach(c => c.style.border = '');
  // Выделяем
  const card = document.querySelector(`.dish-card[data-dish="${dish.keyword}"]`);
  if (card) card.style.border = '2px solid tomato';
  // Сохраняем
  selectedDishes[dish.category] = dish;
  // Обновляем всё
  saveToStorage();
  updateOrderTotalDisplay();
  checkComboValidity();
}

function saveToStorage() {
  const data = Object.values(selectedDishes).filter(d => d).map(d => ({ keyword: d.keyword }));
  localStorage.setItem('selectedDishes', JSON.stringify(data));
}

function loadFromStorage() {
  const data = localStorage.getItem('selectedDishes');
  if (!data) return;
  try {
    const items = JSON.parse(data);
    items.forEach(item => {
      const dish = dishes.find(d => d.keyword === item.keyword);
      if (dish) selectedDishes[dish.category] = dish;
    });
  } catch (e) { console.warn('Ошибка загрузки заказа'); }
}

// --- ОБНОВЛЕНИЕ ПАНЕЛИ ---
function updateOrderTotalDisplay() {
  let total = 0;
  for (const d of Object.values(selectedDishes)) if (d) total += d.price;

  const totalEl = document.getElementById('current-order-total');
  const panel = document.getElementById('checkout-panel');
  const link = document.getElementById('checkout-link');

  if (totalEl) totalEl.textContent = total + '₽';
  if (panel) panel.style.display = total > 0 ? 'block' : 'none';
  if (link) link.style.display = total > 0 ? 'inline' : 'none';
}

// --- ВАЛИДАЦИЯ КОМБО ---
function checkComboValidity() {
  const { soup, main, starter, dessert, drink } = selectedDishes;
  const hasSoup = !!soup, hasMain = !!main, hasStarter = !!starter, hasDrink = !!drink;
  const valid =
    (hasSoup && hasMain && hasStarter && hasDrink) ||
    (hasSoup && hasMain && hasDrink) ||
    (hasSoup && hasStarter && hasDrink) ||
    (hasMain && hasStarter && hasDrink) ||
    (hasMain && hasDrink);

  const link = document.getElementById('checkout-link');
  if (link) {
    if (valid) {
      link.style.pointerEvents = 'auto';
      link.style.opacity = '1';
    } else {
      link.style.pointerEvents = 'none';
      link.style.opacity = '0.5';
    }
  }
}

// --- ФИЛЬТРЫ ---
function attachFilterListeners() {
  document.querySelectorAll('.filter-buttons .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.closest('section');
      if (!section) return;
      let cat = null;
      if (section.id === 'soup-section') cat = 'soup';
      else if (section.id === 'main-section') cat = 'main';
      else if (section.id === 'starter-section') cat = 'starter';
      else if (section.id === 'dessert-section') cat = 'dessert';
      else if (section.id === 'drink-section') cat = 'drink';
      if (!cat) return;

      const kind = btn.dataset.kind;
      if (activeFilters[cat] === kind) {
        activeFilters[cat] = null;
        btn.classList.remove('active');
      } else {
        activeFilters[cat] = kind;
        section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      renderDishesForCategory(cat);
    });
  });
}

// --- ИНИЦИАЛИЗАЦИЯ ---
function initRenderDishes() {
  loadFromStorage();
  renderAllDishes();
  attachFilterListeners();
  updateOrderTotalDisplay();
  checkComboValidity();

  // Обработка сброса (если есть кнопка)
  const resetBtn = document.querySelector('.btn-clean');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      for (const k in selectedDishes) selectedDishes[k] = null;
      saveToStorage();
      renderAllDishes();
      updateOrderTotalDisplay();
      checkComboValidity();
    });
  }

  // Обработка времени доставки
  document.querySelectorAll('input[name="delivery_time_option"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const timeInput = document.getElementById('delivery_time');
      if (timeInput) timeInput.disabled = radio.value !== 'by_time';
    });
  });
}

window.initRenderDishes = initRenderDishes;
