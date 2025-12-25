document.addEventListener('DOMContentLoaded', async () => {
  // 🔑 ЗАМЕНИ ЭТОТ КЛЮЧ НА СВОЙ ИЗ СДО!
  const API_KEY = '0ef845ea-3f76-4af2-9e70-1af33830ec6d';
  const API_BASE = 'https://edu.std-900.ist.mospolytech.ru/labs/api';

  // === 1. ЗАГРУЗКА БЛЮД С СЕРВЕРА ===
  let dishes = [];
  try {
    const res = await fetch(`${API_BASE}/dishes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rawData = await res.json();
    dishes = rawData.map(d => {
      let cat = d.category;
      if (cat === 'main-course') cat = 'main';
      if (cat === 'salad') cat = 'starter';
      return { ...d, category: cat, image: d.image.trim() };
    });
  } catch (err) {
    alert('Не удалось загрузить меню: ' + err.message);
    return;
  }

  // === 2. ЗАГРУЗКА ВЫБРАННЫХ БЛЮД ИЗ localStorage ===
  let orderItems = [];
  try {
    const stored = localStorage.getItem('selectedDishes');
    if (stored) orderItems = JSON.parse(stored);
  } catch (e) {
    console.warn('Ошибка загрузки заказа');
  }

  // === 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
  const container = document.getElementById('order-items-container');
  const emptyMsg = document.getElementById('empty-order-message');
  const summaryList = document.getElementById('order-summary-list');
  const totalValue = document.getElementById('order-total-value');
  const submitBtn = document.getElementById('submit-order-btn');

  // Показ "ничего не выбрано"
  const showEmpty = () => {
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (container) container.style.display = 'none';
    if (summaryList) summaryList.innerHTML = '<p>Ничего не выбрано</p>';
    if (totalValue) totalValue.textContent = '0₽';
    if (submitBtn) submitBtn.disabled = true;
  };

  // Отображение карточек
  const renderCards = () => {
    if (!container) return;
    container.innerHTML = '';
    orderItems.forEach(item => {
      const dish = dishes.find(d => d.keyword === item.keyword);
      if (!dish) return;
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
        renderAll();
      });
      container.appendChild(card);
    });
    if (container) container.style.display = 'grid';
    if (emptyMsg) emptyMsg.style.display = 'none';
  };

  // Обновление списка в форме
  const updateSummary = () => {
    if (!summaryList) return;
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

    let html = '';
    cats.forEach(cat => {
      html += `
        <div class="summary-item">
          <strong>${cat.label}</strong>
          <p>${selected[cat.key] ? selected[cat.key].name : 'Не выбрано'}</p>
        </div>
      `;
    });
    summaryList.innerHTML = html;
  };

  // Обновление суммы
  const updateTotal = () => {
    if (!totalValue) return;
    let total = 0;
    orderItems.forEach(item => {
      const dish = dishes.find(d => d.keyword === item.keyword);
      if (dish) total += dish.price;
    });
    totalValue.textContent = total + '₽';
  };

  // Проверка комбо
  const isValidCombo = () => {
    const sel = {};
    orderItems.forEach(item => {
      const d = dishes.find(x => x.keyword === item.keyword);
      if (d) sel[d.category] = d;
    });
    const { soup, main, starter, drink } = sel;
    return (
      (soup && main && starter && drink) ||
      (soup && main && drink) ||
      (soup && starter && drink) ||
      (main && starter && drink) ||
      (main && drink)
    );
  };

  // Полная перерисовка
  const renderAll = () => {
    if (orderItems.length === 0) {
      showEmpty();
    } else {
      renderCards();
      updateSummary();
      updateTotal();
      if (submitBtn) submitBtn.disabled = !isValidCombo();
    }
  };

  // Отправка заказа
  const submitOrder = async (e) => {
    e.preventDefault();
    if (!isValidCombo()) {
      alert('Состав заказа не соответствует ни одному из доступных комбо');
      return;
    }

    const form = document.getElementById('order-form');
    const data = {
      full_name: form.name.value,
      email: form.email.value,
      subscribe: form.subscribe.checked ? 1 : 0,
      phone: form.phone.value,
      delivery_address: form.address.value,
      delivery_type: form.delivery_time_option.value,
      delivery_time: form.delivery_time.value,
      comment: form.comment.value,
      student_id: 1,
      soup_id: null,
      main_course_id: null,
      salad_id: null,
      drink_id: null,
      dessert_id: null
    };

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

    try {
      const url = `${API_BASE}/orders?api_key=${API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert('Заказ успешно оформлен!');
        localStorage.removeItem('selectedDishes');
        window.location.href = 'orders.html';
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Ошибка: ' + (err.error || 'сервер не принял заказ'));
      }
    } catch (err) {
      alert('Ошибка сети: ' + err.message);
    }
  };

  // === 4. ЗАПУСК ===
  renderAll();

  // Обработчики
  if (submitBtn) {
    submitBtn.addEventListener('click', submitOrder);
  }

  // Обработка времени доставки
  document.querySelectorAll('input[name="delivery_time_option"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const timeInput = document.getElementById('delivery_time');
      if (timeInput) {
        timeInput.disabled = radio.value !== 'by_time';
      }
    });
  });

  // Обработка сброса формы
  const form = document.getElementById('order-form');
  if (form) {
    form.addEventListener('reset', (e) => {
      e.preventDefault();
      localStorage.removeItem('selectedDishes');
      orderItems = [];
      renderAll();
    });
  }
});
