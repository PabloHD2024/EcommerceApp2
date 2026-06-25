require('dotenv').config();

const sequelize = require('./src/config/database');
const User = require('./src/models/User');

const usuariosIniciales = [
  {
    name: 'Administrador de pruebas',
    email: 'admin@example.com',
    telefono: '1122334455',
    password: '123456',
    role: 'admin',
    carrito: '[]',
  },
  {
    name: 'Cliente de pruebas',
    email: 'cliente@example.com',
    telefono: '1199887766',
    password: '123456',
    role: 'client',
    carrito: '[]',
  },
];

async function seedUsers() {
  try {
    console.log('📂 Conectando a la base de datos...');

    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    console.log('🔄 Sincronizando tabla de usuarios...');
    await User.sync({ alter: true });
    console.log('✅ Tabla de usuarios sincronizada');

    console.log('📝 Insertando usuarios de prueba...');

    for (const usuario of usuariosIniciales) {
      const [user, created] = await User.findOrCreate({
        where: { email: usuario.email },
        defaults: usuario,
      });

      if (created) {
        console.log(`✓ Usuario creado: ${user.email} (${user.role})`);
      } else {
        console.log(`- Usuario ya existía: ${user.email} (${user.role})`);
      }
    }

    const totalUsuarios = await User.count();
    console.log(`📊 Total de usuarios en BD: ${totalUsuarios}`);

    console.log('🎉 Seed de usuarios completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed de usuarios:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedUsers();
