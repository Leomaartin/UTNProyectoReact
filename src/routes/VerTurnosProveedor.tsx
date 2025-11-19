import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import { useParams } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from "react-hot-toast";
import "./css/VerTurnosProveedor.css";

// ================= UTILIDADES =================

function calcularHora(time: number): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const hr = Math.floor(time / 3600);
  const min = Math.floor((time % 3600) / 60);
  const seg = time % 60;
  return `${pad(hr)}:${pad(min)}:${pad(seg)}`;
}

function calcularNumero(hora: string): number {
  if (!hora) return 0;
  const partes = hora.split(":").map(Number);
  if (partes.length < 2) return 0;
  const [hr, min] = partes;
  return hr * 3600 + min * 60;
}

function generarIdTurno(): string {
  return "turno_" + crypto.randomUUID();
}

function formatFecha(fecha: string): string {
  if (!fecha) return "Fecha inválida";
  const d = new Date(fecha);
  return isNaN(d.getTime())
    ? "Fecha inválida"
    : d.toLocaleDateString("es-AR", { timeZone: "UTC" });
}

// ================= COMPONENTE HORA =================

interface HoraProps {
  hora: string;
  onToggle: (hora: string, selected: boolean) => void;
  selected?: boolean;
  bloqueada?: boolean;
}

function Hora({
  hora,
  onToggle,
  selected = false,
  bloqueada = false,
}: HoraProps) {
  const [agendar, setAgendar] = useState(selected);

  useEffect(() => {
    setAgendar(selected);
  }, [selected]);

  const toggleHora = () => {
    if (bloqueada) return;
    const nuevoEstado = !agendar;
    setAgendar(nuevoEstado);
    onToggle(hora, nuevoEstado);
  };

  const getClassState = () => {
    if (bloqueada) return "hora-blocked";
    if (agendar) return "hora-selected"; // verde al seleccionar
    return "hora-available";
  };

  return (
    <span onClick={toggleHora} className={`hora-span ${getClassState()}`}>
      {hora}
    </span>
  );
}

// ================= COMPONENTE ARRAY HORAS =================

interface ArrayHorasProps {
  horaInicio: string;
  horaFin: string;
  onToggleHora: (hora: string, selected: boolean) => void;
  horasSeleccionadas?: string[];
  horasBloqueadas?: string[];
}

function ArrayHoras({
  horaInicio,
  horaFin,
  onToggleHora,
  horasSeleccionadas = [],
  horasBloqueadas = [],
}: ArrayHorasProps) {
  const inicio = calcularNumero(horaInicio);
  const fin = calcularNumero(horaFin);
  const horas: string[] = [];

  for (let h = inicio; h <= fin; h += 3600) horas.push(calcularHora(h));

  return (
    <div className="horas-grid">
      {horas.map((hora, i) => (
        <Hora
          key={i}
          hora={hora}
          onToggle={onToggleHora}
          selected={horasSeleccionadas.includes(hora)}
          bloqueada={horasBloqueadas.includes(hora)}
        />
      ))}
    </div>
  );
}

// ================= COMPONENTE PRINCIPAL =================

interface TurnoData {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  turnos_bloqueados: string | null;
}

interface AgendarTurnoState {
  [id: string]: { fecha: string; horas: string[] };
}

function VerTurnosProveedor() {
  const [turnos, setTurnos] = useState<TurnoData[]>([]);
  const [proveedorNombre, setProveedorNombre] = useState("Cargando...");
  const [agendarTurnos, setAgendarTurnos] = useState<AgendarTurnoState>({});

  const { proveedorid } = useParams<{ proveedorid: string }>();
  const [user] = useLocalStorage("user", null);

  // --- Traer turnos ---
  useEffect(() => {
    if (!proveedorid) return;
    const fetchTurnos = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/tusTurnos/${proveedorid}`
        );
        setTurnos(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar los turnos.");
      }
    };
    fetchTurnos();
  }, [proveedorid]);

  // --- Traer nombre proveedor ---
  useEffect(() => {
    if (!proveedorid) return;
    const fetchProveedor = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/proveedor/${proveedorid}`
        );
        setProveedorNombre(res.data.nombre || "Proveedor desconocido");
      } catch (err) {
        console.error(err);
        setProveedorNombre("Error al cargar nombre");
      }
    };
    fetchProveedor();
  }, [proveedorid]);

  // --- Toggle hora ---
  const handleToggleHora = (
    id: string,
    fecha: string,
    hora: string,
    selected: boolean
  ) => {
    setAgendarTurnos((prev) => {
      const previo = prev[id] || { fecha, horas: [] };
      let nuevasHoras;

      if (selected) {
        nuevasHoras = previo.horas.includes(hora)
          ? previo.horas
          : [...previo.horas, hora];
      } else {
        nuevasHoras = previo.horas.filter((h) => h !== hora);
      }

      if (nuevasHoras.length === 0) {
        const { [id]: omitido, ...resto } = prev;
        return resto;
      }

      return {
        ...prev,
        [id]: { fecha, horas: nuevasHoras },
      };
    });
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return toast.error("Debes iniciar sesión para agendar turnos.");

    const turnosSeleccionados = Object.values(agendarTurnos).flatMap(
      (t) => t.horas
    ).length;
    if (turnosSeleccionados === 0)
      return toast("Selecciona al menos un turno.", { icon: "⚠️" });

    try {
      // Bloquear turnos
      await axios.post("http://localhost:3333/api/horasBloqueadas", {
        turnos: Object.entries(agendarTurnos).map(([id, data]) => ({
          id,
          fecha: data.fecha,
          horas: data.horas,
        })),
      });

      // Agendar turnos
      await axios.post("http://localhost:3333/api/turnoAgendado", {
        proveedorid,
        turnos: Object.entries(agendarTurnos).map(([id, data]) => ({
          id_turno: generarIdTurno(),
          nombre: user.nombre,
          userid: user.id,
          proveedorNombre,
          proveedorid,
          fecha: data.fecha,
          horas: data.horas,
        })),
      });

      toast.success(`${turnosSeleccionados} turno(s) agendado(s).`);
      setAgendarTurnos({});
      // Recargar turnos
      const res = await axios.get(
        `http://localhost:3333/api/tusTurnos/${proveedorid}`
      );
      setTurnos(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error al agendar. Inténtalo de nuevo.");
    }
  };

  return (
    <main className="turnos-proveedor-container">
      <header>
        <Toaster position="top-right" />
        <Navbar />
      </header>

      <div className="turnos-proveedor-content">
        <h3>Turnos disponibles - {proveedorNombre}</h3>

        <ul className="turnos-list">
          {turnos.length === 0 ? (
            <p className="text-center text-muted">No hay turnos disponibles.</p>
          ) : (
            turnos.map((t) => {
              let turnosBloqueados: { fecha: string; horas: string[] }[] = [];

              if (t.turnos_bloqueados) {
                try {
                  turnosBloqueados =
                    typeof t.turnos_bloqueados === "string"
                      ? JSON.parse(t.turnos_bloqueados)
                      : t.turnos_bloqueados;
                } catch {}
              }

              const horasBloqueadas = turnosBloqueados
                .filter((b) => b.fecha === t.fecha)
                .flatMap((b) => b.horas);

              const horasSeleccionadas = agendarTurnos[t.id]?.horas || [];

              return (
                <li key={t.id} className="turno-item">
                  <div className="turno-header">
                    <strong>{formatFecha(t.fecha)}</strong>
                  </div>

                  <ArrayHoras
                    horaInicio={t.hora_inicio}
                    horaFin={t.hora_fin}
                    horasBloqueadas={horasBloqueadas}
                    horasSeleccionadas={horasSeleccionadas}
                    onToggleHora={(hora, selected) =>
                      handleToggleHora(t.id, t.fecha, hora, selected)
                    }
                  />
                </li>
              );
            })
          )}
        </ul>

        {turnos.length > 0 && (
          <button
            onClick={handleSubmit}
            className="btn-action-submit"
            disabled={Object.keys(agendarTurnos).length === 0}
          >
            Borrar {Object.values(agendarTurnos).flatMap((t) => t.horas).length}{" "}
            Turno(s)
          </button>
        )}
      </div>
    </main>
  );
}

export default VerTurnosProveedor;
