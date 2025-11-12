import React, { useState, useEffect } from "react";
import Card from "./Card.jsx";
import Navbar from "./Navbar.jsx";
import axios from "axios";
import useLocalStorage from "../auth/useLocalStorage";
import usePeticionBD from "./PeticionBD";
import "./Home.css";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // 🔹 Redirección según categoría
  const irACategoria = (categoriaId) => {
    navigate(`/proveedores/${categoriaId}`);
  };

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
      } finally {
        setLoading(false);
      }
    };

    fetchTurnosAgendados();
  }, [user?.id, user?.tipoCuenta]);

  return (
    <main className="home-container">
      <header>
        <Navbar />
      </header>

      <section>
        {/* Sección principal */}
        <div className="home-grid">
          {/* CARD DE AGREGAR TURNOS */}
          <StyleCards
            className="home-card small-card"
            width="49.5%"
            heigth="20rem"
            background="#E8DAD0"
          >
            <h2>
              <a href="/turnosdisponibles">Agregar Turnos</a>
            </h2>
          </StyleCards>

          {/* CARD DE PROVEEDORES */}
          <StyleCards
            className="home-card large-card"
            width="49.5%"
            heigth="20rem"
            background="#D6C2B7"
          >
            <h2>Conoce Proveedores</h2>

            <button
              className="card-button proveedores"
              style={{ margin: "3px" }}
              onClick={() => irACategoria(0)}
            >
              Educación
            </button>
            <button
              className="card-button proveedores"
              style={{ margin: "3px" }}
              onClick={() => irACategoria(1)}
            >
              Tecnología
            </button>
            <button
              className="card-button proveedores"
              style={{ margin: "3px" }}
              onClick={() => irACategoria(2)}
            >
              Administrativos / Profesionales
            </button>
            <button
              className="card-button proveedores"
              style={{ margin: "3px" }}
              onClick={() => irACategoria(3)}
            >
              Mascotas
            </button>
            <button
              className="card-button proveedores"
              style={{ margin: "3px" }}
              onClick={() => irACategoria(4)}
            >
              Salud y Bienestar
            </button>
            <button
              className="card-button proveedores"
              style={{ margin: "3px" }}
              onClick={() => irACategoria(5)}
            >
              Belleza y Cuidado Personal
            </button>
          </StyleCards>
        </div>

        {/* Sección inferior - MIS TURNOS */}
        <div className="bottom-section">
          <StyleCards
            className="home-card full-card"
            width="100%"
            heigth="100%"
            background="#A58C78"
          >
            <h2 style={{ color: "#fff" }}>Mis Turnos</h2>

            {loading && <p style={{ color: "#fff" }}>Cargando...</p>}

            {!loading && turnosAgendados.length === 0 && (
              <p style={{ color: "#fff" }}>No hay turnos agendados.</p>
            )}

            {!loading &&
              turnosAgendados.map((turno, index) => (
                <div key={index} className="turno-item">
                  <p>
                    Nombre del proveedor:{" "}
                    <strong>
                      {turno.proveedorNombre},{turno.proveedorid}
                    </strong>
                  </p>
                  <p>
                    Usuario: {turno.nombre}, {turno.userid}
                  </p>
                  <p>
                    Fecha: {new Date(turno.fecha).toLocaleDateString("es-AR")}
                  </p>

                  {Array.isArray(turno.horas) && turno.horas.length > 0 ? (
                    <p>Horas: {turno.horas.join(", ")}</p>
                  ) : (
                    <p>Sin horas asignadas</p>
                  )}
                </div>
              ))}
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
