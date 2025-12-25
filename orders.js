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

    // Формируем состав заказа
    const items = [];
    if (order.soup_name) items.push(order.soup_name);
    if (order.main_course_name) items.push(order.main_course_name);
    if (order.salad_name) items.push(order.salad_name);
    if (order.drink_name) items.push(order.drink_name);
    if (order.dessert_name) items.push(order.dessert_name);

    const itemsText = items.length > 0 ? items.join(', ') : 'Нет блюд';

    // Формируем время доставки
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
        <strong>Состав:</strong> ${itemsText}<br>
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

// Показать модальное окно просмотра
async function showViewModal(orderId) {
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
        ${order.comment || 'Нет комментария'}<br><br>
        <strong>Состав заказа:</strong><br>
        ${order.soup_name ? `Основное блюдо: ${order.soup_name}<br>` : ''}
        ${order.main_course_name ? `Основное блюдо: ${order.main_course_name}<br>` : ''}
        ${order.salad_name ? `Салат: ${order.salad_name}<br>` : ''}
        ${order.drink_name ? `Напиток: ${order.drink_name}<br>` : ''}
        ${order.dessert_name ? `Десерт: ${order.dessert_name}<br>` : ''}
        <strong>Стоимость:</strong> ${order.total_cost}₽
      </div>
    `;

    document.getElementById('viewModal').style.display = 'flex';
  } catch (error) {
    alert('Ошибка при загрузке данных заказа: ' + error.message);
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
      ${order.soup_name ? `<p>Суп: ${order.soup_name}</p>` : ''}
      ${order.main_course_name ? `<p>Главное блюдо: ${order.main_course_name}</p>` : ''}
      ${order.salad_name ? `<p>Салат: ${order.salad_name}</p>` : ''}
      ${order.drink_name ? `<p>Напиток: ${order.drink_name}</p>` : ''}
      ${order.dessert_name ? `<p>Десерт: ${order.dessert_name}</p>` : ''}
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
