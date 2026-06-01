// ========== CARRITO DE COMPRAS ==========

// Función para obtener el carrito actual
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// Función para guardar carrito en localStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Función para actualizar el contador del carrito
function updateCartCount() {
  const cart = getCart();
  const cartCountElements = document.querySelectorAll("#cart-count");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountElements.forEach((el) => {
    if (el) el.textContent = totalItems;
  });
}

// Función para mostrar notificación
function showNotification(message) {
  let notification = document.getElementById("notification");

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.className = "notification";
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

// Función para añadir producto al carrito
function addToCart(producto) {
  const stock = Number(producto.stock) || 0;

  if (stock <= 0) {
    showNotification(
      `✕ ${producto.name || producto.nombre} no tiene stock disponible`,
    );
    return;
  }

  let cart = getCart();

  console.log("Añadiendo al carrito:", producto);

  const existingProduct = cart.find((item) => item.id === producto.id);

  if (existingProduct) {
    if (existingProduct.quantity >= stock) {
      showNotification(
        `✕ No hay más stock disponible de ${producto.name || producto.nombre}`,
      );
      return;
    }

    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: producto.id,
      name: producto.name || producto.nombre,
      price: producto.price || producto.precio,
      image:
        producto.image ||
        `/img/${(producto.name || producto.nombre).replace(/\s/g, "")}.png`,
      stock: stock,
      quantity: 1,
    });
  }

  saveCart(cart);
  showNotification(`✓ ${producto.name || producto.nombre} añadido al carrito`);

  if (
    typeof renderCart === "function" &&
    document.getElementById("cart-items")
  ) {
    renderCart();
  }
}

// Función para manejar el click de añadir al carrito
function handleAddToCart(event) {
  let button = event.target;

  if (!button.classList.contains("btn-add")) {
    button = button.closest(".btn-add");
  }

  if (!button) return;

  if (button.disabled || button.classList.contains("disabled")) {
    showNotification("✕ Producto sin stock disponible");
    return;
  }

  const id = parseInt(button.getAttribute("data-id"));
  const name = button.getAttribute("data-name");
  const price = parseFloat(button.getAttribute("data-price"));
  const image = button.getAttribute("data-image");
  const stock = parseInt(button.getAttribute("data-stock"));

  console.log(
    "Botón clickeado - ID:",
    id,
    "Nombre:",
    name,
    "Precio:",
    price,
    "Stock:",
    stock,
  );

  if (id && name && !isNaN(price)) {
    addToCart({ id, name, price, image, stock });
  } else {
    console.error("Faltan datos en el botón:", button);
  }
}

// Función para asignar eventos a todos los botones de añadir al carrito
function bindAddToCartButtons() {
  const allButtons = document.querySelectorAll(".btn-add");
  console.log(
    `🔘 Asignando eventos a ${allButtons.length} botones "Añadir al carrito"`,
  );

  allButtons.forEach((btn) => {
    btn.removeEventListener("click", handleAddToCart);
    btn.addEventListener("click", handleAddToCart);
  });
}

// ========== FILTRADO DE PRODUCTOS ==========
let allProducts = []; // Guardar todos los productos
let currentCategory = "all"; // Categoría actual seleccionada

// Función para filtrar productos por categoría
function filterProductsByCategory(products, category) {
  if (category === "all") {
    return products;
  }
  return products.filter((product) => {
    const productCategory = product.categoria || product.category;
    return productCategory === category;
  });
}

// Función para mostrar productos filtrados
function displayFilteredProducts(products) {
  const productsList = document.getElementById("products-list");
  if (!productsList) return;

  const filteredProducts = filterProductsByCategory(products, currentCategory);

  if (filteredProducts.length === 0) {
    productsList.innerHTML =
      '<p class="empty-message" style="text-align: center; padding: 40px;">No hay productos en esta categoría</p>';
    return;
  }

  productsList.innerHTML = "";

  filteredProducts.forEach((product) => {
    // Manejar diferentes nombres de propiedades
    const nombre = product.name || product.nombre || "Producto sin nombre";
    const precio = product.price || product.precio || 0;
    const imagen =
      product.image ||
      product.imagen ||
      "https://via.placeholder.com/300x200?text=Imagen+no+disponible";
    const rating = product.rating || 0;
    const reviews = product.reviews || 0;
    const stock = Number(product.stock) || 0;
    const sinStock = stock <= 0;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = "";

    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fa-solid fa-star"></i>';
    }
    if (hasHalfStar) {
      starsHTML += '<i class="fa-regular fa-star-half-stroke"></i>';
    }
    for (let i = 0; i < 5 - Math.ceil(rating); i++) {
      starsHTML += '<i class="fa-regular fa-star"></i>';
    }

    const productCard = document.createElement("div");
    productCard.className = `product-card ${sinStock ? "product-card-out-stock" : ""}`;
    productCard.innerHTML = `
            <div class="product-image">
                <img src="${imagen}" alt="${nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
            </div>
            <h3>${nombre}</h3>
            <div class="rating">
                ${starsHTML}
                <span>(${reviews})</span>
            </div>
            <p class="price">$${precio.toLocaleString("es-AR")}</p>

            <div class="stock-info">
                ${
                  sinStock
                    ? '<span class="stock-badge sin-stock">Sin stock disponible</span>'
                    : `<span class="stock-badge con-stock">Disponibles: ${stock}</span>`
                }
            </div>

            <button 
                class="btn-add ${sinStock ? "disabled" : ""}" 
                data-id="${product.id}" 
                data-name="${nombre}" 
                data-price="${precio}"
                data-image="${imagen}"
                data-stock="${stock}"
                ${sinStock ? "disabled" : ""}
            >
    <i class="fa-solid fa-cart-plus"></i> 
    ${sinStock ? "Agotado" : "Añadir al carrito"}
</button>
        `;

    productsList.appendChild(productCard);
  });

  // Reasignar eventos a los botones después de filtrar
  bindAddToCartButtons();
}

// Función para inicializar los filtros
function initFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (filterButtons.length === 0) return;

  filterButtons.forEach((btn) => {
    btn.removeEventListener("click", handleFilterClick);
    btn.addEventListener("click", handleFilterClick);
  });
}

// Manejador del click en filtros
function handleFilterClick(event) {
  const button = event.currentTarget;
  const category = button.getAttribute("data-category");

  // Actualizar clase activa
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  button.classList.add("active");

  // Actualizar categoría actual y mostrar productos filtrados
  currentCategory = category;
  displayFilteredProducts(allProducts);
}

// ========== CARGAR PRODUCTOS EN LA PÁGINA productos.html ==========
// async function loadProductsPage() {
//     const productsList = document.getElementById('products-list');

//     if (!productsList) {
//         console.log("No estamos en la página de productos");
//         return;
//     }

//     console.log("Cargando productos desde la API...");

//     try {
//         const response = await fetch('/api/productos');

//         if (!response.ok) {
//             throw new Error(`Error HTTP: ${response.status}`);
//         }

//         const products = await response.json();
//         console.log(`✅ ${products.length} productos recibidos`);

//         if (products.length === 0) {
//             productsList.innerHTML = '<p class="empty-message">No hay productos disponibles</p>';
//             return;
//         }

//         productsList.innerHTML = '';

//         products.forEach(product => {
//             const fullStars = Math.floor(product.rating);
//             const hasHalfStar = product.rating % 1 !== 0;
//             let starsHTML = '';

//             for (let i = 0; i < fullStars; i++) {
//                 starsHTML += '<i class="fa-solid fa-star"></i>';
//             }
//             if (hasHalfStar) {
//                 starsHTML += '<i class="fa-regular fa-star-half-stroke"></i>';
//             }
//             for (let i = 0; i < 5 - Math.ceil(product.rating); i++) {
//                 starsHTML += '<i class="fa-regular fa-star"></i>';
//             }

//             const productCard = document.createElement('div');
//             productCard.className = 'product-card';
//             productCard.innerHTML = `
//                 <div class="product-image">
//                     <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
//                 </div>
//                 <h3>${product.name}</h3>
//                 <div class="rating">
//                     ${starsHTML}
//                     <span>(${product.reviews})</span>
//                 </div>
//                 <p class="price">$${product.price.toLocaleString('es-AR')}</p>
//                 <button class="btn-add" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
//                     <i class="fa-solid fa-cart-plus"></i> Añadir al carrito
//                 </button>
//             `;

//             productsList.appendChild(productCard);
//         });

//         bindAddToCartButtons();

//         console.log("✅ Productos mostrados correctamente");

//     } catch (error) {
//         console.error("❌ Error cargando productos:", error);
//         productsList.innerHTML = `<p class="error-message" style="color:red; text-align:center;">Error: ${error.message}</p>`;
//     }
// }

async function loadProductsPage() {
  const productsList = document.getElementById("products-list");

  if (!productsList) {
    console.log("No estamos en la página de productos");
    return;
  }

  console.log("Cargando productos desde la API...");

  try {
    const response = await fetch("/api/productos");

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const products = await response.json();
    console.log(`✅ ${products.length} productos recibidos`);

    // Ver el primer producto para debugging
    if (products.length > 0) {
      console.log("Primer producto:", products[0]);
    }

    // Guardar todos los productos
    allProducts = products;

    if (products.length === 0) {
      productsList.innerHTML =
        '<p class="empty-message">No hay productos disponibles</p>';
      return;
    }

    // Inicializar filtros
    initFilters();

    // Mostrar productos (todos inicialmente)
    displayFilteredProducts(products);

    console.log("✅ Productos mostrados correctamente con filtros");
  } catch (error) {
    console.error("❌ Error cargando productos:", error);
    productsList.innerHTML = `<p class="error-message" style="color:red; text-align:center;">Error: ${error.message}</p>`;
  }
}

// ========== FUNCIONES PARA CART.HTML ==========
function renderCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalSpan = document.getElementById("cart-total");

  if (!cartItemsContainer) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart" style="text-align: center; padding: 40px;">Tu carrito está vacío</p>';
    if (cartTotalSpan) cartTotalSpan.textContent = "$0";
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = "";

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
            <img src="..${item.image}" alt="${item.name}" onerror="this.src='../img/placeholder.png'">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p class="item-unit-price">Precio unitario: $${item.price.toLocaleString("es-AR")}</p>
            </div>
            <div class="item-controls">
                <div class="quantity-controls">
                    <button class="btn-qty" data-index="${index}" data-change="-1">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="btn-qty" data-index="${index}" data-change="1">+</button>
                </div>
                <p class="item-subtotal">$${subtotal.toLocaleString("es-AR")}</p>
            </div>
            <button class="btn-remove" data-index="${index}">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
    cartItemsContainer.appendChild(itemElement);
  });

  if (cartTotalSpan) {
    cartTotalSpan.textContent = `$${total.toLocaleString("es-AR")}`;
  }

  document.querySelectorAll(".btn-qty").forEach((btn) => {
    btn.removeEventListener("click", handleQuantityChange);
    btn.addEventListener("click", handleQuantityChange);
  });

  document.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.removeEventListener("click", handleRemoveItem);
    btn.addEventListener("click", handleRemoveItem);
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
  let cart = getCart();
  if (cart[index]) {
    const newQuantity = cart[index].quantity + change;
    if (newQuantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = newQuantity;
    }
    saveCart(cart);
    renderCart();
  }
}

function removeFromCart(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function emptyCart() {
  if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
    saveCart([]);
    renderCart();
    showNotification("Carrito vaciado");
  }
}

// Versión mejorada de checkout con soporte para cupón
async function checkout(codigoCupon = null) {
  const cart = getCart();

  if (cart.length === 0) {
    showNotification("Tu carrito está vacío");
    return;
  }

  let totalFinal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (codigoCupon) {
    const resultado = await aplicarCupon(codigoCupon, totalFinal);
    if (resultado.monto_final) {
      totalFinal = resultado.monto_final;
      showNotification(
        `¡Cupón aplicado! Ahorraste $${resultado.ahorro.toLocaleString("es-AR")}`,
      );
    } else {
      showNotification(resultado.mensaje || "Cupón no válido");
    }
  }

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carrito: cart,
        total: totalFinal,
        cupon_aplicado: codigoCupon || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    alert(
      `¡Gracias por tu compra! Total: $${totalFinal.toLocaleString("es-AR")}\n${result.mensaje || ""}`,
    );

    saveCart([]);
    renderCart();

    window.location.href = "../index.html";
  } catch (error) {
    console.error("Error al finalizar la compra:", error);
    showNotification("Ocurrió un error al finalizar la compra");
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
    const response = await fetch(
      `/api/cupones/aplicar/${codigo}?monto=${monto}`,
    );
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
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const resultado = await aplicarCupon(codigoCupon, total);

  if (resultado.monto_final) {
    showNotification(
      `¡Cupón aplicado! Ahorraste $${resultado.ahorro.toLocaleString("es-AR")}`,
    );
    return resultado.monto_final;
  } else {
    showNotification(resultado.mensaje || "Cupón no válido");
    return total;
  }
}

// ========== MENÚ HAMBURGUESA ==========
function initHamburgerMenu() {
  const hamburger = document.getElementById("hamburger-menu");
  const navMenu = document.getElementById("nav-menu");

  console.log("Inicializando menú hamburguesa...");
  console.log("hamburger:", hamburger);
  console.log("navMenu:", navMenu);

  if (!hamburger || !navMenu) {
    console.error("No se encontraron los elementos del menú hamburguesa");
    return;
  }

  // Crear overlay (fondo oscuro)
  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  document.body.appendChild(overlay);

  // Función para abrir el menú
  function openMenu() {
    hamburger.classList.add("active");
    navMenu.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Función para cerrar el menú
  function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Toggle del menú
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (navMenu.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Cerrar menú al hacer clic en el overlay
  overlay.addEventListener("click", closeMenu);

  // Cerrar menú al hacer clic en un enlace
  const navLinks = navMenu.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Cerrar menú al redimensionar la ventana
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && navMenu.classList.contains("active")) {
      closeMenu();
    }
  });

  console.log("✅ Menú hamburguesa inicializado correctamente");
}

// ========== CARGAR PRODUCTOS DESTACADOS EN INDEX.HTML ==========
async function loadFeaturedProducts() {
  const featuredProducts = document.getElementById("featured-products");

  if (!featuredProducts) {
    return;
  }

  console.log("Cargando productos destacados desde la API...");

  try {
    const response = await fetch("/api/productos");

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const products = await response.json();

    featuredProducts.innerHTML = "";

    const destacados = products.slice(0, 4);

    destacados.forEach((product) => {
      const stock = Number(product.stock) || 0;
      const sinStock = stock === 0;

      const nombre = product.name || product.nombre;
      const precio = product.price || product.precio;
      const imagen = product.image || product.imagen;
      const rating = Number(product.rating) || 4;
      const reviews = product.reviews || 0;

      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      let starsHTML = "";

      for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fa-solid fa-star"></i>';
      }

      if (hasHalfStar) {
        starsHTML += '<i class="fa-regular fa-star-half-stroke"></i>';
      }

      for (let i = 0; i < 5 - Math.ceil(rating); i++) {
        starsHTML += '<i class="fa-regular fa-star"></i>';
      }

      const productCard = document.createElement("div");
      productCard.className = `product-card ${sinStock ? "opacity-75" : ""}`;

      productCard.innerHTML = `
                <div class="product-image">
                    <img src="${imagen}" alt="${nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
                </div>

                <h3>${nombre}</h3>

                <div class="rating">
                    ${starsHTML}
                    <span>(${reviews})</span>
                </div>

                <p class="price">$${Number(precio).toLocaleString("es-AR")}</p>

                <div class="stock-info">
                    ${
                      sinStock
                        ? '<span class="stock-badge sin-stock">Sin stock disponible</span>'
                        : `<span class="stock-badge con-stock">Disponibles: ${stock}</span>`
                    }
                </div>

                <button 
                    class="btn-add ${sinStock ? "disabled" : ""}" 
                    data-id="${product.id}" 
                    data-name="${nombre}" 
                    data-price="${precio}"
                    data-image="${imagen}"
                    data-stock="${stock}"
                    ${sinStock ? "disabled" : ""}
                >
                    <i class="fa-solid fa-cart-plus"></i> 
                    ${sinStock ? "Agotado" : "Añadir al carrito"}
                </button>
            `;

      featuredProducts.appendChild(productCard);
    });

    bindAddToCartButtons();

    console.log("✅ Productos destacados cargados correctamente");
  } catch (error) {
    console.error("❌ Error cargando productos destacados:", error);

    featuredProducts.innerHTML = `
            <p class="error-message" style="color:red; text-align:center;">
                Error al conectar con la base de datos de productos. Asegurate de tener el backend encendido.
            </p>
        `;
  }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado - Inicializando...");

  // Inicializar menú hamburguesa
  initHamburgerMenu();

  // Actualizar contador del carrito
  updateCartCount();

  // Cargar productos si estamos en la página de productos
  loadProductsPage();

  // Renderizar carrito si estamos en la página del carrito
  if (document.getElementById("cart-items")) {
    renderCart();
  }

  // Asignar eventos a botones
  bindAddToCartButtons();

  // Botón vaciar carrito
  const btnEmpty = document.getElementById("btn-empty");
  if (btnEmpty) {
    btnEmpty.removeEventListener("click", emptyCart);
    btnEmpty.addEventListener("click", emptyCart);
  }

  // Botón checkout
  const btnCheckout = document.getElementById("btn-checkout");
  if (btnCheckout) {
    btnCheckout.removeEventListener("click", checkout);
    btnCheckout.addEventListener("click", () => {
      checkout(window.cuponAplicado || null);
    });
  }

  // Formulario de suscripción
  const subscribeForm = document.getElementById("subscribe-form");
  if (subscribeForm) {
    subscribeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = subscribeForm.querySelector('input[type="email"]').value;
      if (email) {
        showNotification(
          `¡Gracias por suscribirte! Enviaremos ofertas a ${email}`,
        );
        subscribeForm.reset();
      }
    });
  }

  // Formulario de contacto
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name")?.value || "";
      const email = document.getElementById("email")?.value || "";
      const message = document.getElementById("message")?.value || "";

      if (name && email && message) {
        showNotification(`¡Gracias ${name}! Tu mensaje ha sido enviado.`);
        contactForm.reset();
      } else {
        showNotification("Por favor, completa todos los campos.");
      }
    });
  }

  // Botón aplicar cupón
  const btnApplyCoupon = document.getElementById("btn-apply-coupon");
  if (btnApplyCoupon) {
    btnApplyCoupon.addEventListener("click", async () => {
      const couponInput = document.getElementById("coupon-code");
      const codigo = couponInput.value.trim();

      if (!codigo) {
        showNotification("Ingresa un código de cupón");
        return;
      }

      const cart = getCart();
      const totalActual = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      if (totalActual === 0) {
        showNotification("El carrito está vacío");
        return;
      }

      const resultado = await aplicarCupon(codigo, totalActual);

      const messageEl = document.getElementById("coupon-message");
      if (messageEl) {
        if (resultado.monto_final !== undefined) {
          messageEl.style.color = "green";
          messageEl.textContent = `¡Cupón aplicado! Ahorraste $${resultado.ahorro.toLocaleString("es-AR")}`;

          const cartTotalSpan = document.getElementById("cart-total");
          if (cartTotalSpan) {
            cartTotalSpan.innerHTML = `
                            <span style="text-decoration: line-through; font-size: 0.8em; color: gray; margin-right: 8px;">
                                $${totalActual.toLocaleString("es-AR")}
                            </span>
                            $${resultado.monto_final.toLocaleString("es-AR")} 
                            <small style="color: green; font-weight: bold;">(${resultado.descuento}% OFF)</small>
                        `;
          }
          window.cuponAplicado = codigo;
        } else {
          messageEl.style.color = "red";
          messageEl.textContent = resultado.mensaje || "Cupón no válido";

          const cartTotalSpan = document.getElementById("cart-total");
          if (cartTotalSpan && !resultado.monto_final) {
            const cart = getCart();
            const total = cart.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            );
            cartTotalSpan.textContent = `$${total.toLocaleString("es-AR")}`;
          }
          window.cuponAplicado = null;
        }
      }
    });
  }
});

// Cargar productos destacados en el index
loadFeaturedProducts();
