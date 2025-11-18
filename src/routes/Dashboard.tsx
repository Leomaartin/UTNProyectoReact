import { useAuth } from "../auth/authProvider.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useLocalStorage from "../auth/useLocalStorage.js";
import Navbar from "../Components/Navbar.js";
import axios from "axios";
import "./css/Dashboard.css";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import personita from "../img/personita2.png";
import tienda from "../img/tienda.png";

function Dashboard() {
  const auth = useAuth();
  const navegar = useNavigate();
  const [user, setUser] = useLocalStorage("user", null);
  const [opcion, setOpcion] = useState("");

  const manejarCambio = (event) => {
    setOpcion(event.target.value);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    navegar("/");
  };

  const tipoDeCuenta = () => {
    if (user?.tipoCuenta === 1) {
      return (
        <>
          <div className="profile-container">
            <img
              src={user?.fotoPerfil || tienda}
              alt="Icono de tienda"
              className="icono-tienda"
            />
            <input type="file" />
            <div className="overlay">Cambiar foto de perfil</div>
          </div>
          {categoria()}
          <div>
            <label htmlFor="opciones">Elegí una nueva categoría:</label>
            <select id="opciones" value={opcion} onChange={manejarCambio}>
              <option value="">--Seleccioná--</option>
              <option value="0">Educación</option>
              <option value="1">Tecnología</option>
              <option value="2">Administrativo</option>
              <option value="3">Mascotas</option>
              <option value="4">Salud</option>
              <option value="5">Belleza y Cuidado</option>
            </select>

            <button onClick={handleSubmit}>Cambiar categoría</button>
          </div>
          <h3>Tu cuenta es proveedor.</h3>
        </>
      );
    } else {
      return (
        <>
          {" "}
          <div className="profile-container">
            <img
              src={user?.fotoPerfil || personita}
              alt="Icono de tienda"
              className="icono-tienda"
            />
            <input type="file" />
            <div className="overlay">Cambiar foto de perfil</div>
          </div>
          <h3>Tu cuenta es Usuario.</h3>
        </>
      );
    }
  };

  const categoria = () => {
    switch (user?.categoria) {
      case 0:
        return <h3>Tu categoría es Educación</h3>;
      case 1:
        return <h3>Tu categoría es Tecnología</h3>;
      case 2:
        return <h3>Tu categoría es Administrativo</h3>;
      case 3:
        return <h3>Tu categoría es Mascotas</h3>;
      case 4:
        return <h3>Tu categoría es Salud</h3>;
      case 5:
        return <h3>Tu categoría es Belleza y Cuidado</h3>;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!opcion) {
      alert("Por favor seleccioná una categoría.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3333/api/actualizarCategoria",
        {
          categoria: opcion,
          id: user?.id,
        }
      );

      if (res.data.success) {
        toast.success("Categoría actualizada correctamente.");
        setUser({ ...user, categoria: parseInt(opcion) });
      } else {
        toast.error(res.data.message || "No se pudo actualizar la categoría.");
      }
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      toast.error("Error en el servidor.");
    }
  };

  return (
    <main className="main-dashboard">
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
      <div className="dashboard-card">
        <h1>Bienvenido/a {user?.nombre}!</h1>
        <p>Este es tu Perfil</p>
        {tipoDeCuenta()}

        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          Salir
        </button>
      </div>
    </main>
  );
}

export default Dashboard;
