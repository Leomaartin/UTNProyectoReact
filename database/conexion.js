import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
const PORT = 3333;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const conexion = mysql.createConnection({
  host: "localhost",
  database: "turnos",
  user: "root",
  password: "",
});

conexion.connect((err) => {
  if (err) throw err;
  console.log("Conexión exitosa a la base de datos");
});

app.get("/api/tusTurnos/:proveedorid", (req, res) => {
  const { proveedorid } = req.params;
  const SQL_QUERY = "SELECT * FROM turnos WHERE id_proveedor = ?";
  conexion.query(SQL_QUERY, [proveedorid], (err, result) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });
    res.json(result);
  });
});

app.get("/api/proveedor/:id", (req, res) => {
  const { id } = req.params;

  const SQL_QUERY = "SELECT nombre FROM proveedores WHERE id = ?";
  conexion.query(SQL_QUERY, [id], (err, result) => {
    if (err) {
      console.error("Error al obtener proveedor:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Proveedor no encontrado" });
    }

    res.json({ success: true, nombre: result[0].nombre });
  });
});

app.get("/api/agendarturno/:proveedorid", (req, res) => {
  const { proveedorid } = req.params;
  const SQL_QUERY = "SELECT * FROM turnos WHERE id_proveedor = ?";
  conexion.query(SQL_QUERY, [proveedorid], (err, result) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });
    res.json(result);
  });
});

app.get("/api/reservarturnos", (req, res) => {
  const SQL_QUERY = "SELECT * FROM proveedores";
  conexion.query(SQL_QUERY, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.get("/api/infoturnos", (req, res) => {
  const SQL_QUERY = "SELECT * FROM turnos";
  conexion.query(SQL_QUERY, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.post("/api/turnospublicados", (req, res) => {
  const { id_turno, fechas, horas } = req.body;
  const SQL_QUERY =
    "INSERT INTO turnospublicados (id_turno, fechas, horas) VALUES (?, ?, ?)";
  conexion.query(SQL_QUERY, [id_turno, fechas, horas], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Error publicar turnos",
        error: err.message,
      });
    }
    res.json({ success: true, message: "Turno publicado correctamente" });
  });
});

app.get("/api/proveedores", (req, res) => {
  const SQL_QUERY = "SELECT * FROM proveedores";
  conexion.query(SQL_QUERY, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.get("/api/usuariosTurno", (req, res) => {
  const { id } = req.body;
  const SQL_QUERY = "SELECT nombre FROM usuarios WHERE id=?";
  conexion.query(SQL_QUERY, [id], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.get("/api/turnosDisponibles", (req, res) => {
  const SQL = `
    SELECT t.id, t.fecha, t.hora_inicio, t.hora_fin, u.nombre AS proveedor
    FROM turnos t
    JOIN usuarios u ON t.id_proveedor = u.id
    ORDER BY t.fecha, t.hora_inicio
  `;
  conexion.query(SQL, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/infoUsuarios", (req, res) => {
  const { gmail, password } = req.body;

  const SQL_USUARIO = "SELECT * FROM usuarios WHERE gmail=? AND password=?";
  conexion.query(SQL_USUARIO, [gmail, password], (err, result) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Error al loguear usuario",
        error: err.message,
      });

    if (result.length > 0)
      return res.json({ success: true, usuario: result[0] });

    const SQL_PROVEEDOR =
      "SELECT * FROM proveedores WHERE gmail=? AND password=?";
    conexion.query(SQL_PROVEEDOR, [gmail, password], (err, result2) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "Error al loguear proveedor",
          error: err.message,
        });

      if (result2.length > 0)
        return res.json({ success: true, proveedor: result2[0] });

      return res.json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    });
  });
});

app.post("/api/register", (req, res) => {
  const { nombre, gmail, password, tipoCuenta } = req.body;
  console.log(req.body);
  let SQL_QUERY;

  if (Number(tipoCuenta) === 0) {
    SQL_QUERY =
      "INSERT INTO usuarios (nombre, gmail, password, tipoCuenta) VALUES (?, ?, ?, ?)";
  } else {
    SQL_QUERY =
      "INSERT INTO proveedores (nombre, gmail, password, tipoCuenta) VALUES (?, ?, ?, ?)";
  }

  conexion.query(
    SQL_QUERY,
    [nombre, gmail, password, tipoCuenta],
    (err, result) => {
      if (err) {
        console.error("❌ Error MySQL:", err);
        return res.status(500).json({
          success: false,
          message: "Error al registrar usuario",
          error: err.message,
        });
      }

      console.log("✅ Usuario insertado:", result);
      res.json({ success: true, message: "Usuario registrado correctamente" });
    }
  );
});

app.post("/api/registrarTurnos", (req, res) => {
  const { turnosDispo } = req.body;
  if (!Array.isArray(turnosDispo) || turnosDispo.length === 0)
    return res
      .status(400)
      .json({ success: false, message: "No se enviaron turnos" });

  const SQL_QUERY =
    "INSERT INTO turnos (fecha, hora_inicio, hora_fin, id_proveedor) VALUES ?";
  const values = turnosDispo.map((t) => [
    t.fecha,
    t.hora_inicio,
    t.hora_fin,
    t.id_proveedor,
  ]);

  conexion.query(SQL_QUERY, [values], (err, result) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Error al registrar turnos",
        error: err.message,
      });
    res.json({
      success: true,
      message: "Turnos registrados correctamente",
      inserted: result.affectedRows,
    });
  });
});

app.delete("/api/borrarTurno/:id", (req, res) => {
  const { id } = req.params;
  const SQL_QUERY = "DELETE FROM turnos WHERE id = ?";
  conexion.query(SQL_QUERY, [id], (err, result) => {
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

app.get("/api/turnosAgendadosUsuario/:proveedorid", (req, res) => {
  const { proveedorid } = req.params;
  const SQL_QUERY = "SELECT turnos_agendados FROM proveedores WHERE id = ?";
  conexion.query(SQL_QUERY, [proveedorid], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    if (result.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });

    let turnosAgendados = [];
    try {
      turnosAgendados = JSON.parse(result[0].turnos_agendados || "[]");
      if (!Array.isArray(turnosAgendados)) turnosAgendados = [];
    } catch (e) {
      console.error("Error parseando turnos_agendados:", e);
      turnosAgendados = [];
    }
    res.json({ success: true, turnosAgendados });
  });
});

app.get("/api/turnosAgendadosProveedor/:proveedorid", (req, res) => {
  const { proveedorid } = req.params;
  const SQL_QUERY = "SELECT turnos_agendados FROM proveedores WHERE id = ?";
  conexion.query(SQL_QUERY, [proveedorid], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    if (result.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Proveedor no encontrado" });

    let turnosAgendados = [];
    try {
      turnosAgendados = JSON.parse(result[0].turnos_agendados || "[]");
      if (!Array.isArray(turnosAgendados)) turnosAgendados = [];
    } catch (e) {
      console.error("Error parseando turnos_agendados:", e);
      turnosAgendados = [];
    }
    res.json({ success: true, turnosAgendados });
  });
});

app.get("/api/turnosDelUsuario/:usuarioid", (req, res) => {
  const { usuarioid } = req.params;
  const { tipoCuenta } = req.query;

  let SQL_QUERY;
  let campo;

  if (tipoCuenta == 0) {
    // usuario normal
    SQL_QUERY = "SELECT turno_guardado FROM usuarios WHERE id = ?";
    campo = "turno_guardado";
  } else {
    // proveedor
    SQL_QUERY = "SELECT turnos_agendados FROM proveedores WHERE id = ?";
    campo = "turnos_agendados";
  }

  conexion.query(SQL_QUERY, [usuarioid], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });

    if (result.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });

    let turnosAgendados = [];
    try {
      turnosAgendados = JSON.parse(result[0][campo] || "[]");
      if (!Array.isArray(turnosAgendados)) turnosAgendados = [];
    } catch (e) {
      console.error(`Error parseando ${campo}:`, e);
      turnosAgendados = [];
    }

    res.json({ success: true, turnosAgendados });
  });
});

app.post("/api/turnoAgendado", (req, res) => {
  const { proveedorid, turnos } = req.body;
  console.log(req.body);

  if (!proveedorid || !Array.isArray(turnos))
    return res.status(400).json({ success: false, message: "Datos inválidos" });

  const SQL_SELECT = "SELECT turnos_agendados FROM proveedores WHERE id = ?";
  conexion.query(SQL_SELECT, [proveedorid], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });

    let turnosActuales = [];
    try {
      turnosActuales = JSON.parse(results[0]?.turnos_agendados || "[]");
      if (!Array.isArray(turnosActuales)) turnosActuales = [];
    } catch (e) {
      console.error("Error parseando turnos_agendados:", e);
      turnosActuales = [];
    }

    // 👉 Agregamos los turnos nuevos (ya incluyen el id)
    turnosActuales.push(...turnos);

    const SQL_UPDATE =
      "UPDATE proveedores SET turnos_agendados = ? WHERE id = ?";
    conexion.query(
      SQL_UPDATE,
      [JSON.stringify(turnosActuales), proveedorid],
      (err2) => {
        if (err2)
          return res
            .status(500)
            .json({ success: false, message: err2.message });
        res.json({
          success: true,
          message: "Turnos guardados correctamente (proveedor)",
        });
      }
    );
  });
});

app.post("/api/turnoGuardado", (req, res) => {
  const { usuarioid, turnos } = req.body;

  if (!usuarioid || !Array.isArray(turnos))
    return res.status(400).json({ success: false, message: "Datos inválidos" });

  const SQL_SELECT = "SELECT turno_guardado FROM usuarios WHERE id = ?";
  conexion.query(SQL_SELECT, [usuarioid], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });

    let turnosActuales = [];
    try {
      turnosActuales = JSON.parse(results[0]?.turno_guardado || "[]");
      if (!Array.isArray(turnosActuales)) turnosActuales = [];
    } catch (e) {
      console.error("Error parseando turno_guardado:", e);
      turnosActuales = [];
    }

    // 👉 Guardamos los turnos nuevos (que traen id)
    turnosActuales.push(...turnos);

    const SQL_UPDATE = "UPDATE usuarios SET turno_guardado = ? WHERE id = ?";
    conexion.query(
      SQL_UPDATE,
      [JSON.stringify(turnosActuales), usuarioid],
      (err2) => {
        if (err2)
          return res
            .status(500)
            .json({ success: false, message: err2.message });
        res.json({
          success: true,
          message: "Turnos guardados correctamente (usuario)",
        });
      }
    );
  });
});

app.post("/api/cancelarTurno", (req, res) => {
  const { proveedorid, usuarioid, id_turno } = req.body;

  if (!proveedorid || !usuarioid || !id_turno) {
    return res.status(400).json({
      success: false,
      message: "Faltan datos (proveedorid, usuarioid o id del turno)",
    });
  }

  console.log("🧠 Datos recibidos en cancelarTurno:", {
    proveedorid,
    usuarioid,
    id_turno,
  });
  const SQL_USER = "SELECT turno_guardado FROM usuarios WHERE id = ?";
  conexion.query(SQL_USER, [usuarioid], (err, resultsUser) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Error al buscar usuario" });

    let turnosUsuario = [];
    try {
      turnosUsuario = JSON.parse(resultsUser[0]?.turno_guardado || "[]");
    } catch {
      turnosUsuario = [];
    }

    const nuevosTurnosUsuario = turnosUsuario.filter(
      (t) => t.id_turno !== id_turno
    );

    const SQL_UPDATE_USER =
      "UPDATE usuarios SET turno_guardado = ? WHERE id = ?";
    conexion.query(
      SQL_UPDATE_USER,
      [JSON.stringify(nuevosTurnosUsuario), usuarioid],
      (err2) => {
        if (err2)
          return res.status(500).json({
            success: false,
            message: "Error al actualizar usuario",
          });

        const SQL_PROV =
          "SELECT turnos_agendados FROM proveedores WHERE id = ?";
        conexion.query(SQL_PROV, [proveedorid], (err3, resultsProv) => {
          if (err3)
            return res.status(500).json({
              success: false,
              message: "Error al buscar proveedor",
            });

          let turnosProv = [];
          try {
            turnosProv = JSON.parse(resultsProv[0]?.turnos_agendados || "[]");
          } catch {
            turnosProv = [];
          }

          const nuevosTurnosProv = turnosProv.filter(
            (t) => t.id_turno !== id_turno
          );

          const SQL_UPDATE_PROV =
            "UPDATE proveedores SET turnos_agendados = ? WHERE id = ?";
          conexion.query(
            SQL_UPDATE_PROV,
            [JSON.stringify(nuevosTurnosProv), proveedorid],
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
        });
      }
    );
  });
});
app.post("/api/actualizarCategoria", (req, res) => {
  const { categoria, id } = req.body;

  const SQL_UPDATE = "UPDATE proveedores SET categoria = ? WHERE id = ?";
  conexion.query(SQL_UPDATE, [categoria, id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    return res.json({
      success: true,
      message: "Categoría actualizada correctamente",
    });
  });
});
app.get("/api/buscarCategoria/:categoria", (req, res) => {
  const categoria = req.params.categoria;

  const SQL_QUERY = `
    SELECT DISTINCT p.*
    FROM proveedores p
    INNER JOIN turnos t ON p.id = t.id_proveedor
    WHERE p.categoria = ?;
  `;

  conexion.query(SQL_QUERY, [categoria], (err, result) => {
    if (err) {
      console.error("Error al buscar proveedores:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron proveedores con turnos disponibles",
      });
    }

    return res.json({
      success: true,
      message: "Proveedores encontrados correctamente",
      proveedores: result,
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
