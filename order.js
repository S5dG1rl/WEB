// Глобальные переменные для хранения данных о заказе
let orderItems = []; // Массив выбранных блюд (по их keyword)
let orderTotal = 0; // Итоговая стоимость заказа

// Функция для загрузки данных о блюдах из localStorage
function loadOrderFromStorage() {
  const storedOrder = localStorage.getItem('selectedDishes');
  if (storedOrder) {
    orderItems = JSON.parse(storedOrder);
    // Загружаем данные о блюдах с сервера
    loadDishesData();
  } else {
    // Если нет данных в localStorage, показываем сообщение
    document.getElementById('empty-order-message').style.display = 'block';
    document.getElementById('order-items-container').style.display = 'none';
    document.getElementById('order-summary-list').innerHTML = '';
    document.getElementById('order-total-value').textContent = '0₽';
    document.getElementById('submit-order-btn').disabled = true;
  }
}

// Функция для загрузки данных о блюдах с сервера
async function loadDishesData() {
  try {
    const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    dishes = data; // Присваиваем загруженные данные глобальной переменной

    // Отображаем блюда в разделе "Состав заказа"
    displayOrderItems();
    // Обновляем сумму заказа
    updateOrderTotal();
    // Активируем кнопку отправки, если есть хотя бы одно блюдо
    document.getElementById('submit-order-btn').disabled = orderItems.length === 0;
  } catch (error) {
    console.error('Ошибка при загрузке данных о блюдах:', error);
    alert('Не удалось загрузить меню. Попробуйте позже.');
  }
}

// Функция для отображения блюд в разделе "Состав заказа"
function displayOrderItems() {
  const container = document.getElementById('order-items-container');
  const emptyMessage = document.getElementById('empty-order-message');

  if (orderItems.length === 0) {
    container.style.display = 'none';
    emptyMessage.style.display = 'block';
    return;
  }

  container.style.display = 'grid';
  emptyMessage.style.display = 'none';

  container.innerHTML = '';
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) {
      const card = createOrderItemCard(dish);
      container.appendChild(card);
    }
  });
}

// Функция для создания карточки блюда в разделе "Состав заказа"
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

// Функция для удаления блюда из заказа
function removeOrderItem(keyword) {
  // Удаляем блюдо из массива
  orderItems = orderItems.filter(item => item.keyword !== keyword);

  // Удаляем блюдо из localStorage
  localStorage.setItem('selectedDishes', JSON.stringify(orderItems));

  // Обновляем отображение
  displayOrderItems();
  updateOrderTotal();
  // Деактивируем кнопку отправки, если нет блюд
  document.getElementById('submit-order-btn').disabled = orderItems.length === 0;
}

// Функция для обновления итоговой стоимости заказа
function updateOrderTotal() {
  orderTotal = 0;
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) {
      orderTotal += dish.price;
    }
  });
  document.getElementById('order-total-value').textContent = orderTotal + '₽';
}

// Функция для обновления списка блюд в разделе "Оформление заказа"
function updateOrderSummaryList() {
  const list = document.getElementById('order-summary-list');
  list.innerHTML = '';

  if (orderItems.length === 0) {
    list.innerHTML = '<p>Ничего не выбрано</p>';
    return;
  }

  // Получаем выбранные блюда по категориям
  const selectedDishes = {};
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) {
      selectedDishes[dish.category] = dish;
    }
  });

  // Отображаем блюда в списке
  const categories = [
    { key: 'soup', label: 'Суп' },
    { key: 'main', label: 'Главное блюдо' },
    { key: 'starter', label: 'Салат/стартер' },
    { key: 'dessert', label: 'Десерт' },
    { key: 'drink', label: 'Напиток' }
  ];

  categories.forEach(cat => {
    const dish = selectedDishes[cat.key];
    if (dish) {
      const item = document.createElement('div');
      item.className = 'summary-item';
      item.innerHTML = `
        <strong>${cat.label}</strong>
        <p>${dish.name} (${dish.price}₽)</p>
      `;
      list.appendChild(item);
    } else {
      const item = document.createElement('div');
      item.className = 'summary-item';
      item.innerHTML = `
        <strong>${cat.label}</strong>
        <p>Не выбрано</p>
      `;
      list.appendChild(item);
    }
  });

  // Обновляем общую стоимость
  document.getElementById('order-total-value').textContent = orderTotal + '₽';
}

// Функция для проверки состава заказа перед отправкой
function validateOrder() {
  const selected = orderItems.reduce((acc, item) => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) {
      acc[dish.category] = dish;
    }
    return acc;
  }, {});

  const { soup, main, starter, dessert, drink } = selected;

  // Проверяем, выбрано ли хоть одно блюдо
  if (!soup && !main && !starter && !dessert && !drink) {
    alert('Ничего не выбрано. Выберите блюда для заказа');
    return false;
  }

  // Проверяем наличие напитка, если выбрано хоть что-то из основных блюд
  if ((soup || main || starter) && !drink) {
    alert('Выберите напиток');
    return false;
  }

  // Если выбран суп, должно быть либо главное блюдо, либо салат/стартер
  if (soup && !main && !starter) {
    alert('Выберите главное блюдо или салат/стартер');
    return false;
  }

  // Если выбран салат/стартер, должно быть либо суп, либо главное блюдо
  if (starter && !soup && !main) {
    alert('Выберите суп или главное блюдо');
    return false;
  }

  // Если выбран только напиток или десерт — должно быть хотя бы одно основное блюдо
  if ((drink || dessert) && !main && !starter && !soup) {
    alert('Выберите хотя бы одно основное блюдо (суп, главное блюдо или салат)');
    return false;
  }

  return true;
}

// Функция для отправки заказа на сервер
async function submitOrder() {
  if (!validateOrder()) {
    return;
  }

  // Получаем данные из формы
  const formData = new FormData(document.getElementById('order-form'));
  const data = {
    full_name: formData.get('name'),
    email: formData.get('email'),
    subscribe: formData.get('subscribe') === 'on' ? 1 : 0,
    phone: formData.get('phone'),
    delivery_address: formData.get('address'),
    delivery_type: formData.get('delivery_time_option'),
    delivery_time: formData.get('delivery_time'),
    comment: formData.get('comment'),
    student_id: 1, // ← ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ student_id
    soup_id: null,
    main_course_id: null,
    salad_id: null,
    drink_id: null,
    dessert_id: null
  };

  // Находим идентификаторы блюд
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) {
      switch (dish.category) {
        case 'soup':
          data.soup_id = dish.id;
          break;
        case 'main':
          data.main_course_id = dish.id;
          break;
        case 'starter':
          data.salad_id = dish.id;
          break;
        case 'drink':
          data.drink_id = dish.id;
          break;
        case 'dessert':
          data.dessert_id = dish.id;
          break;
      }
    }
  });

  const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d'; // ← УБЕДИТЕСЬ, ЧТО ЭТО ВАШ КЛЮЧ

  try {
    const url = new URL('https://edu.std-900.ist.mospolytech.ru/labs/api/orders');
    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
    }

    const result = await response.json();
    alert('Заказ успешно оформлен!');
    localStorage.removeItem('selectedDishes');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error);
    alert('Произошла ошибка при оформлении заказа. Попробуйте позже.');
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadOrderFromStorage();

  // Обновляем список блюд в разделе "Оформление заказа"
  updateOrderSummaryList();

  // Обновляем итоговую стоимость
  updateOrderTotal();

  // Добавляем обработчик события для кнопки "Сбросить"
  document.getElementById('order-form').addEventListener('reset', () => {
    // Удаляем данные о заказе из localStorage
    localStorage.removeItem('selectedDishes');
    // Обновляем отображение
    loadOrderFromStorage();
  });

  // Добавляем обработчик события для кнопки "Отправить"
  document.getElementById('submit-order-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    await submitOrder();
  });

  // Добавляем обработчик события для радио-кнопок "Время доставки"
  document.querySelectorAll('input[name="delivery_time_option"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const timeInput = document.getElementById('delivery_time');
      if (timeInput) {
        timeInput.disabled = radio.value !== 'by_time';
      }
    });
  });
});
