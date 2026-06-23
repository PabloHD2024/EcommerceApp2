// ========== VARIABLES GLOBALES ==========
let allProducts = [];
let currentCategory = 'all';
let currentProductsPage = 1;
let productsPagination = null;
const PRODUCTS_PAGE_LIMIT = 9;
let descuentoActivo = 0;

// ========== FUNCIONES DE UTILIDAD ==========
function showNotification(message, tipo = 'success') {
  let notification = document.getElementById('notification');

  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);
  }

  notification.className = 'notification';
  notification.classList.add(
    tipo === 'error' ? 'notif-error' : 'notif-success',
  );
  notification.textContent = message;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('#cart-count').forEach((el) => {
    if (el) el.textContent = totalItems;
  });
}

// ========== FUNCIONES DEL CARRITO ==========
function addToCart(producto) {
  const stock = Number(producto.stock) || 0;

  if (stock <= 0) {
    showNotification(`✕ ${producto.name} no tiene stock`, 'error');
    return;
  }

  let cart = getCart();
  const existingProduct = cart.find((item) => item.id === producto.id);

  if (existingProduct) {
    if (existingProduct.quantity >= stock) {
      showNotification(`✕ No hay más stock de ${producto.name}`, 'error');
      return;
    }
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: producto.id,
      name: producto.name,
      price: producto.price,
      image: producto.image || '../img/placeholder.png',
      stock: stock,
      quantity: 1,
    });
  }

  saveCart(cart);
  showNotification(`✓ ${producto.name} añadido al carrito`);

  if (document.getElementById('cart-items')) {
    renderCart();
  }
}

function handleAddToCart(event) {
  const button = event.target.closest('.btn-add');
  if (!button) return;

  if (button.disabled) {
    showNotification('Producto sin stock', 'error');
    return;
  }

  const producto = {
    id: parseInt(button.dataset.id),
    name: button.dataset.name,
    price: parseFloat(button.dataset.price),
    image: button.dataset.image,
    stock: parseInt(button.dataset.stock),
  };

  if (producto.id && producto.name) {
    addToCart(producto);
  }
}

function bindAddToCartButtons() {
  document.querySelectorAll('.btn-add').forEach((btn) => {
    btn.removeEventListener('click', handleAddToCart);
    btn.addEventListener('click', handleAddToCart);
  });
}

// ========== FUNCIONES DE PRODUCTOS ==========
function normalizeProductsResponse(payload) {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      metadata: {
        totalItems: payload.length,
        totalPages: 1,
        currentPage: 1,
        limit: payload.length,
        currentItems: payload.length,
        fromItem: payload.length ? 1 : 0,
        toItem: payload.length,
        hasPreviousPage: false,
        hasNextPage: false,
        previousPage: null,
        nextPage: null,
      },
    };
  }

  return {
    data: payload?.items || payload?.data || [],
    metadata: payload?.pagination || payload?.metadata || {},
  };
}

function displayFilteredProducts(products) {
  const productsList = document.getElementById('products-list');
  if (!productsList) return;

  const filtered =
    currentCategory === 'all'
      ? products
      : products.filter((p) => (p.categoria || p.category) === currentCategory);

  if (filtered.length === 0) {
    productsList.innerHTML =
      '<p class="empty-message">No hay productos en esta categoría</p>';
    return;
  }

  productsList.innerHTML = '';

  filtered.forEach((product) => {
    const nombre = product.name || product.nombre;
    const precio = product.price || product.precio;
    const imagen = product.image || product.imagen || '../img/placeholder.png';
    const stock = Number(product.stock) || 0;
    const sinStock = stock <= 0;
    const rating = Number(product.rating) || 4;
    const reviews = product.reviews || 0;

    // Generar estrellas
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starsHTML += '<i class="fa-solid fa-star"></i>';
      } else if (i - 0.5 <= rating) {
        starsHTML += '<i class="fa-solid fa-star-half-alt"></i>';
      } else {
        starsHTML += '<i class="fa-regular fa-star"></i>';
      }
    }

    const card = document.createElement('div');
    card.className = `product-card ${sinStock ? 'out-of-stock' : ''}`;
    card.innerHTML = `
      <div class="product-image">
        <img src="${imagen}" alt="${nombre}" onerror="this.src='../img/placeholder.png'">
      </div>
      <h3>${nombre}</h3>
      <div class="rating">${starsHTML} <span>(${reviews})</span></div>
      <p class="price">$${precio.toLocaleString('es-AR')}</p>
      <div class="stock-info">
        ${sinStock ? '<span class="sin-stock">Sin stock</span>' : `<span class="con-stock">Stock: ${stock}</span>`}
      </div>
      <button class="btn-add" data-id="${product.id}" data-name="${nombre}" 
              data-price="${precio}" data-image="${imagen}" data-stock="${stock}" ${sinStock ? 'disabled' : ''}>
        <i class="fa-solid fa-cart-plus"></i> ${sinStock ? 'Agotado' : 'Añadir'}
      </button>
    `;
    productsList.appendChild(card);
  });

  bindAddToCartButtons();
}

function renderProductsPagination(metadata) {
  const productsList = document.getElementById('products-list');
  if (!productsList) return;

  let pagination = document.getElementById('products-pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.id = 'products-pagination';
    pagination.className = 'pagination-container';
    productsList.insertAdjacentElement('afterend', pagination);
  }

  const totalPages = Number(metadata?.totalPages) || 0;
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  const currentPage = Number(metadata.page || metadata.currentPage) || 1;
  const limit = Number(metadata.limit) || PRODUCTS_PAGE_LIMIT;
  const totalItems = Number(metadata.totalItems) || 0;
  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const toItem = Math.min(currentPage * limit, totalItems);

  pagination.innerHTML = `
    <button class="pagination-btn" data-page="${currentPage - 1}" ${metadata.hasPreviousPage ? '' : 'disabled'}>
      <i class="fa-solid fa-chevron-left"></i> Anterior
    </button>
    <span class="pagination-info">
      Página ${currentPage} de ${totalPages} · Mostrando ${fromItem}-${toItem} de ${totalItems}
    </span>
    <button class="pagination-btn" data-page="${currentPage + 1}" ${metadata.hasNextPage ? '' : 'disabled'}>
      Siguiente <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

  pagination.querySelectorAll('.pagination-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = Number(btn.dataset.page);
      if (page > 0) loadProductsPage(page);
    });
  });
}

function createCategoryFilterButton(label, category) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `filter-btn ${currentCategory === category ? 'active' : ''}`;
  button.dataset.category = category;
  button.textContent = label;
  return button;
}

function bindCategoryFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll('.filter-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      loadProductsPage(1);
    };
  });
}

async function loadProductCategories() {
  const filtersContainer = document.getElementById('category-filters');
  if (!filtersContainer) return;

  try {
    const response = await fetch('/api/categorias');
    if (!response.ok) throw new Error('Error al cargar categorías');

    const categorias = await response.json();
    filtersContainer.innerHTML = '';
    filtersContainer.appendChild(createCategoryFilterButton('Todos', 'all'));

    categorias.forEach((categoria) => {
      filtersContainer.appendChild(
        createCategoryFilterButton(categoria, categoria),
      );
    });
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }

  bindCategoryFilterButtons();
}

async function loadProductsPage(page = 1) {
  const productsList = document.getElementById('products-list');
  if (!productsList) return;

  try {
    currentProductsPage = Math.max(Number(page) || 1, 1);
    const params = new URLSearchParams({
      page: currentProductsPage,
      limit: PRODUCTS_PAGE_LIMIT,
    });

    if (currentCategory !== 'all') {
      params.set('categoria', currentCategory);
    }

    productsList.innerHTML = '<p>Cargando productos...</p>';
    const response = await fetch(`/api/productos?${params.toString()}`);

    if (!response.ok) throw new Error('Error al cargar productos');

    const payload = await response.json();
    const paginated = normalizeProductsResponse(payload);
    allProducts = paginated.data;
    productsPagination = paginated.metadata;

    if (allProducts.length === 0) {
      productsList.innerHTML = '<p>No hay productos disponibles</p>';
      renderProductsPagination(productsPagination);
      return;
    }
    bindCategoryFilterButtons();
    displayFilteredProducts(allProducts);
    renderProductsPagination(productsPagination);
  } catch (error) {
    console.error('Error:', error);
    productsList.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    renderProductsPagination(null);
  }
}

async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;

  try {
    const response = await fetch('/api/productos?page=1&limit=4');
    const payload = await response.json();
    const products = normalizeProductsResponse(payload).data;
    const destacados = products.slice(0, 4);

    container.innerHTML = '';
    destacados.forEach((product) => {
      const nombre = product.name || product.nombre;
      const precio = product.price || product.precio;
      const imagen = product.image || product.imagen || 'img/placeholder.png';
      const stock = Number(product.stock) || 0;

      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-image">
          <img src="${imagen}" alt="${nombre}" onerror="this.src='img/placeholder.png'">
        </div>
        <h3>${nombre}</h3>
        <p class="price">$${precio.toLocaleString('es-AR')}</p>
        <button class="btn-add" data-id="${product.id}" data-name="${nombre}" 
                data-price="${precio}" data-image="${imagen}" data-stock="${stock}" ${stock <= 0 ? 'disabled' : ''}>
          <i class="fa-solid fa-cart-plus"></i> ${stock <= 0 ? 'Agotado' : 'Comprar'}
        </button>
      `;
      container.appendChild(card);
    });
    bindAddToCartButtons();
  } catch (error) {
    console.error('Error cargando destacados:', error);
  }
}

// ========== FUNCIONES DEL CARRITO (render) ==========
function renderCart() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    document.getElementById('cart-total').textContent = '$0';
    return;
  }

  let total = 0;
  container.innerHTML = '';

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" onerror="this.src='../img/placeholder.png'">
      <div class="item-info">
        <h3>${item.name}</h3>
        <p>$${item.price.toLocaleString('es-AR')} c/u</p>
      </div>
      <div class="item-controls">
        <button class="btn-qty" data-index="${index}" data-change="-1">-</button>
        <span>${item.quantity}</span>
        <button class="btn-qty" data-index="${index}" data-change="1">+</button>
        <p class="item-subtotal">$${subtotal.toLocaleString('es-AR')}</p>
      </div>
      <button class="btn-remove" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(itemDiv);
  });

  document.getElementById('cart-total').textContent =
    `$${total.toLocaleString('es-AR')}`;

  // Eventos
  document.querySelectorAll('.btn-qty').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.dataset.index);
      const change = parseInt(btn.dataset.change);
      let cart = getCart();
      if (cart[idx]) {
        const newQty = cart[idx].quantity + change;
        if (newQty <= 0) cart.splice(idx, 1);
        else cart[idx].quantity = newQty;
        saveCart(cart);
        renderCart();
      }
    });
  });

  document.querySelectorAll('.btn-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      let cart = getCart();
      cart.splice(parseInt(btn.dataset.index), 1);
      saveCart(cart);
      renderCart();
    });
  });
}

function emptyCart() {
  if (confirm('¿Vaciar carrito?')) {
    saveCart([]);
    renderCart();
    showNotification('Carrito vaciado');
  }
}

async function checkout() {
  // NUEVO: Verificar si el usuario está logueado
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Debes iniciar sesión para finalizar la compra', 'error');
    alert('Por favor, inicia sesión para continuar con tu pago.');
    window.location.href = './login.html'; // Redirige a la pantalla de login
    return; // Frena la ejecución de la compra
  }

  const cart = getCart();
  if (cart.length === 0) {
    showNotification('Carrito vacío', 'error');
    return;
  }

  // Calcular total contemplando el descuento que hicimos en el punto anterior
  let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (descuentoActivo > 0) {
    total = total * (1 - descuentoActivo / 100);
  }

  try {
    // NUEVO: Enviamos el token en los headers para que el Backend también lo valide de forma segura
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ carrito: cart, total }),
    });

    if (!response.ok) throw new Error('Error en checkout');

    alert(`¡Compra realizada! Total: $${total.toLocaleString('es-AR')}`);
    descuentoActivo = 0; // Reseteamos el cupón
    saveCart([]);
    renderCart();
    window.location.href = '/index.html';
  } catch (error) {
    showNotification('Error al procesar compra', 'error');
  }
}

// ========== LOGIN Y REGISTRO ==========
function switchAuth(view) {
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');

  if (view === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  }
}

// Inicializar formularios de login/registro
function initAuthForms() {
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value;
      const password = document.getElementById('login-password')?.value;

      if (!email || !password) {
        showNotification('Completa todos los campos', 'error');
        return;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok)
          throw new Error(
            data.message || data.mensaje || 'Error al iniciar sesión',
          );

        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);

        showNotification('¡Bienvenido!');

        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = '/admin.html';
          } else {
            window.location.href = '/index.html';
          }
        }, 1000);
      } catch (error) {
        showNotification(error.message, 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name')?.value;
      const email = document.getElementById('reg-email')?.value;
      const password = document.getElementById('reg-password')?.value;
      const terms = document.getElementById('reg-terms')?.checked;

      if (!name || !email || !password) {
        showNotification('Completa todos los campos', 'error');
        return;
      }

      if (!terms) {
        showNotification('Acepta los términos', 'error');
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok)
          throw new Error(
            data.message || data.mensaje || 'Error al registrarse',
          );

        showNotification('Registro exitoso. Ahora inicia sesión.');
        switchAuth('login');
        registerForm.reset();
      } catch (error) {
        showNotification(error.message, 'error');
      }
    });
  }
}

// ========== LOGOUT ==========
async function logoutUsuario() {
  const token = localStorage.getItem('token');
  const cart = getCart();

  if (token && cart.length > 0) {
    try {
      await fetch('/api/clientes/carrito', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ carrito: cart }),
      });
    } catch (error) {
      console.error('Error guardando carrito:', error);
    }
  }

  localStorage.clear();
  showNotification('Sesión cerrada');
  setTimeout(() => (window.location.href = '/index.html'), 1000);
}

// ========== ADMIN PANEL ==========
async function loadAdminProducts() {
  const container = document.querySelector('#admin-products .admin-card');
  if (!container) return;

  try {
    const response = await fetch('/api/productos?page=1&limit=100');
    const payload = await response.json();
    const products = normalizeProductsResponse(payload).data;

    if (!products.length) {
      container.innerHTML = '<p>No hay productos</p>';
      return;
    }

    let html =
      '<div class="admin-table-container"><table class="admin-table"><thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>';

    products.forEach((p) => {
      const nombre = p.name || p.nombre;
      const precio = p.price || p.precio;
      html += `
        <tr>
          <td>${p.id}</td>
          <td>${nombre}</td>
          <td>$${precio}</td>
          <td>${p.stock}</td>
          <td>
            <button onclick="editProduct(${p.id})">Editar</button>
            <button onclick="deleteProduct(${p.id})">Eliminar</button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

function openAdminModal(type) {
  const modal = document.getElementById('admin-modal');
  const container = document.getElementById('modal-form-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <h2>${type === 'product' ? 'Nuevo Producto' : 'Nuevo Cliente'}</h2>
    <form id="admin-form">
      <input type="text" id="name" placeholder="Nombre" required>
      <input type="number" id="price" placeholder="Precio" required>
      <input type="number" id="stock" placeholder="Stock" required>
      <input type="text" id="category" placeholder="Categoría">
      <button type="submit">Guardar</button>
    </form>
  `;

  const form = document.getElementById('admin-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      nombre: document.getElementById('name').value,
      precio: parseFloat(document.getElementById('price').value),
      stock: parseInt(document.getElementById('stock').value),
      categoria: document.getElementById('category').value,
    };

    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token')
            ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
            : {}),
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showNotification('Producto creado');
        closeAdminModal();
        loadAdminProducts();
      }
    } catch (error) {
      showNotification('Error', 'error');
    }
  });

  modal.classList.add('active');
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.classList.remove('active');
}

window.editProduct = async (id) => {
  showNotification('Función en desarrollo');
};

window.deleteProduct = async (id) => {
  if (!confirm('¿Eliminar producto?')) return;
  try {
    await fetch(`/api/productos/${id}`, {
      method: 'DELETE',
      headers: localStorage.getItem('token')
        ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
        : {},
    });
    showNotification('Producto eliminado');
    loadAdminProducts();
  } catch (error) {
    showNotification('Error', 'error');
  }
};

function switchAdminView(view) {
  const productsSec = document.getElementById('admin-products');
  const customersSec = document.getElementById('admin-customers');
  const prodBtn = document.getElementById('nav-prod');
  const custBtn = document.getElementById('nav-cust');

  if (view === 'products') {
    productsSec.classList.add('active');
    customersSec.classList.remove('active');
    prodBtn.classList.add('active');
    custBtn.classList.remove('active');
    loadAdminProducts();
  } else {
    customersSec.classList.add('active');
    productsSec.classList.remove('active');
    custBtn.classList.add('active');
    prodBtn.classList.remove('active');
  }
}

// ========== MENÚ HAMBURGUESA ==========
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger-menu');
  const navMenu = document.getElementById('nav-menu');

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
}

function mostrarBotonAdminSiCorresponde() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token || role !== 'admin') return;
  if (document.getElementById('btn-nav-admin')) return;

  const btnLogout = document.getElementById('btn-nav-logout');
  if (!btnLogout) return;

  const logoutLi = btnLogout.closest('li');
  const navList = logoutLi?.parentElement;

  if (!logoutLi || !navList) return;

  const adminLi = document.createElement('li');
  adminLi.innerHTML = `
    <a href="/html/admin.html" id="btn-nav-admin" style="
      display: inline-block;
      color: white;
      font-weight: 700;
      text-decoration: none;
      padding: 8px 14px;
      border: 1px solid #ff7a21;
      border-radius: 20px;
    ">
      AdminPanel
    </a>
  `;

  navList.insertBefore(adminLi, logoutLi);
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar menú
  initHamburgerMenu();

  // Actualizar contador del carrito
  updateCartCount();

  // Cargar productos según la página
  if (document.getElementById('products-list')) {
    loadProductCategories().finally(() => loadProductsPage());
  }

  if (document.getElementById('featured-products')) {
    loadFeaturedProducts();
  }

  if (document.getElementById('cart-items')) {
    renderCart();
  }

  if (
    document.getElementById('admin-products') &&
    !document.querySelector('.admin-body')
  ) {
    loadAdminProducts();
  }

  // Inicializar formularios de auth
  initAuthForms();

  // Botones del carrito
  const btnEmpty = document.getElementById('btn-empty');
  if (btnEmpty) btnEmpty.addEventListener('click', emptyCart);

  const btnCheckout = document.getElementById('btn-checkout');
  if (btnCheckout) btnCheckout.addEventListener('click', checkout);

  // Actualizar navbar según login
  const token = localStorage.getItem('token');
  const btnLogin = document.getElementById('btn-nav-login');
  const btnLogout = document.getElementById('btn-nav-logout');

  if (token && btnLogin && btnLogout) {
    btnLogin.style.display = 'none';
    btnLogout.style.display = 'block';
  }

  mostrarBotonAdminSiCorresponde();

  // Verificar admin en admin.html
  if (document.querySelector('.admin-body')) {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      alert('Acceso denegado');
      window.location.href = '/index.html';
    }
  }
});
