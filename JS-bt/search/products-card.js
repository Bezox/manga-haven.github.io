// ==================== МОДУЛЬ ТОВАРОВ И ПОИСКА ====================

class ProductManager {
    constructor() {
        this.products = [];
        this.searchResults = [];
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupSearch();
        this.renderAllProducts();
    }

    // Функция для получения корректного пути (абсолютного от корня)
    getProductPath(product) {
        if (!product || !product.path) {
            return `/product.html?id=${product.id}`;
        }
        
        let path = product.path;
        
        // Убедимся, что путь начинается с /
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Если в пути уже есть cards/, не добавляем его
        if (!path.includes('cards/') && !path.includes('cards/')) {
            path = '/cards' + path;
        }
        
        // Удаляем возможные дублирования
        if (path.includes('//')) {
            path = path.replace('//', '/');
        }
        
        // Удаляем дублирование cards/cards/
        if (path.includes('/cards/cards/')) {
            path = path.replace('/cards/cards/', '/cards/');
        }
        
        return path;
    }

    // Загрузка товаров из JSON
  // В обоих файлах добавьте после loadProducts():
async loadProducts() {
    try {
        console.log('📥 Загружаем товары из JSON...');
        
        // Пробуем несколько возможных путей
        const possiblePaths = [
            '/JS-bt/search/products-card.json',
            '/JS-bt/search/products.json',
            'products-card.json',
            'products.json'
        ];
        
        let data = null;
        let lastError = null;
        
        for (const path of possiblePaths) {
            try {
                console.log(`Пробуем загрузить: ${path}`);
                const response = await fetch(path);
                
                if (response.ok) {
                    data = await response.json();
                    console.log(`✅ Успешно загружено с ${path}`);
                    break;
                }
            } catch (err) {
                lastError = err;
                console.warn(`❌ Не удалось загрузить ${path}:`, err.message);
            }
        }
        
        if (!data) {
            throw new Error(`Не удалось загрузить данные: ${lastError?.message || 'Все пути недоступны'}`);
        }
        
        this.products = data.products;
        console.log('✅ Товары загружены:', this.products.length);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки товаров:', error);
        console.log('🔄 Используем резервные данные...');
        this.products = this.getFallbackProducts();
    }
}
    // Настройка поиска
    setupSearch() {
        const searchInput = document.querySelector('.search-bar input');
        const searchBtn = document.querySelector('.search-btn');
        
        console.log('🔍 Настройка поиска...');
        
        if (searchInput && searchBtn) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(searchInput.value);
                }
            });
            
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.performSearch(searchInput.value);
            });
            
            console.log('✅ Поиск настроен');
        } else {
            console.warn('⚠️ Элементы поиска не найдены');
        }
    }

    // Выполнение поиска
    performSearch(query) {
        if (!query || !query.trim()) {
            this.hideSearchResults();
            return;
        }
        
        const searchTerm = query.toLowerCase().trim();
        this.searchResults = this.products.filter(product => {
            const searchFields = [
                product.name?.toLowerCase() || '',
                product.author?.toLowerCase() || '',
                product.category?.toLowerCase() || '',
                product.description?.toLowerCase() || '',
                ...(product.tags || []).map(tag => tag.toLowerCase())
            ];
            
            return searchFields.some(field => field.includes(searchTerm));
        });
        
        console.log('🔎 Найдено товаров:', this.searchResults.length);
        this.displaySearchResults(query);
    }

    // Отображение результатов поиска
    displaySearchResults(query) {
        let resultsContainer = document.getElementById('search-results-container');
        
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'search-results-container';
            resultsContainer.className = 'search-results-container';
            document.body.appendChild(resultsContainer);
            
            document.addEventListener('click', (e) => {
                if (!resultsContainer.contains(e.target) && 
                    !e.target.closest('.search-bar') && 
                    !e.target.closest('.search-btn')) {
                    this.hideSearchResults();
                }
            });
        }
        
        if (this.searchResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-results-header">
                    <h3>Результати пошуку "${query}"</h3>
                    <button class="close-search-results">&times;</button>
                </div>
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Нічого не знайдено</h3>
                    <p>Спробуйте інший запит</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="search-results-header">
                    <h3>Результати пошуку "${query}" (${this.searchResults.length})</h3>
                    <button class="close-search-results">&times;</button>
                </div>
                <div class="search-results-grid">
                    ${this.searchResults.slice(0, 6).map(product => this.renderSearchResult(product)).join('')}
                </div>
                ${this.searchResults.length > 6 ? `
                    <div class="search-results-footer">
                        <button class="btn secondary-btn" id="show-all-results">
                            Показати всі ${this.searchResults.length} товарів
                        </button>
                    </div>
                ` : ''}
            `;
        }
        
        resultsContainer.style.display = 'block';
        
        resultsContainer.querySelector('.close-search-results').addEventListener('click', () => {
            this.hideSearchResults();
        });
        
        const showAllBtn = document.getElementById('show-all-results');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => {
                this.showAllSearchResults();
            });
        }
        
        setTimeout(() => {
            this.setupSearchResultButtons();
        }, 100);
    }

    // Рендеринг одного результата поиска
    renderSearchResult(product) {
        const badge = product.status === 'new' ? 'NEW' : 
                     product.status === 'popular' ? 'POPULAR' : 
                     product.discount > 0 ? `SALE -${product.discount}%` : '';
        
        const badgeClass = product.status === 'new' ? 'new' : 
                          product.status === 'popular' ? 'popular' : 
                          product.discount > 0 ? 'sale' : '';
        
        const priceHTML = product.discount > 0 ? `
            <div class="price">
                <span class="original">${product.originalPrice} грн</span>
                <span class="current">${product.price} грн</span>
            </div>
        ` : `
            <div class="price">${product.price} грн</div>
        `;
        
        // Используем функцию getProductPath для получения корректного пути
        const productPath = this.getProductPath(product);
        
        return `
            <div class="search-result-item" data-id="${product.id}">
                ${badge ? `<div class="badge ${badgeClass}">${badge}</div>` : ''}
                <div class="image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/250x350/F5F1FF/5A5A5A?text=No+Image'">
                </div>
                <div class="info">
                    <h4>${product.name}</h4>
                    <div class="category">${product.category}</div>
                    ${priceHTML}
                    <div class="rating">
                        <span class="stars">${this.renderStars(product.rating)}</span>
                        <span class="value">${product.rating}</span>
                    </div>
                    <div class="actions">
                        <button class="btn cart-btn" 
                                data-id="${product.id}"
                                data-name="${product.name}"
                                data-price="${product.price}"
                                data-image="${product.image}">
                            <i class="fas fa-cart-plus"></i> В кошик
                        </button>
                        <a href="${productPath}" class="btn view-btn">
                            <i class="fas fa-eye"></i> Детальніше
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Рендеринг звезд рейтинга
    renderStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5;
        const empty = 5 - full - (half ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
        if (half) stars += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
        
        return stars;
    }

    // Настройка кнопок в результатах поиска
    setupSearchResultButtons() {
        document.querySelectorAll('.cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.ShoppingCart) {
                    const product = {
                        id: btn.getAttribute('data-id'),
                        name: btn.getAttribute('data-name'),
                        price: parseInt(btn.getAttribute('data-price')),
                        image: btn.getAttribute('data-image')
                    };
                    
                    window.ShoppingCart.addItem(product);
                    this.showNotification('Товар додано до кошика!');
                }
            });
        });
    }

    // Скрытие результатов поиска
    hideSearchResults() {
        const resultsContainer = document.getElementById('search-results-container');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }

    // Показать все результаты поиска
    showAllSearchResults() {
        console.log('Показываем все результаты');
        alert(`Показати всі ${this.searchResults.length} товарів`);
        this.hideSearchResults();
    }

    // Рендеринг всех товаров на странице
    renderAllProducts() {
        console.log('🔄 Рендеринг товаров на странице...');
        
        setTimeout(() => {
            this.renderSectionProducts('#new-arrivals .products-grid', this.getProductsByStatus('new'));
            this.renderSectionProducts('#bestsellers .products-grid', this.getProductsByStatus('popular'));
            this.renderSectionProducts('#discounts .products-grid', this.getProductsByStatus('sale'));
            this.renderSectionProducts('#related-products .products-grid', this.getRandomProducts(4));
            
            this.setupProductCards();
            
            console.log('✅ Товары отрендерены');
        }, 300);
    }

    // Рендеринг секции товаров
    renderSectionProducts(selector, products) {
        const container = document.querySelector(selector);
        if (!container) {
            console.warn(`Контейнер не найден: ${selector}`);
            return;
        }
        
        const sectionProducts = products.slice(0, 4);
        container.innerHTML = sectionProducts.map(product => 
            this.renderProductCard(product)
        ).join('');
    }

    // Получение товаров по статусу
    getProductsByStatus(status) {
        return this.products.filter(product => product.status === status);
    }

    // Получение случайных товаров
    getRandomProducts(count) {
        return [...this.products]
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }

    // Рендеринг карточки товара
    renderProductCard(product) {
        const badge = product.status === 'new' ? 'NEW' : 
                     product.status === 'popular' ? 'POPULAR' : 
                     product.discount > 0 ? `SALE -${product.discount}%` : '';
        
        const badgeClass = product.status === 'new' ? 'new' : 
                          product.status === 'popular' ? 'popular' : 
                          product.discount > 0 ? 'sale' : '';
        
        const extraClass = product.status === 'popular' ? 'recommended' : '';
        
        const priceHTML = product.discount > 0 ? `
            <div class="product-price">
                <span class="original-price">${product.originalPrice} грн</span>
                <span class="discounted-price">${product.price} грн</span>
            </div>
        ` : `
            <div class="product-price">${product.price} грн</div>
        `;
        
        // Используем функцию getProductPath для получения корректного пути
        const productPath = this.getProductPath(product);
        
        return `
            <div class="product-card ${extraClass}">
                ${badge ? `<div class="product-badge ${badgeClass}">${badge}</div>` : ''}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/250x350/F5F1FF/5A5A5A?text=No+Image'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        <span class="stars">
                            ${this.renderStars(product.rating)}
                        </span>
                        <span class="rating-value">${product.rating}</span>
                    </div>
                    <p class="product-description">${product.description.substring(0, 80)}...</p>
                    ${priceHTML}
                    <div class="product-actions">
                        <button class="btn product-btn add-to-cart-page" 
                                data-id="${product.id}"
                                data-name="${product.name}"
                                data-price="${product.price}"
                                data-image="${product.image}">
                            В кошик
                        </button>
                        <a href="${productPath}" class="btn view-details-btn">
                            <i class="fas fa-eye"></i>
                            Детальніше
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Настройка кнопок "В корзину" на странице
    setupProductCards() {
        document.querySelectorAll('.add-to-cart-page').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (window.ShoppingCart) {
                    const product = {
                        id: btn.getAttribute('data-id'),
                        name: btn.getAttribute('data-name'),
                        price: parseInt(btn.getAttribute('data-price')),
                        image: btn.getAttribute('data-image')
                    };
                    
                    window.ShoppingCart.addItem(product);
                    
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i> Додано';
                    btn.style.background = 'var(--pastel-mint)';
                    btn.style.color = 'var(--ink-black)';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 2000);
                }
            });
        });
    }

    // Уведомление
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'simple-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 9999;
            animation: fadeInOut 3s ease-in-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-20px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }

    // Получение товара по ID
    getProductById(id) {
        return this.products.find(product => product.id == id);
    }

    // Получение товаров по категории
    getProductsByCategory(category) {
        return this.products.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Резервные данные (упрощенные)
    getFallbackProducts() {
        return [
            {
                id: 1,
                name: "One Piece Том 102",
                price: 350,
                path: "OP/One_Piece.html",
                image: "https://via.placeholder.com/250x350/F5F1FF/5A5A5A?text=One+Piece+Vol.102",
                status: "new",
                rating: 4.7
            },
            {
                id: 2,
                name: "Jujutsu Kaisen Том 22",
                price: 320,
                path: "JK/JK.html",
                image: "https://via.placeholder.com/250x350/F5F1FF/5A5A5A?text=Jujutsu+Kaisen+Vol.22",
                status: "new",
                rating: 5.0
            }
        ];
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

// Глобальная переменная для доступа к менеджеру товаров
window.ProductManager = null;

// Функция инициализации
function initProducts() {
    console.log('🚀 Инициализация менеджера товаров...');
    window.ProductManager = new ProductManager();
    console.log('✅ Менеджер товаров инициализирован');
    return window.ProductManager;
}

// Автоматическая инициализация
// Заменяем:
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM загружен, инициализируем менеджер товаров...');
    
    setTimeout(() => {
        initProducts();
        
        // Быстрая проверка в консоли
        console.log('Для проверки: window.ProductManager доступен глобально');
        console.log('Попробуйте в консоли: ProductManager.products');
    }, 100);
});


document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM загружен, инициализируем менеджер товаров...');
    
    // Проверяем, не инициализирован ли уже менеджер
    if (window.ProductManager) {
        console.log('✅ Менеджер товаров уже инициализирован');
        return;
    }
    
    // Задержка для гарантии полной загрузки DOM
    setTimeout(() => {
        try {
            window.ProductManager = initProducts();
            console.log('✅ Менеджер товаров успешно инициализирован');
            
            // Дебаг информация
            if (window.ProductManager && window.ProductManager.products) {
                console.log(`📦 Загружено ${window.ProductManager.products.length} товаров`);
                
                // Проверяем работу поиска
                const searchInput = document.querySelector('.search-bar input');
                if (searchInput) {
                    console.log('🔍 Поле поиска найдено');
                    
                    // Быстрая тестовая проверка
                    setTimeout(() => {
                        console.log('Тест поиска: введите текст в поиск и нажмите Enter');
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('❌ Ошибка инициализации менеджера товаров:', error);
        }
    }, 100);
});