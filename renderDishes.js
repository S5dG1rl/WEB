// renderDishes.js

// Глобальное хранилище выбранных блюд
const selectedDishes = {
  soup: null,
  main: null,
  drink: null
};

// Сортируем блюда по категории и алфавиту
function getSortedDishesByCategory(category) {
  return dishes
    .filter(dish => dish.category === category)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

// Создаём карточку блюда
function createDishCard(dish) {
  const card = document.createElement('div');
  card.className = 'dish-card';
  card.dataset.dish = dish.keyword;

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

// Отображаем все блюда
function renderAllDishes() {
  const soupSection = document.querySelector('#soup-section .dishes-grid');
  const mainSection = document.querySelector('#main-section .dishes-grid');
  const drinkSection = document.querySelector('#drink-section .dishes-grid');

  soupSection.innerHTML = '';
  mainSection.innerHTML = '';
  drinkSection.innerHTML = '';

  getSortedDishesByCategory('soup').forEach(dish => soupSection.appendChild(createDishCard(dish)));
  getSortedDishesByCategory('main').forEach(dish => mainSection.appendChild(createDishCard(dish)));
  getSortedDishesByCategory('drink').forEach(dish => drinkSection.appendChild(createDishCard(dish)));
}

// Выбор блюда
function selectDish(dish) {
  // Снимаем выделение со всех блюд в категории
  document.querySelectorAll(`.dish-card[data-dish^="${dish.category}"]`).forEach(card => {
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
}

// Обновляем блок "Ваш заказ"
function updateOrderSummary() {
  const summary = document.querySelector('#order-summary');
  let hasSelection = false;
  let total = 0;

  const categories = [
    { key: 'soup', label: 'Суп' },
    { key: 'main', label: 'Главное блюдо' },
    { key: 'drink', label: 'Напиток' }
  ];

  let html = '';

  for (const cat of categories) {
    const dish = selectedDishes[cat.key];
    if (dish) {
      hasSelection = true;
      total += dish.price;
      html += `
        <div class="summary-item">
          <strong>${cat.label}:</strong> ${dish.name} — ${dish.price}₽
        </div>
      `;
    } else {
      html += `<div>${cat.label} не выбран</div>`;
    }
  }

  if (!hasSelection) {
    summary.innerHTML = '<p>Ничего не выбрано</p>';
    document.getElementById('order-total').style.display = 'none';
  } else {
    summary.innerHTML = html;
    document.getElementById('order-total').style.display = 'block';
    document.getElementById('order-total-value').textContent = total + '₽';
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  renderAllDishes();
  updateOrderSummary();
});

// Перехват отправки формы — подставляем keyword
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.tagName !== 'FORM') return;

  // Удаляем старые скрытые поля, если есть
  form.querySelectorAll('input[name^="selected_"]').forEach(el => el.remove());

  // Добавляем скрытые поля с keyword
  if (selectedDishes.soup) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'soup';
    input.value = selectedDishes.soup.keyword;
    form.appendChild(input);
  }
  if (selectedDishes.main) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'main_dish';
    input.value = selectedDishes.main.keyword;
    form.appendChild(input);
  }
  if (selectedDishes.drink) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'drink';
    input.value = selectedDishes.drink.keyword;
    form.appendChild(input);
  }
});
