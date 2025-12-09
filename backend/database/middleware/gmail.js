import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarCorreo = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Turnos App <onboarding@resend.dev>", 
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Error enviando con Resend:", error);
      return false;
    }

    console.log("📧 Email enviado:", data.id);
    return true;

  } catch (err) {
    console.error("🚨 Error general en enviarCorreo:", err);
    return false;
  }
};