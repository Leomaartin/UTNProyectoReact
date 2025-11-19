import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../Components/Navbar";
import "./css/ProveedoresPorCategoria.css";
import tienda from "../img/tienda.png";
function ProveedoresPorCategoria() {
  const { categoriaId } = useParams();
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const catIndex = Number(categoriaId);

  const nombresCategorias = [
    "Educación",
    "Tecnología",
    "Administrativo / Profesional",
    "Mascotas",
    "Salud y Bienestar",
    "Belleza y Cuidado Personal",
  ];

  const irACategoria = (id) => {
    navigate(`/proveedores/${id}`);
  };

  const handleCardClick = (id) => {
    navigate(`/asignarturnos/${id}`);
  };

  useEffect(() => {
    const fetchProveedores = async () => {
      if (
        isNaN(catIndex) ||
        catIndex < 0 ||
        catIndex >= nombresCategorias.length
      ) {
        setError("ID de categoría no válido.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3333/api/buscarCategoria/${categoriaId}`
        );

        if (res.data.success) {
          setProveedores(res.data.proveedores);
        } else {
          toast.error("No se encontraron proveedores.");
          setProveedores([]);
        }
      } catch (err) {
        console.error("Error fetching providers:", err);
        toast.error("Hubo un error al buscar proveedores.");
      } finally {
        setLoading(false);
      }
    };

    fetchProveedores();
  }, [categoriaId, catIndex]);

  if (loading)
    return <p className="loading-message">Cargando proveedores...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <main className="proveedores-categoria-main">
      <Toaster position="top-right" />

      <header>
        <Navbar />
      </header>

      <h1>Proveedores de {nombresCategorias[catIndex]}</h1>

      {/* BOTONES DE CATEGORÍA */}
      <div className="categorias-botones-2">
        {nombresCategorias.map((nombre, index) => (
          <button
            key={index}
            className={`categoria-btn-2 ${
              index === catIndex ? "active-btn" : ""
            }`}
            onClick={() => irACategoria(index)}
          >
            {nombre}
          </button>
        ))}
      </div>

      {/* LISTA DE PROVEEDORES */}
      {proveedores.length > 0 ? (
        <div className="contenedor-proveedores">
          {proveedores.map((prov) => (
            <div
              className="card-proveedor"
              key={prov.id}
              onClick={() => handleCardClick(prov.id)}
            >
              <div className="proveedor-header">
                <div className="proveedor-info-principal">
                  <h5>{prov.nombre}</h5>
                </div>

                {/* FOTO DEL PROVEEDOR */}
                <img
                  src={prov.fotoPerfil || tienda}
                  alt="foto proveedor"
                  className="proveedor-foto"
                />
              </div>

              <p className="contact-info">
                <span className="contact-icon">📧</span> {prov.gmail}
              </p>

              <div className="hover-action">
                <span>📅 Ver Turnos</span>
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
