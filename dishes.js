// Глобальный массив для хранения блюд
let dishes = [];

// Функция загрузки данных о блюдах из API
async function loadDishes() {
  try {
    // Запрос к корректному API
    const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();

    // Приводим данные к ожидаемому формату
    dishes = rawData.map(dish => {
      // Преобразуем категории под вашу логику
      let category = dish.category;
      if (category === 'main-course') category = 'main';
      if (category === 'salad') category = 'starter';

      // Убираем лишние пробелы в URL изображения
      const image = dish.image ? dish.image.trim() : '';

      // Возвращаем нормализованное блюдо
      return {
        ...dish,
        category,
        image
      };
    });

    // Безопасный вызов отрисовки
    if (typeof renderAllDishes === 'function') {
      renderAllDishes();
    } else {
      console.warn('renderAllDishes не определена. Убедитесь, что renderDishes.js подключён.');
    }

  } catch (error) {
    console.error('Ошибка при загрузке данных о блюдах:', error);
    alert('Не удалось загрузить меню. Попробуйте позже.');
  }
}

// Запускаем загрузку при готовности DOM
document.addEventListener('DOMContentLoaded', () => {
  loadDishes();
});
