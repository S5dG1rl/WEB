// Простая авторизация "для защиты"
(function() {
  const AUTH_DONE = sessionStorage.getItem('authDone');
  if (AUTH_DONE) return; // уже прошёл

  const login = prompt('Введите логин:');
  const password = prompt('Введите пароль:');

  // Можно оставить любые значения — это только для демонстрации
  if (login === 'user' && password === '123') {
    sessionStorage.setItem('authDone', 'true');
    alert('Добро пожаловать!');
  } else {
    alert('Неверные данные. Попробуйте ещё раз.');
    location.reload(); // перезагрузить, пока не введёт правильно
  }
})();
