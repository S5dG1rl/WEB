let orderItems = [];

function showEmptyOrderMessage() {
  document.getElementById('empty-order-message').style.display = 'block';
  document.getElementById('order-items-container').style.display = 'none';
  document.getElementById('order-summary-list').innerHTML = '<p>Ничего не выбрано</p>';
}

function displayOrderItems() {
  const container = document.getElementById('order-items-container');
  container.innerHTML = '';
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) {
      const card = document.createElement('div');
      card.className = 'dish-card';
      card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}" />
        <p class="price">${dish.price}₽</p>
        <p class="name">${dish.name}</p>
        <p class="weight">${dish.count}</p>
        <button class="remove-button">Удалить</button>
      `;
      card.querySelector('.remove-button').addEventListener('click', () => {
        orderItems = orderItems.filter(i => i.keyword !== dish.keyword);
        localStorage.setItem('selectedDishes', JSON.stringify(orderItems));
        displayOrderItems();
        updateOrderSummaryList();
        updateOrderTotal();
        if (orderItems.length === 0) showEmptyOrderMessage();
      });
      container.appendChild(card);
    }
  });
  container.style.display = 'grid';
  document.getElementById('empty-order-message').style.display = 'none';
}

function updateOrderTotal() {
  const total = orderItems.reduce((sum, item) => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    return sum + (dish ? dish.price : 0);
  }, 0);
  document.getElementById('order-total-value').textContent = total + '₽';
}

function updateOrderSummaryList() {
  const list = document.getElementById('order-summary-list');
  const selected = {};
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) selected[dish.category] = dish;
  });

  const cats = [
    { key: 'soup', label: 'Суп' },
    { key: 'main', label: 'Главное блюдо' },
    { key: 'starter', label: 'Салат/стартер' },
    { key: 'dessert', label: 'Десерт' },
    { key: 'drink', label: 'Напиток' }
  ];

  list.innerHTML = cats.map(cat => `
    <div class="summary-item">
      <strong>${cat.label}</strong>
      <p>${selected[cat.key] ? selected[cat.key].name : 'Не выбрано'}</p>
    </div>
  `).join('');
}

// 🔥 ВАЛИДАЦИЯ СОСТАВА ЗАКАЗА (соответствие комбо)
function validateOrder() {
  const selected = {};
  orderItems.forEach(item => {
    const dish = dishes.find(d => d.keyword === item.keyword);
    if (dish) selected[dish.category] = dish;
  });

  const { soup, main, starter, dessert, drink } = selected;
  const hasSoup = !!soup;
  const hasMain = !!main;
  const hasStarter = !!starter;
  const hasDrink = !!drink;

  // Проверяем, соответствует ли заказ одному из комбо
  const isValid =
    (hasSoup && hasMain && hasStarter && hasDrink) ||
    (hasSoup && hasMain && hasDrink) ||
    (hasSoup && hasStarter && hasDrink) ||
    (hasMain && hasStarter && hasDrink) ||
    (hasMain && hasDrink);

  return isValid;
}

// 🔥 ОТПРАВКА ЗАКАЗА НА СЕРВЕР
async function submitOrder() {
  if (orderItems.length === 0) {
    alert('Ничего не выбрано для заказа');
    return;
  }

  if (!validateOrder()) {
    alert('Состав заказа не соответствует ни одному из доступных комбо. Добавьте недостающие блюда.');
    return;
  }

  // Собираем данные формы
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
    student_id: 9001234, // ← ЗАМЕНИТЕ НА ВАШ STUDENT_ID ИЗ СДО
    soup_id: null,
    main_course_id: null,
    salad_id: null,
    drink_id: null,
    dessert_id: null
  };

  // Сопоставляем ID блюд по категориям
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

  // 🔑 ВАШ API KEY ИЗ СДО
  const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d'; // ← ЗАМЕНИТЕ НА СВОЙ

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

    if (response.ok) {
      alert('Заказ успешно оформлен!');
      localStorage.removeItem('selectedDishes');
      window.location.href = 'orders.html'; // Перенаправляем на "Мои заказы"
    } else {
      const errorText = await response.text();
      alert('Ошибка при оформлении заказа:\n' + errorText);
    }
  } catch (error) {
    console.error('Ошибка сети:', error);
    alert('Не удалось подключиться к серверу. Проверьте интернет и попробуйте позже.');
  }
}

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('selectedDishes');
  orderItems = stored ? JSON.parse(stored) : [];

  const waitForDishes = () => {
    if (typeof dishes !== 'undefined' && dishes.length > 0) {
      if (orderItems.length > 0) {
        displayOrderItems();
        updateOrderSummaryList();
        updateOrderTotal();
      } else {
        showEmptyOrderMessage();
      }

      // Назначаем обработчик отправки формы
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
    } else {
      setTimeout(waitForDishes, 100);
    }
  };
  waitForDishes();
});
