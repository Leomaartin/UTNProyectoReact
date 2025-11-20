// src/routes/TurnosDisponible.tsx
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../Components/Navbar";
import "./css/TurnosDisponible.css";
import axios from "axios";
import useLocalStorage from "../auth/useLocalStorage";
import toast, { Toaster } from "react-hot-toast";

function TurnosDisponible() {
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<Date[]>([]);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");
  const [titulo, setTitulo] = useState("");
  const [user] = useLocalStorage("user", null);

  const proveedorId = user?.id;

  // =============================
  // Seleccionar / Quitar fechas
  // =============================
  const toggleFecha = (fecha: Date | Date[]) => {
    if (Array.isArray(fecha)) return;

    const existe = fechasSeleccionadas.some(
      (f) => f.toDateString() === fecha.toDateString()
    );

    if (existe) {
      setFechasSeleccionadas((prev) =>
        prev.filter((f) => f.toDateString() !== fecha.toDateString())
      );
    } else {
      setFechasSeleccionadas((prev) => [...prev, fecha]);
    }
  };

  // =============================
  // Enviar turnos al backend
  // =============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proveedorId) {
      toast.error("No estás logueado, inicia sesión");
      return;
    }

    if (fechasSeleccionadas.length === 0) {
      toast.error("Seleccioná al menos una fecha");
      return;
    }

    if (!titulo.trim()) {
      toast.error("Agregá un título para el turno");
      return;
    }

    const turnosDispo = fechasSeleccionadas.map((fecha) => ({
      fecha: fecha.toISOString().split("T")[0],
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      id_proveedor: proveedorId,
      titulo: titulo.trim(),
    }));

    try {
      const res = await axios.post(
        "http://localhost:3333/api/registrarTurnos",
        { turnosDispo }
      );

      if (!res.data.success) {
        toast.error(res.data.message || "No se pudieron registrar turnos");
        return;
      }

      toast.success("Turnos registrados con éxito!");

      // reset
      setFechasSeleccionadas([]);
      setTitulo("");
      setHoraInicio("09:00");
      setHoraFin("10:00");
    } catch (err) {
      console.error("Error al registrar turnos:", err);
      toast.error("Error en el servidor");
    }
  };

  return (
    <main>
      <header>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "1.1rem",
              padding: "14px 18px",
              borderRadius: "10px",
            },
          }}
        />
        <Navbar />
      </header>

      <div className="container mt-4">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Seleccioná tus turnos</h2>
          <p className="text-muted">
            Elegí la fecha, un rango horario y agregá un título
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Calendario */}
          <div className="calendar-wrapper shadow-lg p-4 rounded mb-4">
            <Calendar
              onClickDay={toggleFecha}
              tileClassName={({ date }) =>
                fechasSeleccionadas.some(
                  (f) => f.toDateString() === date.toDateString()
                )
                  ? "selected-date"
                  : "normal-date"
              }
            />
          </div>

          {/* Horarios */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="fw-bold">Hora inicio:</label>
              <input
                type="time"
                className="form-control"
                step={1800}
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="fw-bold">Hora fin:</label>
              <input
                type="time"
                className="form-control"
                step={1800}
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
              />
            </div>
          </div>

          {/* Título */}
          <div className="mb-4">
            <label className="fw-bold">Título del turno:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Corte de pelo, consulta médica..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          {/* Vista previa */}
          <div className="mt-4">
            <h5 className="fw-bold">Turnos a registrar:</h5>

            {fechasSeleccionadas.length > 0 ? (
              <ul className="list-group">
                {fechasSeleccionadas.map((f, idx) => (
                  <li className="list-group-item" key={idx}>
                    {f.toLocaleDateString()} — {horaInicio} a {horaFin}
                    <em> (Título: {titulo || "sin título"})</em>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No seleccionaste ningún turno.</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary mt-4">
            Agregar Turno
          </button>
        </form>
      </div>
    </main>
  );
}

export default TurnosDisponible;
