import { useState } from "react";
import Navbar from "../Components/Navbar";
import { useAuth } from "../auth/authProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useLocalStorage from "../auth/useLocalStorage";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import "./css/Login.css";

function Login() {
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useLocalStorage("user", null);
  const [mensaje, setMensaje] = useState("");

  const auth = useAuth();
  const navegar = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://api-node-turnos.onrender.com/api/infoUsuarios", {
        gmail,
        password,
      });

      if (res.data.success) {
        auth.login();

        if (res.data.usuario) {
          setUser(res.data.usuario);
        } else if (res.data.proveedor) {
          setUser(res.data.proveedor);
        }

        navegar("/dashboard");
      } else {
        setMensaje(res.data.message || "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error(error);
      toast.error("Hubo un problema con el servidor. Intenta más tarde.");
    }
  };

  return (
    <main className="login-main">
      {" "}
      {/* 👈 CLASE PRINCIPAL */}
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
      <div
        style={{
          position: "absolute",
          display: "flex",
          gap: "8px",
          zIndex: 1000,
          left: "7%",
          marginTop: "10px",
        }}
      >
        <i
          className="fa-solid fa-backward"
          onClick={() => navegar(-1)}
          style={{ cursor: "pointer" }}
        ></i>
        <i
          className="fa-solid fa-forward"
          onClick={() => navegar(1)}
          style={{ cursor: "pointer" }}
        ></i>
      </div>
      {/* ⚠️ APLICAR CLASE CUSTOM: login-container */}
      <div className="login-container">
        {/* ⚠️ APLICAR CLASE CUSTOM: login-card */}
        <div className="login-card">
          <h3 className="text-center mb-4">Iniciar Sesión</h3>
          <form onSubmit={handleSubmit}>
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
              />
            </div>

            <button type="submit" className="btn-ingresar">
              Ingresar
            </button>
          </form>
          {mensaje ? (
            <div className="alert-error" role="alert">
              <div>{mensaje}</div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default Login;
