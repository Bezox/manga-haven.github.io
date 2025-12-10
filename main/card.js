
document.addEventListener('DOMContentLoaded', function() {
    initProductGallery();
    initProductOptions();
    initTabs();
    initQuantitySelector();
    initProductActions();
    initImageModal();
    initReviews();
});
window.addEventListener('resize', handleResize);

document.addEventListener('DOMContentLoaded', function() {
 
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId && window.ProductManager) {
        const product = window.ProductManager.getProductById(productId);
        if (product) {
            
            populateProductPage(product);
        }
    }
    
 
});

function populateProductPage(product) {
   
    document.querySelector('.product-title').textContent = product.name;
    document.querySelector('.price-current').textContent = `${product.price} грн`;

}

// Галерея изображений
function initProductGallery() {
    const mainImage = document.getElementById('main-product-image');
    const thumbItems = document.querySelectorAll('.thumb-item');
    const zoomBtn = document.getElementById('zoom-btn');
    
    if (thumbItems.length > 0) {
        thumbItems.forEach(thumb => {
            thumb.addEventListener('click', function() {
                // Убираем активный класс у всех миниатюр
                thumbItems.forEach(item => item.classList.remove('active'));
                
                // Добавляем активный класс к текущей миниатюре
                this.classList.add('active');
                
                // Обновляем главное изображение
                const newImageSrc = this.getAttribute('data-image');
                mainImage.src = newImageSrc;
                mainImage.alt = this.querySelector('img').alt;
            });
        });
    }
    
    // Увеличение изображения
    if (zoomBtn && mainImage) {
        zoomBtn.addEventListener('click', function() {
            openImageModal(mainImage.src, mainImage.alt);
        });
    }
}

// Опции товара
function initProductOptions() {
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const optionGroup = this.closest('.option-group');
            const buttons = optionGroup.querySelectorAll('.option-btn');
            
            // Убираем активный класс у всех кнопок в группе
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс к текущей кнопке
            this.classList.add('active');
        });
    });
}

// Табы
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Убираем активный класс у всех кнопок и панелей
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Добавляем активный класс к текущей кнопке и соответствующей панели
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Селектор количества
function initQuantitySelector() {
    const quantityInput = document.getElementById('quantity-input');
    const decreaseBtn = document.getElementById('quantity-decrease');
    const increaseBtn = document.getElementById('quantity-increase');
    
    if (decreaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
    }
    
    if (increaseBtn && quantityInput) {
        increaseBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            const maxValue = parseInt(quantityInput.getAttribute('max')) || 10;
            if (currentValue < maxValue) {
                quantityInput.value = currentValue + 1;
            }
        });
    }
    
    // Валидация ввода
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            const min = parseInt(this.getAttribute('min')) || 1;
            const max = parseInt(this.getAttribute('max')) || 10;
            
            if (isNaN(value) || value < min) {
                this.value = min;
            } else if (value > max) {
                this.value = max;
            }
        });
    }
}

// Действия с товаром
function initProductActions() {
    const addToCartBtn = document.getElementById('add-to-cart');
    const addToWishlistBtn = document.getElementById('add-to-wishlist');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const quantity = parseInt(document.getElementById('quantity-input').value);
            const productTitle = document.querySelector('.product-title').textContent;
            const productPrice = document.querySelector('.price-current').textContent;
            
            // Анимация кнопки
            this.innerHTML = '<i class="fas fa-check"></i> Додано до кошика';
            this.style.background = 'var(--pastel-mint)';
            this.style.color = 'var(--ink-black)';
            
            // Обновление счетчика корзины
            updateCartCounter(quantity);
            
            // Восстановление кнопки через 2 секунды
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-shopping-cart"></i> Додати до кошика';
                this.style.background = '';
                this.style.color = '';
            }, 2000);
            
            // Показать уведомление
            showNotification(`"${productTitle}" додано до кошика! (${quantity} шт.)`);
        });
    }
    
    if (addToWishlistBtn) {
        addToWishlistBtn.addEventListener('click', function() {
            const productTitle = document.querySelector('.product-title').textContent;
            
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                this.innerHTML = '<i class="fas fa-heart"></i> В обраному';
                this.style.background = 'var(--sakura-pink)';
                this.style.color = 'var(--white)';
                this.style.borderColor = 'var(--sakura-pink)';
                
                // Обновление счетчика избранного
                updateWishlistCounter(1);
                showNotification(`"${productTitle}" додано до обраного!`);
            } else {
                this.innerHTML = '<i class="fas fa-heart"></i> В обране';
                this.style.background = '';
                this.style.color = '';
                this.style.borderColor = 'var(--soft-lilac)';
                
                // Обновление счетчика избранного
                updateWishlistCounter(-1);
            }
        });
    }
}

// Модальное окно изображения
function initImageModal() {
    const modal = document.getElementById('image-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImage = document.getElementById('modal-image');
    
    // Закрытие модального окна
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
    
    // Закрытие по клику вне изображения
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

function openImageModal(imageSrc, imageAlt) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    
    modalImage.src = imageSrc;
    modalImage.alt = imageAlt;
    modal.classList.add('active');
}

// Отзывы
function initReviews() {
    const helpfulButtons = document.querySelectorAll('.helpful-btn');
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    const writeReviewBtn = document.querySelector('.write-review-btn');
    
    // Кнопки "Полезно"
    helpfulButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentText = this.textContent;
            const match = currentText.match(/\((\d+)\)/);
            
            if (match) {
                const currentCount = parseInt(match[1]);
                const newCount = currentCount + 1;
                this.textContent = currentText.replace(/\(\d+\)/, `(${newCount})`);
                
                // Временное изменение стиля
                this.style.background = 'var(--pastel-mint)';
                this.style.color = 'var(--ink-black)';
                
                setTimeout(() => {
                    this.style.background = '';
                    this.style.color = '';
                }, 1000);
            }
        });
    });
    
    // Пагинация отзывов
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('next')) return;
            
            paginationButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
           
            showNotification('Завантаження наступної сторінки відгуків...');
        });
    });
    
    // Кнопка написания отзыва
    if (writeReviewBtn) {
        writeReviewBtn.addEventListener('click', function() {
            showNotification('Функція написання відгуку буде доступна найближчим часом!');
        });
    }
}

// Вспомогательные функции
function updateCartCounter(increment = 0) {
    const cartBtn = document.getElementById('cart-btn');
    const badge = cartBtn?.querySelector('.badge');
    
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + increment;
        
        // Анимация обновления
        badge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 300);
    }
}

function updateWishlistCounter(increment = 0) {
    const wishlistBtn = document.getElementById('wishlist-btn');
    const badge = wishlistBtn?.querySelector('.badge');
    
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        const newCount = Math.max(0, currentCount + increment);
        badge.textContent = newCount;
        
        // Анимация обновления
        badge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 300);
    }
}

function showNotification(message, type = 'success') {
    // Создание элемента уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--white);
        color: var(--ink-black);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-strong);
        border-left: 4px solid ${type === 'success' ? 'var(--pastel-mint)' : 'var(--blush-rose)'};
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Адаптивность для мобильных устройств
function handleResize() {
    // Закрыть мобильное меню при изменении размера на десктоп
    if (window.innerWidth > 768) {
        const mainNav = document.getElementById('main-nav');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        if (mainNav) mainNav.classList.remove('active');
        if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
}

