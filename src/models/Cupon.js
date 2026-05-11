class Cupon {
    constructor(id_cupon, descuento, fecha_vencimiento, limite_stock) {
        this.id_cupon = id_cupon;
        this.descuento = descuento;          // porcentaje de descuento (ej: 15 para 15%)
        this.fecha_vencimiento = fecha_vencimiento; // formato 'YYYY-MM-DD'
        this.limite_stock = limite_stock;    // cantidad máxima de usos
        this.usos_actuales = 0;              // contador de usos
        this.activo = true;                  // si está activo o no
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
    }

    // === GETTERS ===
    getId() { return this.id_cupon; }
    getDescuento() { return this.descuento; }
    getFechaVencimiento() { return this.fecha_vencimiento; }
    getLimiteStock() { return this.limite_stock; }
    getUsosActuales() { return this.usos_actuales; }
    isActivo() { return this.activo; }

    // === MÉTODOS DE NEGOCIO ===

    // Verificar si el cupón es válido (no vencido, no agotado, activo)
    esValido() {
        const hoy = new Date().toISOString().split('T')[0];
        const noVencido = this.fecha_vencimiento >= hoy;
        const noAgotado = this.usos_actuales < this.limite_stock;
        return this.activo && noVencido && noAgotado;
    }

    // Aplicar descuento a un monto
    aplicarDescuento(monto) {
        if (!this.esValido()) {
            throw new Error('El cupón no es válido');
        }
        return monto - (monto * this.descuento / 100);
    }

    // Registrar un uso del cupón
    registrarUso() {
        if (!this.esValido()) {
            throw new Error('El cupón no es válido');
        }
        this.usos_actuales++;
        this.updated_at = new Date().toISOString();
        return this.usos_actuales;
    }

    // Desactivar cupón
    desactivar() {
        this.activo = false;
        this.updated_at = new Date().toISOString();
    }

    // Reactivar cupón
    reactivar() {
        this.activo = true;
        this.updated_at = new Date().toISOString();
    }

    // Actualizar datos del cupón
    actualizar(datos) {
        if (datos.descuento !== undefined) this.descuento = datos.descuento;
        if (datos.fecha_vencimiento !== undefined) this.fecha_vencimiento = datos.fecha_vencimiento;
        if (datos.limite_stock !== undefined) this.limite_stock = datos.limite_stock;
        this.updated_at = new Date().toISOString();
    }
}

module.exports = Cupon;