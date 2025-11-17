import useLocalStorage from "../auth/useLocalStorage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightToBracket,
  faRegistered,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../img/logo.png";

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
        backgroundColor: "#6eb8f5",
        borderBottom: "1px solid #9acef8",
      }}
      data-bs-theme="light"
    >
      <a className="navbar-brand" href="/">
        <img
          src={logo}
          alt="TurnosSmart Logo"
          style={{
            marginLeft: "0%",
            color: "#fafafaff",
            position: "absolute",
            width: "70px",
            height: "70px",
            borderRadius: "15px",
            top: "5px",
            left: "2%",
          }}
        />
      </a>
      <div className="container-fluid">
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
              <a className="nav-link" href="/" style={{ color: "#fafafaff" }}>
                {" "}
                Home
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="/turnosagendadosusuario"
                style={{ color: "#fafafaff" }}
              >
                Tus Turnos
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="/dashboard"
                style={{ color: "#fafafaff" }}
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
                backgroundColor: "#fafafaff",
                border: "1px solid #fafafaff",
                color: "#fafafaff",
              }}
            />
            <button
              className="btn"
              type="submit"
              style={{
                backgroundColor: "#fafbfd",
                color: "#b2b2b2",
                border: "none",
                transition: "0.3s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#b2b2b2")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#fafbfd")}
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
                  backgroundColor: "#fafbfd",
                  color: "#b2b2b2",
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
                  <a href="/login" style={{ color: "#308adfff" }}>
                    {" "}
                    <FontAwesomeIcon
                      icon={faRightToBracket}
                      style={{ marginRight: "10px" }}
                    />
                  </a>
                  <a href="/registrarse" style={{ color: "#308adfff" }}>
                    {" "}
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
                background: "#e8f5ff",
                border: "1px solid #9acef8",
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
              <a href="/" style={{ textDecoration: "none", color: "#2196f3" }}>
                Home
              </a>
              <a
                href="/"
                style={{ textDecoration: "none", color: "#2196f3" }}
                onClick={handleLogout}
              >
                Logout
              </a>
              <a href="#" style={{ textDecoration: "none", color: "#2196f3" }}>
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
