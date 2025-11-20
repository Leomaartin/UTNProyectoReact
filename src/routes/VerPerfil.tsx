// src/routes/VerPerfil.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import "./css/VerPerfil.css";
import toast, { Toaster } from "react-hot-toast";

import tienda from "../img/tienda.png";
import useLocalStorage from "../auth/useLocalStorage";

function VerPerfil() {
  const navegar = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useLocalStorage("user", null);
  const { proveedorid } = useParams();

  // Cargar perfil desde backend
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/perfilproveedor/${proveedorid}`
        );

        console.log("✅ Datos que llegan del backend:", res.data);

        if (res.data.success) {
          setPerfil(res.data.perfil);
        } else {
          toast.error(res.data.message || "No se encontró el perfil");
        }
      } catch (err) {
        console.error("❌ Error al traer perfil:", err);
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [proveedorid]);

  const foto = () => {
    const foto = perfil?.fotoPerfil || tienda;
    return (
      <div
        className="profile-container"
        onClick={() => document.getElementById("input-foto").click()}
      >
        <img src={foto} alt="Perfil" className="icono-tienda" />

        <input id="input-foto" style={{ display: "none" }} accept="image/*" />
      </div>
    );
  };
  // Formato WhatsApp: +54 + código de área sin 0 + número
  const formatoWhatsapp = (numeroArgentino) => {
    if (!numeroArgentino) return "";

    const soloNumeros = numeroArgentino.replace(/\D/g, "");

    const sinCero = soloNumeros.startsWith("0")
      ? soloNumeros.substring(1)
      : soloNumeros;
    return `+54${sinCero}`;
  };

  const categoria = () => {
    switch (perfil.categoria) {
      case 0:
        return <h4>Tu categoría es Educación</h4>;
      case 1:
        return <h4>Tu categoría es Tecnología</h4>;
      case 2:
        return <h4>Tu categoría es Administrativo</h4>;
      case 3:
        return <h4>Tu categoría es Mascotas</h4>;
      case 4:
        return <h4>Tu categoría es Salud</h4>;
      case 5:
        return <h4>Tu categoría es Belleza y Cuidado</h4>;
      default:
        return null;
    }
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!perfil) return <p>Perfil no encontrado</p>;

  return (
    <main className="main-dashboard">
      <header>
        <Toaster position="top-right" />
        <Navbar />
      </header>

      <div className="dashboard-card">
        <h1>El turno pertenece a {perfil.nombre || "N/A"}</h1>
        {categoria()}
        {foto()}
        <p>Este es el perfil de proveedor</p>
        <h5>Si quieres contactarte:</h5>
        <p>Gmail:{perfil.gmail}</p>
        <p>Teléfono: {formatoWhatsapp(perfil.telefono)}</p>

        {/* Botón para abrir WhatsApp directamente */}
        <a
          href={`https://wa.me/${formatoWhatsapp(perfil.telefono).replace(
            "+",
            ""
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-contact-btn"
        >
          Contactar por WhatsApp
        </a>
      </div>
    </main>
  );
}

export default VerPerfil;
