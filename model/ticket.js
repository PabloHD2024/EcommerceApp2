// ===== IMPORT =====
const {
  crearTicket,
  obtenerTicket,
  actualizarTotal,
  eliminarTicket
} = require("./models/Ticket");

// ===== CRUD TICKET =====

// CREATE
app.post("/ticket", (req, res) => {
  try {
    const ticket = crearTicket(req.body, req.body.pedido);
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ
app.get("/ticket/:id", (req, res) => {
  const ticket = obtenerTicket(req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket no encontrado" });
  }

  res.json(ticket);
});

// UPDATE
app.put("/ticket/:id", (req, res) => {
  const ticket = actualizarTotal(req.params.id, req.body.total);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket no encontrado" });
  }

  res.json(ticket);
});

// DELETE
app.delete("/ticket/:id", (req, res) => {
  const eliminado = eliminarTicket(req.params.id);

  if (!eliminado) {
    return res.status(404).json({ error: "Ticket no encontrado" });
  }

  res.json({ mensaje: "Ticket eliminado correctamente" });
});