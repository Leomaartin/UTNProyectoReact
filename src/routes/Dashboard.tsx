import { useAuth } from "../auth/authProvider.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useLocalStorage from "../auth/useLocalStorage.js";
import Navbar from "../Components/Navbar.js";
import axios from "axios";
import "./css/Dashboard.css";
import toast, { Toaster } from "react-hot-toast";
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

  // ======= SUBIR FOTO =======
  const manejarFoto = async (event) => {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.append("foto", archivo);
    formData.append("userId", user.id);

    try {
      const res = await axios.post(
        "http://localhost:3333/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        toast.success("Foto actualizada!");
        setUser({ ...user, fotoPerfil: res.data.url });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al subir imagen.");
    }
  };

  const tipoDeCuenta = () => {
    const foto =
      user?.fotoPerfil || (user?.tipoCuenta === 1 ? tienda : personita);

    return (
      <>
        <div
          className="profile-container"
          onClick={() => document.getElementById("input-foto").click()}
        >
          <img src={foto} alt="Perfil" className="icono-tienda" />

          {/* Input oculto */}
          <input
            type="file"
            id="input-foto"
            onChange={manejarFoto}
            style={{ display: "none" }}
            accept="image/*"
          />

          <div className="overlay">Cambiar foto de perfil</div>
        </div>

        {user?.tipoCuenta === 1 ? (
          <>
            {categoria()}

            {/* INICIO: Contenedor con clase para estilos de formulario */}
            <div className="category-form">
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
              <button onClick={handleSubmit} className="btn-primary-action">
                Cambiar categoría
              </button>
            </div>
            <h4>Telefono:{user?.telefono}</h4>
            {/* NOTA: También he añadido la clase btn-primary-action al botón */}
            {/* FIN: Contenedor con clase para estilos de formulario */}

            <p>Tu cuenta es proveedor.</p>
          </>
        ) : (
          // ...: (
          <p>Tu cuenta es usuario.</p>
        )}
      </>
    );
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
    if (!opcion) return alert("Seleccioná una categoría.");

    try {
      const res = await axios.post(
        "http://localhost:3333/api/actualizarCategoria",
        { categoria: opcion, id: user?.id }
      );

      if (res.data.success) {
        toast.success("Categoría actualizada.");
        setUser({ ...user, categoria: parseInt(opcion) });
      }
    } catch (error) {
      toast.error("Error actualizando categoría.");
    }
  };

  return (
    <main className="main-dashboard">
      <header>
        <Toaster position="top-right" />
        <Navbar />
      </header>

      <div className="dashboard-card">
        <h1>Bienvenido/a {user?.nombre}!</h1>

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
