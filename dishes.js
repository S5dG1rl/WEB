let dishes = [];

async function loadDishes() {
  try {
    const res = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    dishes = data.map(d => {
      let cat = d.category;
      if (cat === 'main-course') cat = 'main';
      if (cat === 'salad') cat = 'starter';
      return { ...d, category: cat, image: d.image.trim() };
    });
    if (typeof initRenderDishes === 'function') initRenderDishes();
  } catch (err) {
    console.error(err);
    alert('Ошибка загрузки меню');
  }
}

document.addEventListener('DOMContentLoaded', loadDishes);
