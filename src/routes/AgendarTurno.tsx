import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import { useParams } from "react-router-dom";
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

// ✅ Generador de ID único (sin librerías)
function generarIdTurno() {
  return "turno_" + crypto.randomUUID();
}

function Hora({
  hora,
  onToggle,
  selected = false,
}: {
  hora: string;
  onToggle: (hora: string, selected: boolean) => void;
  selected?: boolean;
}) {
  const [agendar, setAgendar] = useState(selected);

  useEffect(() => {
    setAgendar(selected);
  }, [selected]);

  const toggleBorradoHora = () => {
    const nuevoEstado = !agendar;
    setAgendar(nuevoEstado);
    onToggle(hora, nuevoEstado);
  };

  return (
    <span
      onClick={toggleBorradoHora}
      style={{
        backgroundColor: agendar ? "#aef5a8ff" : "#f0f0f0",
        color: agendar ? "#27b13eff" : "inherit",
        padding: "0.5rem 1rem",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        fontWeight: 500,
        cursor: "pointer",
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
  onToggleHora,
  horasSeleccionadas = [],
}: {
  horaInicio: string;
  horaFin: string;
  onToggleHora: (hora: string, selected: boolean) => void;
  horasSeleccionadas?: string[];
}) {
  const inicio = calcularNumero(horaInicio);
  const fin = calcularNumero(horaFin);
  const horas: string[] = [];
  for (let h = inicio; h <= fin; h += 3600) horas.push(calcularHora(h));

  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", gap: "1rem", margin: "2% 0" }}
    >
      {horas.map((hora, i) => (
        <Hora
          key={i}
          hora={hora}
          onToggle={onToggleHora}
          selected={horasSeleccionadas.includes(hora)}
        />
      ))}
    </div>
  );
}

function AgendarTurno() {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [proveedorNombre, setProveedorNombre] = useState("");
  const [agendarTurnosPorFecha, setAgendarTurnosPorFecha] = useState<{
    [fecha: string]: string[];
  }>({});
  const { proveedorid } = useParams<{ proveedorid: string }>();
  const [user] = useLocalStorage("user", null);

  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/proveedor/${proveedorid}`
        );
        setProveedorNombre(res.data.nombre || "Proveedor desconocido");
      } catch (err) {
        console.error("Error al traer el proveedor:", err);
      }
    };

    fetchProveedor();
  }, [proveedorid]);

  const handleToggleHora = (fecha: string, hora: string, selected: boolean) => {
    setAgendarTurnosPorFecha((prev) => ({
      ...prev,
      [fecha]: selected
        ? [...(prev[fecha] || []), hora]
        : (prev[fecha] || []).filter((h) => h !== hora),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("No hay usuario logueado");

    try {
      // 🆕 Agregamos un id_turno único a cada registro
      const turnosParaEnviar = Object.entries(agendarTurnosPorFecha).map(
        ([fecha, horas]) => ({
          id_turno: generarIdTurno(),
          nombre: user.nombre,
          proveedorNombre,
          proveedorid,
          fecha,
          horas,
        })
      );

      // ✅ Enviar a proveedores
      await axios.post("http://localhost:3333/api/turnoAgendado", {
        proveedorid,
        turnos: turnosParaEnviar,
      });

      // ✅ Enviar a usuarios
      await axios.post("http://localhost:3333/api/turnoGuardado", {
        usuarioid: user.id,
        turnos: turnosParaEnviar,
      });

      alert("Turnos agendados correctamente");
      setAgendarTurnosPorFecha({});
    } catch (error) {
      console.error(error);
      alert("Hubo un problema con el servidor");
    }
  };

  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/tusTurnos/${proveedorid}`
        );
        setTurnos(res.data);
      } catch (err) {
        console.error("Error al traer turnos:", err);
        setError("No se pudieron cargar los turnos");
      }
    };
    fetchTurnos();
  }, [proveedorid]);

  return (
    <main>
      <header>
        <Navbar />
      </header>
      <div className="container mt-4">
        <h3>Turnos disponibles</h3>
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
                <strong>
                  {new Date(t.fecha).toLocaleDateString("es-AR")} -{" "}
                  {t.proveedor}
                </strong>
                <ArrayHoras
                  horaInicio={t.hora_inicio}
                  horaFin={t.hora_fin}
                  onToggleHora={(hora, selected) =>
                    handleToggleHora(t.fecha, hora, selected)
                  }
                  horasSeleccionadas={[]}
                />
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={handleSubmit}
          className="btn btn-secondary"
          style={{ margin: "2%", marginLeft: "40%" }}
        >
          Agendar turnos
        </button>
      </div>
    </main>
  );
}

export default AgendarTurno;
