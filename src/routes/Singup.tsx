import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";

function Singup() {
  const [username, setUsername] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");

  const navegar = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3333/api/register", {
        nombre: username,
        gmail: gmail,
        password: password,
        tipoCuenta: Number(tipoCuenta),
      });

      if (res.data.success) {
        alert("Usuario registrado correctamente");
        navegar("/Login");
      } else {
        alert("Error al registrar usuario");
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un problema con el servidor");
    }
  };

  return (
    <main>
      <header>
        <Navbar />
      </header>
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card p-4 shadow" style={{ width: "24rem" }}>
          <h3 className="text-center mb-4">Registrarse</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
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
              <label className="form-check-label" htmlFor="opcion1">
                Cuenta usuario
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
              <label className="form-check-label" htmlFor="opcion2">
                Cuenta proveedor
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Singup;
