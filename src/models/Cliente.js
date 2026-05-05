class Cliente {
  constructor(id_cliente, nombre, email, tipoCliente, condicionIVA, cuit_cuil, direccion) {
   this.id_cliente = id_cliente;
    this.nombre = nombre;
    this.email = email;
    this.tipoCliente = tipoCliente; // ej: "Final", "Corporativo"
    this.condicionIVA = condicionIVA; // ej: "Responsable Inscripto", "Monotributista"
    this.cuit_cuil = cuit_cuil; 
    this.direccion = direccion;
    this.created_at = new Date().toISOString();
  }

  // --- Getters ---
  getIdCliente() { return this.id_cliente; }
  getNombre() { return this.nombre; }
  getEmail() { return this.email; }
  getIdentificacion() { return this.cuit_cuil; }
  getCondicionIVA() { return this.condicionIVA; }

  // --- Métodos de Lógica ---
  esCorporativo() {
    return this.tipoCliente.toLowerCase() === "corporativo";
  }

  actualizarEmail(nuevoEmail) {
    if (nuevoEmail.includes("@")) {
      this.email = nuevoEmail;
      return true;
    }
    return false;
  }

  cambiarDireccion(nuevaDireccion) {
    this.direccion = nuevaDireccion;
  }

  cambiarCondicionIVA(nuevaCondicionIVA) {
    // Podrías validar que sea una condición válida según AFIP/Entidad Fiscal
    this.condicionIVA = nuevaCondicionIVA;
  }
}

class ClienteManager {
  constructor() {
    this.clientes = [];
  }

  // CREATE: Agregar un cliente
  agregarCliente(cliente) {
    // Evitar duplicados por CUIT
    const existe = this.clientes.some(c => c.cuit_cuil === cliente.cuit_cuil);
    if (existe) {
      console.error("Ya existe un cliente con ese CUIT/CUIL");
      return null;
    }
    this.clientes.push(cliente);
    return cliente;
  }

  // READ: Obtener todos o buscar por identificación
  listarClientes() {
    return this.clientes;
  }

  buscarPorCuit(cuit) {
    return this.clientes.find(c => c.cuit_cuil === cuit) || null;
  }

  buscarPorId(id) {
    return this.clientes.find(c => c.idCliente === id) || null;
  }

  // UPDATE: Actualizar datos dinámicamente
  actualizarCliente(id, datosNuevos) {
    const cliente = this.buscarPorId(id);
    if (cliente) {
      // Actualizamos solo las propiedades enviadas en datosNuevos
      Object.assign(cliente, datosNuevos);
      return cliente;
    }
    return null;
  }

  // DELETE: Eliminar cliente
  eliminarCliente(id) {
    const index = this.clientes.findIndex(c => c.idCliente === id);
    if (index !== -1) {
      return this.clientes.splice(index, 1)[0];
    }
    return null;
  }
}

module.exports = {
  Cliente,
  ClienteManager
};