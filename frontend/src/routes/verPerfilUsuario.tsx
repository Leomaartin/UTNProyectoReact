import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import "./css/VerPerfil.css";
import toast, { Toaster } from "react-hot-toast";

// Asegúrate de que las importaciones de imágenes sigan siendo correctas
import tienda from "../img/tienda.png"; 
import personita from "../img/personita2.png"; 

import useLocalStorage from "../auth/useLocalStorage";
import Footer from "../Components/Footer";

function VerPerfilUsuario() {
  const { usuarioid } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useLocalStorage("user", null);
  
  // URL base del servidor de archivos para imágenes
  const BASE_URL = "https://api-node-turnos.onrender.com"; 

  // Cargar perfil desde backend
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await axios.get(
          `https://api-node-turnos.onrender.com/api/perfilusuario/${usuarioid}`
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
  }, [usuarioid]);

  // Función para construir la URL de WhatsApp (sin cambios)
  const formatoWhatsapp = (numeroArgentino) => {
    if (!numeroArgentino) return "";

    const soloNumeros = numeroArgentino.replace(/\D/g, "");

    const sinCero = soloNumeros.startsWith("0")
      ? soloNumeros.substring(1)
      : soloNumeros;
    return `+54${sinCero}`;
  };



  // ==========================================
  // RENDERIZADO CONDICIONAL
  // ==========================================
  if (loading) return <p>Cargando perfil...</p>;
  if (!perfil) return <p>Perfil no encontrado</p>;

  return (
    // 1. Contenedor Principal
    <main className="main-app-container">
      <header>
        <Toaster position="top-right" />
        <Navbar />
      </header>

      {/* 2. CONTENEDOR INTERMEDIO QUE CRECE */}
      <div className="content-wrapper">
        {/* Botones de navegación (posicionamiento absoluto) */}
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
            onClick={() => navigate(-1)}
            style={{ cursor: "pointer" }}
          ></i>
          <i
            className="fa-solid fa-forward"
            onClick={() => navigate(1)}
            style={{ cursor: "pointer" }}
          ></i>
        </div>

        {/* Card Principal del Perfil */}
        <div className="dashboard-card">
          <h1>Este es el perfil de {perfil.nombre}!</h1>

          {/* Contenedor de la imagen: Usa la URL construida */}
          <div className="perfil-container">
            <img src={perfil.fotoPerfil} alt={`Perfil de ${perfil.nombre}`} className="profile-img" />
          </div>
          
          {/* Botón de Gmail */}
          <a
            className="gmail-contact-btn"
            href={`mailto:${perfil.gmail}`}
            style={{ marginTop: "5%" }}
          >
            Gmail: {perfil.gmail}
          </a>
          
          {/* Botón de WhatsApp */}
          <a
            href={`https://wa.me/${formatoWhatsapp(perfil.telefono).replace(
              "+",
              ""
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-contact-btn"
            style={{ marginTop: "5%" }}
          >
            WhatsApp:{perfil.telefono}
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default VerPerfilUsuario;