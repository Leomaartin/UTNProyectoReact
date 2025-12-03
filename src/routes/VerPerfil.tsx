// src/routes/VerPerfil.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import "./css/VerPerfil.css";
import toast, { Toaster } from "react-hot-toast";

import tienda from "../img/tienda.png";
import personita from "../img/personita2.png";
import Footer from "../Components/Footer";
import useLocalStorage from "../auth/useLocalStorage";

function VerPerfil() {
  const navigate = useNavigate();
  const { proveedorid } = useParams();

  const [perfil, setPerfil] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user] = useLocalStorage("user", null);

  // ================================
  // Cargar perfil y servicios (useEffect se mantiene igual)
  // ================================
  useEffect(() => {
    const fetchPerfilYServicios = async () => {
      try {
        const resPerfil = await axios.get(
          `http://localhost:3333/api/perfilproveedor/${proveedorid}`
        );

        if (resPerfil.data.success) setPerfil(resPerfil.data.perfil);
        else toast.error(resPerfil.data.message || "No se encontró el perfil");

        const resServicios = await axios.get(
          `http://localhost:3333/api/buscarservicio/${proveedorid}`
        );

        if (resServicios.data.success)
          setServicios(resServicios.data.servicios);
        else toast.error(resServicios.data.message || "No hay servicios");
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfilYServicios();
  }, [proveedorid]);

  const fotoPerfil = perfil?.fotoPerfil || tienda;

  // ================================
  // Formatear WhatsApp (se mantiene igual)
  // ================================
  const formatoWhatsapp = (numero) => {
    if (!numero) return "";
    const n = numero.replace(/\D/g, "");
    const sinCero = n.startsWith("0") ? n.substring(1) : n;
    return `+54${sinCero}`;
  };

  // ================================
  // Categoría (se mantiene igual)
  // ================================
  const categoriaTexto = () => {
    const categorias = [
      "Educación",
      "Tecnología",
      "Administrativo",
      "Mascotas",
      "Salud",
      "Belleza y Cuidado",
    ];
    return categorias[perfil?.categoria] || "Sin categoría";
  };

  // ================================
  // Loading / errores (se mantienen iguales)
  // ================================
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
        {/* ======================================
            CARD PRINCIPAL DEL PERFIL
        ======================================= */}
        <div className="nav-arrows" style={{ marginTop: "6%" }}>
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
        <div className="perfil-card">
          {/* Botones atrás / adelante */}

          <div className="divImg">
            <div className="current-category">{categoriaTexto()}</div>

            <div className="perfil-container">
              <img src={fotoPerfil} alt="Perfil" className="profile-img" />
            </div>
          </div>

          {/* Info del perfil */}
          <div className="divBotones">
            <h4>{perfil.servicio}</h4>

            <p>{perfil.descripcion}</p>

            <div className="contact-buttons-container">
              <h5>Si quieres contactarte:</h5>
              <a className="gmail-contact-btn" href={`mailto:${perfil.gmail}`}>
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
              >
                WhatsApp: {perfil.telefono}
              </a>
            </div>
          </div>
        </div>

        {/* ======================================
            LISTA DE SERVICIOS
        ======================================= */}
        <div className="nose">
          <h3 style={{ marginLeft: "20%" }}>Nuestros servicios</h3>

          {servicios.map((s) => (
            <div key={s.id} className="servicio-card">
              <img
                src={
                  s.imagen.startsWith("/")
                    ? `http://localhost:3333${s.imagen}`
                    : s.imagen
                }
                alt={s.nombre}
                className="servicio-img"
              />

              <div className="servicio-precio-fijo">Precio: ${s.precio}</div>

              <div className="servicio-info">
                <h4>{s.nombre}</h4>
                <p>{s.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* FIN: content-wrapper */}

      {/* 3. Footer: Este será empujado hacia el final de la ventana */}
      <Footer />
    </main>
  );
}

export default VerPerfil;
