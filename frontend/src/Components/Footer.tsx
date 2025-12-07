import React from "react";
import "../routes/css/Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-left">
        <span className="brand">TurnoSmart</span>
        <nav className="links">
          <a href="#">Acerca</a>
          <a href="/contacto">Contacto</a>
          <a href="#">Privacidad</a>
        </nav>
      </div>

      <span className="copy">© {year} TurnoSmart — Todos los derechos</span>
    </footer>
  );
}
