import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import "./TurnosAgendados.css";

function TurnosAgendadosUsuario() {
  const [user] = useLocalStorage("user", null);
  const [turnosAgendados, setTurnosAgendados] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (proveedorid, id) => {
    // 👈 ahora recibe el id del turno
    if (!user?.id) return;

    try {
      const res = await axios.delete(
        "http://localhost:3333/api/cancelarTurno",
        {
          data: {
            proveedorid,
            usuarioid: user.id,
            id, // 👈 se envía el id del turno
          },
        }
      );

      if (res.data.success) {
        alert("Turno cancelado correctamente.");

        // Actualizar lista sin recargar
        setTurnosAgendados((prevTurnos) =>
          prevTurnos.filter((turno) => turno.id !== id)
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
            {turnosAgendados.map((turno, index) => (
              <div key={index} className="turno-card">
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
                  onClick={() => handleSubmit(turno.proveedorid, turno.id)} // 👈 usamos el id
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

export default TurnosAgendadosUsuario;
