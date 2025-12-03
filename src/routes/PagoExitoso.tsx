import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function PagoExitoso() {
  useEffect(() => {
    const procesarTurno = async () => {
      try {
        const mpData = JSON.parse(localStorage.getItem("mp_metadata") || "{}");

        if (!mpData.turnosSeleccionados) {
          toast.error("No se encontraron los datos del turno.");
          return;
        }

        // ⚠️ Convertir turnosSeleccionados desde STRING → OBJETO
        const turnosSeleccionados = JSON.parse(mpData.turnosSeleccionados);

        const {
          proveedorid,
          proveedorNombre,
          proveedorGmail,
          userId,
          userNombre,
          userGmail,
        } = mpData;

        // ---- ARMAR TURNOS ----
        const turnosParaEnviar = Object.entries(turnosSeleccionados).map(
          ([id, data]) => ({
            id_turno: "turno_" + crypto.randomUUID(),
            nombre: userNombre,
            userid: userId,
            usergmail: userGmail,
            proveedorNombre,
            proveedorid,
            proveedorGmail,
            fecha: data.fecha,
            horas: data.horas,
          })
        );

        const turnosParaBloquear = Object.entries(turnosSeleccionados).map(
          ([id, data]) => ({
            id,
            fecha: data.fecha,
            horas: data.horas,
          })
        );

        // 1️⃣ BLOQUEAR HORAS
        await axios.post("http://localhost:3333/api/horasBloqueadas", {
          turnos: turnosParaBloquear,
        });

        // 2️⃣ GUARDAR TURNO AL PROVEEDOR
        await axios.post("http://localhost:3333/api/turnoAgendado", {
          proveedorid,
          turnos: turnosParaEnviar,
        });

        // 3️⃣ GUARDAR TURNO AL USUARIO
        await axios.post("http://localhost:3333/api/turnoGuardado", {
          usuarioid: userId,
          turnos: turnosParaEnviar,
        });

        // 4️⃣ EMAILS
        const fechaFormateada = new Date(
          Object.values(turnosSeleccionados)[0].fecha
        ).toLocaleDateString("es-AR");

        await axios.post("http://localhost:3333/api/enviar-mail", {
          email: proveedorGmail,
          asunto: "Nuevo turno agendado",
          mensaje: `
            Hola ${proveedorNombre},<br><br>
            El usuario <b>${userNombre}</b> ha agendado un turno.<br>
            <b>Fecha:</b> ${fechaFormateada}<br>
            <b>Horas:</b> ${turnosParaEnviar.flatMap((t) => t.horas).join(", ")}
          `,
        });

        await axios.post("http://localhost:3333/api/enviar-mail", {
          email: userGmail,
          asunto: "Turno confirmado",
          mensaje: `
            Hola ${userNombre},<br><br>
            Tu turno con <b>${proveedorNombre}</b> fue confirmado.<br>
            <b>Fecha:</b> ${fechaFormateada}<br>
            <b>Horas:</b> ${turnosParaEnviar.flatMap((t) => t.horas).join(", ")}
          `,
        });

        toast.success("Pago realizado y turno agendado.");
        localStorage.removeItem("mp_metadata");
      } catch (e) {
        console.error(e);
        toast.error("Hubo un problema al procesar el turno.");
      }
    };

    procesarTurno();
  }, []);

  return (
    <main>
      <h1 style={{ textAlign: "center", marginTop: "40px" }}>
        ✔️ Pago exitoso. Procesando turno...
      </h1>
    </main>
  );
}
