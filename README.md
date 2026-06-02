# EcommerceApp2

Proyecto grupal desarrollado para la materia **Prácticas Profesionalizantes 2** del IFTS 16.

El objetivo del proyecto es construir una aplicación de e-commerce utilizando **Node.js**, **Express**, **Sequelize** y **SQLite**, con una estructura backend organizada bajo el patrón **MVC**.

---

## Descripción del proyecto

EcommerceApp2 es una aplicación web de tienda online que permite trabajar con distintas entidades propias de un sistema de ventas, como productos, categorías, clientes, pedidos, detalles de pedido, tickets y cupones.

El proyecto implementa una **API REST** para manejar datos desde el backend y utiliza **Sequelize + SQLite** para la persistencia local. Además, incorpora una capa de **seguridad** basada en autenticación con JWT y autorización por rol, permitiendo distinguir usuarios administradores y clientes.

La aplicación permite listar productos públicamente, pero restringe acciones sensibles como crear, modificar o eliminar productos a usuarios autenticados con rol de administrador.

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
- cors
- jsonwebtoken
- bcryptjs
- Git
- GitHub
- Thunder Client / Postman para pruebas de API
- ChatGPT / GEMINI / DeepSeek / codex

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
- `User.js`
- `cart.js`

El modelo `User.js` permite persistir usuarios con email, contraseña hasheada y rol.

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
- `authController.js`

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
- `authRoutes.js`

### Middlewares

Los middlewares permiten interceptar una petición antes de que llegue al controlador.

Se encuentran en:

`src/middlewares/`

Middlewares actuales:

- `authMiddleware.js`

Este archivo contiene:

- `authenticateToken`: valida que la petición tenga un token JWT válido.
- `isAdmin`: valida que el usuario autenticado tenga rol de administrador.

### Config

La configuración de la base de datos se encuentra en:

`src/config/database.js`

La conexión utiliza variables de entorno definidas en el archivo `.env`.

Ejemplo de `.env`:

```env
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./ecommerce.sqlite
JWT_SECRET=clave_local_para_desarrollo
```

Importante: el archivo `.env` no debe subirse al repositorio. La variable `JWT_SECRET` se utiliza para firmar y validar los tokens JWT.

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
│   │   ├── authController.js
│   │   ├── categoriasController.js
│   │   ├── clientesController.js
│   │   ├── cuponController.js
│   │   ├── detallePedidoController.js
│   │   ├── pedidoController.js
│   │   ├── productosController.js
│   │   └── ticketsController.js
│   ├── data/
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── cart.js
│   │   ├── Categoria.js
│   │   ├── Cliente.js
│   │   ├── Cupon.js
│   │   ├── DetallePedido.js
│   │   ├── Pedido.js
│   │   ├── Producto.js
│   │   ├── Ticket.js
│   │   └── User.js
│   └── routes/
│       ├── authRoutes.js
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
├── seed_Cupones_DB.js
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
JWT_SECRET=clave_local_para_desarrollo
```

### 5. Crear o actualizar la base de datos local

Ejecutar el seed para crear la base SQLite local y cargar los productos iniciales:

```bash
node seed_DB.js
```

Si se desea cargar o actualizar los cupones iniciales:

```bash
node seed_Cupones_DB.js
```

Estos pasos son necesarios cuando se clona el proyecto por primera vez, cuando se borra `ecommerce.sqlite`, o cuando se actualizan datos/modelos relacionados con la base.

### 6. Ejecutar el servidor

```bash
npm start
```

El servidor se ejecuta en:

`http://localhost:3000`

Importante: la aplicación debe abrirse desde `http://localhost:3000`, no haciendo doble click sobre `index.html`, porque el frontend necesita comunicarse con la API del backend.

---

## Seguridad: autenticación y autorización

En la clase 10 se incorporó seguridad en la API mediante autenticación con JWT y autorización por rol.

### Autenticación

La autenticación responde a la pregunta: **¿quién sos?**

El usuario inicia sesión enviando email y contraseña. Si las credenciales son correctas, el backend genera un token JWT firmado con `JWT_SECRET`.

Endpoint de login:

```http
POST /api/auth/login
```

Body de ejemplo:

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

Respuesta esperada:

```json
{
  "success": true,
  "token": "TOKEN_JWT",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Autorización

La autorización responde a la pregunta: **¿qué puede hacer este usuario?**

El sistema utiliza el campo `role` del usuario para permitir o rechazar acciones sensibles.

Roles utilizados:

- `admin`: puede crear, modificar y eliminar productos.
- `client`: puede navegar el catálogo, pero no puede administrar productos.

### Uso del token

Para acceder a rutas protegidas se debe enviar el token JWT en el header `Authorization`.

Formato esperado:

```http
Authorization: Bearer TOKEN
```

### Contraseñas

Las contraseñas no se guardan en texto plano. Se procesan con `bcryptjs` antes de persistirse en la base de datos.

---

## Endpoints disponibles

### Autenticación

```http
POST /api/auth/login
```

Permite iniciar sesión y obtener un token JWT.

Usuarios de prueba:

```text
Administrador:
email: admin@example.com
password: 123456

Cliente:
email: cliente@example.com
password: 123456
```

---

### Productos

```http
GET /api/productos
GET /api/productos/:id
POST /api/productos
PUT /api/productos/:id
DELETE /api/productos/:id
```

Las rutas de lectura son públicas:

```http
GET /api/productos
GET /api/productos/:id
```

Las rutas de escritura están protegidas y requieren usuario administrador:

```http
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

Respuesta si se intenta crear un producto sin token:

```json
{
  "message": "Acceso denegado. Token no provisto."
}
```

Código HTTP esperado:

```http
401 Unauthorized
```

Respuesta si se intenta crear un producto con token válido pero sin rol administrador:

```json
{
  "message": "Acceso denegado. Se requieren permisos de administrador."
}
```

Código HTTP esperado:

```http
403 Forbidden
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

Endpoint básico para simular una compra desde el carrito. El backend valida productos vigentes y stock disponible antes de confirmar la operación.

---

### Cupones

```http
GET /api/cupones/validar/:codigo
GET /api/cupones/aplicar/:codigo?monto=10000
```

Estos endpoints permiten validar un cupón y calcular el descuento sobre un monto determinado.

---

## Pruebas con PowerShell

### Probar productos públicos

```powershell
Invoke-RestMethod http://localhost:3000/api/productos
```

Resultado esperado:

```text
200 OK
```

### Probar creación de producto sin token

```powershell
try {
  Invoke-RestMethod `
    -Uri http://localhost:3000/api/productos `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"nombre":"Producto Test","precio":1000,"stock":5,"categoria":"Test"}'
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Resultado esperado:

```text
401
```

### Probar login de administrador

```powershell
Invoke-RestMethod `
  -Uri http://localhost:3000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"123456"}'
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

## Pruebas con Thunder Client

### GET productos sin token

```http
GET http://localhost:3000/api/productos
```

Resultado esperado:

```http
200 OK
```

### POST producto sin token

```http
POST http://localhost:3000/api/productos
```

Header:

```http
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Producto Test Thunder",
  "precio": 1000,
  "stock": 5,
  "categoria": "Test"
}
```

Resultado esperado:

```http
401 Unauthorized
```

Respuesta esperada:

```json
{
  "message": "Acceso denegado. Token no provisto."
}
```

### Login administrador

```http
POST http://localhost:3000/api/auth/login
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

Resultado esperado:

```http
200 OK
```

Luego copiar el token devuelto y enviarlo en las rutas protegidas.

### POST producto con token administrador

```http
POST http://localhost:3000/api/productos
```

Headers:

```http
Content-Type: application/json
Authorization: Bearer TOKEN_ADMIN
```

Body:

```json
{
  "nombre": "Producto Admin Thunder",
  "precio": 2500,
  "stock": 10,
  "categoria": "Test"
}
```

Resultado esperado:

```http
201 Created
```

### POST producto con token cliente

Usar un token generado con el usuario `cliente@example.com`.

Resultado esperado:

```http
403 Forbidden
```

---

## Estado actual del proyecto

Actualmente el proyecto cuenta con:

- Servidor Express funcionando.
- Frontend servido desde Express.
- Conexión a base de datos SQLite mediante Sequelize.
- Archivo `.env` para configuración local.
- Archivo `.gitignore` configurado.
- CRUD de productos conectado y funcionando.
- Listado de categorías conectado mediante estructura MVC.
- Endpoint básico de checkout.
- Endpoints de validación y aplicación de cupones disponibles.
- Estructura MVC creada para varias entidades del dominio.
- Dependencias de seguridad agregadas: `jsonwebtoken` y `bcryptjs`.
- Modelo de usuario para autenticación.
- Login con email y contraseña.
- Generación de token JWT.
- Hash de contraseñas mediante `bcryptjs`.
- Middleware de autenticación mediante JWT.
- Middleware de autorización para rol administrador.
- Rutas de creación, modificación y eliminación de productos protegidas.
- Rutas de lectura de productos públicas.
- Interfaz preparada para diferenciar usuario invitado, cliente y administrador.

---

## Próximos pasos

Posibles mejoras futuras:

- Proteger rutas sensibles de categorías y cupones.
- Definir permisos específicos para clientes, pedidos, tickets y checkout.
- Completar la integración de todas las rutas MVC en `server.js`.
- Unificar completamente todas las entidades bajo Sequelize.
- Agregar relaciones entre modelos.
- Relacionar pedidos con clientes.
- Relacionar detalle de pedido con productos y pedidos.
- Implementar validaciones más completas.
- Agregar manejo de errores centralizado.
- Mejorar el frontend para consumir todos los endpoints de la API.
- Mejorar la interfaz según usuario logueado y rol.
- Agregar pruebas automatizadas.

---

## Integrantes

- Lucía Corral
- Pablo Demartini
- Carla Guisande
- Ignacio Hernandez
- Ignacio Vidal

---
