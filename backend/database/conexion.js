import { upload } from "./middleware/upload.js";
import path from "path";
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// 🔥 Creamos el pool (maneja conexiones automáticamente)
export const conexion = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  database: process.env.MYSQLDATABASE,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
});

// 🔥 Versión con Promesas (para usar async/await)
export const db = conexion.promise();

// 🟢 Verificación de conexión
conexion.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
  } else {
    console.log("🟢 Conectado a MySQL");
    connection.release();
  }
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
    const turnos = req.body.turnos;

    if (!Array.isArray(turnos)) {
      return res.status(400).json({
        success: false,
        message: "Se esperaba un array",
      });
    }

    const SQL_SELECT = `
    SELECT turnos_bloqueados 
    FROM turnos 
    WHERE id = ?
  `;

    const SQL_UPDATE = `
    UPDATE turnos 
    SET turnos_bloqueados = ?
    WHERE id = ?
  `;

    const promises = turnos.map((t) => {
      return new Promise((resolve, reject) => {
        // 1️⃣ Leer bloqueos actuales
        conexion.query(SQL_SELECT, [t.id], (err, result) => {
          if (err) return reject(err);

          let bloqueosActuales = [];

          if (result[0]?.turnos_bloqueados) {
            try {
              bloqueosActuales = JSON.parse(result[0].turnos_bloqueados);
            } catch (e) {
              console.error("JSON inválido:", e);
            }
          }

          // 2️⃣ Buscar si ya existe un registro para esa fecha
          let registro = bloqueosActuales.find((b) => b.fecha === t.fecha);

          if (registro) {
            // Merge: NO reemplaza, añade horas sin duplicar
            registro.horas = Array.from(
              new Set([...registro.horas, ...t.horas])
            );
          } else {
            // Crear registro nuevo
            bloqueosActuales.push({
              fecha: t.fecha,
              horas: t.horas,
            });
          }

          const nuevoJSON = JSON.stringify(bloqueosActuales);

          // 3️⃣ Guardar todo actualizado
          conexion.query(SQL_UPDATE, [nuevoJSON, t.id], (err2, resultado) => {
            if (err2) return reject(err2);
            resolve(resultado.affectedRows);
          });
        });
      });
    });

    Promise.all(promises)
      .then((respuestas) =>
        res.json({
          success: true,
          message: "Horas bloqueadas actualizadas correctamente",
          updated: respuestas.reduce((a, b) => a + b, 0),
        })
      )
      .catch((err) => {
        console.error("ERROR:", err);
        res.status(500).json({ success: false, error: err });
      });
  });
  app.post("/api/upload", upload.single("foto"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No se subió ninguna imagen",
        });
      }

      console.log("Archivo recibido:", req.file);
      console.log("Body recibido:", req.body);

      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Falta el userId",
        });
      }

      const url = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;

      // Buscar tipo de cuenta del usuario
      const [rows] = await conexion
        .promise()
        .query("SELECT tipoCuenta FROM usuarios WHERE id = ?", [userId]);

      console.log("Resultado SELECT tipoCuenta:", rows);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      const tipo = rows[0].tipoCuenta;

      try {
        let result;
        if (tipo === 0) {
          // PROVEEDOR
          [result] = await conexion
            .promise()
            .query("UPDATE proveedores SET fotoPerfil = ? WHERE id = ?", [
              url,
              userId,
            ]);
          console.log("UPDATE proveedores:", result);
        } else {
          // USUARIO NORMAL
          [result] = await conexion
            .promise()
            .query("UPDATE usuarios SET fotoPerfil = ? WHERE id = ?", [
              url,
              userId,
            ]);
          console.log("UPDATE usuarios:", result);
        }

        if (result.affectedRows === 1) {
          console.warn(
            "⚠️ Ninguna fila actualizada, chequeá el userId y la tabla"
          );
        }
      } catch (err) {
        console.error("Error ejecutando UPDATE:", err);
        return res.status(500).json({
          success: false,
          message: "Error al actualizar la base de datos",
          error: err,
        });
      }

      res.json({
        success: true,
        message: "Imagen subida y guardada correctamente",
        url,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      res.status(500).json({
        success: false,
        message: "Error interno al subir imagen",
        error,
      });
    }
  });
}
