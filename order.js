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
    } else {
      setTimeout(waitForDishes, 100);
    }
  };
  waitForDishes();
});
