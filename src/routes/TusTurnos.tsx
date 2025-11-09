import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import "@fortawesome/fontawesome-free/css/all.min.css";

function calcularHora(time: number) {
  const hr = Math.floor(time / 3600);
  const min = Math.floor((time % 3600) / 60);
  const seg = time % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(hr)}:${pad(min)}:${pad(seg)}`;
}

function calcularNumero(hora: string) {
  const [hr, min, seg] = hora.split(":").map(Number);
  return hr * 3600 + min * 60 + seg;
}

function Hora({ hora }: { hora: string }) {
  const [borrada, setBorrada] = useState(false);

  const toggleBorradoHora = () => {
    setBorrada(!borrada);
  };

  return (
    <span
      onClick={toggleBorradoHora}
      style={{
        backgroundColor: borrada ? "#f8d7da" : "#f0f0f0",
        color: borrada ? "#721c24" : "inherit",
        padding: "0.5rem 1rem",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        fontWeight: 500,
        cursor: "pointer",
        textDecoration: borrada ? "line-through" : "none",
        transition: "0.2s",
      }}
    >
      {hora}
    </span>
  );
}

function ArrayHoras({
  horaInicio,
  horaFin,
}: {
  horaInicio: string;
  horaFin: string;
}) {
  const inicio = calcularNumero(horaInicio);
  const fin = calcularNumero(horaFin);

  const horas: string[] = [];
  for (let h = inicio; h <= fin; h += 3600) {
    horas.push(calcularHora(h));
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        margin: "2% 0",
      }}
    >
      {horas.map((hora, i) => (
        <Hora key={i} hora={hora} />
      ))}
    </div>
  );
}

function TusTurnos() {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user] = useLocalStorage("user", null);

  const proveedorId = user?.id;

  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/tusTurnos/${proveedorId}`
        );
        setTurnos(res.data);
      } catch (err) {
        console.error("Error al traer turnos:", err);
        setError("No se pudieron cargar los turnos");
      }
    };

    fetchTurnos();
  }, [proveedorId]);

  const borrarTurno = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3333/api/borrarTurno/${id}`);
      setTurnos(turnos.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error al borrar turno:", err);
      setError("No se pudo borrar el turno");
    }
  };

  return (
    <main>
      <header>
        <Navbar />
      </header>
      <div className="container mt-4">
        <h3>Tus turnos</h3>
        {error && <p className="text-danger">{error}</p>}
        <ul className="list-group">
          {turnos.map((t) => (
            <li
              key={t.id}
              className="list-group-item"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{new Date(t.fecha).toLocaleDateString("es-AR")}</strong>
                <ArrayHoras horaInicio={t.hora_inicio} horaFin={t.hora_fin} />
              </div>
              <i
                className="fa-regular fa-trash-can"
                style={{ cursor: "pointer", color: "#dc3545" }}
                onClick={() => borrarTurno(t.id)}
              ></i>
            </li>
          ))}
        </ul>
        <button
          type="submit"
          className="btn btn-secondary"
          style={{
            margin: "2%",
            marginLeft: "40%",
          }}
        >
          Publicar turnos
        </button>
      </div>
    </main>
  );
}

export default TusTurnos;
