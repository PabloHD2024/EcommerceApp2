# EcommerceApp2 — ejecución y despliegue de microservicios

## Estado actual

El código original se mantiene intacto mientras se realiza la extracción en la rama `feature/refactor-microservicios`. Las nuevas aplicaciones están en `frontend/`, `api-gateway/`, `ms-usuarios/`, `ms-catalogo/` y `ms-pedidos/`. Cada backend tiene su propio manifiesto npm y Dockerfile; no se importa código de dominio entre servicios.

Esta etapa incluye autenticación y carrito en Usuarios, productos/cupones e inventario transaccional en Catálogo, pedidos idempotentes, pago simulado y comprobantes en Pedidos, y coordinación Gateway de compra y cancelación con devolución idempotente de stock. El panel también puede avanzar pedidos pagados a envío y entrega. La migración de datos SQLite, la conciliación validada ante fallos reales, la equivalencia del resto del CRUD administrativo y las pruebas con motores reales todavía requieren trabajo; no se declara terminado el refactor.

## Requisitos y ejecución local

- Node.js 22 o superior.
- Docker Desktop con el motor Linux disponible para levantar MongoDB, PostgreSQL y MySQL.
- Copiar/ajustar las variables de los `.env.example` en cada servicio si se ejecuta sin Compose.

Desde la raíz:

```powershell
docker compose up --build
```

Abrir <http://localhost:8080>. Compose inicia MongoDB, PostgreSQL y MySQL con volúmenes persistentes, aplica las migraciones iniciales idempotentes de Catálogo y Pedidos, y levanta las cuatro aplicaciones backend. Las credenciales incluidas en Compose son solamente para desarrollo local.

Para ejecutar cada API sin Docker, instalar dependencias en cada carpeta y configurar su `.env`:

```powershell
cd ms-usuarios
npm install
npm start
```

Los comandos equivalentes de Catálogo y Pedidos son `npm install`, `npm run migrate` y `npm start`. Gateway y Frontend usan `npm install` y `npm start`. Puertos locales: Gateway `3000`, Usuarios `3101`, Catálogo `3102`, Pedidos `3103`, frontend `8080`.

Ejecutar pruebas:

```powershell
cd api-gateway; npm test
cd ..\ms-usuarios; npm test
cd ..\ms-catalogo; npm test
cd ..\ms-pedidos; npm test
```

Las pruebas unitarias de esta etapa cubren rutas, claims, validación, proxy, coordinación de compra y resultado incierto. No sustituyen las pruebas de transacciones con MongoDB/PostgreSQL/MySQL reales.

## Variables

- `frontend/config.js`: cambiar `gatewayUrl` por la URL pública del API Gateway al publicar el frontend. Es el único punto de configuración de la API para tienda y dashboard.
- `api-gateway/.env.example`: `JWT_SECRET` compartido con Usuarios y Catálogo; `SERVICE_TOKEN` compartido con Gateway, Catálogo y Pedidos; URLs base de los tres servicios; `FRONTEND_ORIGIN`; timeout de upstream.
- `ms-usuarios/.env.example`: `MONGODB_URI`, `JWT_SECRET`, puerto.
- `ms-catalogo/.env.example`: `DATABASE_URL`, `DATABASE_SSL`, `JWT_SECRET`, `SERVICE_TOKEN`, puerto.
- `ms-pedidos/.env.example`: `DATABASE_URL`, `DATABASE_SSL`, `SERVICE_TOKEN`, puerto.

En producción generar secretos aleatorios distintos para JWT y servicio, con al menos 32 caracteres. No enviar `.env` ni credenciales al repositorio. El servicio de Pedidos debe usar TLS verificado hacia MySQL de Railway (`DATABASE_SSL=true`).

## Despliegue previsto

### Frontend en Vercel

Crear un proyecto con `frontend/` como Root Directory. El proyecto es HTML/CSS/JavaScript estático y usa los rewrites de `frontend/vercel.json`. Actualizar `frontend/config.js` para apuntar al Gateway de producción antes de publicar. Configurar el dominio de Vercel en `FRONTEND_ORIGIN` del Gateway.

### Gateway y microservicios en Render

`render.yaml` define cuatro servicios Docker independientes, todos en Render: Gateway, Usuarios, Catálogo y Pedidos. Crear los servicios desde ese Blueprint o configurar para cada uno su Root Directory, Dockerfile y health check `/health`. Configurar:

- Usuarios: `MONGODB_URI` de MongoDB Atlas y `JWT_SECRET`.
- Catálogo: `DATABASE_URL` de Render Postgres, `DATABASE_SSL=true`, el mismo `JWT_SECRET` y `SERVICE_TOKEN`.
- Pedidos: `DATABASE_URL` de MySQL en Railway, `DATABASE_SSL=true` y `SERVICE_TOKEN`.
- Gateway: URLs HTTPS de los otros tres servicios, `FRONTEND_ORIGIN`, los mismos secretos y un `UPSTREAM_TIMEOUT_MS` razonable.

Render no provisiona la base MySQL desde este repositorio. Railway aloja solo MySQL; el proceso `ms-pedidos` corre en Render y se conecta a esa base usando TLS. No se crean cuentas, recursos cloud ni despliegues automáticamente desde este proyecto.

### Migraciones y primera cuenta administradora

Aplicar `npm run migrate` en `ms-catalogo` y `ms-pedidos` contra las respectivas bases antes de habilitar tráfico. Las migraciones SQL numeradas son idempotentes; todavía falta guardar en una tabla qué versiones se aplicaron. La importación desde SQLite sigue pendiente. Registrar el usuario administrador inicial con `npm run set-admin -- correo@ejemplo.com` desde `ms-usuarios`, apuntando a MongoDB Atlas; el usuario debe haberse registrado primero. Ese comando solo cambia el rol del usuario indicado y no vuelve a cifrar la contraseña.

## Contratos y responsabilidades

El contrato OpenAPI inicial está en `docs-microservicios/openapi.yaml`.

- Frontend → únicamente Gateway.
- Gateway: valida JWT, reenvía HTTP/JSON y coordina pedidos. Sin base propia.
- Usuarios: MongoDB, bcrypt, sesión, perfil, roles y carrito.
- Catálogo: PostgreSQL, productos, vigencia, cupones y movimientos. Único servicio que cambia stock.
- Pedidos: MySQL, propiedad, intentos idempotentes, detalle, estados e importes históricos.

El cliente envía identificadores/cantidades y, opcionalmente, un código de cupón; nunca se autorizan precios ni totales del navegador. `POST /api/pedidos` requiere `Idempotency-Key`; el Gateway persiste el pedido pendiente, pide a Catálogo una operación atómica de todos los artículos y luego guarda la confirmación en Pedidos. `201` representa el pedido nuevo confirmado, `200` reutiliza el resultado idempotente, `202` mantiene resultado incierto y `409` indica rechazo/conflicto definitivo. El frontend conserva el carrito y ofrece consultar los intentos `202`.

Las rutas internas de inventario y transición de estado requieren `x-service-token`; además, el Gateway no expone al navegador las rutas internas de conciliación ni `PATCH` de estado. Las cancelaciones se persisten primero como `cancelling`, revierten stock y uso de cupón con una operación idempotente de Catálogo, y luego quedan `cancelled`; si una dependencia no responde, el Gateway las reintenta en su conciliación. Pedidos guarda pagos y comprobantes en MySQL en transacciones locales. Los microservicios no comparten modelos ni consultan las bases ajenas.

## Pendientes para terminar la migración

- Migración repetible desde `ecommerce.sqlite` con modo simulación, referencias y preservación de contraseñas ya hasheadas e IDs históricos.
- Migración repetible desde `ecommerce.sqlite` con modo simulación, referencias y preservación de contraseñas ya hasheadas e IDs históricos.
- Completar categorías/cupones administrativos y equivalencia de todas las funcionalidades del dashboard.
- Conciliación de compras y cancelaciones ejercitada ante reinicios/fallas reales de PostgreSQL y MySQL.
- Pruebas end-to-end con los tres motores reales, concurrencia e idempotencia bajo varias instancias.
- Reubicar el README de aplicación sin sobrescribir los cambios locales preexistentes; documentar las cuatro secuencias por separado cuando se complete la implementación.
