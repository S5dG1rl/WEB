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

  // Обновляем текущую стоимость заказа в п
