// ========== CARGAR PRODUCTOS EN LA PÁGINA productos.html ==========
function loadProductsPage() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return; // No estamos en la página de productos

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
                    <img src="${product.image}" alt="${product.name}">
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

    // Re-asignar eventos a los botones de añadir al carrito
    const btnsAdd = document.querySelectorAll('.btn-add');
    btnsAdd.forEach(btn => {
        btn.removeEventListener('click', handleAddToCart);
        btn.addEventListener('click', handleAddToCart);
    });
}

// Función para manejar el click de añadir al carrito
function handleAddToCart(e) {
    const button = e.currentTarget;
    const id = parseInt(button.getAttribute('data-id'));
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));

    addToCart({ id, name, price });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    loadProductsPage();
});