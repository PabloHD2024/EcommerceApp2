class Cupon {
    constructor(id_cupon, porcentaje_descuento, fecha_vencimiento, limite_uso_global, limite_uso_por_cliente) {
        this.id_cupon = id_cupon;
        this.descuento = porcentaje_descuento;
        this.vencimiento = new Date(fecha_vencimiento);
        this.limite_stock = limite_uso_global;
        this.limite_uso_por_cliente = limite_uso_por_cliente;
        this.usos_actuales = 0; 
    }

    // --- Getters ---
    getIdCupon() { return this.id_cupon; }
    getDescuento() { return this.descuento; }
    getVencimiento() { return this.vencimiento; }

    // --- Métodos de Lógica de Negocio ---

    /**
     * Verifica si el cupón aún puede ser utilizado
     */
    esValido(usosDelCliente = 0) {
        const ahora = new Date();
        // Regla: Límite global
        const tieneStockGlobal = this.usos_actuales < this.limite_stock;
        
        // CORRECCIÓN: Agregar validación de límite por cliente
        const tieneStockIndividual = usosDelCliente < this.limite_uso_por_cliente;
        
        // Regla: Fecha de vencimiento
        const noExpirado = ahora <= this.vencimiento;
        
        // Ahora validamos las tres condiciones
        return tieneStockGlobal && tieneStockIndividual && noExpirado;
    }

    /**
     * Calcula el descuento aplicado a un monto total
     */
    aplicarDescuento(montoTotal, usosDelCliente = 0) {
        // CORRECCIÓN: Pasar el parámetro usosDelCliente a esValido
        if (!this.esValido(usosDelCliente)) {
            console.error("El cupón no es válido para este cliente o ha expirado.");
            return montoTotal;
        }
        const ahorro = (montoTotal * this.descuento) / 100;
        return montoTotal - ahorro;
    }

    /**
     * Incrementa el contador de uso global
     */
    registrarUso() {
        if (this.usos_actuales < this.limite_stock) {
            this.usos_actuales++;
            return true;
        }
        return false;
    }

    // --- Setters con validación ---
    setDescuento(nuevoPorcentaje) {
        if (nuevoPorcentaje > 0 && nuevoPorcentaje <= 100) {
            this.descuento = nuevoPorcentaje;
        }
    }

    setVencimiento(nuevaFecha) {
        this.vencimiento = new Date(nuevaFecha);
    }
}
module.exports = { Cupon };