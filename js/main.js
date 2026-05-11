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
        1: "/img/Freidora.png",
        2: "/img/Smartwatch.png",
        3: "/img/JBL.png",
        4: "/img/Auriculares Sony WH-1000XM5.png",
        5: "/img/24'' UHD (3840x2160) 4K IPS LED.png",
        6: "/img/Teclado Mecánico RGB.png",
        7: "/img/Notebook Cx Cx40082.jpeg",
        8: "/img/Notebook Bangho Bes Pro T5 R5.jpeg"
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

// Función para añadir producto al carrito
function addToCart(product) {
    console.log("Añadiendo al carrito:", product);
    
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
    
    if (typeof renderCart === 'function') {
        renderCart();
    }
}

// Función para manejar el click de añadir al carrito
function handleAddToCart(event) {
    let button = event.target;
    
    if (!button.classList.contains('btn-add')) {
        button = button.closest('.btn-add');
    }
    
    if (!button) return;
    
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

// Función para asignar eventos a todos los botones de añadir al carrito
function bindAddToCartButtons() {
    const allButtons = document.querySelectorAll('.btn-add');
    console.log(`🔘 Asignando eventos a ${allButtons.length} botones "Añadir al carrito"`);
    
    allButtons.forEach(btn => {
        btn.removeEventListener('click', handleAddToCart);
        btn.addEventListener('click', handleAddToCart);
    });
}

// ========== CARGAR PRODUCTOS EN LA PÁGINA productos.html ==========
async function loadProductsPage() {
    const productsList = document.getElementById('products-list');
    
    if (!productsList) {
        console.error("ERROR: No se encontró el elemento con id 'products-list'");
        return;
    }

    console.log("Cargando productos desde la API...");

    try {
        const response = await fetch('/api/productos');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const products = await response.json();
        console.log(`✅ ${products.length} productos recibidos`);

        if (products.length === 0) {
            productsList.innerHTML = '<p class="empty-message">No hay productos disponibles</p>';
            return;
        }

        productsList.innerHTML = '';

        products.forEach(product => {
            const fullStars = Math.floor(product.rating);
            const hasHalfStar = product.rating % 1 !== 0;
            let starsHTML = '';
            
            for (let i = 0; i < fullStars; i++) {
                starsHTML += '<i class="fa-solid fa-star"></i>';
            }
            if (hasHalfStar) {
                starsHTML += '<i class="fa-regular fa-star-half-stroke"></i>';
            }
            for (let i = 0; i < 5 - Math.ceil(product.rating); i++) {
                starsHTML += '<i class="fa-regular fa-star"></i>';
            }
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
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
            `;
            
            productsList.appendChild(productCard);
        });
        
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', handleAddToCart);
        });
        
        console.log("✅ Productos mostrados correctamente");
        
    } catch (error) {
        console.error("❌ Error cargando productos:", error);
        productsList.innerHTML = `<p class="error-message" style="color:red; text-align:center;">Error: ${error.message}</p>`;
    }
}

// ========== FUNCIONES PARA CART.HTML ==========
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart" style="text-align: center; padding: 40px;">Tu carrito está vacío</p>';
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
    
    document.querySelectorAll('.btn-qty').forEach(btn => {
        btn.removeEventListener('click', handleQuantityChange);
        btn.addEventListener('click', handleQuantityChange);
    });
    
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

// Versión mejorada de checkout con soporte para cupón
async function checkout(codigoCupon = null) {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }

    let totalFinal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (codigoCupon) {
        const resultado = await aplicarCupon(codigoCupon, totalFinal);
        if (resultado.monto_final) {
            totalFinal = resultado.monto_final;
            showNotification(`¡Cupón aplicado! Ahorraste $${resultado.ahorro.toLocaleString('es-AR')}`);
        } else {
            showNotification(resultado.mensaje || "Cupón no válido");
        }
    }

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                carrito: cart,
                total: totalFinal,
                cupon_aplicado: codigoCupon || null
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();

        alert(`¡Gracias por tu compra! Total: $${totalFinal.toLocaleString('es-AR')}\n${result.mensaje || ''}`);

        cart = [];
        saveCart();
        renderCart();

        window.location.href = '../index.html';

    } catch (error) {
        console.error('Error al finalizar la compra:', error);
        showNotification('Ocurrió un error al finalizar la compra');
    }
}

// Validar un cupón
async function validarCupon(codigo) {
    try {
        const response = await fetch(`/api/cupones/validar/${codigo}`);
        const data = await response.json();
        console.log("Validación de cupón:", data);
        return data;
    } catch (error) {
        console.error("Error al validar cupón:", error);
        return { valido: false, mensaje: "Error al validar cupón" };
    }
}

// Aplicar descuento
async function aplicarCupon(codigo, monto) {
    try {
        const response = await fetch(`/api/cupones/aplicar/${codigo}?monto=${monto}`);
        const data = await response.json();
        console.log("Cupón aplicado:", data);
        return data;
    } catch (error) {
        console.error("Error al aplicar cupón:", error);
        return { mensaje: "Error al aplicar cupón" };
    }
}

// Función para integrar cupón en el checkout
async function aplicarCuponAlCarrito(codigoCupon) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const resultado = await aplicarCupon(codigoCupon, total);
    
    if (resultado.monto_final) {
        showNotification(`¡Cupón aplicado! Ahorraste $${resultado.ahorro.toLocaleString('es-AR')}`);
        return resultado.monto_final;
    } else {
        showNotification(resultado.mensaje || "Cupón no válido");
        return total;
    }
}

// ========== MENÚ HAMBURGUESA ==========
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    
    console.log("Inicializando menú hamburguesa...");
    console.log("hamburger:", hamburger);
    console.log("navMenu:", navMenu);
    
    if (!hamburger || !navMenu) {
        console.error("No se encontraron los elementos del menú hamburguesa");
        return;
    }
    
    // Crear overlay (fondo oscuro)
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
    
    // Función para abrir el menú
    function openMenu() {
        hamburger.classList.add('active');
        navMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Función para cerrar el menú
    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Toggle del menú
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    // Cerrar menú al hacer clic en el overlay
    overlay.addEventListener('click', closeMenu);
    
    // Cerrar menú al hacer clic en un enlace
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Cerrar menú al redimensionar la ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    console.log("✅ Menú hamburguesa inicializado correctamente");
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado - Inicializando...");
    
    // Inicializar menú hamburguesa (PRIMERO)
    initHamburgerMenu();
    
    updateCartCount();
    loadProductsPage();
    renderCart();
    bindAddToCartButtons();
    
    const btnEmpty = document.getElementById('btn-empty');
    if (btnEmpty) {
        btnEmpty.removeEventListener('click', emptyCart);
        btnEmpty.addEventListener('click', emptyCart);
    }
    
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
        btnCheckout.removeEventListener('click', checkout);
        btnCheckout.addEventListener('click', () => {
            checkout(window.cuponAplicado || null);
        });
    }
    
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

    const btnApplyCoupon = document.getElementById('btn-apply-coupon');
    if (btnApplyCoupon) {
        btnApplyCoupon.addEventListener('click', async () => {
            const couponInput = document.getElementById('coupon-code');
            const codigo = couponInput.value;
            
            if (!codigo) {
                showNotification('Ingresa un código de cupón');
                return;
            }
            
            const totalActual = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const resultado = await aplicarCupon(parseInt(codigo), totalActual);
            
            const messageEl = document.getElementById('coupon-message');
            if (resultado.monto_final) {
                messageEl.style.color = 'green';
                messageEl.textContent = `¡Cupón aplicado! Ahorraste $${resultado.ahorro.toLocaleString('es-AR')}`;
                const cartTotalSpan = document.getElementById('cart-total');
                if (cartTotalSpan) {
                    cartTotalSpan.textContent = `$${resultado.monto_final.toLocaleString('es-AR')}`;
                }
                window.cuponAplicado = parseInt(codigo);
            } else {
                messageEl.style.color = 'red';
                messageEl.textContent = resultado.mensaje || 'Cupón no válido';
            }
        });
    }
});