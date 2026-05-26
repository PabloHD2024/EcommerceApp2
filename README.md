# EcommerceApp2

Proyecto grupal desarrollado para la materia **Prácticas Profesionalizantes 2** del IFTS 16.

El objetivo del proyecto es construir una aplicación de e-commerce utilizando **Node.js**, **Express**, **Sequelize** y **SQLite**, con una estructura backend organizada bajo el patrón **MVC**.

---

## Descripción del proyecto

EcommerceApp2 es una aplicación web de tienda online que permite trabajar con distintas entidades propias de un sistema de ventas, como productos, categorías, clientes, pedidos, detalles de pedido, tickets y cupones.

En esta etapa del proyecto se implementó una **API REST** para manejar datos desde el backend. Algunas entidades ya cuentan con persistencia mediante **Sequelize + SQLite**, mientras que otras continúan en proceso de migración, conexión o mejora.

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

`src/models/`

Modelos actuales:

- `Producto.js`
- `Cliente.js`
- `Cupon.js`
- `Pedido.js`
- `DetallePedido.js`
- `Ticket.js`
- `cart.js`

### Controllers

Los controladores contienen la lógica de cada recurso. Reciben la petición, procesan los datos y devuelven una respuesta en formato JSON.

Se encuentran en:

`src/controllers/`

Controladores actuales:

- `productosController.js`
- `categoriasController.js`
- `clientesController.js`
- `cuponController.js`
- `pedidoController.js`
- `detallePedidoController.js`
- `ticketsController.js`

### Routes

Las rutas definen los endpoints de la API y conectan cada URL con su controlador correspondiente.

Se encuentran en:

`src/routes/`

Rutas actuales:

- `productosRoutes.js`
- `categoriasRoutes.js`
- `clientesRoutes.js`
- `cuponRoutes.js`
- `pedidoRoutes.js`
- `detallePedidoRoutes.js`
- `ticketsRoutes.js`

### Config

La configuración de la base de datos se encuentra en:

`src/config/database.js`

La conexión utiliza variables de entorno definidas en el archivo `.env`.

Ejemplo de `.env`:

```env
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./ecommerce.sqlite
```

---

## Estructura del proyecto

```text
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
│   │   ├── Categoria.js
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
├── package-lock.json
├── seed_DB.js
├── server.js
├── .env
├── .gitignore
└── README.md
```

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/PabloHD2024/EcommerceApp2.git
```

### 2. Ingresar a la carpeta del proyecto

```bash
cd EcommerceApp2
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./ecommerce.sqlite
```

### 5. Crear o actualizar la base de datos local

Ejecutar el seed para crear la base SQLite local y cargar los productos iniciales:

```bash
node seed_DB.js
```

Este paso es necesario cuando se clona el proyecto por primera vez, cuando se borra `ecommerce.sqlite`, o cuando se actualizan datos/modelos relacionados con la base.

### 6. Ejecutar el servidor

```bash
npm start
```

El servidor se ejecuta en:

`http://localhost:3000`

Importante: la aplicación debe abrirse desde `http://localhost:3000`, no haciendo doble click sobre `index.html`, porque el frontend necesita comunicarse con la API del backend.

---

## Endpoints disponibles

### Productos

```http
GET /api/productos
GET /api/productos/:id
POST /api/productos
PUT /api/productos/:id
DELETE /api/productos/:id
```

Ejemplo de body para crear producto:

```json
{
  "nombre": "Teclado mecánico",
  "precio": 75000,
  "stock": 20,
  "categoria": "Tecnología"
}
```

---

### Categorías

```http
GET /api/categorias
```

Este endpoint devuelve las categorías disponibles a partir de los productos cargados en la base de datos.

Ejemplo de respuesta:

```json
["Computación", "Electrodomésticos", "Tecnología"]
```

---

### Checkout

```http
POST /api/checkout
```

Endpoint básico para simular una compra desde el carrito.

---

### Cupones

```http
GET /api/cupones/validar/:codigo
GET /api/cupones/aplicar/:codigo?monto=10000
```

Estos endpoints permiten validar un cupón y calcular el descuento sobre un monto determinado.

Nota: el módulo de cupones cuenta con rutas MVC creadas, pero su integración completa al servidor continúa en proceso de ajuste.

---

## Pruebas con PowerShell

### Probar productos

```powershell
Invoke-RestMethod http://localhost:3000/api/productos
```

### Probar categorías

```powershell
Invoke-RestMethod http://localhost:3000/api/categorias
```

### Probar cupones

```powershell
Invoke-RestMethod http://localhost:3000/api/cupones/validar/1
Invoke-RestMethod "http://localhost:3000/api/cupones/aplicar/1?monto=10000"
```

---

## Estado actual del proyecto

Actualmente el proyecto cuenta con:

- Servidor Express funcionando.
- Frontend servido desde Express.
- Conexión a base de datos SQLite mediante Sequelize.
- Archivo `.env` para configuración.
- Archivo `.gitignore` configurado.
- CRUD de productos conectado y funcionando.
- Listado de categorías conectado mediante estructura MVC.
- Endpoint básico de checkout.
- Endpoints de validación y aplicación de cupones disponibles.
- Estructura MVC creada para varias entidades del dominio.
- Algunas entidades continúan en proceso de integración completa al servidor.

---

## Próximos pasos

Posibles mejoras futuras:

- Completar la integración de todas las rutas MVC en `server.js`.
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

- Lucía Corral
- Pablo Demartini
- Carla Guisande
- Ignacio Hernandez
- Ignacio Vidal

---
