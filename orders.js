// Глобальная переменная для хранения текущего заказа
let currentOrder = null;

// Загружаем заказы с сервера
async function loadOrders() {
  const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d'; // ← ВАШ КЛЮЧ

  try {
    const url = new URL('https://edu.std-900.ist.mospolytech.ru/labs/api/orders');
    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const orders = await response.json();
    displayOrders(orders);
  } catch (error) {
    console.error('Ошибка загрузки заказов:', error);
    document.getElementById('orders-container').innerHTML = 
      '<div id="no-orders">Не удалось загрузить заказы. Попробуйте позже.</div>';
  }
}

function displayOrders(orders) {
  const container = document.getElementById('orders-container');

  if (!orders || orders.length === 0) {
    container.innerHTML = '<div id="no-orders">У вас пока нет заказов.</div>';
    return;
  }

  container.innerHTML = '';

  // Сортируем по дате (новые сверху)
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  orders.forEach((order, index) => {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.orderId = order.id;

    // Внимание: в списке заказов НЕТ полей soup_name и т.д.!
    // Поэтому не пытаемся показать состав — только то, что есть
    let deliveryTimeText = 'Как можно скорее (с 7:00 до 23:00)';
    if (order.delivery_type === 'by_time' && order.delivery_time) {
      deliveryTimeText = order.delivery_time;
    }

    card.innerHTML = `
      <div class="order-header">
        <span>Заказ #${index + 1}</span>
        <span>${new Date(order.created_at).toLocaleString('ru-RU')}</span>
      </div>
      <div class="order-details">
        <strong>Стоимость:</strong> ${order.total_cost}₽<br>
        <strong>Время доставки:</strong> ${deliveryTimeText}
      </div>
      <div class="order-actions">
        <button class="btn-action-small" data-action="view" data-id="${order.id}">Подробнее</button>
        <button class="btn-action-small" data-action="edit" data-id="${order.id}">Редактировать</button>
        <button class="btn-action-small" data-action="delete" data-id="${order.id}">Удалить</button>
      </div>
    `;

    container.appendChild(card);
  });

  // Добавляем обработчики событий
  document.querySelectorAll('.order-card button[data-action]').forEach(button => {
    button.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const orderId = parseInt(e.target.dataset.id);
      handleOrderAction(action, orderId);
    });
  });
}

// Обработка действий с заказом
function handleOrderAction(action, orderId) {
  currentOrder = null;

  switch (action) {
    case 'view':
      showViewModal(orderId);
      break;
    case 'edit':
      showEditModal(orderId);
      break;
    case 'delete':
      showDeleteModal(orderId);
      break;
  }
}

async function showViewModal(orderId) {
  try {
    const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d';
    
    // 1. Получаем данные заказа
    const orderRes = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${apiKey}`);
    if (!orderRes.ok) throw new Error(`Заказ не найден: ${orderRes.status}`);
    const order = await orderRes.json();

    // 2. Получаем список блюд (если ещё не загружены)
    let dishes = window.cachedDishes;
    if (!dishes) {
      const dishesRes = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
      const rawData = await dishesRes.json();
      dishes = rawData.map(d => {
        let cat = d.category;
        if (cat === 'main-course') cat = 'main';
        if (cat === 'salad') cat = 'starter';
        return { ...d, category: cat, image: d.image.trim() };
      });
      window.cachedDishes = dishes; // кэшируем
    }

    // 3. Находим блюда по ID
    const soup = dishes.find(d => d.id === order.soup_id);
    const main = dishes.find(d => d.id === order.main_course_id);
    const salad = dishes.find(d => d.id === order.salad_id);
    const drink = dishes.find(d => d.id === order.drink_id);
    const dessert = dishes.find(d => d.id === order.dessert_id);

    // 4. Считаем сумму
    let total = 0;
    if (soup) total += soup.price;
    if (main) total += main.price;
    if (salad) total += salad.price;
    if (drink) total += drink.price;
    if (dessert) total += dessert.price;

    // 5. Формируем HTML
    const details = document.getElementById('viewOrderDetails');
    details.innerHTML = `
      <div class="order-details">
        <strong>Дата оформления:</strong> ${new Date(order.created_at).toLocaleString('ru-RU')}<br><br>
        <strong>Доставка:</strong><br>
        Имя получателя: ${order.full_name}<br>
        Адрес доставки: ${order.delivery_address}<br>
        Время доставки: ${order.delivery_type === 'now' ? 'Как можно скорее' : order.delivery_time}<br>
        Телефон: ${order.phone}<br>
        Email: ${order.email}<br><br>
        <strong>Комментарий:</strong><br>
        ${order.comment || 'Нет'}<br><br>
        <strong>Состав заказа:</strong><br>
        ${soup ? `<strong>Суп:</strong> ${soup.name}<br>` : ''}
        ${main ? `<strong>Главное блюдо:</strong> ${main.name}<br>` : ''}
        ${salad ? `<strong>Салат:</strong> ${salad.name}<br>` : ''}
        ${drink ? `<strong>Напиток:</strong> ${drink.name}<br>` : ''}
        ${dessert ? `<strong>Десерт:</strong> ${dessert.name}<br>` : ''}
        ${(order.soup_id || order.main_course_id || order.salad_id || order.drink_id || order.dessert_id) ? '' : 'Нет блюд'}
        <br><strong>Стоимость:</strong> ${total}₽
      </div>
    `;

    document.getElementById('viewModal').style.display = 'flex';
  } catch (error) {
    alert('Ошибка при загрузке заказа: ' + error.message);
  }
}

// Показать модальное окно редактирования
async function showEditModal(orderId) {
  try {
    const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d';
    const url = new URL(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}`);
    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const order = await response.json();
    currentOrder = order;

    // Заполняем форму
    document.getElementById('editOrderId').value = order.id;
    document.getElementById('editFullName').value = order.full_name;
    document.getElementById('editEmail').value = order.email;
    document.getElementById('editPhone').value = order.phone;
    document.getElementById('editAddress').value = order.delivery_address;
    document.getElementById('editComment').value = order.comment || '';

    // Устанавливаем тип доставки
    if (order.delivery_type === 'now') {
      document.getElementById('editDeliveryNow').checked = true;
      document.getElementById('editDeliveryTime').disabled = true;
    } else {
      document.getElementById('editDeliveryByTime').checked = true;
      document.getElementById('editDeliveryTime').disabled = false;
      document.getElementById('editDeliveryTime').value = order.delivery_time || '';
    }

    // Отображаем состав заказа
    const itemsDiv = document.getElementById('editOrderItems');
    itemsDiv.innerHTML = `
      ${order.soup_name ? `<p><strong>Суп:</strong> ${order.soup_name}</p>` : ''}
      ${order.main_course_name ? `<p><strong>Главное блюдо:</strong> ${order.main_course_name}</p>` : ''}
      ${order.salad_name ? `<p><strong>Салат:</strong> ${order.salad_name}</p>` : ''}
      ${order.drink_name ? `<p><strong>Напиток:</strong> ${order.drink_name}</p>` : ''}
      ${order.dessert_name ? `<p><strong>Десерт:</strong> ${order.dessert_name}</p>` : ''}
      <p><strong>Стоимость:</strong> ${order.total_cost}₽</p>
    `;

    document.getElementById('editModal').style.display = 'flex';
  } catch (error) {
    alert('Ошибка при загрузке данных заказа: ' + error.message);
  }
}

// Показать модальное окно удаления
function showDeleteModal(orderId) {
  currentOrder = { id: orderId };
  document.getElementById('deleteModal').style.display = 'flex';
}

// Закрыть все модальные окна
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Сохранить изменения заказа
async function saveOrderChanges() {
  const formData = new FormData(document.getElementById('editOrderForm'));
  const data = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    delivery_address: formData.get('delivery_address'),
    delivery_type: formData.get('delivery_type'),
    delivery_time: formData.get('delivery_time'),
    comment: formData.get('comment')
  };

  const orderId = parseInt(document.getElementById('editOrderId').value);
  const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d';

  try {
    const url = new URL(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}`);
    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
    }

    alert('Заказ успешно изменён!');
    closeModal('editModal');
    loadOrders(); // Обновляем список
  } catch (error) {
    alert('Ошибка при сохранении заказа: ' + error.message);
  }
}

// Удалить заказ
async function deleteOrder() {
  const orderId = currentOrder.id;
  const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d';

  try {
    const url = new URL(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}`);
    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert('Заказ успешно удалён!');
    closeModal('deleteModal');
    loadOrders(); // Обновляем список
  } catch (error) {
    alert('Ошибка при удалении заказа: ' + error.message);
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();

  // Обработчики закрытия модальных окон
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').style.display = 'none';
    });
  });

  document.getElementById('viewCloseBtn').addEventListener('click', () => {
    closeModal('viewModal');
  });

  document.getElementById('editCancelBtn').addEventListener('click', () => {
    closeModal('editModal');
  });

  document.getElementById('deleteCancelBtn').addEventListener('click', () => {
    closeModal('deleteModal');
  });

  document.getElementById('editSaveBtn').addEventListener('click', saveOrderChanges);
  document.getElementById('deleteConfirmBtn').addEventListener('click', deleteOrder);
});
