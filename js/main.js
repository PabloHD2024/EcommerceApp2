// ========== CARRITO DE COMPRAS ==========

// Cargar carrito del localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => {
        if (el) el.textContent = totalItems;
    });
}

// Función para obtener imagen del producto según ID
function getProductImage(id) {
    const images = {
        1: "../img/Freidora.png",
        2: "../img/Smartwatch.png",
        3: "../img/JBL.png",
        4: "../img/Auriculares Sony WH-1000XM5.png",
        5: "../img/24'' UHD (3840x2160) 4K IPS LED.png",
        6: "../img/Teclado Mecánico RGB.png"
    };
    return images[id] || "https://via.placeholder.com/80x80?text=Producto";
}

// Función para mostrar notificación
function showNotification(message) {
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Función para añadir producto al carrito (VERSIÓN CORREGIDA)
function addToCart(product) {
    console.log("Añadiendo al carrito:", product); // Para debug
    
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
        console.log("Producto existente, nueva cantidad:", existingProduct.quantity);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image || getProductImage(product.id)
        });
        console.log("Nuevo producto añadido:", product.name);
    }
    
    saveCart();
    showNotification(`✓ ${product.name} añadido al carrito`);
    
    // Si estamos en cart.html, actualizar la vista
    if (typeof renderCart === 'function') {
        renderCart();
    }
}

// Función para manejar el click de añadir al carrito (VERSIÓN CORREGIDA)
function handleAddToCart(event) {
    // Asegurarnos de obtener el botón correcto
    let button = event.target;
    
    // Si el click fue en el ícono o en el texto, buscar el botón padre
    if (!button.classList.contains('btn-add')) {
        button = button.closest('.btn-add');
    }
    
    if (!button) return;
    
    // Obtener los datos del producto
    const id = parseInt(button.getAttribute('data-id'));
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));
    
    console.log("Botón clickeado - ID:", id, "Nombre:", name, "Precio:", price);
    
    if (id && name && price) {
        addToCart({ id, name, price });
    } else {
        console.error("Faltan datos en el botón:", button);
    }
}

// ========== CARGAR PRODUCTOS EN LA PÁGINA productos.html ==========
function loadProductsPage() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return; // No estamos en la página de productos
    
    console.log("Cargando página de productos...");
    
    // Lista completa de productos
    const allProducts = [
        {
            id: 1,
            name: "Freidora de Aire 5L",
            price: 89990,
            image: "../img/Freidora.png",
            rating: 4,
            reviews: 120
        },
        {
            id: 2,
            name: "Smartwatch Pro",
            price: 59990,
            image: "../img/Smartwatch.png",
            rating: 5,
            reviews: 85
        },
        {
            id: 3,
            name: "Parlante JBL Flip 6",
            price: 129990,
            image: "../img/JBL.png",
            rating: 4.5,
            reviews: 210
        },
        {
            id: 4,
            name: "Auriculares Sony WH-1000XM5",
            price: 349990,
            image: "../img/Auriculares Sony WH-1000XM5.png",
            rating: 5,
            reviews: 45
        },
        {
            id: 5,
            name: "Monitor LG 24' 4K",
            price: 289990,
            image: "../img/24'' UHD (3840x2160) 4K IPS LED.png",
            rating: 4,
            reviews: 67
        },
        {
            id: 6,
            name: "Teclado Mecánico RGB",
            price: 45990,
            image: "../img/Teclado Mecánico RGB.png",
            rating: 4.5,
            reviews: 112
        }
    ];
    
    // Generar HTML para cada producto
    productsList.innerHTML = allProducts.map(product => {
        // Generar estrellas de rating
        const fullStars = Math.floor(product.rating);
        const hasHalfStar = product.rating % 1 !== 0;
        let starsHTML = '';
        
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fa-solid fa-star"></i>';
        }
        if (hasHalfStar) {
            starsHTML += '<i class="fa-regular fa-star-half-stroke"></i>';
        }
        const emptyStars = 5 - Math.ceil(product.rating);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="fa-regular fa-star"></i>';
        }
        
        return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
                </div>
                <h3>${product.name}</h3>
                <div class="rating">
                    ${starsHTML}
                    <span>(${product.reviews})</span>
                </div>
                <p class="price">$${product.price.toLocaleString('es-AR')}</p>
                <button class="btn-add" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                    <i class="fa-solid fa-cart-plus"></i> Añadir al carrito
                </button>
            </div>
        `;
    }).join('');
    
    // ASIGNAR EVENTOS A LOS BOTONES - FORMA CORRECTA
    const btnsAdd = document.querySelectorAll('.btn-add');
    console.log("Botones encontrados:", btnsAdd.length);
    
    btnsAdd.forEach(btn => {
        // Remover event listeners anteriores para evitar duplicados
        btn.removeEventListener('click', handleAddToCart);
        // Agregar nuevo event listener
        btn.addEventListener('click', handleAddToCart);
    });
}

// ========== FUNCIONES PARA CART.HTML ==========
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart" style="text-align: center; padding: 40px;">🛒 Tu carrito está vacío</p>';
        if (cartTotalSpan) cartTotalSpan.textContent = '$0';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image || getProductImage(item.id)}" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p class="item-unit-price">Precio unitario: $${item.price.toLocaleString('es-AR')}</p>
            </div>
            <div class="item-controls">
                <div class="quantity-controls">
                    <button class="btn-qty" data-index="${index}" data-change="-1">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="btn-qty" data-index="${index}" data-change="1">+</button>
                </div>
                <p class="item-subtotal">$${subtotal.toLocaleString('es-AR')}</p>
            </div>
            <button class="btn-remove" data-index="${index}">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });
    
    if (cartTotalSpan) {
        cartTotalSpan.textContent = `$${total.toLocaleString('es-AR')}`;
    }
    
    // Agregar eventos a los botones de cantidad
    document.querySelectorAll('.btn-qty').forEach(btn => {
        btn.removeEventListener('click', handleQuantityChange);
        btn.addEventListener('click', handleQuantityChange);
    });
    
    // Agregar eventos a los botones de eliminar
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.removeEventListener('click', handleRemoveItem);
        btn.addEventListener('click', handleRemoveItem);
    });
}

function handleQuantityChange(event) {
    const btn = event.currentTarget;
    const index = parseInt(btn.dataset.index);
    const change = parseInt(btn.dataset.change);
    updateQuantity(index, change);
}

function handleRemoveItem(event) {
    const btn = event.currentTarget;
    const index = parseInt(btn.dataset.index);
    removeFromCart(index);
}

function updateQuantity(index, change) {
    if (cart[index]) {
        const newQuantity = cart[index].quantity + change;
        if (newQuantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = newQuantity;
        }
        saveCart();
        renderCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function emptyCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        saveCart();
        renderCart();
        showNotification('Carrito vaciado');
    }
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }
    alert('¡Gracias por tu compra! Pronto recibirás tu pedido.');
    cart = [];
    saveCart();
    renderCart();
    window.location.href = '../index.html';
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado - Inicializando...");
    
    // Actualizar contador del carrito
    updateCartCount();
    
    // Cargar productos si estamos en productos.html
    loadProductsPage();
    
    // Renderizar carrito si estamos en cart.html
    renderCart();
    
    // Botón vaciar carrito (si existe)
    const btnEmpty = document.getElementById('btn-empty');
    if (btnEmpty) {
        btnEmpty.removeEventListener('click', emptyCart);
        btnEmpty.addEventListener('click', emptyCart);
    }
    
    // Botón finalizar compra (si existe)
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
        btnCheckout.removeEventListener('click', checkout);
        btnCheckout.addEventListener('click', checkout);
    }
    
    // Suscripción al newsletter (si existe en index.html)
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = subscribeForm.querySelector('input[type="email"]').value;
            if (email) {
                showNotification(`¡Gracias por suscribirte! Enviaremos ofertas a ${email}`);
                subscribeForm.reset();
            }
        });
    }
    
    // Formulario de contacto (si existe)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const message = document.getElementById('message')?.value || '';
            
            if (name && email && message) {
                showNotification(`¡Gracias ${name}! Tu mensaje ha sido enviado.`);
                contactForm.reset();
            } else {
                showNotification('Por favor, completa todos los campos.');
            }
        });
    }
});