import { useState } from "react";
import Navbar from "../Components/Navbar";
import { useAuth } from "../auth/authProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useLocalStorage from "../auth/useLocalStorage";

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
      const res = await axios.post("http://localhost:3333/api/infoUsuarios", {
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
      alert("Hubo un problema con el servidor. Intenta más tarde.");
    }
  };

  return (
    <main>
      <header>
        <Navbar />
      </header>
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card p-4 shadow" style={{ width: "24rem" }}>
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

            <button type="submit" className="btn btn-primary w-100">
              Ingresar
            </button>

            <p className="text-center mt-3">
              <a href="#">¿Olvidaste tu contraseña?</a>
            </p>
          </form>
          {mensaje ? (
            <div
              className="alert alert-danger d-flex align-items-center"
              role="alert"
            >
              <div>{mensaje}</div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default Login;
