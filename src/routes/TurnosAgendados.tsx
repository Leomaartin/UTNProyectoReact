import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import "./TurnosAgendados.css";

function TurnosAgendados() {
  const [user] = useLocalStorage("user", null);
  const [turnosAgendados, setTurnosAgendados] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (turnoId) => {
    if (!turnoId) return;

    try {
      const res = await axios.delete(
        `http://localhost:3333/api/cancelarTurno/${turnoId}`
      );

      if (res.data.success) {
        alert("Turno cancelado correctamente.");

        // Eliminar el turno cancelado del estado local
        setTurnosAgendados((prevTurnos) =>
          prevTurnos.filter((turno) => turno.id !== turnoId)
        );
      } else {
        alert(res.data.message || "No se pudo cancelar el turno.");
      }
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      alert("Error en el servidor.");
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchTurnosAgendados = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:3333/api/turnosAgendadosProveedor/${user.id}`
        );

        if (res.data?.turnosAgendados) {
          setTurnosAgendados(res.data.turnosAgendados);
        }
      } catch (err) {
        console.error("Error al traer turnos agendados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTurnosAgendados();
  }, [user]);

  return (
    <main>
      <header>
        <Navbar />
      </header>

      <section className="turnos-container">
        <h2>Turnos Agendados</h2>

        {loading && <p>Cargando...</p>}

        {!loading && turnosAgendados.length === 0 && (
          <p>No hay turnos agendados.</p>
        )}

        {!loading && turnosAgendados.length > 0 && (
          <div className="turnos-list">
            {turnosAgendados.map((turno) => (
              <div key={turno.id} className="turno-card">
                <h3>{turno.proveedorNombre}</h3>
                <h6>{turno.nombre}</h6>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(turno.fecha).toLocaleDateString()}
                </p>

                <p>
                  <strong>Horas:</strong>
                </p>
                {Array.isArray(turno.horas) && turno.horas.length > 0 ? (
                  <ul>
                    {turno.horas.map((hora, i) => (
                      <li key={i}>{hora}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Sin horas asignadas</p>
                )}
                <button
                  onClick={() => handleSubmit(turno.id)}
                  className="cancelar-turno"
                  style={{ margin: "2%", marginLeft: "40%" }}
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

export default TurnosAgendados;
