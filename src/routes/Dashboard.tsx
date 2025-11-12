import { useAuth } from "../auth/authProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useLocalStorage from "../auth/useLocalStorage";
import Navbar from "../Components/Navbar.jsx";
import axios from "axios";

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
      return <h3>Tu cuenta es proveedor.</h3>;
    } else {
      return <h3>Tu cuenta es usuario.</h3>;
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
        alert("Categoría actualizada correctamente.");
        setUser({ ...user, categoria: parseInt(opcion) });
      } else {
        alert(res.data.message || "No se pudo actualizar la categoría.");
      }
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      alert("Error en el servidor.");
    }
  };

  return (
    <main>
      <header>
        <Navbar />
      </header>

      <h1>Bienvenido {user?.nombre}!</h1>
      {categoria()}
      {tipoDeCuenta()}

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

        <p>Elegiste: {opcion}</p>
      </div>

      <p>Este es tu dashboard.</p>
      <button
        type="button"
        className="btn btn-outline-danger"
        onClick={handleLogout}
      >
        Salir
      </button>
    </main>
  );
}

export default Dashboard;
