import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import { useParams } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from "react-hot-toast";
import "./css/AgendarTurnos.css";

// --- FUNCIONES DE UTILIDAD (SIN CAMBIOS) ---

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
  if (partes.length < 3) return 0;
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

// --- COMPONENTE HORA (AJUSTADO PARA CLASES CSS) ---

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

  // Lógica para aplicar las clases CSS:
  const getClassState = () => {
    if (bloqueada) return "hora-blocked";
    if (agendar) return "hora-selected";
    return "hora-available";
  };

  const classNames = `hora-span ${getClassState()}`;

  return (
    <span onClick={toggleHora} className={classNames}>
      {hora}
    </span>
  );
}

// --- COMPONENTE ARRAY DE HORAS (SIN CAMBIOS) ---

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

// ========================================
// COMPONENTE PRINCIPAL: AGENDAR TURNO (SIN CAMBIOS)
// ========================================

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

function AgendarTurno() {
  const [turnos, setTurnos] = useState<TurnoData[]>([]);
  const [proveedorNombre, setProveedorNombre] = useState("Cargando...");
  const [proveedorGmail, setProveedorGmail] = useState("Cargando...");
  const [agendarTurnos, setAgendarTurnos] = useState<AgendarTurnoState>({});

  const { proveedorid } = useParams<{ proveedorid: string }>();
  const [user] = useLocalStorage("user", null);

  // --- EFECTO: TRAER TURNOS DISPONIBLES ---
  useEffect(() => {
    if (!proveedorid) return;
    const fetchTurnos = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/tusTurnos/${proveedorid}`
        );
        setTurnos(res.data || []);
        console.log(res.data);
      } catch (err) {
        console.error("Error al traer turnos:", err);
        toast.error("Error al cargar la disponibilidad.");
        setTurnos([]);
      }
    };
    fetchTurnos();
  }, [proveedorid]);

  // --- EFECTO: TRAER NOMBRE DEL PROVEEDOR ---
  useEffect(() => {
    if (!proveedorid) return;
    const fetchProveedor = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/proveedor/${proveedorid}`
        );

        setProveedorNombre(
          res.data.proveedor?.nombre || "Proveedor desconocido"
        );
        setProveedorGmail(res.data.proveedor?.gmail);
        console.log("Proveedor:", res.data.proveedor);
      } catch (err) {
        console.error("Error al traer proveedor:", err);
        setProveedorNombre("Error al cargar nombre");
      }
    };
    fetchProveedor();
  }, [proveedorid]);

  // --- LÓGICA: TOGGLE HORA (Selección/Deselección) ---
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

  // --- LÓGICA: SUBMIT (Agendar) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const turnosSeleccionados = Object.values(agendarTurnos).flatMap(
      (t) => t.horas
    ).length;

    if (turnosSeleccionados === 0) {
      toast("Selecciona al menos un turno para agendar.", { icon: "⚠️" });
      return;
    }

    if (!user) return toast.error("Debes iniciar sesión para agendar turnos.");

    try {
      const turnosParaEnviar = Object.entries(agendarTurnos).map(
        ([id, data]) => ({
          id_turno: generarIdTurno(),
          nombre: user.nombre,
          userid: user.id,
          usergmail: user.gmail,
          proveedorNombre,
          proveedorid,
          proveedorGmail,
          fecha: data.fecha,
          horas: data.horas,
        })
      );

      const turnosParaBloquear = Object.entries(agendarTurnos).map(
        ([id, data]) => ({
          id,
          fecha: data.fecha,
          horas: data.horas,
        })
      );

      // 1️⃣ Bloquear horas
      await axios.post("http://localhost:3333/api/horasBloqueadas", {
        turnos: turnosParaBloquear,
      });

      // 2️⃣ Guardar turno al proveedor
      await axios.post("http://localhost:3333/api/turnoAgendado", {
        proveedorid,
        turnos: turnosParaEnviar,
      });

      // 3️⃣ Guardar turno al usuario
      await axios.post("http://localhost:3333/api/turnoGuardado", {
        usuarioid: user.id,
        turnos: turnosParaEnviar,
      });

      // Formatear fecha igual que en la card
      const fechaFormateada = new Date(
        turnosParaEnviar[0].fecha
      ).toLocaleDateString();

      // 4️⃣ ENVIAR CORREO AL PROVEEDOR
      await axios.post("http://localhost:3333/api/enviar-mail", {
        email: proveedorGmail,
        asunto: "Nuevo turno agendado",
        mensaje: `
        Hola ${proveedorNombre},<br><br>
        El usuario <b>${user.nombre}</b> ha agendado un turno contigo.<br>
        <b>Fecha:</b> ${fechaFormateada}<br>
        <b>Horas:</b> ${turnosParaEnviar
          .flatMap((t) => t.horas)
          .join(", ")}<br><br>
        Saludos,<br>
        Tu sistema de turnos.
      `,
      });

      // 5️⃣ ENVIAR CORREO AL USUARIO
      await axios.post("http://localhost:3333/api/enviar-mail", {
        email: user.gmail,
        asunto: "Nuevo turno agendado",
        mensaje: `
        Hola ${user.nombre},<br><br>
        Has agendado un turno con: <b>${proveedorNombre}</b>.<br>
        <b>Fecha:</b> ${fechaFormateada}<br>
        <b>Horas:</b> ${turnosParaEnviar
          .flatMap((t) => t.horas)
          .join(", ")}<br><br>
        Saludos,<br>
        Tu sistema de turnos.
      `,
      });

      toast.success(
        `${turnosSeleccionados} turno(s) agendado(s) correctamente.`
      );

      setAgendarTurnos({});

      // 🔄 Recargar turnos actualizados
      const res = await axios.get(
        `http://localhost:3333/api/tusTurnos/${proveedorid}`
      );
      setTurnos(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error al agendar. Inténtalo de nuevo.");
    }
  };

  // --- RENDERIZADO ---
  return (
    <main>
      <header>
        <Toaster position="top-right" />
        <Navbar />
      </header>

      <div className="turnos-proveedor-content">
        <h3 className="titulo-turnos">
          📅 Turnos disponibles con {proveedorNombre}
        </h3>

        <ul className="turnos-list">
          {turnos.length === 0 ? (
            <p className="text-center text-muted">
              No hay turnos disponibles para este proveedor.
            </p>
          ) : (
            turnos.map((t) => {
              let turnosBloqueados: { fecha: string; horas: string[] }[] = [];

              if (
                typeof t.turnos_bloqueados === "string" &&
                t.turnos_bloqueados
              ) {
                try {
                  turnosBloqueados = JSON.parse(t.turnos_bloqueados);
                } catch (e) {
                  console.error("Error al parsear turnos bloqueados:", e);
                }
              }

              const horasBloqueadas = turnosBloqueados
                .filter((b) => b.fecha === t.fecha)
                .flatMap((b) => b.horas);

              const horasSeleccionadas = agendarTurnos[t.id]?.horas || [];

              return (
                <li key={t.id} className="turno-item">
                  <div className="turno-header">
                    <strong>{formatFecha(t.fecha)}</strong>
                    <p className="titulo-turnos">{t.titulo}</p>
                  </div>
                  <p className="text-muted">ID de disponibilidad: {t.id}</p>

                  <ArrayHoras
                    horaInicio={t.hora_inicio}
                    horaFin={t.hora_fin}
                    horasBloqueadas={horasBloqueadas}
                    horasSeleccionadas={horasSeleccionadas}
                    onToggleHora={(hora, selected) =>
                      handleToggleHora(t.id, t.fecha, hora, selected)
                    }
                  />
                  {/* Se puede añadir un botón de eliminar fila aquí si es necesario */}
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
            Agendar{" "}
            {Object.values(agendarTurnos).flatMap((t) => t.horas).length || ""}{" "}
            Turno(s)
          </button>
        )}
      </div>
    </main>
  );
}

export default AgendarTurno;
