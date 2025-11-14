import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Configuración de CORS
app.use(
  cors({
    origin: process.env.FRONT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parseo de JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MySQL
const conexion = mysql.createConnection({
  host: "maglev.proxy.rlwy.net",
  port: 42246,
  database: "railway",
  user: "root",
  password: "rSOyuJBzPOTjNkIYnAzrVMXKNxFOBadW",
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

// Obtener turnos de un proveedor
app.get("/api/tusTurnos/:proveedorid", (req, res) => {
  const { proveedorid } = req.params;
  const SQL = "SELECT * FROM turnos WHERE id_proveedor = ?";
  conexion.query(SQL, [proveedorid], (err, result) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });
    res.json(result);
  });
});

// Nombre del proveedor
app.get("/api/proveedor/:id", (req, res) => {
  const { id } = req.params;

  const SQL = "SELECT nombre FROM proveedores WHERE id = ?";
  conexion.query(SQL, [id], (err, result) => {
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

// Turnos por proveedor para agendar
app.get("/api/agendarturno/:proveedorid", (req, res) => {
  const { proveedorid } = req.params;
  const SQL = "SELECT * FROM turnos WHERE id_proveedor = ?";
  conexion.query(SQL, [proveedorid], (err, result) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });
    res.json(result);
  });
});

// Proveedores
app.get("/api/proveedores", (req, res) => {
  const SQL = "SELECT * FROM proveedores";
  conexion.query(SQL, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Traer todos los turnos de la BD
app.get("/api/infoturnos", (req, res) => {
  const SQL = "SELECT * FROM turnos";
  conexion.query(SQL, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Login (usuario o proveedor)
app.post("/api/infoUsuarios", (req, res) => {
  const { gmail, password } = req.body;

  const SQL_USER = "SELECT * FROM usuarios WHERE gmail=? AND password=?";
  conexion.query(SQL_USER, [gmail, password], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Error al loguear usuario" });

    if (result.length > 0)
      return res.json({ success: true, usuario: result[0] });

    const SQL_PROV = "SELECT * FROM proveedores WHERE gmail=? AND password=?";
    conexion.query(SQL_PROV, [gmail, password], (err, result2) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Error al loguear proveedor" });

      if (result2.length > 0)
        return res.json({ success: true, proveedor: result2[0] });

      return res.json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    });
  });
});

// Registro
app.post("/api/register", (req, res) => {
  const { nombre, gmail, password, tipoCuenta } = req.body;

  let SQL;
  if (Number(tipoCuenta) === 0) {
    SQL =
      "INSERT INTO usuarios (nombre, gmail, password, tipoCuenta) VALUES (?, ?, ?, ?)";
  } else {
    SQL =
      "INSERT INTO proveedores (nombre, gmail, password, tipoCuenta) VALUES (?, ?, ?, ?)";
  }

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
      return res.status(500).json({
        success: false,
        message: "Error al registrar turnos",
      });
    res.json({
      success: true,
      message: "Turnos registrados correctamente",
      inserted: result.affectedRows,
    });
  });
});

// BORRAR turno disponible
app.delete("/api/borrarTurno/:id", (req, res) => {
  const { id } = req.params;

  const SQL = "DELETE FROM turnos WHERE id = ?";
  conexion.query(SQL, [id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Turno no encontrado" });

    res.json({ success: true, message: "Turno borrado correctamente" });
  });
});

// Cancelar turno para proveedor y usuario
app.post("/api/cancelarTurno", (req, res) => {
  const { proveedorid, usuarioid, id_turno } = req.body;

  if (!proveedorid || !usuarioid || !id_turno) {
    return res.status(400).json({
      success: false,
      message: "Faltan datos (proveedorid, usuarioid, id_turno)",
    });
  }

  // --- Usuario
  const SQL_USER = "SELECT turno_guardado FROM usuarios WHERE id = ?";
  conexion.query(SQL_USER, [usuarioid], (err, rUser) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Error al buscar usuario" });

    let lista = JSON.parse(rUser[0]?.turno_guardado || "[]");
    lista = lista.filter((t) => t.id_turno !== id_turno);

    conexion.query(
      "UPDATE usuarios SET turno_guardado = ? WHERE id = ?",
      [JSON.stringify(lista), usuarioid],
      (err2) => {
        if (err2)
          return res
            .status(500)
            .json({ success: false, message: "Error al actualizar usuario" });

        // --- Proveedor
        conexion.query(
          "SELECT turnos_agendados FROM proveedores WHERE id = ?",
          [proveedorid],
          (err3, rProv) => {
            if (err3)
              return res
                .status(500)
                .json({ success: false, message: "Error al buscar proveedor" });

            let listaP = JSON.parse(rProv[0]?.turnos_agendados || "[]");
            listaP = listaP.filter((t) => t.id_turno !== id_turno);

            conexion.query(
              "UPDATE proveedores SET turnos_agendados = ? WHERE id = ?",
              [JSON.stringify(listaP), proveedorid],
              (err4) => {
                if (err4)
                  return res.status(500).json({
                    success: false,
                    message: "Error al actualizar proveedor",
                  });

                res.json({
                  success: true,
                  message: "Turno cancelado correctamente para ambas partes",
                });
              }
            );
          }
        );
      }
    );
  });
});

// =========================
//         SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
