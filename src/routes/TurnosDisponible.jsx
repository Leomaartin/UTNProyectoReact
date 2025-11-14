import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../Components/Navbar";
import "./TurnosDisponible.css";
import axios from "axios";
import useLocalStorage from "../auth/useLocalStorage";

function TurnosDisponible() {
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<Date[]>([]);
  const [horaInicio, setHoraInicio] = useState<string>("09:00");
  const [horaFin, setHoraFin] = useState<string>("10:00");
  const [user] = useLocalStorage("user", null);
  const proveedorId = user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const turnosDispo = fechasSeleccionadas.map((fecha) => ({
      fecha: fecha.toISOString().split("T")[0],
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      id_proveedor: proveedorId,
    }));

    try {
      const res = await axios.post(
        "http://localhost:3333/api/registrarTurnos",
        {
          turnosDispo,
        }
      );
      if (res.data.success) {
        alert("Turno registrado correctamente");
      } else {
        alert("Error al registrar turnos");
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un problema con el servidor");
    }
  };

  const toggleFecha = (fecha: Date | Date[]) => {
    if (Array.isArray(fecha)) return;

    const existe = fechasSeleccionadas.some(
      (f) => f.toDateString() === fecha.toDateString()
    );

    if (existe) {
      setFechasSeleccionadas(
        fechasSeleccionadas.filter(
          (f) => f.toDateString() !== fecha.toDateString()
        )
      );
    } else {
      setFechasSeleccionadas([...fechasSeleccionadas, fecha]);
    }
  };

  return (
    <main>
      <header>
        <Navbar />
      </header>
      <div className="container mt-4">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Seleccioná tus turnos</h2>
          <p className="text-muted">
            Elegí la fecha y el rango horario (cada 30 minutos)
          </p>
        </div>

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

        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <label className="fw-bold">Hora inicio:</label>
            <input
              type="time"
              className="form-control"
              step={1800}
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
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

        <div className="mt-4">
          <h5 className="fw-bold">Turnos seleccionados:</h5>
          {fechasSeleccionadas.length > 0 ? (
            <ul className="list-group">
              {fechasSeleccionadas.map((fecha, index) => (
                <li className="list-group-item" key={index}>
                  {fecha.toLocaleDateString()} — {horaInicio} a {horaFin}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Todavía no seleccionaste ningún turno.</p>
          )}
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Agregar Turno
        </button>
      </div>
    </main>
  );
}

export default TurnosDisponible;
