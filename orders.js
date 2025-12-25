let cachedDishes = null;
let currentOrder = null;

// Загрузка списка блюд (для расчёта стоимости)
async function loadDishesForOrders() {
  if (cachedDishes) return;
  try {
    const res = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
    if (!res.ok) throw new Error('Не удалось загрузить меню');
    const data = await res.json();
    cachedDishes = data.map(d => {
      let cat = d.category;
      if (cat === 'main-course') cat = 'main';
      if (cat === 'salad') cat = 'starter';
      return { ...d, category: cat, image: d.image.trim() };
    });
  } catch (err) {
    console.error('Ошибка загрузки блюд:', err);
  }
}

// Расчёт стоимости заказа по ID блюд
function calculateTotal(order) {
  if (!cachedDishes) return 0;
  let total = 0;
  const ids = [
    { id: order.soup_id, cat: 'soup' },
    { id: order.main_course_id, cat: 'main' },
    { id: order.salad_id, cat: 'starter' },
    { id: order.drink_id, cat: 'drink' },
    { id: order.dessert_id, cat: 'dessert' }
  ];
  ids.forEach(item => {
    if (item.id) {
      const dish = cachedDishes.find(d => d.id === item.id);
      if (dish) total += dish.price;
    }
  });
  return total;
}

// Загрузка списка заказов
async function loadOrders() {
  try {
    await loadDishesForOrders();

    const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d';
    const url = new URL('https://edu.std-900.ist.mospolytech.ru/labs/api/orders');
    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const orders = await response.json();
    displayOrders(orders);
  } catch (error) {
    console.error('Ошибка загрузки заказов:', error);
    document.getElementById('orders-container').innerHTML = 
      '<div id="no-orders">Не удалось загрузить заказы. Попробуйте позже.</div>';
  }
}

// Отображение списка заказов
function displayOrders(orders) {
  const container = document.getElementById('orders-container');
  if (!orders || orders.length === 0) {
    container.innerHTML = '<div id="no-orders">У вас пока нет заказов.</div>';
    return;
  }

  container.innerHTML = '';
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  orders.forEach((order, index) => {
    const total = calculateTotal(order);
    let deliveryTimeText = 'Как можно скорее (с 7:00 до 23:00)';
    if (order.delivery_type === 'by_time' && order.delivery_time) {
      deliveryTimeText = order.delivery_time;
    }

    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.orderId = order.id;
    card.innerHTML = `
      <div class="order-header">
        <span>Заказ #${index + 1}</span>
        <span>${new Date(order.created_at).toLocaleString('ru-RU')}</span>
      </div>
      <div class="order-details">
        <strong>Стоимость:</strong> ${total}₽<br>
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

  // Обработчики
  document.querySelectorAll('.order-card button[data-action]').forEach(button => {
    button.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const orderId = parseInt(e.target.dataset.id);
      handleOrderAction(action, orderId);
    });
  });
}

// Обработка кликов по кнопкам
function handleOrderAction(action, orderId) {
  currentOrder = orderId;
  switch (action) {
    case 'view': showViewModal(orderId); break;
    case 'edit': showEditModal(orderId); break;
    case 'delete': showDeleteModal(orderId); break;
  }
}

// МОДАЛЬНОЕ ОКНО: ПОДРОБНО
async function showViewModal(orderId) {
  try {
    const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d';
    const res = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${apiKey}`);
    if (!res.ok) throw new Error('Заказ не найден');
    const order = await res.json();

    // Загружаем блюда, если нужно
    if (!cachedDishes) await loadDishesForOrders();

    const soup = cachedDishes?.find(d => d.id === order.soup_id);
    const main = cachedDishes?.find(d => d.id === order.main_course_id);
    const salad = cachedDishes?.find(d => d.id === order.salad_id);
    const drink = cachedDishes?.find(d => d.id === order.drink_id);
    const dessert = cachedDishes?.find(d => d.id === order.dessert_id);

    let total = 0;
    if (soup) total += soup.price;
    if (main) total += main.price;
    if (salad) total += salad.price;
    if (drink) total += drink.price;
    if (dessert) total += dessert.price;

    document.getElementById('viewOrderDetails').innerHTML = `
      <div class="order-details">
        <strong>Дата:</strong> ${new Date(order.created_at).toLocaleString('ru-RU')}<br><br>
        <strong>Получатель:</strong> ${order.full_name}<br>
        <strong>Адрес:</strong> ${order.delivery_address}<br>
        <strong>Телефон:</strong> ${order.phone}<br>
        <strong>Email:</strong> ${order.email}<br>
        <strong>Время доставки:</strong> ${order.delivery_type === 'now' ? 'Как можно скорее' : order.delivery_time}<br>
        <strong>Комментарий:</strong> ${order.comment || '—'}<br><br>
        <strong>Состав:</strong><br>
        ${soup ? `Суп: ${soup.name}<br>` : ''}
        ${main ? `Главное блюдо: ${main.name}<br>` : ''}
        ${salad ? `Салат: ${salad.name}<br>` : ''}
        ${drink ? `Напиток: ${drink.name}<br>` : ''}
        ${dessert ? `Десерт: ${dessert.name}<br>` : ''}
        ${(order.soup_id || order.main_course_id || order.salad_id || order.drink_id || order.dessert_id) ? '' : 'Нет блюд'}
        <br><strong>Итого:</strong> ${total}₽
      </div>
    `;
    document.getElementById('viewModal').style.display = 'flex';
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
}

// МОДАЛЬНОЕ ОКНО: УДАЛЕНИЕ
function showDeleteModal(orderId) {
  currentOrder = orderId;
  document.getElementById('deleteModal').style.display = 'flex';
}

// ЗАКРЫТИЕ МОДАЛЕЙ
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// УДАЛЕНИЕ ЗАКАЗА
async function deleteOrder() {
  const orderId = currentOrder;
  const apiKey = '0ef845ea-3f76-4af2-9e70-1af33830ec6d';
  try {
    const res = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${apiKey}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Не удалось удалить');
    alert('Заказ удалён');
    closeModal('deleteModal');
    loadOrders();
  } catch (err) {
    alert('Ошибка удаления: ' + err.message);
  }
}

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();

  // Закрытие модалей по крестику
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay').style.display = 'none');
  });

  // Кнопки
  document.getElementById('viewCloseBtn').addEventListener('click', () => closeModal('viewModal'));
  document.getElementById('deleteCancelBtn').addEventListener('click', () => closeModal('deleteModal'));
  document.getElementById('deleteConfirmBtn').addEventListener('click', deleteOrder);
});
