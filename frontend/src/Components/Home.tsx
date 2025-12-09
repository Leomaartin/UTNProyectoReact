import React, { useState, useEffect } from "react";
import Card from "./Card.js";
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

// Datos del carrusel, más limpios aquí
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

/* ============================================================
  CARRUSEL HECHO CON REACT/CSS (REEMPLAZO DE BOOTSTRAP)
  ============================================================ */
function SimpleCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToNext = () =>
    setActiveIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
  const goToPrev = () =>
    setActiveIndex(
      (prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length
    );
  const goToSlide = (index) => setActiveIndex(index);

  // Auto-play
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
              <p>{item.subtitle}</p> {/* Se elimina el style inline */}
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
  HOME – USUARIO INVITADO (NO LOGUEADO)
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
          {/* Se elimina el style inline */}
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
  COMPONENTE REUTILIZABLE PARA TARJETAS
  ============================================================ */
// Se mantienen width y height, pero se manejan mejor en el CSS.
function StyleCards({ background, className, children }) {
  return (
    <Card
      className={className}
      style={{
        backgroundColor: background,
        // Eliminados: width, height. Ahora solo se usan clases CSS.
      }}
    >
      {children}
    </Card>
  );
}

/* ============================================================
  HOME – USUARIO LOGUEADO
  ============================================================ */
function Home() {
  const [user] = useLocalStorage("user", null);
  const [turnosAgendados, setTurnosAgendados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [turnos, setTurnos] = useState([]);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  /* Si NO hay usuario → mostrar HOME INVITADO */
  if (!user) return <HomeInvitado navigate={navigate} />;

  /* ============================================================
    TRAER TURNOS AGENDADOS
    ============================================================ */
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
        console.error("Error al traer turnos agendados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTurnosAgendados();
  }, [user?.id, user?.tipoCuenta]);

  /* ============================================================
    TRAER TURNOS DISPONIBLES (SI ES PROVEEDOR)
    ============================================================ */
  useEffect(() => {
    if (!user?.id || user.tipoCuenta === 0) return;

    const fetchTurnosDisponibles = async () => {
      try {
        const res = await axios.post(
          "https://api-node-turnos.onrender.com/api/buscarTurnos",
          {
            id: user.id,
          }
        );
        setTurnos(res.data.result || []);
      } catch (err) {
        console.error("Error al traer turnos disponibles:", err);
      }
    };

    fetchTurnosDisponibles();
  }, [user?.id, user.tipoCuenta]);

  /* ============================================================
    ELIMINAR TURNO DISPONIBLE
    ============================================================ */
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
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      toast.error("Error en el servidor", { id: notify });
    }
  };

  /* ============================================================
    ANIMACIÓN RIPPLE + REDIRECCIÓN
    ============================================================ */
  const handleRedirectRipple = (e, index) => {
    const btn = e.currentTarget;
    btn.classList.add("ripple");

    setTimeout(() => {
      btn.classList.remove("ripple");
      navigate(`/proveedores/${index}`);
    }, 600);
  };

  /* ============================================================
    RENDER PRINCIPAL USER LOGUEADO
    ============================================================ */
  return (
    <main className="home-container">
      <header>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "1.1rem",
              padding: "14px 18px",
              borderRadius: "10px",
            },
          }}
        />
        <Navbar />
      </header>

      <div className="content-wrapper">
        <section className="home-grid">
          {user.tipoCuenta === 0 ? (
            /* =========================== CATEGORÍAS – USUARIO NORMAL =========================== */
            <StyleCards
              className="home-card full-card"
              background="#fff"
              // Eliminados: width="100%" height="auto"
            >
              <h2 className="category-title" style={{ color: "#7b2cbf" }}>
                Categorías:
              </h2>

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
            </StyleCards>
          ) : (
            <>
              {/* =========================== PROVEEDOR – TURNOS DISPONIBLES =========================== */}
              <StyleCards
                className="home-card small-card"
                background="#fff"
                // Eliminados: width="49%" height="20rem"
              >
                <h2 className="agregar-turnos-titulo">
                  <a
                    href="/turnosdisponibles"
                    className="turno-titulo"
                    style={{ color: "#7b2cbf" }}
                  >
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
                    <p className="sin-turnos">
                      No hay turnos disponibles. **Agregá uno!**
                    </p>
                  )}
                </div>
              </StyleCards>

              {/* =========================== PROVEEDOR – BUSCAR CATEGORÍAS (Para reservar) =========================== */}
              <StyleCards
                className="home-card large-card"
                background="#fff"
                // Eliminados: width="49%" height="20rem"
              >
                <h2 className="buscar-categoria" style={{ color: "#7b2cbf" }}>
                  Buscar Profesionales:
                </h2>

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
              </StyleCards>
            </>
          )}
        </section>

        {/* =========================== MIS TURNOS AGENDADOS / RESERVADOS =========================== */}
        <section className="bottom-section">
          <StyleCards
            className="home-card full-card"
            background="#fff"
            // Eliminados: width="100%"
          >
            <h2 style={{ color: "#7b2cbf" }}>
              Mis Turnos Agendados
              <i
                className="fa-regular fa-eye"
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  color: "var(--light-blue)",
                  fontSize: "1.5rem",
                  marginLeft: "auto", // CLAVE: Cambiado de "70%" a "auto" para responsividad
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
                  <div
                    key={index}
                    className="turno-agendado-item appointment-card"
                  >
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
                        Fecha:{" "}
                        <strong>
                          {new Date(t.fecha).toLocaleDateString("es-AR")}
                        </strong>
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
          </StyleCards>
        </section>
      </div>

      <Footer />
    </main>
  );
}

export default Home;