# EcommerceApp2






5/5/2026
## Cambios realizados

Se agregó el CRUD/ABM de la entidad Categorías en el backend.

### Endpoints implementados

- GET /api/categorias
- POST /api/categorias
- PUT /api/categorias/:id
- DELETE /api/categorias/:id

### Detalles técnicos

- Se agregó express.json() para permitir que el servidor reciba datos en formato JSON.
- Se creó un arreglo en memoria llamado categoriasDB.
- Se validó que el nombre de la categoría sea obligatorio al crear una nueva categoría.
- Se probaron los endpoints con Invoke-RestMethod desde PowerShell.

### Pruebas realizadas

- GET devuelve las categorías existentes.
- POST agrega una categoría nueva.
- PUT modifica una categoría por ID.
- DELETE elimina una categoría por ID.
