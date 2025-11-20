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

function VerPerfilUsuario() {
  const { usuarioid } = useParams();
  const navegar = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useLocalStorage("user", null);

  // Cargar perfil desde backend
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
  const formatoWhatsapp = (numeroArgentino) => {
    if (!numeroArgentino) return "";

    const soloNumeros = numeroArgentino.replace(/\D/g, "");

    const sinCero = soloNumeros.startsWith("0")
      ? soloNumeros.substring(1)
      : soloNumeros;
    return `+54${sinCero}`;
  };

  const tipoDeCuenta = () => {
    const foto = perfil?.fotoPerfil || personita;

    return (
      <div
        className="profile-container"
        onClick={() => document.getElementById("input-foto").click()}
      >
        <img src={foto} alt="Perfil" className="icono-tienda" />

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
    <main className="main-dashboard">
      <header>
        <Toaster position="top-right" />
        <Navbar />
      </header>

      <div className="dashboard-card">
        <h1>Bienvenido/a {perfil.nombre || "N/A"}!</h1>
        <p>Este es el perfil de {perfil.tipo}</p>

        {tipoDeCuenta()}
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

export default VerPerfilUsuario;
