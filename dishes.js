// Заменяем статический массив на функцию загрузки данных
let dishes = [];

// Функция для загрузки данных о блюдах из API
async function loadDishes() {
  try {
    const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    dishes = data; // Присваиваем загруженные данные глобальной переменной
  } catch (error) {
    console.error('Ошибка при загрузке данных о блюдах:', error);
    // В случае ошибки, можно использовать резервный массив или показать сообщение пользователю
    // Например:
    // alert('Не удалось загрузить меню. Попробуйте позже.');
  }
}

// Вызываем функцию при загрузке страницы
window.addEventListener('DOMContentLoaded', loadDishes);
