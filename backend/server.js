// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import registrarEndpoints from "./database/conexion.js";
import cron from "node-cron";
import { conexion } from "./database/conexion.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🕛 Limpiando turnos vencidos...");

    await conexion.query(`
      DELETE FROM turnos
      WHERE fecha < CURDATE()
    `);

    console.log("✔ Turnos vencidos eliminados");
  } catch (error) {
    console.error("Error al borrar turnos vencidos:", error);
  }
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registrar todos los endpoints (acá pasa la magia)
registrarEndpoints(app);

app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
