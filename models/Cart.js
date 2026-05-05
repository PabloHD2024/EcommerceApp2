class CartManager {
    constructor() {
        // Carga inicial desde localStorage
        this.storageKey = 'cart';
        this.items = JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    // --- GETTERS ---
    getItems() {
        return this.items;
    }

    getTotal() {
        // Calcula el total sumando (precio * cantidad) de cada item
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // --- CRUD METHODS ---

    // CREATE / UPDATE: Agregar producto o sumar cantidad si ya existe
    addItem(producto, cantidad = 1) {
        const index = this.items.findIndex(item => item.id === producto.id_producto);

        if (index !== -1) {
            // Si ya existe, aumentamos la cantidad[cite: 1]
            this.items[index].quantity += cantidad;
        } else {
            // Si es nuevo, lo agregamos siguiendo la estructura de cart.js[cite: 1]
            this.items.push({
                id: producto.id_producto,
                name: producto.descripcion,
                price: producto.precio,
                image: producto.image || 'default.jpg', // Asumiendo propiedad de imagen
                quantity: cantidad
            });
        }
        this.save();
    }

    // UPDATE: Cambiar cantidad manualmente
    updateQuantity(index, newQty) {
        if (this.items[index]) {
            if (newQty <= 0) {
                this.removeItem(index);
            } else {
                this.items[index].quantity = newQty;
                this.save();
            }
        }
    }

    // DELETE: Eliminar un item específico por su índice[cite: 1]
    removeItem(index) {
        this.items.splice(index, 1);
        this.save();
    }

    // DELETE: Vaciar todo el carrito[cite: 1]
    clearCart() {
        if (confirm('¿Estás seguro de que querés vaciar el carrito?')) {
            this.items = [];
            this.save();
        }
    }

    // --- PERSISTENCIA ---
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        // Disparar el re-renderizado de la UI si existe la función[cite: 1]
        if (typeof renderCart === 'function') renderCart();
    }
}