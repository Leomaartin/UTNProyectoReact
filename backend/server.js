import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import registrarEndpoints from "./database/conexion.js";
import cron from "node-cron";
import { conexion } from "./database/conexion.js";
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(
  cors({
    origin: process.env.FRONT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Registrar endpoints
registrarEndpoints(app);

// Ruta principal
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// Cron job
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

// Servidor
app.listen(PORT, () => console.log("Servidor corriendo en puerto " + PORT));
