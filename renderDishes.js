// Глобальное хранилище выбранных блюд
const selectedDishes = {
  soup: null,
  main: null,
  starter: null,
  dessert: null,
  drink: null
};

// Хранилище активных фильтров для каждой категории
const activeFilters = {
  soup: null,
  main: null,
  starter: null,
  dessert: null,
  drink: null
};

// Сортируем блюда по категории и алфавиту
function getSortedDishesByCategory(category) {
  return dishes
    .filter(dish => dish.category === category)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

// Фильтруем блюда по активному фильтру в категории
function getFilteredDishesByCategory(category) {
  const activeKind = activeFilters[category];
  if (!activeKind) {
    return getSortedDishesByCategory(category);
  }
  return dishes
    .filter(dish => dish.category === category && dish.kind === activeKind)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

// Создаём карточку блюда
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

  card.querySelector('.add-button').addEventListener('click', () => {
    selectDish(dish);
  });

  return card;
}

// Отображаем блюда для конкретной категории
function renderDishesForCategory(category) {
  const container = document.querySelector(`#${category}-section .dishes-grid`);
  if (!container) return;

  container.innerHTML = '';
  const dishesToRender = getFilteredDishesByCategory(category);
  dishesToRender.forEach(dish => container.appendChild(createDishCard(dish)));

  // Проверяем, есть ли выбранное блюдо в этой категории и оно видимо после фильтрации
  const selectedDishInCategory = selectedDishes[category];
  if (selectedDishInCategory) {
    const selectedCard = container.querySelector(`.dish-card[data-dish="${selectedDishInCategory.keyword}"]`);
    if (selectedCard) {
      selectedCard.style.border = '2px solid tomato';
    } else {
      // Если выбранное блюдо скрыто фильтром, убираем визуальное выделение
      const allCardsInCategory = document.querySelectorAll(`#${category}-section .dish-card`);
      allCardsInCategory.forEach(card => card.style.border = '');
    }
  }
}

// Отображаем все блюда (для всех категорий)
function renderAllDishes() {
  const categories = ['soup', 'main', 'starter', 'dessert', 'drink'];
  categories.forEach(category => renderDishesForCategory(category));
}

// Выбор блюда
function selectDish(dish) {
  // Снимаем выделение со всех блюд в категории
  document.querySelectorAll(`#${dish.category}-section .dish-card`).forEach(card => {
    card.style.border = '';
  });

  // Выделяем выбранное
  const selectedCard = document.querySelector(`.dish-card[data-dish="${dish.keyword}"]`);
  if (selectedCard) {
    selectedCard.style.border = '2px solid tomato';
  }

  // Сохраняем выбор
  selectedDishes[dish.category] = dish;

  // Обновляем форму заказа
  updateOrderSummary();

  // Обновляем текущую стоимость заказа в панели оформления (если существует)
  updateOrderTotalDisplay();

  // Сохраняем выбранные блюда в localStorage
  saveSelectedDishesToStorage();
}

// Сохраняем выбранные блюда в localStorage (только keyword)
function saveSelectedDishesToStorage() {
  const serializable = Object.entries(selectedDishes).map(([category, dish]) => {
    return dish ? { keyword: dish.keyword } : null;
  }).filter(Boolean);

  localStorage.setItem('selectedDishes', JSON.stringify(serializable));
}

// Загружаем выбранные блюда из localStorage
function loadSelectedDishesFromStorage() {
  const stored = localStorage.getItem('selectedDishes');
  if (!stored) return;

  const data = JSON.parse(stored);
  data.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) {
      selectedDishes[dish.category] = dish;
    }
  });
}

// Обновляем итоговую стоимость заказа и отображаем её
function updateOrderTotalDisplay() {
  let total = 0;
  for (const category in selectedDishes) {
    const dish = selectedDishes[category];
    if (dish) {
      total += dish.price;
    }
  }

  // Обновляем в форме заказа на странице lunch.html
  const totalElement = document.getElementById('order-total-value');
  if (totalElement) {
    totalElement.textContent = total + '₽';
  }

  // Обновляем в sticky-панели (если она есть)
  const currentTotalElement = document.getElementById('current-order-total');
  if (currentTotalElement) {
    currentTotalElement.textContent = total + '₽';
  }

  // Показываем сумму, если выбрано хотя бы одно блюдо
  const orderTotalSection = document.getElementById('order-total');
  if (orderTotalSection) {
    orderTotalSection.style.display = total > 0 ? 'block' : 'none';
  }

  // Активируем ссылку на оформление заказа (если есть панель)
  const checkoutLink = document.getElementById('checkout-link');
  if (checkoutLink) {
    checkoutLink.style.display = total > 0 ? 'inline' : 'none';
  }

  // Проверяем, удовлетворяет ли заказ комбо
  checkComboValidity();
}

// Проверяем, удовлетворяет ли состав заказа одному из комбо
function checkComboValidity() {
  const { soup, main, starter, dessert, drink } = selectedDishes;

  const hasSoup = !!soup;
  const hasMain = !!main;
  const hasStarter = !!starter;
  const hasDrink = !!drink;
  const hasDessert = !!dessert;

  // Комбо 1: Суп + Главное блюдо + Салат + Напиток
  // Комбо 2: Суп + Главное блюдо + Напиток
  // Комбо 3: Суп + Салат + Напиток
  // Комбо 4: Главное блюдо + Салат + Напиток
  // Комбо 5: Главное блюдо + Напиток
  // Комбо 6: Десерт (можно добавить к любому)

  const valid =
    (hasSoup && hasMain && hasStarter && hasDrink) ||
    (hasSoup && hasMain && hasDrink) ||
    (hasSoup && hasStarter && hasDrink) ||
    (hasMain && hasStarter && hasDrink) ||
    (hasMain && hasDrink);

  const submitBtn = document.getElementById('submit-order-btn');
  const checkoutLink = document.getElementById('checkout-link');

  if (submitBtn) {
    submitBtn.disabled = !valid;
  }
  if (checkoutLink) {
    checkoutLink.style.pointerEvents = valid ? 'auto' : 'none';
    checkoutLink.style.opacity = valid ? '1' : '0.5';
  }
}

// Обновляем сводку заказа в форме
function updateOrderSummary() {
  const summaryContainer = document.getElementById('order-summary');
  if (!summaryContainer) return;

  const selected = Object.values(selectedDishes).filter(dish => dish !== null);
  if (selected.length === 0) {
    summaryContainer.innerHTML = '<p>Ничего не выбрано</p>';
    return;
  }

  let html = '<ul>';
  selected.forEach(dish => {
    html += `<li>${dish.name} — ${dish.price}₽</li>`;
  });
  html += '</ul>';

  // Итоговая сумма
  let total = selected.reduce((sum, dish) => sum + dish.price, 0);
  html += `<p><strong>Итого: ${total}₽</strong></p>`;

  summaryContainer.innerHTML = html;
}

// Назначаем обработчики фильтров
function attachFilterListeners() {
  document.querySelectorAll('.filter-buttons .filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      // Определяем категорию по родительскому section
      const section = button.closest('section');
      if (!section) return;

      let category = null;
      if (section.id === 'soup-section') category = 'soup';
      else if (section.id === 'main-section') category = 'main';
      else if (section.id === 'starter-section') category = 'starter';
      else if (section.id === 'dessert-section') category = 'dessert';
      else if (section.id === 'drink-section') category = 'drink';

      if (!category) return;

      // Обновляем активный фильтр
      const kind = button.dataset.kind;
      if (activeFilters[category] === kind) {
        activeFilters[category] = null;
        button.classList.remove('active');
      } else {
        activeFilters[category] = kind;
        // Снимаем активность с других кнопок в той же категории
        section.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      }

      // Перерисовываем блюда
      renderDishesForCategory(category);
    });
  });
}

// Инициализация после загрузки данных
function initRenderDishes() {
  loadSelectedDishesFromStorage(); // ← Загружаем из localStorage
  renderAllDishes();
  attachFilterListeners();
  updateOrderSummary();
  updateOrderTotalDisplay();
  checkComboValidity(); // ← Проверяем комбо сразу

  // Добавляем обработчик события для кнопки "Сбросить"
  const form = document.getElementById('order-form');
  if (form) {
    form.addEventListener('reset', () => {
      resetOrder();
    });
  }

  // Добавляем обработчик события для радио-кнопок "Время доставки"
  document.querySelectorAll('input[name="delivery_time_option"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const timeInput = document.getElementById('delivery_time');
      if (timeInput) {
        timeInput.disabled = radio.value !== 'by_time';
      }
    });
  });
}

// Сброс заказа
function resetOrder() {
  for (const category in selectedDishes) {
    selectedDishes[category] = null;
  }
  saveSelectedDishesToStorage();
  renderAllDishes();
  updateOrderSummary();
  updateOrderTotalDisplay();
  checkComboValidity();
}

// Запускаем инициализацию, когда dishes загружены
window.initRenderDishes = initRenderDishes;
