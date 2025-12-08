import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import "./css/Login.css";
function Singup() {
  const [username, setUsername] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [telefono, setTelefono] = useState("");

  const navegar = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://api-node-turnos.onrender.com/api/register", {
        nombre: username,
        gmail: gmail,
        password: password,
        tipoCuenta: Number(tipoCuenta),
        telefono: Number(telefono),
      });

      if (res.data.success) {
        toast.success("Usuario registrado correctamente");
        navegar("/Login");
      } else {
        toast.error("Error al registrar usuario");
      }
    } catch (error) {
      console.error(error);
      toast.error("Hubo un problema con el servidor");
    }
  };

  return (
    <main className="login-main">
      <header>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "1.1rem",
              padding: "14px 18px",
              borderRadius: "10px",
            },
            error: {
              style: {
                background: "#ff4d4d",
                color: "#fff",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#ff4d4d",
              },
            },
          }}
        />
        <Navbar />
      </header>

      {/* Flechas de navegación (las dejo con estilos inline como pediste) */}
      <div
        style={{
          marginTop: "1%",
          marginLeft: "30%",
        }}
      >
        <i
          className="fa-solid fa-backward"
          onClick={() => navegar(-1)}
          style={{ cursor: "pointer", color: "gray" }}
        ></i>
        <i
          className="fa-solid fa-forward"
          onClick={() => navegar(1)}
          style={{ cursor: "pointer", color: "gray" }}
        ></i>
      </div>

      {/* Contenedor del formulario */}
      <div className="login-container">
        <div className="login-card">
          <h3>Registrarse</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Nombre Usuario
              </label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="ejemplo@email.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label">
                Teléfono
              </label>
              <input
                type="text"
                id="phone"
                className="form-control"
                placeholder="Tu teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>

            {/* Radios */}
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="opcion"
                id="opcion1"
                value="0"
                checked={tipoCuenta === "0"}
                onChange={(e) => setTipoCuenta(e.target.value)}
              />
              <label htmlFor="opcion1" className="form-check-label">
                Cuenta cliente
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="opcion"
                id="opcion2"
                value="1"
                checked={tipoCuenta === "1"}
                onChange={(e) => setTipoCuenta(e.target.value)}
              />
              <label htmlFor="opcion2" className="form-check-label">
                Cuenta proveedor
              </label>
            </div>

            <button type="submit" className="btn-ingresar">
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Singup;
