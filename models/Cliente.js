class Cliente {
    constructor(id_cliente, nombre, email, tipoCliente, condicionIVA, cuit_cuil, direccion) {
        this._id_cliente = id_cliente;
        this._nombre = nombre;
        this._email = email;
        this._tipoCliente = tipoCliente;
        this._condicionIVA = condicionIVA;
        this._cuit_cuil = cuit_cuil;
        this._direccion = direccion;
        this._created_at = new Date().toISOString();
    }

    // Getters
    get id_cliente() { return this._id_cliente; }
    get nombre() { return this._nombre; }
    get email() { return this._email; }
    get cuit_cuil() { return this._cuit_cuil; }

    // Setters
    set nombre(val) { this._nombre = val; }
    set email(val) { if (val.includes("@")) this._email = val; }
    set direccion(val) { this._direccion = val; }
    set condicionIVA(val) { this._condicionIVA = val; }
}

class ClienteManager {
    constructor() { this.clientes = []; }

    agregar(cliente) {
        if (this.clientes.some(c => c.cuit_cuil === cliente.cuit_cuil)) return null;
        this.clientes.push(cliente);
        return cliente;
    }

    obtenerPorCuit(cuit) { return this.clientes.find(c => c.cuit_cuil === cuit); }

    actualizar(id, datos) {
        const cliente = this.clientes.find(c => c.id_cliente === id);
        if (cliente) return Object.assign(cliente, datos);
        return null;
    }

    eliminar(id) {
        const index = this.clientes.findIndex(c => c.id_cliente === id);
        return index !== -1 ? this.clientes.splice(index, 1)[0] : null;
    }
}