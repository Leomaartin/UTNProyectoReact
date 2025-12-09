import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import useLocalStorage from "../auth/useLocalStorage";
import { useParams, useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from "react-hot-toast";
import Footer from "../Components/Footer";
import "./css/AgendarTurnos.css";



// ============================================================================
// 🛠️ FUNCIONES DE UTILIDAD (SIN CAMBIOS)
// ============================================================================

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

// ============================================================================
// 🎨 COMPONENTES HIJOS (SIN CAMBIOS FUNCIONALES)
// ============================================================================

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

// ============================================================================
// ⚙️ DEFINICIONES DE TIPOS
// ============================================================================

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

// ============================================================================
// 🚀 COMPONENTE PRINCIPAL: AgendarTurno
// ============================================================================

function AgendarTurno() {
  const [turnos, setTurnos] = useState<TurnoData[]>([]);
  const [proveedorNombre, setProveedorNombre] = useState("Cargando...");
  const [proveedorGmail, setProveedorGmail] = useState("");
  const [agendarTurnos, setAgendarTurnos] = useState<AgendarTurnoState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { proveedorid } = useParams<{ proveedorid: string }>();
  const [user] = useLocalStorage("user", null);
  const navigate = useNavigate();

  // 1. Cargar Turnos Disponibles
useEffect(() => {
  if (!proveedorid) return;

  console.log("📌 solicitando turnos para proveedor:", proveedorid);

  axios
    .get(`https://api-node-turnos.onrender.com/api/tusTurnos/${proveedorid}`)
    .then((res) => {
      console.log("📥 respuesta turnos:", res.data);
      setTurnos(res.data || []);
    })
    .catch((err) => {
      console.error("❌ Error al cargar turnos", err);
      toast.error("Error al cargar la disponibilidad.");
      setTurnos([]);
    });
}, [proveedorid]);

  // 2. Cargar Datos del Proveedor
  useEffect(() => {
  if (!proveedorid) return;

  console.log("📌 solicitando datos del proveedor:", proveedorid);

  axios
    .get(`https://api-node-turnos.onrender.com/api/proveedor/${proveedorid}`)
    .then((res) => {
      console.log("📥 respuesta proveedor:", res.data);
      setProveedorNombre(res.data.proveedor?.nombre || "Proveedor desconocido");
      setProveedorGmail(res.data.proveedor?.gmail);
    })
    .catch((err) => {
      console.error("❌ Error al cargar proveedor:", err);
      setProveedorNombre("Error al cargar nombre");
    });
}, [proveedorid]);


  // Manejar la selección/deselección de horas
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

      // Si no quedan horas seleccionadas para este ID, eliminamos el objeto
      if (nuevasHoras.length === 0) {
        const { [id]: omitido, ...resto } = prev;
        return resto;
      }

      return { ...prev, [id]: { fecha, horas: nuevasHoras } };
    });
  };

  // 3. Enviar Formulario (Agendamiento)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isSubmitting) return;
  setIsSubmitting(true);
  const loadingToastId = toast.loading(
    "Procesando turno... Esto puede tardar unos segundos."
  );

  try {
    if (!user) throw new Error("Debes iniciar sesión.");

    const turnosSeleccionadosCount = Object.values(agendarTurnos).flatMap(
      (t) => t.horas
    ).length;

    if (turnosSeleccionadosCount === 0)
      throw new Error("Selecciona al menos un turno.");

    // ============================
    // 💳 PASO 1: PAGO CON SEÑA
    // ============================
    let montoTotalSena = 0;
    Object.entries(agendarTurnos).forEach(([id, data]) => {
      const turno = turnos.find((t) => t.id === id);
      if (turno?.sena === 1 && turno.valorsena)
        montoTotalSena += Number(turno.valorsena) * data.horas.length;
    });

    if (montoTotalSena > 0) {
      const prod = {
        titulo: `Seña turnos con ${proveedorNombre}`,
        valorsena: montoTotalSena,
        cantidad: 1,
      };

      const res = await axios.post(
        "https://api-node-turnos.onrender.com/api/create-order",
        { prod }
      );

      const { init_point } = res.data;
      if (!init_point) throw new Error("No se pudo obtener el enlace de pago.");

      toast.dismiss(loadingToastId);
      // Redirigir a Mercado Pago
      window.location.href = init_point;
      return; // ⚠️ Importantísimo para no ejecutar el paso 2
    }

    // ============================
    // 💾 PASO 2: AGENDAR NORMAL
    // ============================
    const turnosParaEnviar = Object.entries(agendarTurnos).map(([id, data]) => ({
      id_turno: generarIdTurno(),
      nombre: user.nombre,
      userid: user.id,
      usergmail: user.gmail,
      proveedorNombre,
      proveedorid,
      proveedorGmail,
      fecha: data.fecha,
      horas: data.horas,
      turnoId: id,
    }));

    const turnosParaBloquear = Object.entries(agendarTurnos).map(([id, data]) => ({
      id,
      fecha: data.fecha,
      horas: data.horas,
    }));

    // Bloquear horas
    await axios.post("https://api-node-turnos.onrender.com/api/horasBloqueadas", {
      turnos: turnosParaBloquear,
    });

    // Guardar turno en tablas del proveedor y del usuario
    await Promise.all([
      axios.post("https://api-node-turnos.onrender.com/api/turnoAgendado", {
        proveedorid,
        turnos: turnosParaEnviar,
      }),
      axios.post("https://api-node-turnos.onrender.com/api/turnoGuardado", {
        usuarioid: user.id,
        turnos: turnosParaEnviar,
      }),
    ]);

    toast.dismiss(loadingToastId);
    toast.success(`${turnosSeleccionadosCount} turno(s) agendado(s) correctamente.`);

    setAgendarTurnos({});

    // Recargar disponibilidad
    const resTurnos = await axios.get(
      `https://api-node-turnos.onrender.com/api/tusTurnos/${proveedorid}`
    );
    setTurnos(resTurnos.data || []);
  } catch (err: any) {
    console.error("❌ Error en handleSubmit:", err);
    toast.dismiss(loadingToastId);
    toast.error(err.message || "Error al agendar. Inténtalo de nuevo.");
  } finally {
    setIsSubmitting(false);
  }
};

  const totalHorasSeleccionadas = Object.values(agendarTurnos).flatMap((t) => t.horas).length;

  return (
    <main>
      <header>
        <Toaster position="top-right" />
        <Navbar />
      </header>

      {/* BOTONES ATRÁS / ADELANTE */}
      <div
        className="nav-buttons-container"
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
            <p className="text-center text-muted no-turnos-text">
              No hay turnos disponibles para este proveedor.
            </p>
          ) : (
            turnos.map((t) => {
              // Parsear turnos_bloqueados de string a objeto
              let turnosBloqueados: { fecha: string; horas: string[] }[] = [];
              if (
                typeof t.turnos_bloqueados === "string" &&
                t.turnos_bloqueados
              ) {
                try {
                  const parsed = JSON.parse(t.turnos_bloqueados);
                  if (Array.isArray(parsed)) {
                    turnosBloqueados = parsed;
                  }
                } catch {}
              }

              // 🔑 CORRECCIÓN APLICADA AQUÍ: Comparar solo la porción de fecha (YYYY-MM-DD)
              const fechaTurnoNormalizada = t.fecha.substring(0, 10);

              const horasBloqueadas = turnosBloqueados
                .filter((b) => b.fecha.substring(0, 10) === fechaTurnoNormalizada)
                .flatMap((b) => b.horas);
                
              const horasSeleccionadas = agendarTurnos[t.id]?.horas || [];

              return (
                <li key={t.id} className="turno-item">
                  <div className="turno-header">
                    <strong>{formatFecha(t.fecha)}</strong>
                    <p className="titulo-turnos">{t.titulo}</p>
                  </div>

                  <div className="seña-info">
                    {t.sena === 1 ? (
                      <p className="text-muted">
                        <i className="fa-solid fa-credit-card"></i> Estos turnos tienen seña de: **${t.valorsena}**
                      </p>
                    ) : (
                      <p className="text-muted">
                        <i className="fa-regular fa-clock"></i> Estos turnos no tienen seña
                      </p>
                    )}
                  </div>
                  
                  {horasBloqueadas.length > calcularNumero(t.hora_fin) / 3600 ? (
                     <p className="no-horas-disponibles">No quedan horas disponibles en este bloque.</p>
                  ) : (
                    <ArrayHoras
                      horaInicio={t.hora_inicio}
                      horaFin={t.hora_fin}
                      horasBloqueadas={horasBloqueadas}
                      horasSeleccionadas={horasSeleccionadas}
                      onToggleHora={(hora, selected) =>
                        handleToggleHora(t.id, t.fecha, hora, selected)
                      }
                    />
                  )}
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
              totalHorasSeleccionadas === 0 ||
              isSubmitting
            }
          >
            {isSubmitting ? "Procesando..." : "Agendar"}{" "}
            {!isSubmitting && totalHorasSeleccionadas}{" "}
            {!isSubmitting && (totalHorasSeleccionadas === 1 ? "Turno" : "Turnos")}
          </button>
        )}
      </div>
      <Footer />
    </main>
  );
}

export default AgendarTurno;