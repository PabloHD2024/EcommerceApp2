const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Servir TODOS los archivos estáticos
// Esto es lo más simple y debería funcionar sin problemas
app.use(express.static(__dirname));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});