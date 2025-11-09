import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Card from "../Components/Card.jsx";
import { useNavigate } from "react-router-dom";

function StyleCards({ background, width, heigth, children }) {
  return (
    <Card
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

function TurnosPublicados() {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchProveedores = async () => {
    try {
      const res = await axios.get("http://localhost:3333/api/reservarturnos");
      setProveedores(res.data);
    } catch (err) {
      console.error("Error al traer proveedores:", err);
    }
  };

  const fetchTurnos = async () => {
    try {
      const res = await axios.get("http://localhost:3333/api/infoturnos");
      setTurnos(res.data);
    } catch (err) {
      console.error("Error al traer turnos:", err);
    }
  };

  useEffect(() => {
    fetchProveedores();
    fetchTurnos();
  }, []);

  const handleCardClick = (id: number) => {
    navigate(`/asignarturnos/${id}`);
  };

  // filtrar proveedores que tienen turnos
  const proveedoresConTurnos = proveedores.filter((p) =>
    turnos.some((t) => t.id_proveedor === p.id)
  );

  return (
    <main>
      <header>
        <Navbar />
      </header>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          margin: "7%",
        }}
      >
        {proveedoresConTurnos.map((t) => (
          <div
            key={t.id}
            style={{ cursor: "pointer", flex: "0 0 25%" }}
            onClick={() => handleCardClick(t.id)}
          >
            <StyleCards
              key={t.id}
              width="100%"
              background="#E9EEED"
              heigth="12rem"
            >
              <h5>{t.nombre}</h5>
              <p>Id: {t.id}</p>
              <p>Teléfono: {t.telefono}</p>
            </StyleCards>
          </div>
        ))}
      </div>
    </main>
  );
}

export default TurnosPublicados;
