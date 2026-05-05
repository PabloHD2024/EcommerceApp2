const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

function renderCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-msg">Tu carrito está vacío</div>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p class="item-unit-price">$${item.price.toFixed(2)} c/u</p>
                </div>
                <div class="item-controls">
                    <div class="quantity-selector">
                        <button class="qty-btn" data-index="${index}" data-delta="-1">-</button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" data-index="${index}">
                        <button class="qty-btn" data-index="${index}" data-delta="1">+</button>
                    </div>
                    <p class="item-subtotal" id="subtotal-${index}">$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="btn-remove" data-index="${index}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(div);
        });

        // Listeners para botones +/-
        cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const delta = parseInt(btn.dataset.delta);
                changeQty(index, delta);
            });
        });

        // Listener para edición manual del input
        cartItemsContainer.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', () => {
                const index = parseInt(input.dataset.index);
                let newQty = parseInt(input.value);

                if (isNaN(newQty) || newQty < 1) {
                    newQty = 1;
                    input.value = 1;
                }

                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                if (cart[index]) {
                    cart[index].quantity = newQty;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateSubtotal(index, cart[index].price, newQty);
                    updateTotal();
                    updateCartCount();
                }
            });
        });

        // Listeners para botones de eliminar
        cartItemsContainer.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                removeItem(index);
            });
        });
    }

    cartTotalElement.innerText = `$${total.toFixed(2)}`;
}

// Actualiza solo el subtotal de un item sin re-renderizar todo
function updateSubtotal(index, price, quantity) {
    const subtotalEl = document.getElementById(`subtotal-${index}`);
    if (subtotalEl) {
        subtotalEl.innerText = `$${(price * quantity).toFixed(2)}`;
    }
}

// Recalcula y actualiza el total general
function updateTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (cartTotalElement) {
        cartTotalElement.innerText = `$${total.toFixed(2)}`;
    }
}

// Cambia la cantidad con los botones +/-
window.changeQty = function(index, delta) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart[index]) {
        cart[index].quantity += delta;

        if (cart[index].quantity < 1) {
            removeItem(index);
            return;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }
};

window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
};

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateCartCount();

    // Botón vaciar carrito
    const btnEmpty = document.getElementById('btn-empty');
    if (btnEmpty) {
        btnEmpty.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que querés vaciar el carrito?')) {
                localStorage.removeItem('cart');
                renderCart();
                updateCartCount();
            }
        });
    }
});
