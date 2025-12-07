// src/routes/VerPerfil.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import "./css/VerPerfil.css";
import toast, { Toaster } from "react-hot-toast";
import personita from "../img/personita2.png";
import tienda from "../img/tienda.png";
import useLocalStorage from "../auth/useLocalStorage";
import Footer from "../Components/Footer";

function VerPerfilUsuario() {
  const { usuarioid } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useLocalStorage("user", null);

  // Cargar perfil desde backend (useEffect se mantiene igual)
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/perfilusuario/${usuarioid}`
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

  // formatoWhatsapp se mantiene igual
  const formatoWhatsapp = (numeroArgentino) => {
    if (!numeroArgentino) return "";

    const soloNumeros = numeroArgentino.replace(/\D/g, "");

    const sinCero = soloNumeros.startsWith("0")
      ? soloNumeros.substring(1)
      : soloNumeros;
    return `+54${sinCero}`;
  };

  // tipoDeCuenta se mantiene igual
  const tipoDeCuenta = () => {
    const foto = perfil?.fotoPerfil || personita;

    return (
      <div
        style={{ marginLeft: "36%" }}
        className="perfil-container"
        onClick={() => document.getElementById("input-foto").click()}
      >
        <div className="perfil-containerusuario">
          <img src={foto} alt="Perfil" className="profile-imgusuario" />
        </div>
        <input
          type="file"
          id="input-foto"
          style={{ display: "none" }}
          accept="image/*"
        />
      </div>
    );
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!perfil) return <p>Perfil no encontrado</p>;

  return (
    // 1. Contenedor Principal: Clase para aplicar Flexbox Vertical y 100vh
    <main className="main-app-container">
      <header>
        <Toaster position="top-right" />
        <Navbar />
      </header>

      {/* 2. CONTENEDOR INTERMEDIO QUE CRECE: Aplica flex-grow: 1 en el CSS */}
      <div className="content-wrapper">
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

        <div className="dashboard-card">
          <h1>Este es el perfil de {perfil.nombre}!</h1>

          <div className="perfil-container">
            <img src={perfil.fotoPerfil} alt="Perfil" className="profile-img" />
          </div>
          <a
            className="gmail-contact-btn"
            href={`mailto:${perfil.gmail}`}
            style={{ marginTop: "5%" }}
          >
            Gmail: {perfil.gmail}
          </a>
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
