import React, { useState, useEffect } from "react";
import Card from "./Card.js";
import Navbar from "./Navbar.js";
import axios from "axios";
import useLocalStorage from "../auth/useLocalStorage.js";
import usePeticionBD from "./PeticionBD.js";
import "../routes/css/Home.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

function StyleCards({ background, width, heigth, className, children }) {
  return (
    <Card
      className={className}
      style={{
        backgroundColor: background,
        width: width,
        height: heigth,
      }}
    >
      {children}
    </Card>
  );
}

function Home() {
  const [user] = useLocalStorage("user", null);
  const [turnosAgendados, setTurnosAgendados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [turnos, setTurnos] = useState([]);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  // Función para navegar a la página de categorías
  const irACategoria = (categoriaId) => {
    navigate(`/proveedores/${categoriaId}`);
  };

  // useEffect para cargar los turnos agendados del usuario
  useEffect(() => {
    if (!user?.id) return;

    const fetchTurnosAgendados = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:3333/api/turnosDelUsuario/${user.id}`,
          {
            params: { tipoCuenta: user.tipoCuenta },
          }
        );

        if (res.data?.turnosAgendados) {
          setTurnosAgendados(res.data.turnosAgendados);
        } else {
          setTurnosAgendados([]);
        }
      } catch (err) {
        console.error("Error al traer turnos agendados:", err);
        setTurnosAgendados([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTurnosAgendados();
  }, [user?.id, user?.tipoCuenta]);

  // useEffect para cargar los turnos disponibles (si el usuario es un proveedor)
  useEffect(() => {
    if (!user?.id) return;

    const fetchTurnosDisponibles = async () => {
      try {
        const res = await axios.post("http://localhost:3333/api/buscarTurnos", {
          id: user.id,
        });
        console.log("Turnos Disponibles:", res.data.result);
        setTurnos(res.data.result || []);
      } catch (err: any) {
        console.error(
          "Error al traer turnos disponibles:",
          err.response?.data || err.message
        );
      }
    };

    fetchTurnosDisponibles();
  }, [user?.id]);

  // Función para manejar la eliminación de un turno disponible
  const handleSubmit = async (id) => {
    if (!user?.id) return;

    try {
      const res = await axios.post(
        "http://localhost:3333/api/borrarTurnoDisponible",
        { id }
      );

      if (res.data.success) {
        setTurnos((prevTurnos) => prevTurnos.filter((t) => t.id !== id));
        toast.success("Turno eliminado con éxito.");
      } else {
        toast.error(res.data.message || "No se pudo eliminar el turno.");
      }
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      toast.error("Error en el servidor al intentar eliminar el turno.");
    }
  };

  return (
    <main className="home-container">
      <header>
        {/* Componente Navbar */}
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

      <section>
        <div className="home-grid">
          {user?.tipoCuenta === 0 ? (
            // CARD DE BUSCAR EN CATEGORÍAS
            <div className="divcategorias">
              <h2 className="category-title">Categorias:</h2>
              <div className="category-grid-buttons">
                {[
                  "Educación",
                  "Tecnología",
                  "Administrativos / Profesionales",
                  "Mascotas",
                  "Salud y Bienestar",
                  "Belleza y Cuidado Personal",
                ].map((cat, index) => (
                  <button
                    key={index}
                    className="category-action-button"
                    onClick={() => irACategoria(index)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* CARD DE TURNOS DEL PROVEEDOR */}
              <StyleCards
                className="home-card small-card"
                width="49%"
                height="20rem"
                background="#fff"
              >
                <h2 className="agregar-turnos-titulo">
                  <a href="/turnosdisponibles" className="turno-titulo">
                    Agregar Turnos +
                  </a>

                  <i
                    className="fa-solid fa-pen-to-square"
                    style={{
                      marginLeft: "60%",
                      cursor: "pointer",
                      fontSize: hover ? "22px" : "18px",
                      color: hover ? "#007bff" : "#000",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onClick={() => navigate(`/verturnosproveedor/${user?.id}`)}
                  />
                </h2>

                <div className="turnos-lista">
                  {turnos.length > 0 ? (
                    turnos.map((t) => (
                      <div key={t.id} className="turno-box">
                        <div className="turno-info">
                          <p className="turno-fecha">
                            {new Date(t.fecha).toLocaleDateString("es-AR")}
                          </p>
                          <p className="turno-hora">
                            {t.hora_inicio} a {t.hora_fin}
                          </p>
                        </div>
                        <button
                          className="btn-eliminar-turno"
                          onClick={() => handleSubmit(t.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="sin-turnos">No hay turnos disponibles</p>
                  )}
                </div>
              </StyleCards>

              {/* CARD DE BUSCAR EN CATEGORÍAS */}
              <StyleCards
                className="home-card large-card"
                width="49.5%"
                height="20rem"
                background="#fff"
              >
                <h2 className="buscar-categoria">Buscar en categorías:</h2>
                <div className="categorias-botones">
                  {[
                    "Educación",
                    "Tecnología",
                    "Administrativos / Profesionales",
                    "Mascotas",
                    "Salud y Bienestar",
                    "Belleza y Cuidado Personal",
                  ].map((cat, index) => (
                    <button
                      key={index}
                      className="categoria-btn"
                      onClick={() => irACategoria(index)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </StyleCards>
            </>
          )}
        </div>

        {/* Sección inferior - MIS TURNOS */}
        <div className="bottom-section">
          <StyleCards
            className="home-card full-card"
            width="100%"
            height="100%"
            background="#f4f4f4"
          >
            <h2 style={{ color: "#2196f3" }}>Mis Turnos</h2>

            {user?.tipoCuenta === 1 ? (
              <i
                className="fa-regular fa-eye"
                style={{
                  marginLeft: "90%",
                  cursor: "pointer",
                  fontSize: hover ? "22px" : "18px",
                  color: hover ? "#007bff" : "#000",
                  transition: "all 0.2s ease",
                }}
                onClick={() => navigate(`/turnosagendadosproveedor`)}
              />
            ) : (
              <i
                className="fa-regular fa-eye"
                style={{
                  marginLeft: "90%",
                  cursor: "pointer",
                  fontSize: hover ? "22px" : "18px",
                  color: hover ? "#007bff" : "#000",
                  transition: "all 0.2s ease",
                }}
                onClick={() => navigate(`/turnosagendadosusuario`)}
              />
            )}

            {loading && (
              <p style={{ color: "#2196f3" }}>Cargando turnos agendados...</p>
            )}
            {!loading && turnosAgendados.length === 0 && (
              <p style={{ color: "#2196f3" }}>No hay turnos agendados.</p>
            )}
            {!loading && turnosAgendados.length > 0 && (
              <div className="turnos-agendados-lista">
                {turnosAgendados.map((turno, index) => (
                  <div key={index} className="turno-agendado-item">
                    <div className="info-principal">
                      <span className="proveedor-nombre">
                        Agendado por: {turno.nombre}
                      </span>
                      <span className="usuario-nombre">
                        {turno.proveedorNombre}
                      </span>
                    </div>
                    <div className="info-detalle">
                      <p className="detalle-fecha">
                        Fecha:{" "}
                        <strong>
                          {new Date(turno.fecha).toLocaleDateString("es-AR")}
                        </strong>
                      </p>
                      {Array.isArray(turno.horas) && turno.horas.length > 0 ? (
                        <p className="detalle-hora">
                          Horas: <strong>{turno.horas.join(", ")}</strong>
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
        </div>
      </section>
    </main>
  );
}

function CrearTurnos() {
  const turnos = usePeticionBD("proveedores");
  return (
    <header>
      Header
      <Navbar />
    </header>
  );
}

function Productos() {
  return (
    <main>
      <header>
        Header
        <Navbar />
      </header>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          margin: "5%",
        }}
      >
        <StyleCards width="20%" background="#E9EEED" heigth="20rem" />
        <StyleCards width="20%" background="#E9EEED" heigth="20rem" />
        <StyleCards width="20%" background="#E9EEED" heigth="20rem" />
        <StyleCards width="20%" background="#E9EEED" heigth="20rem" />
      </div>
    </main>
  );
}

function DetalleProducto() {
  const turnos = usePeticionBD("proveedores");
  return (
    <main>
      <header>
        Header
        <Navbar />
      </header>
      {turnos.map((turno, id) => (
        <div
          key={id}
          className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light"
        >
          <div className="row shadow rounded bg-white w-75 h-75 overflow-hidden">
            <div className="col-md-6 p-0">
              <img
                src="https://picsum.photos/600/600"
                alt="Producto"
                className="img-fluid h-100 w-100 object-fit-cover"
              />
            </div>

            <div className="col-md-6 p-4 d-flex flex-column justify-content-between">
              <div>
                <h2 className="fw-bold mb-3">{turno.nombre}</h2>
                <h3 className="text-primary mb-3">{turno.turnos}</h3>
                <p className="mb-4">{turno.direccion}</p>
              </div>

              <div className="d-flex flex-column gap-3">
                <button className="btn btn-success btn-lg">
                  Comprar ahora
                </button>
                <button className="btn btn-outline-secondary btn-lg">
                  Añadir al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}

function Carrito() {
  const products = [
    {
      id: 1,
      name: "Producto 1",
      price: 199.99,
      quantity: 2,
      image: "https://picsum.photos/80/80?1",
    },
    {
      id: 2,
      name: "Producto 2",
      price: 349.99,
      quantity: 1,
      image: "https://picsum.photos/80/80?2",
    },
  ];

  const total = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  return (
    <main>
      <header>
        Header
        <Navbar />
      </header>
      <div className="container mt-5">
        <h2 className="mb-4">Tu Carrito</h2>
        <div className="list-group mb-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="list-group-item d-flex align-items-center justify-content-between"
            >
              <div className="d-flex align-items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-thumbnail"
                  style={{ width: "80px", height: "80px" }}
                />
                <div>
                  <h5 className="mb-1">{product.name}</h5>
                  <small>Cantidad: {product.quantity}</small>
                </div>
              </div>
              <div>
                <h5>${(product.price * product.quantity).toFixed(2)}</h5>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Total:</h4>
          <h4>${total.toFixed(2)}</h4>
        </div>

        <button className="btn btn-primary btn-lg w-100">
          Finalizar Compra
        </button>
      </div>
    </main>
  );
}

export default Home;
export { Productos, DetalleProducto, Carrito };
