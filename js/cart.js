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

// Función para añadir producto al carrito
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image || getProductImage(product.id)
        });
    }

    saveCart();
    showNotification(`${product.name} añadido al carrito`);
    renderCart(); // Si estamos en la página del carrito, lo renderiza
}

// Función para obtener imagen del producto según ID
function getProductImage(id) {
    const images = {
        1: "../img/Freidora.png",
        2: "../img/Smartwatch.png",
        3: "../img/JBL.png"
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

// Función para renderizar el carrito (para cart.html)
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
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

    // Agregar eventos a los botones
    document.querySelectorAll('.btn-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            const change = parseInt(btn.dataset.change);
            updateQuantity(index, change);
        });
    });

    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            removeFromCart(index);
        });
    });
}

// Actualizar cantidad
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

// Eliminar del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

// Vaciar carrito completo
function emptyCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        saveCart();
        renderCart();
        showNotification('Carrito vaciado');
    }
}

// Finalizar compra
function checkout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }
    alert('¡Gracias por tu compra! Pronto recibirás tu pedido.');
    cart = [];
    saveCart();
    renderCart();
    window.location.href = './index.html';
}

// Inicializar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();

    // Botón vaciar carrito
    const btnEmpty = document.getElementById('btn-empty');
    if (btnEmpty) {
        btnEmpty.addEventListener('click', emptyCart);
    }

    // Botón finalizar compra
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', checkout);
    }
});