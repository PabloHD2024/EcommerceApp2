class Detalle_Pedido {
	constructor(id_pedido, id_detalle, id_producto, cantidad, precio_unitario){
    if (cantidad <= 0) {
    throw new Error("La cantidad debe ser mayor a cero");
    }

		this.id_pedido = id_pedido;
		this.id_detalle = id_detalle;
		this.id_producto = id_producto;
		this.cantidad = cantidad;
		this.precio_unitario = precio_unitario;
        
  	}

	// Regla de negocio: El subtotal es cantidad * precio_unitario
    
	get subtotal() {
        return this.cantidad * this.precio_unitario;
    }


    // CREATE: Registrar un nuevo detalle
    static async create(pool, detalle) {
        const query = `
            INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario)
            VALUES ($1, $2, $3, $4)
            RETURNING id_detalle;
        `;
        const values = [detalle.id_pedido, detalle.id_producto, detalle.cantidad, detalle.precio_unitario];
        const res = await pool.query(query, values);
        return res.rows[0].id_detalle;
    }

    // READ: Obtener todos los detalles de un pedido específico
    static async getByPedido(pool, id_pedido) {
        const query = 'SELECT * FROM detalles_pedido WHERE id_pedido = $1';
        const res = await pool.query(query, [id_pedido]);
        // Mapeamos los resultados a instancias de la clase
        return res.rows.map(r => new Detalle_Pedido(r.id_pedido, r.id_producto, r.cantidad, r.precio_unitario, r.id_detalle));
    }

    // UPDATE: Modificar cantidad (por ejemplo, si el pedido aún no se pagó)
    static async updateCantidad(pool, id_detalle, nuevaCantidad) {
        const query = `
            UPDATE detalles_pedido 
            SET cantidad = $1 
            WHERE id_detalle = $2 
            RETURNING *;
        `;
        const res = await pool.query(query, [nuevaCantidad, id_detalle]);
        return res.rows[0];
    }

    // DELETE: Eliminar un producto del detalle
    static async delete(pool, id_detalle) {
        const query = 'DELETE FROM detalles_pedido WHERE id_detalle = $1';
        await pool.query(query, [id_detalle]);
        return { message: "Detalle eliminado correctamente" };
    }
};

module.exports = { Detalle_Pedido };