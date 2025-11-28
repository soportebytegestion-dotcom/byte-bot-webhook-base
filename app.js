const express = require("express");
const app = express();

app.use(express.json());

// GET para probar si Render responde
app.get("/", (req, res) => {
  res.send("Servidor Byte – OK");
});

// WEBHOOK POST
app.post("/webhook", (req, res) => {
  console.log("🟢 Webhook recibido:");
  console.log(req.body);

  // Respuesta mínima
  res.json({ status: "ok", message: "Webhook recibido", data: req.body });
});

// Render usa el puerto automático
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Byte escuchando en puerto ${PORT}`);
});
