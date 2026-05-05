class Pedido {
    constructor(id_pedido, id_cliente, id_cupon = null) {
        this.id_pedido = id_pedido;
        this.id_cliente = id_cliente;
        this.id_cupon = id_cupon;
        this.detalles = []; // Array para guardar los productos del pedido
        this.estado = "pendiente"; // Estado inicial según reglas de negocio
        this.fecha_creacion = new Date().toISOString();
        this.subtotal = 0;
        this.descuentoMonto = 0;
        this.total = 0;
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
    }
    // Método para cambiar el estado
    setEstado(nuevoEstado) {
        const estadosValidos = ["pendiente", "reservado", "pagado", "cancelado"];
        
        if (estadosValidos.includes(nuevoEstado)) {
            this.estado = nuevoEstado;
            // Regla de negocio: Actualizar siempre el campo updated_at
            this.updated_at = new Date().toISOString();
        } else {
            console.error("Estado no válido");
        }
    }   

    // Método para agregar detalle
    agregarDetalle(detalle) {
        this.detalles.push(detalle);
        this.actualizarTotales();
    }

    actualizarTotales(cuponObjeto = null, usosDelCliente = 0) {
        this.subtotal = this.detalles.reduce((acc, det) => acc + det.subtotal, 0);
        
        if (cuponObjeto && typeof cuponObjeto.esValido === 'function' && cuponObjeto.esValido(usosDelCliente)) {
            this.descuentoMonto = (this.subtotal * cuponObjeto.getDescuento()) / 100;
        } else {
            this.descuentoMonto = 0;
        }

        this.total = this.subtotal - this.descuentoMonto;
        this.updated_at = new Date().toISOString();
    }

   
    getIdPedido() { return this.id_pedido; }
    getEstado() { return this.estado; }
}


class PedidoManager { 
    constructor() {
        this.pedidos = [];
    }

    crearPedido(id_pedido, id_cliente, id_cupon = null) {
        const nuevoPedido = new Pedido(id_pedido, id_cliente, id_cupon);
        this.pedidos.push(nuevoPedido);
        return nuevoPedido;
    }

    obtenerPedidoPorId(id_pedido) {
        return this.pedidos.find(p => p.getIdPedido() === id_pedido);
    }

    cambiarEstadoPedido(id_pedido, nuevoEstado) {
        const pedido = this.obtenerPedidoPorId(id_pedido);
        if (pedido) {
            pedido.setEstado(nuevoEstado);
            return pedido;
        } else {
            console.error("Pedido no encontrado");
            return null;
        }
    }
}

module.exports = Pedido;