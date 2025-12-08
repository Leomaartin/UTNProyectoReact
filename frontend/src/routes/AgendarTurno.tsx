import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import { useParams } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from "react-hot-toast";
import Footer from "../Components/Footer";
import "./css/AgendarTurnos.css";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => setAgendar(selected), [selected]);

  const toggleHora = () => {
    if (bloqueada) return;
    const nuevoEstado = !agendar;
    setAgendar(nuevoEstado);
    onToggle(hora, nuevoEstado);
  };

  const getClassState = () =>
    bloqueada ? "hora-blocked" : agendar ? "hora-selected" : "hora-available";

  return (
    <span onClick={toggleHora} className={`hora-span ${getClassState()}`}>
      {hora}
    </span>
  );
}

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

interface TurnoData {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  turnos_bloqueados: string | null;
  sena?: number;
  valorsena?: number;
  titulo?: string;
}

interface AgendarTurnoState {
  [id: string]: { fecha: string; horas: string[] };
}

function AgendarTurno() {
  const [turnos, setTurnos] = useState<TurnoData[]>([]);
  const [proveedorNombre, setProveedorNombre] = useState("Cargando...");
  const [proveedorGmail, setProveedorGmail] = useState("Cargando...");
  const [agendarTurnos, setAgendarTurnos] = useState<AgendarTurnoState>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // 👈 LOADING AGREGADO

  const { proveedorid } = useParams<{ proveedorid: string }>();
  const [user] = useLocalStorage("user", null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!proveedorid) return;

    axios
      .get(`https://api-node-turnos.onrender.com/api/tusTurnos/${proveedorid}`)
      .then((res) => setTurnos(res.data || []))
      .catch(() => {
        toast.error("Error al cargar la disponibilidad.");
        setTurnos([]);
      });
  }, [proveedorid]);

  useEffect(() => {
    if (!proveedorid) return;

    axios
      .get(`https://api-node-turnos.onrender.com/api/proveedor/${proveedorid}`)
      .then((res) => {
        setProveedorNombre(
          res.data.proveedor?.nombre || "Proveedor desconocido"
        );
        setProveedorGmail(res.data.proveedor?.gmail);
      })
      .catch(() => setProveedorNombre("Error al cargar nombre"));
  }, [proveedorid]);

  const handleToggleHora = (
    id: string,
    fecha: string,
    hora: string,
    selected: boolean
  ) => {
    setAgendarTurnos((prev) => {
      const previo = prev[id] || { fecha, horas: [] };
      let nuevasHoras = selected
        ? [...previo.horas, hora]
        : previo.horas.filter((h) => h !== hora);

      if (nuevasHoras.length === 0) {
        const { [id]: omitido, ...resto } = prev;
        return resto;
      }

      return { ...prev, [id]: { fecha, horas: nuevasHoras } };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    toast.loading("Procesando turno... Esto puede tardar unos segundos.");

    const backendUrl =
      window.location.hostname === "localhost"
        ? "https://api-node-turnos.onrender.com"
        : "https://interbranchial-momentously-helga.ngrok-free.dev";

    if (!user) {
      toast.error("Debes iniciar sesión.");
      setIsSubmitting(false);
      toast.dismiss();
      return;
    }

    const turnosSeleccionados = Object.values(agendarTurnos).flatMap(
      (t) => t.horas
    ).length;

    if (turnosSeleccionados === 0) {
      toast.dismiss();
      toast("Selecciona al menos un turno.", { icon: "⚠️" });
      setIsSubmitting(false);
      return;
    }

    try {
      /* === PAGO CON SEÑA === */
      let montoTotalSeña = 0;
      Object.entries(agendarTurnos).forEach(([id, data]) => {
        const turno = turnos.find((t) => t.id === Number(id));
        if (turno?.sena === 1 && turno.valorsena)
          montoTotalSeña += Number(turno.valorsena) * data.horas.length;
      });

      if (montoTotalSeña > 0) {
        const prod = {
          titulo: `Seña turnos con ${proveedorNombre}`,
          valorsena: montoTotalSeña,
          cantidad: 1,
        };

        const res = await axios.post(`${backendUrl}/api/create-order`, {
          prod,
        });
        const { init_point } = res.data;

        toast.dismiss();
        setIsSubmitting(false);

        window.location.href = init_point;
        return;
      }

      /* === SI NO HAY SEÑA → AGENDAR NORMAL === */
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
        ([id, data]) => ({ id, fecha: data.fecha, horas: data.horas })
      );

      await axios.post(`${backendUrl}/api/horasBloqueadas`, {
        turnos: turnosParaBloquear,
      });

      await axios.post(`${backendUrl}/api/turnoAgendado`, {
        proveedorid,
        turnos: turnosParaEnviar,
      });

      await axios.post(`${backendUrl}/api/turnoGuardado`, {
        usuarioid: user.id,
        turnos: turnosParaEnviar,
      });

      const fechaFormateada = new Date(
        turnosParaEnviar[0].fecha
      ).toLocaleDateString();

      /* Emails */
      await axios.post(`${backendUrl}/api/enviar-mail`, {
        email: proveedorGmail,
        asunto: "Nuevo turno agendado",
        mensaje: `Hola ${proveedorNombre},<br>El usuario <b>${
          user.nombre
        }</b> ha agendado un turno.<br><b>Fecha:</b> ${fechaFormateada}<br><b>Horas:</b> ${turnosParaEnviar
          .flatMap((t) => t.horas)
          .join(", ")}<br>Saludos.`,
      });

      await axios.post(`${backendUrl}/api/enviar-mail`, {
        email: user.gmail,
        asunto: "Nuevo turno agendado",
        mensaje: `Hola ${
          user.nombre
        },<br>Has agendado un turno con: <b>${proveedorNombre}</b>.<br><b>Fecha:</b> ${fechaFormateada}<br><b>Horas:</b> ${turnosParaEnviar
          .flatMap((t) => t.horas)
          .join(", ")}<br>Saludos.`,
      });

      toast.dismiss();
      toast.success(
        `${turnosSeleccionados} turno(s) agendado(s) correctamente.`
      );

      setAgendarTurnos({});

      const resTurnos = await axios.get(
        `${backendUrl}/api/tusTurnos/${proveedorid}`
      );
      setTurnos(resTurnos.data || []);
    } catch (err) {
      console.error("❌ Error en handleSubmit:", err);
      toast.dismiss();
      toast.error("Error al agendar. Inténtalo de nuevo.");
    }

    setIsSubmitting(false);
  };

  return (
    <main>
      <header>
        <Toaster position="top-right" />
        <Navbar />
      </header>

      {/* BOTONES ATRÁS / ADELANTE */}
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

      <div className="turnos-proveedor-content" style={{ marginBottom: "2%" }}>
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
                    <p className="titulo-turnos">{t.titulo}</p>
                  </div>

                  {t.sena === 1 ? (
                    <p className="text-muted">
                      Estos turnos tienen seña de: ${t.valorsena}
                    </p>
                  ) : (
                    <p className="text-muted">Estos turnos no tienen seña</p>
                  )}

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
            disabled={
              Object.keys(agendarTurnos).length === 0 ||
              isSubmitting /* 👈 BLOQUEADO */
            }
          >
            {isSubmitting ? "Procesando..." : "Agendar"}{" "}
            {!isSubmitting &&
              Object.values(agendarTurnos).flatMap((t) => t.horas).length}{" "}
            {!isSubmitting && "Turno(s)"}
          </button>
        )}
      </div>
      <Footer />
    </main>
  );
}

export default AgendarTurno;
