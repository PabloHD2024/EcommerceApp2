require("dotenv").config();

const sequelize = require("./src/config/database");
const Cupon = require("./src/models/Cupon");

const cuponesIniciales = [
  {
    codigo: "BIENVENIDA10",
    descuento: 10,
    fecha_vencimiento: "2026-10-23",
    limite_stock: 50,
    usos_actuales: 0,
    activo: true,
  },
  {
    codigo: "PROMOJULIO",
    descuento: 15,
    fecha_vencimiento: "2026-07-31",
    limite_stock: 10,
    usos_actuales: 0,
    activo: true,
  },
  {
    codigo: "SUPER30",
    descuento: 30,
    fecha_vencimiento: "2026-06-30",
    limite_stock: 10,
    usos_actuales: 0,
    activo: true,
  },
  {
    codigo: "PROMOMUNDIAL",
    descuento: 20,
    fecha_vencimiento: "2026-07-19",
    limite_stock: 30,
    usos_actuales: 0,
    activo: true,
  },
  {
    codigo: "VAMOSARGENTINA",
    descuento: 25,
    fecha_vencimiento: "2026-07-31",
    limite_stock: 25,
    usos_actuales: 0,
    activo: true,
  },
  {
    codigo: "FINALMUNDIAL",
    descuento: 30,
    fecha_vencimiento: "2026-07-19",
    limite_stock: 15,
    usos_actuales: 0,
    activo: true,
  },
];

async function seedDatabaseCupones() {
  try {
    await Cupon.sync({ alter: true });
    console.log("Tabla de cupones sincronizada sin borrar datos existentes.");

    for (const cupon of cuponesIniciales) {
      const [, created] = await Cupon.findOrCreate({
        where: { codigo: cupon.codigo },
        defaults: cupon,
      });

      console.log(created ? `Cupón creado: ${cupon.codigo}` : `Cupón ya existía: ${cupon.codigo}`);
    }

    console.log("¡Cupones iniciales cargados con éxito!");
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  } finally {
    await sequelize.close();
    console.log("Conexión cerrada.");
  }
}

seedDatabaseCupones();
