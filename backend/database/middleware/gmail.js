// middleware/bravo.js
import dotenv from "dotenv";
dotenv.config();

export const enviarCorreo = async (to, subject, html) => {
  try {
    const KEY = process.env.BRAVO_API_KEY; 
    const DOMAIN = process.env.BRAVO_DOMAIN; // Puede ser "g.bravomail.io" u otro

    if (!KEY || !DOMAIN) {
      console.error("⛔ Faltan variables de entorno de BravoMail");
      return false;
    }

    const url = `https://api.bravo.email/v1/domains/${DOMAIN}/messages`;

    const body = {
      from: `Turnos <no-reply@${DOMAIN}>`,
      to: [to],
      subject,
      html,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("❌ Error BravoMail:", error);
      return false;
    }

    console.log("📧 Correo enviado con BravoMail");
    return true;

  } catch (err) {
    console.error("⛔ Error al enviar correo con BravoMail:", err);
    return false;
  }
};
