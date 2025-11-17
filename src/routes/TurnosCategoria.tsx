import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Components/Navbar";
import axios from "axios";
import "./css/ProveedoresPorCategoria.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

function ProveedoresPorCategoria() {
  const { categoriaId } = useParams();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const nombresCategorias = [
    "Educación",
    "Tecnología",
    "Administrativo / Profesional",
    "Mascotas",
    "Salud y Bienestar",
    "Belleza y Cuidado Personal",
  ];
  const irACategoria = (categoriaId) => {
    navigate(`/proveedores/${categoriaId}`);
  };
  const handleCardClick = (id: number) => {
    navigate(`/asignarturnos/${id}`);
  };

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/buscarCategoria/${categoriaId}`
        );
        if (res.data.success) {
          setProveedores(res.data.proveedores);
        } else {
          toast.error("No se encontraron proveedores.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Hubo un error al buscar proveedores.");
      } finally {
        setLoading(false);
      }
    };

    fetchProveedores();
  }, [categoriaId]);

  if (loading) return <p>Cargando proveedores...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className="proveedores-categoria-main">
      <header>
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
      <h1>Proveedores de {nombresCategorias[categoriaId]}</h1>
      <div className="categorias-botones-2">
        <button className="categoria-btn-2" onClick={() => irACategoria(0)}>
          Educación
        </button>
        <button className="categoria-btn-2" onClick={() => irACategoria(1)}>
          Tecnología
        </button>
        <button className="categoria-btn-2" onClick={() => irACategoria(2)}>
          Administrativos / Profesionales
        </button>
        <button className="categoria-btn-2" onClick={() => irACategoria(3)}>
          Mascotas
        </button>
        <button className="categoria-btn-2" onClick={() => irACategoria(4)}>
          Salud y Bienestar
        </button>
        <button className="categoria-btn-2" onClick={() => irACategoria(5)}>
          Belleza y Cuidado Personal
        </button>
      </div>

      {proveedores.length > 0 ? (
        <div className="contenedor-proveedores">
          {proveedores.map((prov) => (
            <div
              className="card-proveedor"
              key={prov.id}
              onClick={() => handleCardClick(prov.id)}
            >
              <h5>{prov.nombre}</h5>
              <p className="contact-info">
                <span className="contact-icon">📧</span> Contacto: {prov.gmail}
              </p>
              <div className="hover-action">
                <span>📅Ver Turnos</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay proveedores en esta categoría.</p>
      )}
    </main>
  );
}

export default ProveedoresPorCategoria;
