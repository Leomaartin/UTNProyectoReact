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
      {/* LOGO CIRCULAR */}
      <div className="navbar-logo-container">
        <img src={logo} className="navbar-logo" alt="Logo" />
      </div>

      <div className="container-fluid">
        {/* Mobile */}
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
            {/* Home */}
            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="/">
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </a>
            </li>

            {/* Mi Perfil */}
            {user && (
              <li className="nav-item">
                <a className="nav-link nav-link-custom" href="/dashboard">
                  <FontAwesomeIcon icon={faUser} />
                  <span>Mi Perfil</span>
                </a>
              </li>
            )}

            {/* User dropdown */}
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
                      <a className="dropdown-item-custom" href="/registrarse">
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
