document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
  const API_KEY = '0ef845ea-3f76-4af2-9e70-1af33830ec6d'; // ← ЗАМЕНИ НА СВОЙ!

  // 1. Загружаем блюда с сервера
  let dishes = [];
  try {
    const res = await fetch(`${API_URL}/dishes`);
    if (!res.ok) throw new Error('Не удалось загрузить меню');
    const data = await res.json();
    dishes = data.map(d => {
      let c = d.category;
      if (c === 'main-course') c = 'main';
      if (c === 'salad') c = 'starter';
      return { ...d, category: c, image: d.image.trim() };
    });
  } catch (err) {
    alert('Ошибка: ' + err.message);
    return;
  }

  // 2. Загружаем выбранные блюда из localStorage
  let orderItems = [];
  try {
    const stored = localStorage.getItem('selectedDishes');
    if (stored) orderItems = JSON.parse(stored);
  } catch (e) {}

  // 3. Показываем сообщение "ничего не выбрано"
  const showEmpty = () => {
    document.getElementById('empty-order-message').style.display = 'block';
    document.getElementById('order-items-container').style.display = 'none';
    document.getElementById('order-summary-list').innerHTML = '<p>Ничего не выбрано</p>';
  };

  // 4. Отображаем карточки блюд
  const renderCards = () => {
    const container = document.getElementById('order-items-container');
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
        renderAll(); // перерисовываем всё
      });
      container.appendChild(card);
    });
    container.style.display = 'grid';
    document.getElementById('empty-order-message').style.display = 'none';
  };

  // 5. Обновляем список в форме ("Суп: Лазанья", "Напиток: Не выбрано")
  const updateSummary = () => {
    const cats = [
      { key: 'soup', name: 'Суп' },
      { key: 'main', name: 'Главное блюдо' },
      { key: 'starter', name: 'Салат/стартер' },
      { key: 'dessert', name: 'Десерт' },
      { key: 'drink', name: 'Напиток' }
    ];
    const selected = {};
    orderItems.forEach(item => {
      const dish = dishes.find(d => d.keyword === item.keyword);
      if (dish) selected[dish.category] = dish;
    });

    let html = '';
    cats.forEach(cat => {
      html += `
        <div class="summary-item">
          <strong>${cat.name}</strong>
          <p>${selected[cat.key] ? selected[cat.key].name : 'Не выбрано'}</p>
        </div>
      `;
    });
    document.getElementById('order-summary-list').innerHTML = html;
  };

  // 6. Считаем итоговую сумму
  const updateTotal = () => {
    let total = 0;
    orderItems.forEach(item => {
      const dish = dishes.find(d => d.keyword === item.keyword);
      if (dish) total += dish.price;
    });
    document.getElementById('order-total-value').textContent = total + '₽';
  };

  // 7. Проверяем, соответствует ли заказ комбо
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

  // 8. Основная функция перерисовки
  const renderAll = () => {
    if (orderItems.length === 0) {
      showEmpty();
      document.getElementById('submit-order-btn').disabled = true;
    } else {
      renderCards();
      updateSummary();
      updateTotal();
      document.getElementById('submit-order-btn').disabled = !isValidCombo();
    }
  };

  // 9. Отправка заказа
  const submitOrder = async () => {
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
      student_id: 1, // можно оставить 1, если не требуется
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
      const url = `${API_URL}/orders?api_key=${API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok) {
        alert('Заказ успешно оформлен!');
        localStorage.removeItem('selectedDishes');
        window.location.href = 'orders.html';
      } else {
        alert('Ошибка: ' + (result.error || 'неизвестная ошибка'));
      }
    } catch (err) {
      alert('Ошибка отправки: ' + err.message);
    }
  };

  // 10. Запуск
  renderAll();

  // Назначаем обработчик кнопки
  document.getElementById('submit-order-btn').addEventListener('click', (e) => {
    e.preventDefault();
    submitOrder();
  });

  // Обработка времени доставки
  document.querySelectorAll('input[name="delivery_time_option"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('delivery_time').disabled = radio.value !== 'by_time';
    });
  });
});
