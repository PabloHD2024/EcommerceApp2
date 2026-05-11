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

module.exports = { Producto };
