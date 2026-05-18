
require('dotenv').config();

const sequelize = require('./src/config/database');
const Producto = require('./src/models/Producto');

const productosIniciales = [
    { nombre: "Freidora de Aire 5L", precio: 89990, stock: 50, categoria: "Electrodomésticos", image: "/img/Freidora.png", rating: 4, reviews: 120 },
    { nombre: "Smartwatch Pro", precio: 59990, stock: 30, categoria: "Tecnología", image: "/img/Smartwatch.png", rating: 5, reviews: 85 },
    { nombre: "Parlante JBL Flip 6", precio: 129990, stock: 20, categoria: "Audio", image: "/img/JBL.png", rating: 4.5, reviews: 210 },
    { nombre: "Auriculares Sony WH-1000XM5", precio: 349990, stock: 15, categoria: "Audio", image: "/img/Auriculares Sony WH-1000XM5.png", rating: 5, reviews: 45 },
    { nombre: "Monitor LG 24' 4K", precio: 289990, stock: 10, categoria: "Tecnología", image: "/img/24'' UHD (3840x2160) 4K IPS LED.png", rating: 4, reviews: 67 },
    { nombre: "Teclado Mecánico RGB", precio: 45990, stock: 40, categoria: "Tecnología", image: "/img/Teclado Mecánico RGB.png", rating: 4.5, reviews: 112 },
    { nombre: "Notebook Cx Cx40082 AMD Ryzen 5 3500U 8Gb Ssd 256 15.6 Free Ips Fhd", precio: 749900, stock: 5, categoria: "Computación", image: "/img/Notebook Cx Cx40082.jpeg", rating: 4, reviews: 43 },
    { nombre: "Notebook Bangho Bes Pro T5 R5 7430U 16Gb Ssd480 15.6 Fhd Free", precio: 999990, stock: 3, categoria: "Computación", image: "/img/Notebook Bangho Bes Pro T5 R5.jpeg", rating: 4.7, reviews: 149 }
];

async function seedDatabase() {
    try {
        console.log('📂 Conectando a la base de datos...');
        
        // Probar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa');
        
        // Sincronizar (force: true elimina y recrea la tabla)
        console.log('🔄 Sincronizando tablas...');
        await sequelize.sync({ force: true });
        console.log('✅ Tablas creadas/actualizadas');
        
        // Insertar uno por uno
        console.log('📝 Insertando productos...');
        let insertados = 0;
        
        for (let i = 0; i < productosIniciales.length; i++) {
            const producto = productosIniciales[i];
            try {
                await Producto.create(producto);
                insertados++;
                console.log(`   ✓ ${i+1}. ${producto.nombre}`);
            } catch (err) {
                console.error(`   ✗ ${i+1}. Error con ${producto.nombre}:`, err.message);
            }
        }
        
        console.log(`✅ ${insertados} de ${productosIniciales.length} productos insertados`);
        
        // Verificar
        const count = await Producto.count();
        console.log(`📊 Total de productos en BD: ${count}`);
        
        // Mostrar algunos productos como verificación
        const productos = await Producto.findAll({ limit: 3 });
        console.log('📋 Primeros productos:');
        productos.forEach(p => {
            console.log(`   - ${p.nombre}: $${p.precio}`);
        });
        
        console.log('🎉 Seed completado exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error general:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

seedDatabase();