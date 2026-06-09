# Lineamientos del proyecto

Este documento recoge las normas y buenas prácticas para contribuir y mantener el proyecto EcommerceApp2.

## Propósito

- Establecer convenciones de codificación y flujo de trabajo.
- Facilitar la colaboración entre integrantes.

## Flujo de trabajo (Git)

- Rama principal: `main` o `master` (protegida para releases).
- Trabajar en ramas de feature: `feature/nombre-descriptivo`.
- Commits claros y en inglés/español consistente: `tipo: descripción corta` (ej. `feat: agregar endpoint de cupones`).
- Pull requests con descripción, referencias a issues y capturas si aplica.

## Estilo de código

- JavaScript: seguir convenciones modernas (ES6+).
- Usar `prettier`/`eslint` si están configurados; mantener formato consistente.
- Evitar `console.log` en producción; usar logs estructurados si es necesario.

## Estructura y responsabilidades

- Seguir patrón MVC ya establecido en `src/`.
- Agregar tests o scripts de verificación al introducir cambios en lógica crítica.

## Variables de entorno

- Mantener credenciales y secretos en `.env` (no subir al repo).
- Ejemplo mínimo en `README.md`.

## Seguridad

- No almacenar contraseñas en texto plano; usar `bcryptjs`.
- Proteger rutas sensibles con JWT y autorización por rol.

## Documentación

- Actualizar `README.md` cuando se añadan endpoints o cambios importantes.
- Documentar decisiones técnicas relevantes en el repositorio o en issues.

## Pruebas y seeds

- Ejecutar seeds (`seed_DB.js`) para poblar la base local al probar cambios.
- Añadir pruebas automatizadas cuando sea posible.

## Revisión y despliegue

- Revisar PRs antes de merge; asignar al menos un revisor.
- Describir pasos de despliegue y migraciones cuando sean necesarias.

---

Si quieres que agregue más secciones (convenciones de commits, CI, checklist de PR, etc.), dímelo y lo incluyo.
