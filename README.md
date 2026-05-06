# EcommerceApp2

Proyecto grupal desarrollado para la materia **Prácticas Profesionalizantes 2** del IFTS 16.

El objetivo del proyecto es construir una aplicación de e-commerce utilizando **Node.js**, **Express** y una estructura backend organizada bajo el patrón **MVC**.

---

## Descripción del proyecto

EcommerceApp2 es una aplicación web de tienda online que permite trabajar con productos, categorías y otras entidades propias de un sistema de ventas.

En esta etapa del proyecto se implementó una API REST para manejar datos desde el backend. Actualmente se trabaja con datos en memoria, simulando una base de datos mediante arreglos JavaScript.

---

## Tecnologías utilizadas

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- Git
- GitHub

---

## Estructura del proyecto

```text
EcommerceApp2/
├── css/
├── html/
├── img/
├── js/
├── src/
│   ├── controllers/
│   │   ├── categoriasController.js
│   │   └── productosController.js
│   ├── data/
│   │   ├── categoriasData.js
│   │   └── productosData.js
│   ├── models/
│   │   ├── cart.js
│   │   ├── Cliente.js
│   │   ├── DetallePedido.js
│   │   ├── Pedido.js
│   │   ├── Producto.js
│   │   └── Ticket.js
│   └── routes/
│       ├── categoriasRoutes.js
│       └── productosRoutes.js
├── index.html
├── package.json
├── server.js
├── .gitignore
└── README.md
```

---

## Arquitectura MVC

El proyecto utiliza una organización basada en el patrón **MVC**.

### Models

Los modelos representan las entidades principales del sistema.

Se encuentran en:

```text
src/models/
```

Ejemplos:

- `Producto.js`
- `Cliente.js`
- `Pedido.js`
- `DetallePedido.js`
- `Ticket.js`
- `cart.js`

### Controllers

Los controladores contienen la lógica de cada recurso. Reciben la petición, procesan los datos y devuelven una respuesta en formato JSON.

Se encuentran en:

```text
src/controllers/
```

Ejemplos:

- `productosController.js`
- `categoriasController.js`

### Routes

Las rutas definen los endpoints de la API y conectan cada URL con su controlador correspondiente.

Se encuentran en:

```text
src/routes/
```

Ejemplos:

- `productosRoutes.js`
- `categoriasRoutes.js`

### Data

La carpeta `data` contiene arreglos en memoria que simulan una base de datos temporal.

Se encuentra en:

```text
src/data/
```

Ejemplos:

- `productosData.js`
- `categoriasData.js`

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

### 4. Ejecutar el servidor

```bash
npm start
```

El servidor se ejecuta en:

```text
http://localhost:3000
```

---

## Endpoints disponibles

### Productos

#### Obtener todos los productos

```http
GET /api/productos
```

Respuesta esperada:

```json
[
  {
    "id": 1,
    "nombre": "Notebook Lenovo",
    "precio": 850000,
    "stock": 10,
    "categoria": "Tecnología"
  }
]
```

#### Obtener un producto por ID

```http
GET /api/productos/:id
```

Ejemplo:

```http
GET /api/productos/1
```

#### Crear un producto

```http
POST /api/productos
```

Body ejemplo:

```json
{
  "nombre": "Teclado mecánico",
  "precio": 75000,
  "stock": 20,
  "categoria": "Tecnología"
}
```

#### Actualizar un producto

```http
PUT /api/productos/:id
```

Body ejemplo:

```json
{
  "precio": 82000,
  "stock": 18
}
```

#### Eliminar un producto

```http
DELETE /api/productos/:id
```

---

### Categorías

#### Obtener todas las categorías

```http
GET /api/categorias
```

Respuesta esperada:

```json
[
  {
    "id": 1,
    "nombre": "Tecnología"
  },
  {
    "id": 2,
    "nombre": "Hogar"
  },
  {
    "id": 3,
    "nombre": "Audio"
  }
]
```

#### Obtener una categoría por ID

```http
GET /api/categorias/:id
```

Ejemplo:

```http
GET /api/categorias/1
```

#### Crear una categoría

```http
POST /api/categorias
```

Body ejemplo:

```json
{
  "nombre": "Gaming"
}
```

#### Actualizar una categoría

```http
PUT /api/categorias/:id
```

Body ejemplo:

```json
{
  "nombre": "Gaming y accesorios"
}
```

#### Eliminar una categoría

```http
DELETE /api/categorias/:id
```

---

## Pruebas con PowerShell

### Probar productos

```powershell
Invoke-RestMethod http://localhost:3000/api/productos
```

```powershell
Invoke-RestMethod http://localhost:3000/api/productos/1
```

### Crear un producto

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/productos" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"nombre":"Teclado mecánico","precio":75000,"stock":20,"categoria":"Tecnología"}'
```

### Probar categorías

```powershell
Invoke-RestMethod http://localhost:3000/api/categorias
```

```powershell
Invoke-RestMethod http://localhost:3000/api/categorias/1
```

### Crear una categoría

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/categorias" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"nombre":"Gaming"}'
```

---

## Estado actual del proyecto

Actualmente el proyecto cuenta con:

- Servidor Express funcionando.
- Frontend servido desde Express.
- API REST para productos.
- API REST para categorías.
- Separación de responsabilidades usando estructura MVC.
- Modelos del dominio organizados en `src/models`.
- Datos temporales simulados en memoria.
- Archivo `.gitignore` configurado.

---

## Próximos pasos

Posibles mejoras futuras:

- Agregar conexión a base de datos real.
- Implementar persistencia de productos, categorías, clientes y pedidos.
- Agregar autenticación de usuarios.
- Separar roles de cliente y administrador.
- Implementar validaciones más completas.
- Agregar endpoints para clientes, pedidos, cupones y tickets.
- Mejorar el frontend para consumir todos los endpoints de la API.
- Agregar manejo de errores centralizado.

---

## Integrantes

- Ignacio Vidal
- Pablo Demartini
- Lucía Corral
- Carla
- Otros integrantes del grupo

---

## Notas

Este proyecto forma parte de una entrega académica. La base de datos actual es temporal y funciona mediante arreglos en memoria, por lo que los datos creados durante la ejecución se pierden al reiniciar el servidor.