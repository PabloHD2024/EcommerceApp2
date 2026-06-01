require("dotenv").config();

const sequelize = require("./src/config/database");
const Producto = require("./src/models/Producto");

const productosIniciales = [
  {
    nombre: "Pava Eléctrica Corte Mate 1.7L",
    precio: 34990,
    stock: 0,
    categoria: "Electrodomésticos",
    image: "/img/PavaEléctrica.png",
    rating: 4.5,
    reviews: 310,
  },
  {
    nombre: "Cafetera Express 15 Bares",
    precio: 159990,
    stock: 15,
    categoria: "Electrodomésticos",
    image: "/img/CafeteraExpress.png",
    rating: 4.8,
    reviews: 95,
  },
  {
    nombre: "Licuadora de Mano 800W",
    precio: 42990,
    stock: 25,
    categoria: "Electrodomésticos",
    image: "/img/LicuadoraMano.png",
    rating: 4.2,
    reviews: 115,
  },
  {
    nombre: "Tostadora Eléctrica para 2 Rebanadas",
    precio: 29990,
    stock: 35,
    categoria: "Electrodomésticos",
    image: "/img/TostadoraElectrica.png",
    rating: 4.0,
    reviews: 78,
  },
  {
    nombre: "Microondas Digital 20L BGH",
    precio: 184990,
    stock: 12,
    categoria: "Electrodomésticos",
    image: "/img/MicroondasBGH.png",
    rating: 4.6,
    reviews: 204,
  },
  {
    nombre: "Aspiradora Robot Inteligente Wi-Fi",
    precio: 299990,
    stock: 8,
    categoria: "Electrodomésticos",
    image: "/img/AspiradoraRobot.png",
    rating: 4.4,
    reviews: 62,
  },
  {
    nombre: "Balanza de Cocina Digital 5kg",
    precio: 12990,
    stock: 60,
    categoria: "Electrodomésticos",
    image: "/img/BalanzaCocina.png",
    rating: 4.7,
    reviews: 412,
  },
  {
    nombre: "Exprimidor de Cítricos Eléctrico 1L",
    precio: 24990,
    stock: 40,
    categoria: "Electrodomésticos",
    image: "/img/ExprimidorCitricos.png",
    rating: 4.1,
    reviews: 88,
  },

  // --- TECNOLOGÍA ---
  {
    nombre: "Soporte Celular para Auto con Carga Inalámbrica",
    precio: 19990,
    stock: 50,
    categoria: "Tecnología",
    image: "/img/SoporteCelularCarga.png",
    rating: 4.3,
    reviews: 134,
  },
  {
    nombre: "Tablet Lenovo Tab M10 Plus 10.6 Fhd",
    precio: 249990,
    stock: 14,
    categoria: "Tecnología",
    image: "/img/TabletLenovoTabM10.png",
    rating: 4.5,
    reviews: 89,
  },
  {
    nombre: "Aro de Luz LED 26cm con Trípode",
    precio: 15990,
    stock: 70,
    categoria: "Tecnología",
    image: "/img/ArodeLuzLED.png",
    rating: 4.0,
    reviews: 245,
  },
  {
    nombre: "Cargador Portátil Powerbank 20000mAh",
    precio: 38990,
    stock: 40,
    categoria: "Tecnología",
    image: "/img/Powerbank20000mAh.png",
    rating: 4.7,
    reviews: 198,
  },
  {
    nombre: "Repetidor Wi-Fi TP-Link Extensor",
    precio: 22990,
    stock: 55,
    categoria: "Tecnología",
    image: "/img/RepetidorTP-Link.png",
    rating: 4.2,
    reviews: 340,
  },
  {
    nombre: "Smart TV 43' Full HD Android",
    precio: 329990,
    stock: 7,
    categoria: "Tecnología",
    image: "/img/SmartTV43.png",
    rating: 4.4,
    reviews: 156,
  },
  {
    nombre: "Cámara de Seguridad Exterior Wi-Fi 1080p",
    precio: 45990,
    stock: 22,
    categoria: "Tecnología",
    image: "/img/CamaraSeguridadExterior.png",
    rating: 4.5,
    reviews: 112,
  },

  // --- COMPUTACIÓN  ---
  // --- COMPUTACIÓN ---
  {
    nombre: "Mouse Óptico Inalámbrico Logitech M280",
    precio: 18990,
    stock: 80,
    categoria: "Periféricos",
    categoria: "Computación",
    image: "/img/MouseLogitechM280.png",
    rating: 4.8,
    reviews: 520,
  },
  {
    nombre: "Disco Sólido Interno SSD Kingston 480Gb",
    precio: 39990,
    stock: 35,
    categoria: "Almacenamiento",
    categoria: "Computación",
    image: "/img/SSDKingston480Gb.png",
    rating: 4.9,
    reviews: 610,
  },
  {
    nombre: "Pendrive Kingston 64GB USB 3.2",
    precio: 9990,
    stock: 75,
    categoria: "Almacenamiento",
    image: "/img/PendriveKingston64GB.png",
    rating: 4.6,
    reviews: 260,
  },
  {
    nombre: "Disco Externo Portátil 1TB USB 3.0",
    precio: 89990,
    stock: 20,
    categoria: "Almacenamiento",
    image: "/img/DiscoExterno1TB.png",
    rating: 4.7,
    reviews: 190,
  },
  {
    nombre: "Memoria RAM DDR4 8Gb Fury 3200MHz",
    precio: 28990,
    stock: 42,
    categoria: "Computación",
    image: "/img/RAMDDR48GbFury.png",
    rating: 4.8,
    reviews: 289,
  },
  {
    nombre: "Webcam Full HD 1080p con Micrófono",
    precio: 31990,
    stock: 28,
    categoria: "Periféricos",
    categoria: "Computación",
    image: "/img/WebcamFullHD.png",
    rating: 4.1,
    reviews: 73,
  },
  {
    nombre: "Hub USB-C de 4 Puertos de Aluminio",
    precio: 14990,
    stock: 65,
    categoria: "Periféricos",
    categoria: "Computación",
    image: "/img/HubUSB-C4Puertos.png",
    rating: 4.3,
    reviews: 142,
  },
  {
    nombre: "Router Gamer TP-Link Archer AC1200",
    precio: 64990,
    stock: 18,
    categoria: "Computación",
    image: "/img/RouterTP-LinkArcher.png",
    rating: 4.6,
    reviews: 97,
  },
  {
    nombre: "Gabinete Kit Mid Tower con Fuente 500W",
    precio: 54990,
    stock: 15,
    categoria: "Computación",
    image: "/img/GabineteKitMidTower.png",
    rating: 3.9,
    reviews: 54,
  },
  {
    nombre: "Pad Mouse Gamer Extendido 90x40cm",
    precio: 12500,
    stock: 100,
    categoria: "Periféricos",
    categoria: "Computación",
    image: "/img/PadMouseGamer.png",
    rating: 4.7,
    reviews: 315,
  },
  // --- ELECTRÓNICA ---
  {
    nombre: "Auriculares Bluetooth Inalámbricos",
    precio: 34990,
    stock: 30,
    categoria: "Electrónica",
    image: "/img/AuricularesBluetooth.png",
    rating: 4.5,
    reviews: 180,
  },
  {
    nombre: "Parlante Bluetooth Portátil",
    precio: 52990,
    stock: 24,
    categoria: "Electrónica",
    image: "/img/ParlanteBluetooth.png",
    rating: 4.6,
    reviews: 210,
  },
  {
    nombre: "Smartwatch Deportivo con Sensor Cardíaco",
    precio: 69990,
    stock: 18,
    categoria: "Electrónica",
    image: "/img/SmartwatchDeportivo.png",
    rating: 4.4,
    reviews: 165,
  },
];

async function seedDatabase() {
  try {
    console.log("📂 Conectando a la base de datos...");

    await sequelize.authenticate();
    console.log("✅ Conexión exitosa");

    console.log("🔄 Sincronizando tabla de productos...");
    await Producto.sync({ force: true });
    console.log("✅ Tabla de productos creada/actualizada");

    console.log("📝 Insertando productos...");
    let insertados = 0;

    for (let i = 0; i < productosIniciales.length; i++) {
      const producto = productosIniciales[i];
      try {
        await Producto.create(producto);
        insertados++;
        console.log(`   ✓ ${i + 1}. ${producto.nombre}`);
      } catch (err) {
        console.error(
          `   ✗ ${i + 1}. Error con ${producto.nombre}:`,
          err.message,
        );
      }
    }

    console.log(
      `✅ ${insertados} de ${productosIniciales.length} productos insertados`,
    );

    const count = await Producto.count();
    console.log(`📊 Total de productos en BD: ${count}`);

    const productos = await Producto.findAll({ limit: 3 });
    console.log("📋 Primeros productos:");
    productos.forEach((p) => {
      console.log(`   - ${p.nombre}: $${p.precio}`);
    });

    console.log("🎉 Seed completado exitosamente!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error general:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedDatabase();
