// backend/database/conexion.js
import mysql from "mysql2";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

// =========================
//   CONEXIÓN A MYSQL
// =========================
export const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

conexion.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL Railway:", err);
    return;
  }
  console.log("✅ Conexión a MySQL Railway exitosa!");
});

// =========================
//        ENDPOINTS
// =========================

export default function registrarEndpoints(app) {
  // Obtener turnos del proveedor
  app.get("/api/tusTurnos/:proveedorid", (req, res) => {
    const SQL = "SELECT * FROM turnos WHERE id_proveedor = ?";
    conexion.query(SQL, [req.params.proveedorid], (err, result) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
      res.json(result);
    });
  });

  // Nombre del proveedor
  app.get("/api/proveedor/:id", (req, res) => {
    const SQL = "SELECT nombre FROM proveedores WHERE id = ?";
    conexion.query(SQL, [req.params.id], (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Error en el servidor" });

      if (result.length === 0)
        return res
          .status(404)
          .json({ success: false, message: "Proveedor no encontrado" });

      res.json({ success: true, nombre: result[0].nombre });
    });
  });

  // Turnos disponibles para agendar
  app.get("/api/agendarturno/:proveedorid", (req, res) => {
    const SQL = "SELECT * FROM turnos WHERE id_proveedor = ?";
    conexion.query(SQL, [req.params.proveedorid], (err, result) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
      res.json(result);
    });
  });

  // Obtener todos los proveedores
  app.get("/api/proveedores", (req, res) => {
    conexion.query("SELECT * FROM proveedores", (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });

  // Obtener todos los turnos
  app.get("/api/infoturnos", (req, res) => {
    conexion.query("SELECT * FROM turnos", (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });

  // Login
  app.post("/api/infoUsuarios", (req, res) => {
    const { gmail, password } = req.body;

    conexion.query(
      "SELECT * FROM usuarios WHERE gmail=? AND password=?",
      [gmail, password],
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Error al loguear usuario" });

        if (result.length > 0)
          return res.json({ success: true, usuario: result[0] });

        conexion.query(
          "SELECT * FROM proveedores WHERE gmail=? AND password=?",
          [gmail, password],
          (err2, result2) => {
            if (err2)
              return res
                .status(500)
                .json({
                  success: false,
                  message: "Error al loguear proveedor",
                });

            if (result2.length > 0)
              return res.json({ success: true, proveedor: result2[0] });

            res.json({
              success: false,
              message: "Usuario o contraseña incorrectos",
            });
          }
        );
      }
    );
  });

  // Registrar usuarios / proveedores
  app.post("/api/register", (req, res) => {
    const { nombre, gmail, password, tipoCuenta } = req.body;

    const SQL =
      Number(tipoCuenta) === 0
        ? "INSERT INTO usuarios (nombre, gmail, password, tipoCuenta) VALUES (?, ?, ?, ?)"
        : "INSERT INTO proveedores (nombre, gmail, password, tipoCuenta) VALUES (?, ?, ?, ?)";

    conexion.query(SQL, [nombre, gmail, password, tipoCuenta], (err) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "Error al registrar usuario",
        });

      res.json({ success: true, message: "Usuario registrado correctamente" });
    });
  });

  // Registrar turnos
  app.post("/api/registrarTurnos", (req, res) => {
    const { turnosDispo } = req.body;

    if (!Array.isArray(turnosDispo) || turnosDispo.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No se enviaron turnos" });

    const SQL =
      "INSERT INTO turnos (fecha, hora_inicio, hora_fin, id_proveedor) VALUES ?";
    const values = turnosDispo.map((t) => [
      t.fecha,
      t.hora_inicio,
      t.hora_fin,
      t.id_proveedor,
    ]);

    conexion.query(SQL, [values], (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Error al registrar turnos" });

      res.json({
        success: true,
        message: "Turnos registrados correctamente",
        inserted: result.affectedRows,
      });
    });
  });

  // Borrar turno
  app.delete("/api/borrarTurno/:id", (req, res) => {
    conexion.query(
      "DELETE FROM turnos WHERE id = ?",
      [req.params.id],
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Error en el servidor" });

        if (result.affectedRows === 0)
          return res
            .status(404)
            .json({ success: false, message: "Turno no encontrado" });

        res.json({ success: true, message: "Turno borrado correctamente" });
      }
    );
  });

  // Cancelar turno
  app.post("/api/cancelarTurno", (req, res) => {
    const { proveedorid, usuarioid, id_turno } = req.body;

    if (!proveedorid || !usuarioid || !id_turno)
      return res.status(400).json({
        success: false,
        message: "Faltan datos",
      });

    conexion.query(
      "SELECT turno_guardado FROM usuarios WHERE id = ?",
      [usuarioid],
      (err, rUser) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Error al buscar usuario" });

        let lista = JSON.parse(rUser[0]?.turno_guardado || "[]");
        lista = lista.filter((t) => t.id_turno !== id_turno);

        conexion.query(
          "UPDATE usuarios SET turno_guardado=? WHERE id=?",
          [JSON.stringify(lista), usuarioid],
          (err2) => {
            if (err2)
              return res.status(500).json({
                success: false,
                message: "Error al actualizar usuario",
              });

            conexion.query(
              "SELECT turnos_agendados FROM proveedores WHERE id = ?",
              [proveedorid],
              (err3, rProv) => {
                let listaP = JSON.parse(rProv[0]?.turnos_agendados || "[]");
                listaP = listaP.filter((t) => t.id_turno !== id_turno);

                conexion.query(
                  "UPDATE proveedores SET turnos_agendados=? WHERE id=?",
                  [JSON.stringify(listaP), proveedorid],
                  (err4) => {
                    if (err4)
                      return res.status(500).json({
                        success: false,
                        message: "Error al actualizar proveedor",
                      });

                    res.json({
                      success: true,
                      message:
                        "Turno cancelado correctamente para ambas partes",
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}
