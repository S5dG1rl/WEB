// dishes.js
const dishes = [
  // Супы
  { keyword: "borsh", name: "Борщ", price: 210, category: "soup", kind: "meat", count: "300 мл", image: "images/борщ.jpg" },
  { keyword: "tom_yam", name: "Том Ям", price: 240, category: "soup", kind: "fish", count: "300 мл", image: "images/том.jpg" },
  { keyword: "chicken_soup", name: "Куриный суп с лапшой", price: 180, category: "soup", kind: "meat", count: "300 мл", image: "images/кур.jpg" },
  { keyword: "mushroom_soup", name: "Грибной крем-суп", price: 190, category: "soup", kind: "veg", count: "300 мл", image: "images/гриб.jpg" },
  { keyword: "gazpacho", name: "Гаспачо", price: 160, category: "soup", kind: "veg", count: "300 мл", image: "images/гас.jpg" },
  { keyword: "fish_soup", name: "Уха", price: 250, category: "soup", kind: "fish", count: "300 мл", image: "images/уха.jpg" },

  // Главные блюда
  { keyword: "lasagna", name: "Лазанья", price: 385, category: "main", kind: "veg", count: "400 г", image: "images/лаз.jpg" },
  { keyword: "beef_stroganoff", name: "Бефстроганов", price: 340, category: "main", kind: "meat", count: "380 г", image: "images/беф.jpg" },
  { keyword: "salmon", name: "Сёмга на гриле", price: 390, category: "main", kind: "fish", count: "350 г", image: "images/сем.jpg" },
  { keyword: "mushroom_stroganoff", name: "Бефстроганов из грибов", price: 290, category: "main", kind: "veg", count: "380 г", image: "images/гриб_беф.jpg" },
  { keyword: "pork_ribs", name: "Свиные рёбра", price: 420, category: "main", kind: "meat", count: "450 г", image: "images/реб.jpg" },
  { keyword: "tuna", name: "Тунец на гриле", price: 450, category: "main", kind: "fish", count: "300 г", image: "images/тун.jpg" },

  // Салаты и стартеры
  { keyword: "caesar_salad", name: "Цезарь с курицей", price: 280, category: "starter", kind: "meat", count: "250 г", image: "images/цезарь.jpg" },
  { keyword: "tuna_salad", name: "Салат с тунцом", price: 270, category: "starter", kind: "fish", count: "250 г", image: "images/тун_сал.jpg" },
  { keyword: "mushroom_salad", name: "Салат с грибами", price: 220, category: "starter", kind: "veg", count: "250 г", image: "images/гриб_сал.jpg" },
  { keyword: "tomato_salad", name: "Салат из свежих овощей", price: 180, category: "starter", kind: "veg", count: "200 г", image: "images/овощи.jpg" },
  { keyword: "cheese_app", name: "Сырная тарелка", price: 250, category: "starter", kind: "veg", count: "150 г", image: "images/сыр.jpg" },
  { keyword: "avocado_app", name: "Гуакамоле с чипсами", price: 200, category: "starter", kind: "veg", count: "150 г", image: "images/гуак.jpg" },

  // Десерты
  { keyword: "cheesecake", name: "Чизкейк", price: 180, category: "dessert", kind: "small", count: "100 г", image: "images/чиз.jpg" },
  { keyword: "pancakes", name: "Блинчики", price: 150, category: "dessert", kind: "small", count: "150 г", image: "images/блин.jpg" },
  { keyword: "ice_cream", name: "Мороженое 3 шарика", price: 190, category: "dessert", kind: "small", count: "120 г", image: "images/мор.jpg" },
  { keyword: "tiramisu", name: "Тирамису", price: 250, category: "dessert", kind: "medium", count: "150 г", image: "images/тир.jpg" },
  { keyword: "brownie", name: "Брауни с мороженым", price: 220, category: "dessert", kind: "medium", count: "180 г", image: "images/бра.jpg" },
  { keyword: "cake", name: "Торт 'Наполеон'", price: 300, category: "dessert", kind: "large", count: "250 г", image: "images/торт.jpg" },

  // Напитки
  { keyword: "lemonade", name: "Домашний лимонад", price: 120, category: "drink", kind: "cold", count: "400 мл", image: "images/лим.jpg" },
  { keyword: "green_tea", name: "Зелёный чай", price: 90, category: "drink", kind: "hot", count: "400 мл", image: "images/зел.jpg" },
  { keyword: "americano", name: "Американо", price: 150, category: "drink", kind: "hot", count: "300 мл", image: "images/кофе.jpg" },
  { keyword: "milkshake", name: "Молочный коктейль", price: 180, category: "drink", kind: "cold", count: "350 мл", image: "images/кок.jpg" },
  { keyword: "cola", name: "Кока-Кола", price: 100, category: "drink", kind: "cold", count: "330 мл", image: "images/кола.jpg" },
  { keyword: "herbal_tea", name: "Травяной чай", price: 110, category: "drink", kind: "hot", count: "400 мл", image: "images/трав.jpg" }
];
