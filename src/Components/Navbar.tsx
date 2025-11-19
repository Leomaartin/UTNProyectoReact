import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../auth/useLocalStorage";
import { useAuth } from "../auth/authProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHome,
  faSignOutAlt,
  faRightToBracket,
  faRegistered,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../img/logo.png";
import "../routes/css/Navbar.css";

function Navbar() {
  const [user, setUser] = useLocalStorage("user", null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        {/* Logo */}
        <a className="navbar-brand logo-container" href="/">
          <img src={logo} alt="TurnosSmart Logo" className="navbar-logo" />
        </a>

        {/* Toggler (Mobile) */}
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
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {/* Home siempre */}
            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="/">
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </a>
            </li>

            {/* Mi Perfil solo si está logueado */}
            {user && (
              <li className="nav-item">
                <a className="nav-link nav-link-custom" href="/dashboard">
                  <FontAwesomeIcon icon={faUser} />
                  <span>Mi Perfil</span>
                </a>
              </li>
            )}

            {/* Dropdown de usuario */}
            <li className="nav-item dropdown" style={{ position: "relative" }}>
              <button className="user-button" onClick={toggleDropdown}>
                {user ? user.nombre : "Usuario"}
                <FontAwesomeIcon icon={faUser} style={{ marginLeft: "5px" }} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu-custom show">
                  {!user ? (
                    <>
                      <a className="dropdown-item-custom" href="/login">
                        <FontAwesomeIcon icon={faRightToBracket} /> Login
                      </a>
                      <a className="dropdown-item-custom" href="/register">
                        <FontAwesomeIcon icon={faRegistered} /> Registrarse
                      </a>
                    </>
                  ) : (
                    <button
                      className="dropdown-item-custom logout"
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                    </button>
                  )}
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
