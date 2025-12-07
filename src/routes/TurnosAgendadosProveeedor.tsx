// src/routes/TurnosAgendadosProveedor.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import "./css/TurnosAgendados.css";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";

function TurnosAgendadosProveedor() {
  const [user] = useLocalStorage("user", null); // proveedor
  const [turnosAgendados, setTurnosAgendados] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cancelar turno desde el proveedor
  // ... (handleCancelarTurno se mantiene sin cambios)
  const handleCancelarTurno = async (
    id_turno,
    usuarioid,
    usergmail,
    usuarioNombre,
    horas,
    fecha
  ) => {
    if (!user?.id) return;

    try {
      // Cancelamos turno en la base
      const res = await axios.post("http://localhost:3333/api/cancelarTurno", {
        proveedorid: user.id,
        usuarioid,
        id_turno,
      });

      if (!res.data.success) {
        toast.error(res.data.message || "No se pudo cancelar el turno.");
        return;
      }

      // Actualizamos la lista local
      setTurnosAgendados((prev) =>
        prev.filter((turno) => turno.id_turno !== id_turno)
      );

      toast.success("Turno cancelado correctamente.");

      const horasTurno = Array.isArray(horas) ? horas : [horas];
      const fechaFormateada = new Date(fecha).toLocaleDateString();

      // Correo al usuario
      await axios.post("http://localhost:3333/api/enviar-mail", {
        email: usergmail,
        asunto: "Turno cancelado",
        mensaje: `
          Hola ${usuarioNombre},<br><br>
          El proveedor <b>${user.nombre}</b> ha CANCELADO tu turno.<br>
          <b>Fecha:</b> ${fechaFormateada}<br>
          <b>Horas:</b> ${horasTurno.join(", ")}<br><br>
          Saludos,<br>
          Tu sistema de turnos.
        `,
      });

      // Correo al proveedor
      await axios.post("http://localhost:3333/api/enviar-mail", {
        email: user.gmail,
        asunto: "Turno cancelado",
        mensaje: `
          Hola ${user.nombre},<br><br>
          Has CANCELADO el turno con el usuario <b>${usuarioNombre}</b>.<br>
          <b>Fecha:</b> ${fechaFormateada}<br>
          <b>Horas:</b> ${horasTurno.join(", ")}<br><br>
          Saludos,<br>
          Tu sistema de turnos.
        `,
      });
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      toast.error("Error en el servidor.");
    }
  };

  const VerPerfilUsuario = (id) => navigate(`/verperfilusuario/${id}`);

  // Cargar turnos del proveedor
  // ... (useEffect se mantiene sin cambios)
  useEffect(() => {
    if (!user?.id) return;

    const fetchTurnos = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:3333/api/turnosDelUsuario/${user.id}`,
          { params: { tipoCuenta: user.tipoCuenta } } // 1 para proveedor
        );

        setTurnosAgendados(res.data?.turnosAgendados || []);
        console.table(res.data?.turnosAgendados);
      } catch (err) {
        console.error("Error al traer turnos agendados:", err);
        toast.error("No se pudieron cargar los turnos.");
      } finally {
        setLoading(false);
      }
    };

    fetchTurnos();
  }, [user?.id, user?.tipoCuenta]);

  return (
    // 1. Contenedor Principal: Clase para aplicar Flexbox Vertical y 100vh
    <main className="main-app-container">
      <header>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "1.1rem",
              padding: "14px 18px",
              borderRadius: "10px",
            },
            error: { style: { background: "#dc3545", color: "#fff" } },
            success: { style: { background: "#28a745", color: "#fff" } },
          }}
        />
        <Navbar />
      </header>

      {/* 2. CONTENEDOR INTERMEDIO QUE CRECE: Aplica flex-grow: 1 en el CSS */}
      <div className="content-wrapper">
        {/* Flechas de navegación (incluidas en el content-wrapper) */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            gap: "8px",
            zIndex: 1000,
            left: "7%",
            marginTop: "10px",
          }}
        >
          <i
            className="fa-solid fa-backward"
            onClick={() => navigate(-1)}
            style={{ cursor: "pointer" }}
          ></i>
          <i
            className="fa-solid fa-forward"
            onClick={() => navigate(1)}
            style={{ cursor: "pointer" }}
          ></i>
        </div>

        <section className="turnos-container">
          <h2>Turnos Agendados</h2>

          {loading && <p className="loading-message">Cargando...</p>}

          {!loading && turnosAgendados.length === 0 && (
            <p className="empty-message">No hay turnos agendados.</p>
          )}

          {!loading && turnosAgendados.length > 0 && (
            <div className="turnos-list">
              {turnosAgendados.map((turno) => (
                <div key={turno.id_turno} className="turno-card">
                  <div className="turno-header">
                    <h3>{turno.nombre || "Usuario Desconocido"}</h3>

                    <button
                      onClick={() => VerPerfilUsuario(turno.userid)}
                      className="ir-perfil-btn"
                    >
                      Ver perfil
                    </button>
                  </div>

                  <div className="info-row">
                    <strong>Fecha:</strong>
                    <span>{new Date(turno.fecha).toLocaleDateString()}</span>
                  </div>

                  <div className="horas-wrapper">
                    <p className="horas-label">
                      <strong>Horas reservadas:</strong>
                    </p>
                    {Array.isArray(turno.horas) && turno.horas.length > 0 ? (
                      <ul className="horas-list">
                        {turno.horas.map((hora, i) => (
                          <li key={i} className="hora-item">
                            {hora}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Sin horas asignadas</p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      handleCancelarTurno(
                        turno.id_turno,
                        turno.userid,
                        turno.usergmail,
                        turno.nombre,
                        turno.horas,
                        turno.fecha
                      )
                    }
                    className="cancelar-turno"
                  >
                    Cancelar turno
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {/* FIN: content-wrapper */}

      {/* 3. Footer: Este será empujado hacia el final de la ventana */}
      <Footer />
    </main>
  );
}

export default TurnosAgendadosProveedor;
