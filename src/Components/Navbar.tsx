import useLocalStorage from "../auth/useLocalStorage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightToBracket, // Iniciar sesión
  faRegistered, // Registrarse
  faUser, // Perfil/Bienvenido
  faCalendarCheck, // Tus Turnos
  faHome, // Home
  faSignOutAlt, // Cerrar sesión (Logout)
  faSearch, // Búsqueda
} from "@fortawesome/free-solid-svg-icons"; // Agregué más íconos útiles
import logo from "../img/logo.png";
import "../routes/css/Navbar.css"; // -> Vamos a definir los estilos aquí

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

  // Define los enlaces en un array para mayor limpieza
  const navLinks = [
    { path: "/", label: "Home", icon: faHome },
    {
      path: "/turnosagendadosusuario",
      label: "Tus Turnos",
      icon: faCalendarCheck,
    },
    { path: "/dashboard", label: "Mi Perfil", icon: faUser },
  ];

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        {/* Logo and Brand */}
        <a className="navbar-brand logo-container" href="/">
          <img src={logo} alt="TurnosSmart Logo" className="navbar-logo" />
        </a>

        {/* Toggler Button (Mobile) */}
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

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/* Central Navigation Links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.path}>
                <a className="nav-link nav-link-custom" href={link.path}>
                  <FontAwesomeIcon icon={link.icon} className="me-2" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Search Form */}
          <form className="d-flex me-4 search-form" role="search">
            <input
              className="form-control me-2 search-input"
              type="search"
              placeholder="Buscar..."
              aria-label="Search"
            />
            <button className="btn search-button" type="submit">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>

          {/* User Dropdown */}
          <div className="dropdown-container">
            {user?.nombre ? (
              // Usuario Logueado
              <button
                type="button"
                className="btn user-button logged-in"
                onClick={desplegarButton}
              >
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Bienvenido **{user.nombre}**
              </button>
            ) : (
              // Usuario No Logueado (Muestra Loguearse/Registrarse directamente o un botón genérico)
              <button
                type="button"
                className="btn user-button logged-out"
                onClick={desplegarButton}
              >
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Mi Cuenta
              </button>
            )}

            <div className={`dropdown-menu-custom ${userButton ? "show" : ""}`}>
              {user?.nombre ? (
                // Menu cuando está logueado
                <>
                  {/* Se puede añadir un enlace al perfil aquí también si es necesario */}
                  <div className="dropdown-header">Hola, **{user.nombre}**</div>
                  <a
                    href="/"
                    className="dropdown-item-custom logout"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Cerrar Sesión
                  </a>
                </>
              ) : (
                // Menu cuando NO está logueado
                <>
                  <a href="/login" className="dropdown-item-custom">
                    <FontAwesomeIcon icon={faRightToBracket} className="me-2" />
                    Iniciar Sesión
                  </a>
                  <a href="/registrarse" className="dropdown-item-custom">
                    <FontAwesomeIcon icon={faRegistered} className="me-2" />
                    Registrarse
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
