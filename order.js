// Глобальные переменные
let orderItems = []; // [{ keyword: "..." }, ...]
let orderTotal = 0;
let dishes = []; // Будет заполнен из API

// Загрузка заказа из localStorage при старте
function loadOrderFromStorage() {
  const stored = localStorage.getItem('selectedDishes');
  if (stored) {
    try {
      orderItems = JSON.parse(stored);
    } catch (e) {
      orderItems = [];
    }
  }

  if (orderItems.length === 0) {
    showEmptyOrderMessage();
    document.getElementById('submit-order-btn').disabled = true;
  } else {
    // Скрыть сообщение "ничего не выбрано"
    document.getElementById('empty-order-message').style.display = 'none';
    document.getElementById('order-items-container').style.display = 'grid';
  }
}

// Показать сообщение "ничего не выбрано"
function showEmptyOrderMessage() {
  document.getElementById('empty-order-message').style.display = 'block';
  document.getElementById('order-items-container').style.display = 'none';
  document.getElementById('order-summary-list').innerHTML = '<p>Ничего не выбрано</p>';
}

// Загрузка данных о блюдах с сервера
async function loadDishesData() {
  try {
    const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const rawData = await response.json();

    // Преобразуем категории один раз — как в dishes.js
    dishes = rawData.map(dish => {
      let category = dish.category;
      if (category === 'main-course') category = 'main';
      if (category === 'salad') category = 'starter';
      const image = dish.image ? dish.image.trim() : '';
      return { ...dish, category, image };
    });

    // Отображаем данные
    displayOrderItems();
    updateOrderSummaryList();
    updateOrderTotal();

    const hasItems = orderItems.length > 0;
    if (document.getElementById('submit-order-btn')) {
      document.getElementById('submit-order-btn').disabled = !hasItems;
    }

  } catch (error) {
    console.error('Ошибка загрузки блюд:', error);
    alert('Не удалось загрузить меню. Попробуйте позже.');
  }
}

// Отображение карточек блюд
function displayOrderItems() {
  const container = document.getElementById('order-items-container');
  if (!container) return;

  container.innerHTML = '';

  if (orderItems.length === 0) {
    showEmptyOrderMessage();
    return;
  }

  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) {
      const card = createOrderItemCard(dish);
      container.appendChild(card);
    }
  });
}

// Создание карточки блюда
function createOrderItemCard(dish) {
  const card = document.createElement('div');
  card.className = 'dish-card';
  card.dataset.dish = dish.keyword;

  card.innerHTML = `
    <img src="${dish.image}" alt="${dish.name}" />
    <p class="price">${dish.price}₽</p>
    <p class="name">${dish.name}</p>
    <p class="weight">${dish.count}</p>
    <button class="remove-button">Удалить</button>
  `;

  card.querySelector('.remove-button').addEventListener('click', () => {
    removeOrderItem(dish.keyword);
  });

  return card;
}

// Удаление блюда из заказа
function removeOrderItem(keyword) {
  orderItems = orderItems.filter(item => item.keyword !== keyword);
  localStorage.setItem('selectedDishes', JSON.stringify(orderItems));
  displayOrderItems();
  updateOrderSummaryList();
  updateOrderTotal();

  if (orderItems.length === 0) {
    showEmptyOrderMessage();
    if (document.getElementById('submit-order-btn')) {
      document.getElementById('submit-order-btn').disabled = true;
    }
  }
}

// Обновление итоговой стоимости
function updateOrderTotal() {
  orderTotal = 0;
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) orderTotal += dish.price;
  });
  document.getElementById('order-total-value').textContent = orderTotal + '₽';
}

// Обновление списка в форме "Оформление заказа"
function updateOrderSummaryList() {
  const list = document.getElementById('order-summary-list');
  if (!list) return;

  // Группируем блюда по категориям
  const selectedByCategory = {};
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) {
      selectedByCategory[dish.category] = dish;
    }
  });

  const categories = [
    { key: 'soup', label: 'Суп' },
    { key: 'main', label: 'Главное блюдо' },
    { key: 'starter', label: 'Салат/стартер' },
    { key: 'dessert', label: 'Десерт' },
    { key: 'drink', label: 'Напиток' }
  ];

  let html = '';
  categories.forEach(cat => {
    if (selectedByCategory[cat.key]) {
      const dish = selectedByCategory[cat.key];
      html += `
        <div class="summary-item">
          <strong>${cat.label}</strong>
          <p>${dish.name} (${dish.price}₽)</p>
        </div>
      `;
    } else {
      html += `
        <div class="summary-item">
          <strong>${cat.label}</strong>
          <p>Не выбрано</p>
        </div>
      `;
    }
  });

  list.innerHTML = html;
}

// Валидация состава заказа (по комбо)
function validateOrder() {
  const selected = {};
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) selected[dish.category] = dish;
  });

  const { soup, main, starter, dessert, drink } = selected;

  // Должен быть напиток, если есть хоть что-то основное
  if ((soup || main || starter) && !drink) {
    alert('Выберите напиток');
    return false;
  }

  // Если суп — должно быть либо главное, либо салат
  if (soup && !main && !starter) {
    alert('Выберите главное блюдо или салат');
    return false;
  }

  // Если салат — должно быть либо суп, либо главное
  if (starter && !soup && !main) {
    alert('Выберите суп или главное блюдо');
    return false;
  }

  // Если только десерт/напиток — должно быть основное блюдо
  if ((dessert || drink) && !soup && !main && !starter) {
    alert('Выберите хотя бы одно основное блюдо');
    return false;
  }

  // Должно быть хоть что-то
  if (!soup && !main && !starter && !dessert && !drink) {
    alert('Ничего не выбрано');
    return false;
  }

  return true;
}

// Отправка заказа
async function submitOrder() {
  if (!validateOrder()) return;

  const formData = new FormData(document.querySelector('#order-section form'));
  const data = {
    full_name: formData.get('name'),
    email: formData.get('email'),
    subscribe: formData.get('subscribe') === 'on' ? 1 : 0,
    phone: formData.get('phone'),
    delivery_address: formData.get('address'),
    delivery_type: formData.get('delivery_time_option'),
    delivery_time: formData.get('delivery_time'),
    comment: formData.get('comment'),
    student_id: 1, // ← ЗАМЕНИТЕ НА ВАШ ID
    soup_id: null,
    main_course_id: null,
    salad_id: null,
    drink_id: null,
    dessert_id: null
  };

  // Сопоставляем ID по категориям
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (!dish) return;
    switch (dish.category) {
      case 'soup': data.soup_id = dish.id; break;
      case 'main': data.main_course_id = dish.id; break;
      case 'starter': data.salad_id = dish.id; break;
      case 'drink': data.drink_id = dish.id; break;
      case 'dessert': data.dessert_id = dish.id; break;
    }
  });

  const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d'; // ← ВАШ КЛЮЧ

  try {
    const url = new URL('https://edu.std-900.ist.mospolytech.ru/labs/api/orders');
    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ошибка ${response.status}: ${text}`);
    }

    alert('Заказ успешно оформлен!');
    localStorage.removeItem('selectedDishes');
    window.location.href = 'index.html';

  } catch (error) {
    console.error('Ошибка отправки заказа:', error);
    alert('Не удалось оформить заказ: ' + error.message);
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadOrderFromStorage();
  loadDishesData();

  // Обработка сброса формы
  const form = document.querySelector('#order-section form');
  if (form) {
    form.addEventListener('reset', (e) => {
      e.preventDefault();
      localStorage.removeItem('selectedDishes');
      orderItems = [];
      showEmptyOrderMessage();
      updateOrderSummaryList();
      updateOrderTotal();
      if (document.getElementById('submit-order-btn')) {
        document.getElementById('submit-order-btn').disabled = true;
      }
    });
  }

  // Обработка отправки
  const submitBtn = document.getElementById('submit-order-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      submitOrder();
    });
  }

  // Обработка переключения времени доставки
  document.querySelectorAll('input[name="delivery_time_option"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const timeInput = document.getElementById('delivery_time');
      if (timeInput) {
        timeInput.disabled = radio.value !== 'by_time';
      }
    });
  });
});
