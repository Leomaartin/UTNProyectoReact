// backend/database/conexion.js
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// =========================
//   CONEXIÓN A MYSQL
// =========================
export const conexion = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  database: process.env.MYSQLDATABASE,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
});

conexion.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
    return;
  }
  console.log("🟢 Conectado a MySQL");
});

// ========================================
//   REGISTRO DE TODOS LOS ENDPOINTS
// ========================================
export default function registrarEndpoints(app) {
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

  app.get("/api/turnosDisponibles/:proveedorid", (req, res) => {
    const SQL =
      "SELECT * FROM turnos WHERE id_proveedor = ? AND estado = 'disponible'";
    conexion.query(SQL, [req.params.proveedorid], (err, result) => {
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
        res.json({
          success: true,
          message: "Usuario registrado correctamente",
        });
      }
    );
  });

  app.post("/api/registrarTurnos", (req, res) => {
    try {
      const { turnosDispo } = req.body;

      if (!Array.isArray(turnosDispo) || turnosDispo.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No se enviaron turnos" });
      }

      // Mapeo de valores, agregando turnos_bloqueados como array vacío '[]'
      const values = turnosDispo.map((t) => {
        if (!t.fecha || !t.hora_inicio || !t.hora_fin || !t.id_proveedor) {
          throw new Error("Falta algún campo obligatorio en un turno");
        }
        return [t.fecha, t.hora_inicio, t.hora_fin, t.id_proveedor, "[]"];
      });

      const SQL_QUERY =
        "INSERT INTO turnos (fecha, hora_inicio, hora_fin, id_proveedor, turnos_bloqueados) VALUES ?";

      conexion.query(SQL_QUERY, [values], (err, result) => {
        if (err) {
          console.error("Error SQL:", err);
          return res.status(500).json({ success: false, message: err.message });
        }

        res.json({
          success: true,
          message: "Turnos registrados correctamente",
        });
      });
    } catch (error) {
      console.error("Error en backend:", error);
      res.status(500).json({ success: false, message: error.message });
    }
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
      SQL_QUERY = "SELECT turno_guardado FROM usuarios WHERE id = ?";
      campo = "turno_guardado";
    } else {
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

    if (!proveedorid || !Array.isArray(turnos))
      return res
        .status(400)
        .json({ success: false, message: "Datos inválidos" });

    const SQL_SELECT = "SELECT turnos_agendados FROM proveedores WHERE id = ?";
    conexion.query(SQL_SELECT, [proveedorid], (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });

      let turnosActuales = [];
      try {
        turnosActuales = JSON.parse(results[0]?.turnos_agendados || "[]");
        if (!Array.isArray(turnosActuales)) turnosActuales = [];
      } catch {
        turnosActuales = [];
      }

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
      return res
        .status(400)
        .json({ success: false, message: "Datos inválidos" });

    const SQL_SELECT = "SELECT turno_guardado FROM usuarios WHERE id = ?";
    conexion.query(SQL_SELECT, [usuarioid], (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });

      let turnosActuales = [];
      try {
        turnosActuales = JSON.parse(results[0]?.turno_guardado || "[]");
        if (!Array.isArray(turnosActuales)) turnosActuales = [];
      } catch {
        turnosActuales = [];
      }

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

  app.post("/api/buscarTurnos", (req, res) => {
    const { id } = req.body;
    console.log("BODY RECIBIDO:", req.body);
    const SQL_QUERY = "SELECT * FROM turnos WHERE id_proveedor = ?";

    conexion.query(SQL_QUERY, [id], (err, result) => {
      if (err) {
        console.error("Error SQL:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error en el servidor" });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No se encontraron turnos" });
      }

      return res.json({
        success: true,
        message: "Turnos traídos correctamente",
        result,
      });
    });
  });

  app.post("/api/borrarTurnoDisponible", (req, res) => {
    const { id } = req.body;
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
  app.post("/api/horasBloqueadas", (req, res) => {
    const turnos = req.body.turno; // ⬅️ el array completo

    if (!Array.isArray(turnos)) {
      return res
        .status(400)
        .json({ success: false, message: "Se esperaba un array" });
    }

    // como todos tienen el mismo id, agarro el primero
    const id_turno = turnos[0].id;

    // lo convierto a JSON
    const jsonTurnos = JSON.stringify(turnos);

    const SQL_QUERY = `
    UPDATE turnos
    SET turnos_bloqueados = ?
    WHERE id = ?
  `;

    conexion.query(SQL_QUERY, [jsonTurnos, id_turno], (err, result) => {
      if (err) {
        console.error("ERROR SQL:", err);
        return res.status(500).json({ success: false, error: err });
      }

      res.json({
        success: true,
        message: "Turnos bloqueados actualizados",
        updated: result.affectedRows,
      });
    });
  });
  app.post("/api/horasBloqueadas2", (req, res) => {
    const { proveedorid } = req.body;

    if (!proveedorid) {
      return res
        .status(400)
        .json({ success: false, message: "Falta proveedorid" });
    }

    const SQL = `
    SELECT 
      id,
      CASE 
        WHEN turnos_bloqueados IS NULL OR turnos_bloqueados = '' 
        THEN '[]'
        ELSE turnos_bloqueados
      END AS turnos_bloqueados
    FROM turnos
    WHERE id_proveedor = ?
  `;

    conexion.query(SQL, [proveedorid], (err, rows) => {
      if (err) {
        console.error("ERROR SQL:", err);
        return res.status(500).json({ success: false, error: err });
      }

      try {
        // Convertimos cada fila a JSON real
        const resultado = rows.map((row) => ({
          id: row.id,
          turnos_bloqueados: JSON.parse(row.turnos_bloqueados),
        }));

        return res.json({
          success: true,
          result: resultado,
        });
      } catch (e) {
        console.error("Error al parsear JSON:", e);
        return res.status(500).json({
          success: false,
          message: "Error al procesar turnos_bloqueados",
        });
      }
    });
  });
}
