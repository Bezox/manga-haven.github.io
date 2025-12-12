// init-search.js - Универсальная инициализация поиска
(function () {
  console.log('🔄 Инициализация системы поиска...');

  // Ждем полной загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchSystem);
  } else {
    initSearchSystem();
  }

  function initSearchSystem() {
    console.log('🚀 Запуск системы поиска...');

    // Загружаем только один менеджер товаров
    if (window.ProductManager) {
      console.log('✅ Менеджер товаров уже загружен');
      return;
    }

    // Пробуем загрузить products.js
    const script = document.createElement('script');
    script.src = '/JS-bt/search/products.js';
    script.onload = function () {
      console.log('✅ products.js загружен');

      // Проверяем инициализацию через короткий таймаут
      setTimeout(() => {
        if (window.ProductManager && window.ProductManager.products) {
          console.log(`✅ Система поиска готова. Товаров: ${window.ProductManager.products.length}`);

          // Быстрый тест
          testSearchFunctionality();
        } else {
          console.error('❌ Менеджер товаров не инициализирован');
          loadFallbackManager();
        }
      }, 500);
    };

    script.onerror = function () {
      console.error('❌ Не удалось загрузить products.js');
      loadFallbackManager();
    };

    document.head.appendChild(script);
  }

  function loadFallbackManager() {
    console.log('🔄 Загружаем резервный менеджер товаров...');

    // Создаем простой менеджер для поиска
    window.ProductManager = {
      products: [],
      performSearch: function (query) {
        console.log('🔍 Поиск:', query);
        // Базовая реализация поиска
        return [];
      },
      getFallbackProducts: function () {
        return [
          {
            id: 1,
            name: 'One Piece Том 102',
            price: 350,
            image: 'https://via.placeholder.com/250x350/F5F1FF/5A5A5A?text=One+Piece+Vol.102',
            category: 'Сьонен',
          },
        ];
      },
    };

    console.log('✅ Резервный менеджер товаров загружен');
  }

  function testSearchFunctionality() {
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-btn');

    if (searchInput && searchBtn) {
      console.log('✅ Элементы поиска найдены');

      // Добавляем обработчики событий для быстрой проверки
      searchInput.addEventListener('input', function () {
        console.log('Ввод в поиск:', this.value);
      });
    } else {
      console.warn('⚠️ Элементы поиска не найдены');
    }
  }
})();
