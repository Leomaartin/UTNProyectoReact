import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import "./css/TurnosAgendados.css";
import toast, { Toaster } from "react-hot-toast";
function TurnosAgendadosUsuario() {
  const [user] = useLocalStorage("user", null);
  const [turnosAgendados, setTurnosAgendados] = useState([]);
  const [loading, setLoading] = useState(false);

  // ... (handleSubmit y useEffect para la carga de datos sin cambios) ...
  const handleSubmit = async (proveedorid, id) => {
    if (!user?.id) return;
    console.log({
      proveedorid,
      usuarioid: user.id,
      id,
    });
    try {
      const res = await axios.post("http://localhost:3333/api/cancelarTurno", {
        proveedorid,
        usuarioid: user.id,
        id_turno: id,
      });

      if (res.data.success) {
        toast.success("Turno cancelado correctamente.");

        setTurnosAgendados((prevTurnos) =>
          prevTurnos.filter((turno) => turno.id_turno !== id)
        );
      } else {
        toast.error(res.data.message || "No se pudo cancelar el turno.");
      }
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      toast.error("Error en el servidor.");
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchTurnosAgendados = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:3333/api/turnosDelUsuario/${user.id}`,
          {
            params: { tipoCuenta: user.tipoCuenta },
          }
        );

        if (res.data?.turnosAgendados) {
          setTurnosAgendados(res.data.turnosAgendados);
        } else {
          setTurnosAgendados([]);
        }
      } catch (err) {
        console.error("Error al traer turnos agendados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTurnosAgendados();
  }, [user?.id, user?.tipoCuenta]);
  // ... (Fin de handleSubmit y useEffect) ...

  return (
    <main className="mainTusturnos">
      <header>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "1.1rem",
              padding: "14px 18px",
              borderRadius: "10px",
            },
            error: {
              style: {
                background: "#dc3545", // Rojo de peligro
                color: "#fff",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#dc3545",
              },
            },
            success: {
              // Estilo para éxito
              style: {
                background: "#28a745", // Verde de éxito
                color: "#fff",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#28a745",
              },
            },
          }}
        />
        <Navbar />
      </header>

      <section className="turnos-container">
        <h2>Turnos Agendados</h2>

        {loading && <p className="loading-message">Cargando...</p>}

        {!loading && turnosAgendados.length === 0 && (
          <p className="empty-message">No hay turnos agendados.</p>
        )}

        {!loading && turnosAgendados.length > 0 && (
          <div className="turnos-list">
            {turnosAgendados.map((turno, index) => (
              <div key={index} className="turno-card">
                <h3>{turno.proveedorNombre || "Proveedor Desconocido"}</h3>
                <p className="profesional-nombre">
                  Usuario: **{turno.nombre || "N/A"}**
                </p>

                <div className="info-row">
                  <strong>Fecha:</strong>
                  {new Date(turno.fecha).toLocaleDateString()}
                </div>

                <div className="horas-wrapper">
                  <p className="info-row" style={{ marginBottom: "5px" }}>
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
                    handleSubmit(turno.proveedorid, turno.id_turno)
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
    </main>
  );
}

export default TurnosAgendadosUsuario;
