import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Components/Navbar";
import axios from "axios";
import "./ProveedoresPorCategoria.css";

function ProveedoresPorCategoria() {
  const { categoriaId } = useParams();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nombresCategorias = [
    "Educación",
    "Tecnología",
    "Administrativo / Profesional",
    "Mascotas",
    "Salud y Bienestar",
    "Belleza y Cuidado Personal",
  ];

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/api/buscarCategoria/${categoriaId}`
        );
        if (res.data.success) {
          setProveedores(res.data.proveedores);
        } else {
          setError("No se encontraron proveedores.");
        }
      } catch (err) {
        console.error(err);
        setError("No se encontraron proveedores");
      } finally {
        setLoading(false);
      }
    };

    fetchProveedores();
  }, [categoriaId]);

  if (loading) return <p>Cargando proveedores...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <Navbar />
      <h1>Proveedores de {nombresCategorias[categoriaId]}</h1>
      {proveedores.length > 0 ? (
        <div className="contenedor-proveedores">
          {proveedores.map((prov) => (
            <div className="card-proveedor" key={prov.id}>
              <h5>{prov.nombre}</h5>
              <p>Contacto: {prov.gmail}</p>
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
