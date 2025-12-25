// renderDishes.js

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
}

// Обновляем блок "Ваш заказ"
function updateOrderSummary() {
  const summary = document.querySelector('#order-summary');
  let hasSelection = false;
  let total = 0;

  const categories = [
    { key: 'soup', label: 'Суп' },
    { key: 'main', label: 'Главное блюдо' },
    { key: 'starter', label: 'Салат или стартер' },
    { key: 'dessert', label: 'Десерт' },
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

// Создание и показ уведомления
function showNotification(message) {
  // Удаляем предыдущее уведомление, если оно существует
  const existingOverlay = document.querySelector('.notification-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Создаем новый элемент overlay
  const overlay = document.createElement('div');
  overlay.className = 'notification-overlay';

  // Создаем контейнер уведомления
  const notificationBox = document.createElement('div');
  notificationBox.className = 'notification-box';

  // Создаем текст сообщения
  const messageElement = document.createElement('p');
  messageElement.className = 'notification-message';
  messageElement.textContent = message;

  // Создаем кнопку "Окей"
  const button = document.createElement('button');
  button.className = 'notification-button';
  button.textContent = 'Окей 🡺';

  // Добавляем обработчик клика на кнопку
  button.addEventListener('click', () => {
    overlay.remove();
  });

  // Собираем элементы
  notificationBox.appendChild(messageElement);
  notificationBox.appendChild(button);
  overlay.appendChild(notificationBox);

  // Добавляем в DOM
  document.body.appendChild(overlay);
}

// Проверка состава заказа перед отправкой
function validateOrder() {
  const { soup, main, starter, dessert, drink } = selectedDishes;

  // Проверяем, выбрано ли хоть одно блюдо
  if (!soup && !main && !starter && !dessert && !drink) {
    showNotification('Ничего не выбрано. Выберите блюда для заказа');
    return false;
  }

  // Проверяем наличие напитка
  if ((soup || main || starter) && !drink) {
    showNotification('Выберите напиток');
    return false;
  }

  // Проверяем наличие главного блюда/салата/стартера при наличии супа
  if (soup && !main && !starter) {
    showNotification('Выберите главное блюдо/салат/стартер');
    return false;
  }

  // Проверяем наличие супа/главного блюда при наличии салата/стартера
  if (starter && !soup && !main) {
    showNotification('Выберите суп или главное блюдо');
    return false;
  }

  // Проверяем наличие главного блюда при наличии напитка/десерта
  if ((drink || dessert) && !main && !starter && !soup) {
    showNotification('Выберите главное блюдо');
    return false;
  }

  // Все проверки пройдены
  return true;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  renderAllDishes();
  updateOrderSummary();

  // Добавляем обработчики кликов для кнопок фильтров
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const kind = button.dataset.kind;
      const sectionId = button.closest('section').id;
      const category = sectionId.replace('-section', '');

      if (activeFilters[category] === kind) {
        activeFilters[category] = null;
        button.classList.remove('active');
      } else {
        activeFilters[category] = kind;
        document.querySelectorAll(`#${sectionId} .filter-btn`).forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      }

      renderDishesForCategory(category);
    });
  });
});

// Перехват отправки формы — подставляем keyword и отправляем через fetch
document.getElementById('order-form').addEventListener('submit', function(e) {
  e.preventDefault();

  // Проверяем заказ
  if (!validateOrder()) {
    return; // Останавливаем отправку, если проверка не пройдена
  }

  const formData = new FormData(this);

  // Удаляем старые скрытые поля, если есть
  this.querySelectorAll('input[name^="selected_"]').forEach(el => el.remove());

  // Добавляем скрытые поля с keyword для всех выбранных блюд
  Object.keys(selectedDishes).forEach(category => {
    const dish = selectedDishes[category];
    if (dish) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = category;
      input.value = dish.keyword;
      this.appendChild(input);
    }
  });

  // Отправляем форму через fetch
  fetch(this.getAttribute('action') || 'https://httpbin.org/post', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (response.ok) {
      alert('Заказ успешно отправлен!');
      // Сброс формы и выбора
      this.reset();
      Object.keys(selectedDishes).forEach(key => selectedDishes[key] = null);
      Object.keys(activeFilters).forEach(key => activeFilters[key] = null);
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.dish-card').forEach(card => card.style.border = '');
      updateOrderSummary();
      renderAllDishes();
    } else {
      alert('Ошибка при отправке заказа.');
    }
  })
  .catch(error => {
    console.error('Ошибка:', error);
    alert('Произошла ошибка при отправке запроса.');
  });
});
