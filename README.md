# EcommerceApp2

Proyecto grupal desarrollado para la materia **Prácticas Profesionalizantes 2** del IFTS 16.

El objetivo del proyecto es construir una aplicación de e-commerce utilizando **Node.js**, **Express**, **Sequelize** y **SQLite**, con una estructura backend organizada bajo el patrón **MVC**.

---

## Descripción del proyecto

EcommerceApp2 es una aplicación web de tienda online que permite trabajar con distintas entidades propias de un sistema de ventas, como productos, categorías, clientes, pedidos, detalles de pedido, tickets y cupones.

En esta etapa del proyecto se implementó una **API REST** para manejar datos desde el backend. Algunas entidades ya cuentan con persistencia mediante **Sequelize + SQLite**, mientras que otras continúan en proceso de migración o mejora.

---

## Tecnologías utilizadas

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- Sequelize
- SQLite
- dotenv
- Git
- GitHub

---

## Arquitectura del proyecto

El proyecto utiliza una organización basada en el patrón **MVC**.

### Models

Los modelos representan las entidades principales del sistema y se encuentran en:

src/models/

Modelos actuales:

- Producto.js
- Cliente.js
- Cupon.js
- Pedido.js
- DetallePedido.js
- Ticket.js
- cart.js

### Controllers

Los controladores contienen la lógica de cada recurso. Reciben la petición, procesan los datos y devuelven una respuesta en formato JSON.

Se encuentran en:

src/controllers/

Controladores actuales:

- productosController.js
- categoriasController.js
- clientesController.js
- cuponController.js
- pedidoController.js
- detallePedidoController.js
- ticketsController.js

### Routes

Las rutas definen los endpoints de la API y conectan cada URL con su controlador correspondiente.

Se encuentran en:

src/routes/

Rutas actuales:

- productosRoutes.js
- categoriasRoutes.js
- clientesRoutes.js
- cuponRoutes.js
- pedidoRoutes.js
- detallePedidoRoutes.js
- ticketsRoutes.js

### Config

La configuración de la base de datos se encuentra en:

src/config/database.js

La conexión utiliza variables de entorno definidas en el archivo `.env`.

Ejemplo:

PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./ecommerce.sqlite

---

## Estructura del proyecto

EcommerceApp2/
├── css/
├── html/
├── img/
├── js/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── categoriasController.js
│   │   ├── clientesController.js
│   │   ├── cuponController.js
│   │   ├── detallePedidoController.js
│   │   ├── pedidoController.js
│   │   ├── productosController.js
│   │   └── ticketsController.js
│   ├── data/
│   ├── models/
│   │   ├── cart.js
│   │   ├── Cliente.js
│   │   ├── Cupon.js
│   │   ├── DetallePedido.js
│   │   ├── Pedido.js
│   │   ├── Producto.js
│   │   └── Ticket.js
│   └── routes/
│       ├── categoriasRoutes.js
│       ├── clientesRoutes.js
│       ├── cuponRoutes.js
│       ├── detallePedidoRoutes.js
│       ├── pedidoRoutes.js
│       ├── productosRoutes.js
│       └── ticketsRoutes.js
├── index.html
├── package.json
├── server.js
├── .env
├── .gitignore
└── README.md

---

## Instalación y ejecución

### 1. Clonar el repositorio

git clone https://github.com/PabloHD2024/EcommerceApp2.git

### 2. Ingresar a la carpeta del proyecto

cd EcommerceApp2

### 3. Instalar dependencias

npm install

### 4. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./ecommerce.sqlite

### 5. Ejecutar el servidor

npm start

El servidor se ejecuta en:

http://localhost:3000

---

## Endpoints disponibles

### Productos

GET /api/productos
GET /api/productos/:id
POST /api/productos
PUT /api/productos/:id
DELETE /api/productos/:id

Ejemplo de body para crear producto:

{
  "nombre": "Teclado mecánico",
  "precio": 75000,
  "stock": 20,
  "categoria": "Tecnología"
}

---

### Categorías

GET /api/categorias
GET /api/categorias/:id
POST /api/categorias
PUT /api/categorias/:id
DELETE /api/categorias/:id

Ejemplo de body para crear categoría:

{
  "nombre": "Gaming"
}

---

### Clientes

GET /api/clientes
GET /api/clientes/:id
POST /api/clientes
PUT /api/clientes/:id
DELETE /api/clientes/:id

Ejemplo de body para crear cliente:

{
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan.perez@mail.com",
  "telefono": "1122334455",
  "direccion": "Av. Corrientes 1234"
}

---

### Cupones

GET /api/cupones
GET /api/cupones/:id
POST /api/cupones
PUT /api/cupones/:id
DELETE /api/cupones/:id
GET /api/cupones/validar/:codigo
GET /api/cupones/aplicar/:codigo?monto=10000
POST /api/cupones/:id/usar

Ejemplo de body para crear cupón:

{
  "descuento": 15,
  "fecha_vencimiento": "2026-12-31",
  "limite_stock": 5
}

---

### Pedidos

GET /api/pedido
GET /api/pedido/:id
POST /api/pedido
PUT /api/pedido/:id
DELETE /api/pedido/:id

---

### Detalle de pedido

GET /api/detalle-pedido
GET /api/detalle-pedido/:id
POST /api/detalle-pedido
PUT /api/detalle-pedido/:id
DELETE /api/detalle-pedido/:id

---

### Tickets

GET /api/tickets
GET /api/tickets/:id
POST /api/tickets
PUT /api/tickets/:id
DELETE /api/tickets/:id

---

### Checkout

POST /api/checkout

---

## Pruebas con PowerShell

### Probar clientes

Invoke-RestMethod http://localhost:3000/api/clientes

Invoke-RestMethod -Uri "http://localhost:3000/api/clientes" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "nombre": "Juan",
    "apellido": "Perez",
    "email": "juan.perez@mail.com",
    "telefono": "1122334455",
    "direccion": "Av. Corrientes 1234"
  }'

---

### Probar cupones

Invoke-RestMethod http://localhost:3000/api/cupones

Invoke-RestMethod -Uri "http://localhost:3000/api/cupones" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "descuento": 15,
    "fecha_vencimiento": "2026-12-31",
    "limite_stock": 5
  }'

Invoke-RestMethod http://localhost:3000/api/cupones/validar/1

Invoke-RestMethod "http://localhost:3000/api/cupones/aplicar/1?monto=10000"

Invoke-RestMethod -Uri "http://localhost:3000/api/cupones/1/usar" `
  -Method POST

---

## Estado actual del proyecto

Actualmente el proyecto cuenta con:

- Servidor Express funcionando.
- Frontend servido desde Express.
- API REST organizada por rutas y controladores.
- Estructura MVC aplicada.
- Conexión a base de datos SQLite mediante Sequelize.
- Persistencia implementada en varias entidades del dominio.
- CRUD de productos.
- CRUD de categorías.
- CRUD de clientes.
- CRUD de cupones con validación, aplicación de descuento y registro de uso.
- CRUD de pedidos.
- CRUD de detalle de pedido.
- CRUD de tickets.
- Archivo `.env` para configuración.
- Archivo `.gitignore` configurado.

---

## Próximos pasos

Posibles mejoras futuras:

- Unificar completamente todas las entidades bajo Sequelize.
- Agregar relaciones entre modelos.
- Relacionar pedidos con clientes.
- Relacionar detalle de pedido con productos y pedidos.
- Agregar autenticación de usuarios.
- Separar roles de cliente y administrador.
- Implementar validaciones más completas.
- Agregar manejo de errores centralizado.
- Mejorar el frontend para consumir todos los endpoints de la API.
- Agregar pruebas automatizadas.

---

## Integrantes

- Ignacio Vidal
- Pablo Demartini
- Lucía Corral
- Carla Guisande
- Ignacio Hernandez

---

