import useLocalStorage from "../auth/useLocalStorage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightToBracket,
  faRegistered,
} from "@fortawesome/free-solid-svg-icons";

function Navbar() {
  const [user, setUser] = useLocalStorage("user", null);
  const [userButton, setUserButton] = useState(false);
  const auth = useAuth();
  const navegar = useNavigate();

  function handleLogout() {
    auth.logout();
    setUser(null);
    navegar("/");
  }

  function desplegarButton() {
    setUserButton(!userButton);
  }

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: "#E8D8C3", // tono nude claro
        borderBottom: "1px solid #d3bfa3",
      }}
      data-bs-theme="light"
    >
      <div className="container-fluid">
        <a
          className="navbar-brand"
          href="/"
          style={{
            marginLeft: "0%",
            color: "#5C4033",
            fontWeight: "bold",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          TurnosApp
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarSupportedContent"
          style={{ justifyContent: "center" }}
        >
          <ul className="nav justify-content-center">
            <li className="nav-item">
              <a className="nav-link" href="/" style={{ color: "#5C4033" }}>
                Home
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="/turnosagendadosusuario"
                style={{ color: "#5C4033" }}
              >
                Tus Turnos
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="/dashboard"
                style={{ color: "#5C4033" }}
              >
                Mi Perfil
              </a>
            </li>
          </ul>

          <form className="d-flex" role="search" style={{ marginLeft: "20%" }}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar"
              aria-label="Search"
              style={{
                backgroundColor: "#F6EEE3",
                border: "1px solid #D4C3B5",
                color: "#5C4033",
              }}
            />
            <button
              className="btn"
              type="submit"
              style={{
                backgroundColor: "#D1BFA7",
                color: "#fff",
                border: "none",
                transition: "0.3s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#C0A98B")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#D1BFA7")}
            >
              Buscar
            </button>
          </form>

          <div style={{ position: "relative", marginLeft: "12%" }}>
            {user?.nombre && (
              <button
                type="button"
                className="btn"
                onClick={desplegarButton}
                style={{
                  backgroundColor: "#D1BFA7",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                }}
              >
                Bienvenido {user.nombre}
              </button>
            )}
            <div>
              <ul className="nav justify-content-center">
                <li className="nav-item">
                  <a href="/login" style={{ color: "#5C4033" }}>
                    <FontAwesomeIcon
                      icon={faRightToBracket}
                      style={{ marginRight: "10px" }}
                    />
                  </a>
                  <a href="/registrarse" style={{ color: "#5C4033" }}>
                    <FontAwesomeIcon icon={faRegistered} />
                  </a>
                </li>
              </ul>
            </div>

            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "#F6EEE3",
                border: "1px solid #D4C3B5",
                padding: "10px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                minWidth: "150px",
                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
                opacity: userButton ? 1 : 0,
                transform: userButton ? "translateY(0)" : "translateY(-10px)",
                pointerEvents: userButton ? "auto" : "none",
                zIndex: 1000,
              }}
            >
              <a href="/" style={{ textDecoration: "none", color: "#5C4033" }}>
                Home
              </a>
              <a
                href="/"
                style={{ textDecoration: "none", color: "#5C4033" }}
                onClick={handleLogout}
              >
                Logout
              </a>
              <a href="#" style={{ textDecoration: "none", color: "#5C4033" }}>
                Configuración
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
