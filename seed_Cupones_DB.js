require('dotenv').config();

const sequelize = require('./src/config/database');
const Cupon = require('./src/models/Cupon');

const cuponesIniciales = [
    {
        codigo: "BIENVENIDA10",
        descuento: 10, 
        fecha_vencimiento: "2026-10-23", 
        limite_stock: 50, 
        usos_actuales: 0, 
        activo: true 
    },
    {
        codigo: "PROMOJULIO", // Asegurate de agregar el código
        descuento: 15,        // ¡Aquí faltaba el descuento! Poné el valor que necesites (ej: 15)
        fecha_vencimiento: "2026-07-31", 
        limite_stock: 10, 
        usos_actuales: 0, 
        activo: true 
    },
    {
        codigo: "SUPER30",    // Asegurate de agregar el código
        descuento: 30, 
        fecha_vencimiento: "2026-06-30", 
        limite_stock: 10, 
        usos_actuales: 0, 
        activo: true 
    }
];

async function seedDatabaseCupones() {
    try {
        // 'force: true' borra la tabla 'Cupons' o 'Cupones' vieja si existe,
        // y la crea de cero con el nuevo campo 'codigo' y el id autoincremental.
        await sequelize.sync({ force: true });
        console.log('Base de datos resincronizada (tablas recreadas limpias).');

        // Como la tabla está vacía y nueva, podemos usar bulkCreate directo y seguro
        await Cupon.bulkCreate(cuponesIniciales);
        console.log('¡Cupón inicial cargado con éxito!');

    } catch (error) {
        console.error('Error al cargar los datos:', error);
    } finally {
        await sequelize.close();
        console.log('Conexión cerrada.');
    }
}

seedDatabaseCupones();