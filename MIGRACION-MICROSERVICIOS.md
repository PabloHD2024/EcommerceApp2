# Migración a cinco servicios independientes

## Estado y decisión de organización

La rama de trabajo es `feature/refactor-microservicios`. La migración se desarrollará primero como un **monorepo de cinco aplicaciones desplegables de forma independiente**. Cada carpeta tendrá su propio `package.json`, configuración, comandos, variables de entorno y proceso de arranque. Vercel alojará el frontend y Render los cuatro servicios backend; Railway alojará únicamente la base MySQL de Pedidos. No habrá un backend monolítico compartido en ejecución.

Una vez integrados y validados los cinco despliegues, las carpetas podrán convertirse en cinco repositorios sin cambiar sus límites de servicio. Mantenerlas juntas durante la refactorización permite integrar el frontend y el flujo de compra sin duplicar trabajo prematuramente.

La extracción funcional base ya está presente en `frontend/`, `api-gateway/`, `ms-usuarios/`, `ms-catalogo/` y `ms-pedidos/`, con Compose para desarrollo local y un Blueprint de Render para los cuatro backends. Incluye ciclo de pago simulado/comprobante, cancelación con devolución idempotente de stock y transiciones de envío/entrega. No es una migración funcional completa: siguen pendientes la importación de datos, equivalencias administrativas y validación con bases reales.

## Estructura destino

```text
/
├── frontend/                     # Vercel; tienda y dashboard estáticos
│   ├── index.html
│   ├── html/
│   ├── css/
│   ├── js/
│   ├── img/
│   ├── config.js                 # URL única del Gateway
│   └── vercel.json
├── api-gateway/                  # Render; sin persistencia propia
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── middleware/
│       ├── clients/              # Clientes HTTP a los tres servicios
│       └── workers/              # Conciliación durable vía APIs internas
├── ms-usuarios/                  # Render + MongoDB Atlas
│   ├── package.json
│   ├── .env.example
│   ├── migrations/
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── models/
│       └── middleware/
├── ms-catalogo/                  # Render + PostgreSQL
│   ├── package.json
│   ├── .env.example
│   ├── migrations/
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── models/
│       └── middleware/
├── ms-pedidos/                   # Render + MySQL en Railway
│   ├── package.json
│   ├── .env.example
│   ├── migrations/
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── models/
│       └── middleware/
├── docs                           # archivo preexistente; no se reemplaza
├── docs-microservicios/
│   └── openapi/
└── docker-compose.yml             # Desarrollo y pruebas locales
```

Los nombres de directorio son límites de despliegue: cada servicio debe poder instalarse, iniciarse, probarse y configurarse desde su propia carpeta. La documentación de migración vive en este archivo porque `docs` es un archivo existente, no un directorio. La carpeta compartida para OpenAPI y el Compose local no se despliegan como servicios.

## Matriz de migración funcional

| Funcionalidad actual | Ubicación actual | Destino | Trabajo necesario |
|---|---|---|---|
| Tienda, detalle, búsqueda, filtros y paginación | `index.html`, `html/productos.html`, `css/`, `js/main.js` | `frontend/` | Reubicar assets, corregir rutas relativas y centralizar la URL del Gateway. Mantener las llamadas de negocio exclusivamente hacia el Gateway. |
| Dashboard de administración | `html/admin.html`, estilos y llamadas de `js/main.js` | `frontend/` | Conservar CRUD, paginación y permisos visibles; la autorización efectiva debe quedar en backend. |
| Arranque HTTP, estáticos y montaje de rutas | `server.js` | `api-gateway/` | Quitar Sequelize, `sync({ alter: true })` y controladores/modelos de dominio. El Gateway solo enruta, valida JWT y coordina llamadas HTTP/JSON. |
| Registro, login, perfil y sesión de administrador | `src/controllers/authController.js`, `src/routes/authRoutes.js`, `src/models/User.js` | `ms-usuarios/`; validación de JWT también en Gateway | Exponer `POST /api/usuarios`, `POST /api/sesiones` y perfil. Guardar contraseñas con bcrypt, no devolver hashes y emitir claims acordados. El contrato propuesto exige `201` al crear sesión. |
| Roles y CRUD administrativo de usuarios | `src/controllers/usuariosController.js`, `src/routes/usuariosRoutes.js` | `ms-usuarios/` | Proteger cada ruta en el servicio; el registro público siempre crea `client`, sin aceptar privilegios desde el navegador. |
| Clientes y carrito persistido | `src/controllers/clientesController.js`, `src/models/Cliente.js`, `User.carrito`, rutas `/api/clientes` | `ms-usuarios/` | Migrar carrito por identidad autenticada. Separar el CRUD administrativo de clientes de los datos del usuario y evitar confiar en precios/stock del carrito guardado. |
| Productos, categorías y vigencia | `src/controllers/productosController.js`, `categoriasController.js`, modelos `Producto.js` y `Categoria.js` | `ms-catalogo/` | Migrar datos y reglas de vigencia. Mantener búsqueda, orden y paginación. Asegurar que el detalle aplique la misma disponibilidad que el listado. |
| Cupones y validación de descuentos | `src/controllers/cuponController.js`, `src/models/Cupon.js`, `seed_Cupones_DB.js` | `ms-catalogo/` | Preservar fechas, activación, límites y usos. El servidor calcula el descuento y registra el uso de modo idempotente; el cálculo del frontend es solo una vista previa. |
| Stock y movimientos | Stock en `Producto.js`/`pedidoController.js`; no hay hoy un modelo de movimientos | `ms-catalogo/` | Catálogo será el único escritor de stock. Crear movimiento y actualizar stock atómicamente, con bloqueo/actualización condicional para concurrencia e idempotencia por pedido y conjunto de artículos. |
| Creación y consulta de pedidos | `src/controllers/pedidoController.js`, `src/models/Pedido.js`, `src/models/DetallePedido.js` | `ms-pedidos/`; orquestación en Gateway | Crear pedido pendiente y detalles en transacción MySQL. Copiar nombre y precio autorizado al detalle para conservar el historial, además de IDs externos de usuario/producto. |
| Pago simulado, cancelación y comprobantes | `pedidoController.js`, modelos `Pago.js` y `Ticket.js`, controladores/rutas de tickets | `ms-pedidos/` | Preservar la funcionalidad existente, pero no describir el pago simulado como integración real. La cancelación y sus reintegros de stock deben pasar por Gateway y crear movimientos idempotentes en Catálogo. |
| Seeds y base SQLite compartida | `seed_DB.js`, `seed_Cupones_DB.js`, `seed_Users_DB.js`, `ecommerce.sqlite` | Scripts por dominio en cada servicio | Exportar/migrar con simulación y validación de referencias. No borrar ni sobrescribir el SQLite original; conservar IDs estables o una tabla de correspondencia. |

## Contratos y flujo que guían la separación

| Operación | Ruta pública o interna propuesta | Responsable de datos | Comportamiento requerido |
|---|---|---|---|
| Registro | `POST /api/usuarios` | Usuarios | Rol cliente fijo; respuesta sin hash. |
| Inicio de sesión | `POST /api/sesiones` | Usuarios | Verificar bcrypt, emitir JWT y responder `201` conforme al contrato propuesto. |
| Catálogo | `GET /api/productos`, `GET /api/productos/{id}` | Catálogo | Solo productos publicables/vigentes; `404` cuando no esté disponible. |
| Crear pedido | `POST /api/pedidos` | Pedidos, coordinado por Gateway | Recibir productos y cantidades, no precios/totales. Registrar pedido pendiente y devolver `201`; reutilizar misma clave y contenido con `200`, rechazar la misma clave con otro contenido. |
| Registrar inventario | `POST /api/movimientos-stock` (interno) | Catálogo | Una transacción para todo el pedido: validar, reservar, fijar precios y registrar movimientos; `201` nuevo, `200` repetido coincidente, `409` sin stock. |
| Confirmar/rechazar | `PATCH /api/pedidos/{pedidoId}` (interno) | Pedidos | Transición controlada e idempotente; importe calculado con precios retornados por Catálogo y las cantidades persistidas. |
| Consultar estado | `GET /api/pedidos/{pedidoId}` | Pedidos | Cliente solo ve sus pedidos; administrador según permisos. Un pendiente no se representa como compra confirmada. |

Los consumidores actuales usan rutas heredadas como `/api/auth/login`, `/api/auth/register`, `/api/pedidos/{id}/pagar`, `/api/pedidos/{id}/cancelar` y `/api/cupones/aplicar/{codigo}`. Se migrarán junto con el frontend; no se incorporarán verbos equivalentes a los contratos nuevos. Cualquier alias temporal tendrá fecha/criterio de retiro documentado.

El flujo de compra será: pedido pendiente con detalle en MySQL → Gateway coordina inventario → Catálogo modifica stock y graba el movimiento en PostgreSQL → Pedidos confirma y persiste importes → frontend consulta el estado real. El pedido debe incluir todos los artículos del carrito; se agregan productos repetidos antes de procesar el inventario. No hay transacción distribuida: Pedidos conserva el estado/clave de operación y Catálogo el movimiento durable; el Gateway reanuda conciliaciones consultando esas APIs tras reinicios, sin depender de memoria local ni reintentar una escritura con una clave diferente.

Las llamadas internas de inventario, confirmación y conciliación requieren credencial de servicio y permisos acotados. Un JWT de cliente no autoriza a modificar stock, establecer precios ni cambiar estados. Ningún microservicio consulta la base de otro ni importa sus modelos.

## Decisiones de migración fijadas

- **Roles:** se conservan `admin` y `client` como valores de dominio para no romper el dashboard; el token nuevo usa `sub` como identificador estable y `role` como claim. El contrato público puede incluir `rol` como nombre de campo, pero no cambia esos valores.
- **Identidades:** la migración de Usuarios conserva un `legacyId` único con el ID SQLite actual y crea una correspondencia explícita con `_id` de MongoDB. Pedidos guarda el identificador estable acordado como referencia externa, nunca una FK a MongoDB.
- **Idempotencia:** unicidad persistida (no un `SELECT` seguido de `INSERT`) y hash del contenido canónico. Reutilizar la clave con el mismo contenido devuelve el resultado existente; con contenido distinto devuelve conflicto. En Catálogo, el movimiento debe ser único por pedido y lote completo de artículos.
- **Precios y cupones:** el cliente solo envía IDs/cantidades/código de cupón. Catálogo autoriza precio, disponibilidad y descuento; Pedidos conserva una copia de nombre, precio y cantidades. La reserva y el consumo del cupón se registran en la misma transacción local de Catálogo.
- **Resultado incierto:** timeout o respuesta perdida no equivale a rechazo. Se mantiene la operación pendiente y se consulta/reintenta con la misma clave; no se vacía el carrito hasta conocer un estado final confirmado.
- **Pagos:** el código actual simula una decisión de pago. Se conserva su UX como simulación mientras no exista un proveedor real, claramente identificado en pantalla y documentación.

## Etapas de ejecución

1. **Preparación — realizada:** aislar ownership, contratos, estructura y matriz; conservar los cambios locales preexistentes.
2. **Usuarios y Catálogo — base implementada:** servicios independientes con autenticación, perfil, carrito, catálogo, cupones e inventario; falta importar los datos heredados y completar las operaciones administrativas.
3. **Pedidos — base implementada:** persistencia MySQL, detalle, idempotencia, confirmación, pagos simulados, comprobantes y estados de envío/entrega.
4. **Gateway — base implementada:** proxies HTTP, autorización y coordinación durable inicial de pedidos y cancelaciones; falta probar recuperación con motores reales y completar contratos heredados.
5. **Frontend e integración — implementados, pendientes de validar:** se conservan los assets del repositorio `EcommerceApp2`, se centralizan las llamadas en el Gateway y se conectan checkout idempotente, consulta de pedidos, pago simulado, comprobante, cancelación y gestión de envío/entrega. Falta ejecutar las suites y verificar escenarios end-to-end con bases reales.
6. **Operación — configuración inicial:** Compose, OpenAPI y Blueprint de Render están preparados; faltan pruebas con los tres motores, despliegues Vercel/Render y la conexión segura de Pedidos a MySQL en Railway. Solo después separar los cinco directorios en repositorios si el equipo lo decide.

## Referencias consultadas y diferencias observadas

Las referencias remotas se consultaron en estos commits para dejar claro qué versión sustenta esta matriz:

- Aplicación publicada, `PabloHD2024/EcommerceApp2`, `main`: `a6f36e1195b1284a9233bd1819bcb3966d5b5317`. Su README todavía contiene marcadores de plantilla para tecnologías y comandos; no se toma como fuente de comportamiento implementado.
- Documentación, `ignaci0vidal/pp3-Arquitectura-y-secuencias-del-sistema`, `main`: `cc151cc608a4e9a35663eadefda0ff4da3399ca1`. Define cinco componentes, tres bases y los cuatro flujos propuestos de sesión, consulta, pedido pendiente y confirmación.
- Código local de partida: `PabloHD2024/EcommerceApp2`, rama `main`, commit `a6f36e1195b1284a9233bd1819bcb3966d5b5317`. La rama de refactor se creó desde esa versión; no se trasladaron modificaciones de otros clones.
- Fuentes de secuencia consultadas en `diagramas/01-sesion.puml`, `02-producto.puml`, `03-pedido.puml` y `04-confirmacion.puml`, dentro del commit de documentación indicado.

La documentación es un diseño, no una prueba de despliegue. Los diagramas acotan pedido y confirmación a un producto, y la confirmación no cubre cupones ni pagos; la implementación ya contempla carritos múltiples en el flujo base. El README y `01-sesion.puml` especifican MongoDB Atlas para Usuarios; se adopta esa base según la arquitectura de referencia.

El README local preexistente se dejó intacto. Esta primera extracción implementa la estructura y los límites de despliegue independientes; no afirma que el refactor funcional o el despliegue de producción estén terminados.
