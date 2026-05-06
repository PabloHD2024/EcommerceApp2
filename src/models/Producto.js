class Producto {
  constructor(id_producto, descripcion, stock, precio) { 
    this.id_producto = id_producto;
    this.descripcion = descripcion;
    this.stock = stock;
    this.precio = precio;
  }

  hayStock(cantidad) {
    return this.stock >= cantidad;
  }

  reducirStock(cantidad) {
    if (cantidad <= 0) {
      throw new Error("La cantidad a reducir debe ser mayor a 0.");
    }

    if (!this.hayStock(cantidad)) {
      throw new Error(`No hay stock suficiente para ${this.descripcion}.`);
    }

    this.stock -= cantidad;
  }

  aumentarStock(cantidad) {
    if (cantidad <= 0) {
      throw new Error("La cantidad a aumentar debe ser mayor a 0.");
    }

    this.stock += cantidad;
  }

  actualizarPrecio(nuevoPrecio) {
    if (nuevoPrecio <= 0) {
      throw new Error("El precio debe ser mayor a 0.");
    }

    this.precio = nuevoPrecio;
  }

}

// const { Producto } = require('./Producto');

// class ProductoCRUD {
//   constructor() {
//     this.productos = []; // Simulación de base de datos en memoria
//   }

//   // --- CREATE ---
//   crear(id, descripcion, stock, precio) {
//     const existe = this.productos.find(p => p.id_producto === id);
//     if (existe) {
//       throw new Error(`El producto con ID ${id} ya existe.`);
//     }
//     const nuevoProducto = new Producto(id, descripcion, stock, precio);
//     this.productos.push(nuevoProducto);
//     return nuevoProducto;
//   }

//   // --- READ ---
//   obtenerTodos() {
//     return this.productos;
//   }

//   obtenerPorId(id) {
//     const producto = this.productos.find(p => p.id_producto === id);
//     if (!producto) {
//       throw new Error(`Producto con ID ${id} no encontrado.`);
//     }
//     return producto;
//   }

//   // --- UPDATE ---
//   actualizar(id, nuevosDatos) {
//     const producto = this.obtenerPorId(id);
    
//     // Actualizamos solo los campos permitidos
//     if (nuevosDatos.descripcion !== undefined) producto.descripcion = nuevosDatos.descripcion;
//     if (nuevosDatos.precio !== undefined) producto.actualizarPrecio(nuevosDatos.precio);
//     if (nuevosDatos.stock !== undefined) {
        
//         producto.stock = nuevosDatos.stock;
//     }
    
//     return producto;
//   }

//   // --- DELETE ---
//   eliminar(id) {
//     const indice = this.productos.findIndex(p => p.id_producto === id);
//     if (indice === -1) {
//       throw new Error(`No se puede eliminar: Producto con ID ${id} no existe.`);
//     }
//     return this.productos.splice(indice, 1)[0];
//   }
// }

// // Ejemplo de uso:
// const gestor = new ProductoCRUD();

// try {
//   // Crear
//   gestor.crear(1, "Laptop Gamer", 10, 1500);
//   gestor.crear(2, "Mouse Óptico", 50, 25);

//   // Leer
//   console.log("Todos los productos:", gestor.obtenerTodos());

//   // Actualizar
//   gestor.actualizar(1, { precio: 1400, stock: 8 });
//   console.log("Producto actualizado:", gestor.obtenerPorId(1));

//   // Eliminar
//   gestor.eliminar(2);
//   console.log("Lista tras eliminar el ID 2:", gestor.obtenerTodos());

// } catch (error) {
//   console.error("Error:", error.message);
// }

module.exports = { Producto };
