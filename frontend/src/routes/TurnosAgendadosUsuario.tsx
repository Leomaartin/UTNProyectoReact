// src/routes/TurnosAgendadosUsuario.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import "./css/TurnosAgendados.css";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";

function TurnosAgendadosUsuario() {
  const [user] = useLocalStorage("user", null);
  const [turnosAgendados, setTurnosAgendados] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cancelar turno
  const handleSubmit = async (
    proveedorid,
    id_turno,
    proveedorGmail,
    proveedorNombre,
    horas,
    fecha
  ) => {
    if (!user?.id) return;

    try {
      const res = await axios.post("https://api-node-turnos.onrender.com/api/cancelarTurno", {
        proveedorid,
        usuarioid: user.id,
        id_turno,
        proveedorGmail,
        proveedorNombre,
      });

      if (res.data.success) {
        toast.success("Turno cancelado correctamente.");
        setTurnosAgendados((prev) =>
          prev.filter((turno) => turno.id_turno !== id_turno)
        );

        
      } else {
        toast.error(res.data.message || "No se pudo cancelar el turno.");
      }
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      toast.error("Error en el servidor.");
    }
  };

  const VerPerfil = (id) => {
    navigate(`/verperfilproveedor/${id}`);
  };
  
  // Cargar turnos agendados
  useEffect(() => {
    if (!user?.id) return;

    const fetchTurnos = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://api-node-turnos.onrender.com/api/turnosDelUsuario/${user.id}`,
          { params: { tipoCuenta: user.tipoCuenta } }
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
                    <h3>{turno.proveedorNombre || "Proveedor Desconocido"}</h3>

                    <button
                      onClick={() => VerPerfil(turno.proveedorid)}
                      className="ir-perfil-btn"
                    >
                      Ver perfil
                    </button>
                  </div>

                  <p className="profesional-nombre">
                    Usuario: <strong>{turno.nombre || "N/A"}</strong>
                  </p>

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
                      handleSubmit(
                        turno.proveedorid,
                        turno.id_turno,
                        turno.proveedorGmail,
                        turno.proveedorNombre,
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

      <Footer />
    </main>
  );
}

export default TurnosAgendadosUsuario;
