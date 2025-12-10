import React, { useState, useEffect } from "react";
import Navbar from "./Navbar.js";
import Footer from "./Footer.js";
import axios from "axios";
import useLocalStorage from "../auth/useLocalStorage.js";
import "../routes/css/Home.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import banner5 from "../img/banner5.jpg";
import banner9 from "../img/banner9.jpg";
import banner6 from "../img/banner6.jpg";

/* ============================================================
  CARRUSEL SIMPLE
============================================================ */
const CAROUSEL_ITEMS = [
  {
    src: banner6,
    title: "Agendá en segundos 🕒",
    subtitle: "Turnos rápidos y sin complicaciones.",
  },
  {
    src: banner5,
    title: "Conectate con profesionales 🤝",
    subtitle: "Elegí entre cientos de proveedores.",
  },
  {
    src: banner9,
    title: "Recordatorios automáticos 🔔",
    subtitle: "Nunca más te olvides de un turno.",
  },
];

function SimpleCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToNext = () =>
    setActiveIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
  const goToPrev = () =>
    setActiveIndex(
      (prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length
    );
  const goToSlide = (index) => setActiveIndex(index);

  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel-container">
      <div
        className="carousel-content"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {CAROUSEL_ITEMS.map((item, index) => (
          <div key={index} className="carousel-slide">
            <img src={item.src} alt={`Slide ${index + 1}`} />
            <div className="carousel-caption">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-btn left" onClick={goToPrev}>
        {"<"}
      </button>
      <button className="carousel-btn right" onClick={goToNext}>
        {">"}
      </button>

      <div className="carousel-indicators">
        {CAROUSEL_ITEMS.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === activeIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
  HOME INVITADO
============================================================ */
function HomeInvitado({ navigate }) {
  return (
    <main className="invitado-container">
      <Navbar />
      <div className="invitado-content">
        <h1 className="invitado-title">
          Bienvenido a TurnoSmart <span className="hand">👋</span>
        </h1>
        <p className="invitado-subtitle">
          Gestioná tus turnos de manera rápida, fácil y segura.
        </p>
        <div className="invitado-buttons">
          <button
            className="btn-invitado-primary"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
          <button
            className="btn-invitado-secondary"
            onClick={() => navigate("/registrarse")}
          >
            Crear Cuenta
          </button>
        </div>
        <SimpleCarousel />
      </div>
    </main>
  );
}

/* ============================================================
  HOME LOGUEADO
============================================================ */
function Home() {
  const [user] = useLocalStorage("user", null);
  const [turnosAgendados, setTurnosAgendados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [turnos, setTurnos] = useState([]);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  if (!user) return <HomeInvitado navigate={navigate} />;

  /* ======================= TRAER TURNOS AGENDADOS ======================= */
  useEffect(() => {
    if (!user?.id) return;
    const fetchTurnosAgendados = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://api-node-turnos.onrender.com/api/turnosDelUsuario/${user.id}`,
          { params: { tipoCuenta: user.tipoCuenta } }
        );
        setTurnosAgendados(res.data?.turnosAgendados || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTurnosAgendados();
  }, [user?.id, user?.tipoCuenta]);

  /* ======================= TRAER TURNOS DISPONIBLES ======================= */
  useEffect(() => {
    if (!user?.id || user.tipoCuenta === 0) return;
    const fetchTurnosDisponibles = async () => {
      try {
        const res = await axios.post(
          "https://api-node-turnos.onrender.com/api/buscarTurnos",
          { id: user.id }
        );
        setTurnos(res.data.result || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTurnosDisponibles();
  }, [user?.id, user.tipoCuenta]);

  /* ======================= ELIMINAR TURNO ======================= */
  const borrarTurno = async (id) => {
    const notify = toast.loading("Eliminando turno...");
    try {
      const res = await axios.post(
        "https://api-node-turnos.onrender.com/api/borrarTurnoDisponible",
        { id }
      );
      if (res.data.success) {
        setTurnos((prev) => prev.filter((t) => t.id !== id));
        toast.success("Turno eliminado con éxito.", { id: notify });
      } else {
        toast.error(res.data.message || "No se pudo eliminar el turno.", {
          id: notify,
        });
      }
    } catch {
      toast.error("Error en el servidor", { id: notify });
    }
  };

  const handleRedirectRipple = (e, index) => {
    const btn = e.currentTarget;
    btn.classList.add("ripple");
    setTimeout(() => {
      btn.classList.remove("ripple");
      navigate(`/proveedores/${index}`);
    }, 600);
  };

  return (
    <main className="home-container">
      <header>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontSize: "1.1rem", padding: "14px 18px", borderRadius: "10px" },
          }}
        />
        <Navbar />
      </header>

      <div className="content-wrapper">
        <section className="home-grid">
          {user.tipoCuenta === 0 ? (
            <div className="home-card full-card">
              <h2 className="category-title">Categorías:</h2>
              <div className="category-grid-buttons user-mode">
                {[
                  "Educación 📚",
                  "Tecnología 💻",
                  "Administrativos / Profesionales 💼",
                  "Mascotas 🐾",
                  "Salud y Bienestar 🧘",
                  "Belleza y Cuidado Personal 💅",
                ].map((cat, index) => (
                  <button
                    key={index}
                    className="category-action-button"
                    onClick={(e) => handleRedirectRipple(e, index)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* TURNOS DISPONIBLES */}
              <div className="home-card small-card">
                <h2 className="agregar-turnos-titulo">
                  <a href="/turnosdisponibles" className="turno-titulo">
                    Turnos Disponibles +
                  </a>
                  <i
                    className="fa-solid fa-pen-to-square"
                    style={{
                      cursor: "pointer",
                      fontSize: hover ? "22px" : "18px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onClick={() => navigate(`/verturnosproveedor/${user.id}`)}
                  />
                </h2>

                <div className="turnos-lista">
                  {turnos.length > 0 ? (
                    turnos.map((t) => (
                      <div key={t.id} className="turno-box">
                        <div className="turno-info">
                          <p className="turno-fecha">
                            📅 {new Date(t.fecha).toLocaleDateString("es-AR")}
                          </p>
                          <p className="turno-hora">
                            ⏰ {t.hora_inicio} a {t.hora_fin}
                          </p>
                        </div>
                        <button
                          className="btn-eliminar-turno"
                          onClick={() => borrarTurno(t.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="sin-turnos">No hay turnos disponibles. **Agregá uno!**</p>
                  )}
                </div>
              </div>

              {/* BUSCAR PROFESIONALES */}
              <div className="home-card large-card">
                <h2 className="buscar-categoria">Buscar Profesionales:</h2>
                <div className="categorias-botones provider-mode">
                  {[
                    "Educación 📚",
                    "Tecnología 💻",
                    "Administrativos 💼",
                    "Mascotas 🐾",
                    "Salud y Bienestar 🧘",
                    "Belleza y Cuidado 💅",
                  ].map((cat, index) => (
                    <button
                      key={index}
                      className="categoria-btn"
                      onClick={() => navigate(`/proveedores/${index}`)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* MIS TURNOS AGENDADOS */}
        <section className="bottom-section">
          <div className="home-card full-card">
            <h2>
              Mis Turnos Agendados
              <i
                className="fa-regular fa-eye"
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  color: "var(--light-blue)",
                  fontSize: "1.5rem",
                  marginLeft: "auto",
                }}
                onClick={() =>
                  navigate(
                    user.tipoCuenta === 1
                      ? `/turnosagendadosproveedor`
                      : `/turnosagendadosusuario`
                  )
                }
              />
            </h2>

            {loading && <p className="loading-text">Cargando...</p>}

            {!loading && turnosAgendados.length === 0 && (
              <p className="no-turnos-agendados">
                **¡Genial!** No hay turnos agendados pendientes.
              </p>
            )}

            {!loading && turnosAgendados.length > 0 && (
              <div className="turnos-agendados-lista">
                {turnosAgendados.map((t, index) => (
                  <div key={index} className="turno-agendado-item appointment-card">
                    <div className="info-principal">
                      {user.tipoCuenta === 1 ? (
                        <span className="proveedor-nombre">
                          Cliente: {t.nombre || "Desconocido"}
                        </span>
                      ) : (
                        <span className="proveedor-nombre">
                          Proveedor: {t.proveedorNombre}
                        </span>
                      )}
                    </div>

                    <div className="info-detalle">
                      <p className="detalle-fecha">
                        Fecha: <strong>{new Date(t.fecha).toLocaleDateString("es-AR")}</strong>
                      </p>
                      {Array.isArray(t.horas) ? (
                        <p className="detalle-hora">
                          Horas: <strong>{t.horas.join(", ")}</strong>
                        </p>
                      ) : (
                        <p className="detalle-hora">Sin horas asignadas</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

export default Home;
