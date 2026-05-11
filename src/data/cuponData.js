
let cuponesDB = [
    {
        id_cupon: 1,
        descuento: 10,
        fecha_vencimiento: "2026-12-31",
        limite_stock: 100,
        usos_actuales: 25,
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id_cupon: 2,
        descuento: 15,
        fecha_vencimiento: "2026-06-30",
        limite_stock: 50,
        usos_actuales: 10,
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id_cupon: 3,
        descuento: 20,
        fecha_vencimiento: "2026-03-15",
        limite_stock: 30,
        usos_actuales: 30,  // ya se agotó!
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

module.exports = cuponesDB;