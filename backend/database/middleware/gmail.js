import nodemailer from "nodemailer";

export const enviarCorreo = async (to, subject, html) => {
  try {
    // Transporter: configuración del correo
    const transporter = nodemailer.createTransport({
      service: "gmail", // Podés usar Outlook, Yahoo, SMTP, etc
      auth: {
        user: "leomartin9808@gmail.com",
        pass: "dvoa oium mrew sajn", // No la contraseña real
      },
    });

    // Info del correo
    const mailOptions = {
      from: "tuemail@gmail.com",
      to,
      subject,
      html,
    };

    // Enviar
    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return false;
  }
};
