import { useAuth } from "../auth/authProvider.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useLocalStorage from "../auth/useLocalStorage.js";
import Navbar from "../Components/Navbar.js";
import axios from "axios";
import "./css/Dashboard.css";
import toast, { Toaster } from "react-hot-toast";
import personita from "../img/personita2.png";
import tienda from "../img/tienda.png";

const CATEGORIES = [
  "Educación",
  "Tecnología",
  "Administrativo",
  "Mascotas",
  "Salud",
  "Belleza y Cuidado",
];

function Dashboard() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useLocalStorage("user", null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);

  const [descripcion, setDescripcion] = useState("");
  const [servicio, setServicio] = useState("");

  const [serviceData, setServiceData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    imagen: null,
  });

  const verperfilpublico = () => {
    navigate(`/verperfilproveedor/${userData?.id}`);
  }; 

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceData({ ...serviceData, [name]: value });
  };

  const handleServiceFileChange = (e) => {
    setServiceData({ ...serviceData, imagen: e.target.files[0] });
  };

  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);

  const handleLogout = () => {
    auth.logout();
    setUserData(null);
    navigate("/");
  };

  const navigateHome = () => navigate("/"); 

  const handleSubmitService = async (e) => {
    e.preventDefault();

    const { nombre, precio, descripcion, imagen } = serviceData;

    if (!nombre || !precio || !userData?.id) {
      toast.error("Faltan campos obligatorios");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombreservicio", nombre);
      formData.append("precio", precio);
      formData.append("id_proveedor", userData.id);
      formData.append("descripcion", descripcion);
      if (imagen) formData.append("imagen", imagen);

      const response = await axios.post(
        "https://api-node-turnos.onrender.com/api/agragarservicio",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        toast.success("Servicio agregado correctamente");
        setServiceData({
          nombre: "",
          precio: "",
          descripcion: "",
          imagen: null,
        });
        setShowServiceForm(false);
      } else {
        toast.error(response.data.message || "Error al agregar servicio");
      }
    } catch (error) {
      console.error("Error al agregar servicio:", error);
      toast.error("Error en el servidor");
    }
  }; // ===================================================== // API: CAMBIAR CATEGORÍA // =====================================================

  const handleSubmitCategory = async () => {
    if (!selectedCategory) return toast.error("Seleccioná una categoría.");

    try {
      const res = await axios.post(
        "http://localhost:3333/api/actualizarCategoria",
        {
          categoria: selectedCategory,
          id: userData?.id,
        }
      );

      if (res.data.success) {
        toast.success("Categoría actualizada.");
        setUserData({
          ...userData,
          categoria: parseInt(selectedCategory),
        });
      }
    } catch (error) {
      toast.error("Error actualizando categoría.");
    }
  }; // ===================================================== // API: GUARDAR DESCRIPCIÓN Y SERVICIO (USA MISMA API) // =====================================================

  const handleSubmitDescripcionServicio = async (e) => {
    e.preventDefault();

    const payload = { id: userData?.id };

    if (descripcion.trim() !== "") payload.descripcion = descripcion;
    if (servicio.trim() !== "") payload.servicio = servicio;

    if (!payload.descripcion && !payload.servicio) {
      toast.error("No hay cambios para guardar.");
      return;
    }

    try {
      const res = await axios.post(
        "https://backend-abc.onrender.com/api/actualizarCategoria",
        payload
      );

      if (res.data.success) {
        toast.success("Cambios guardados correctamente");

        setUserData({
          ...userData,
          ...payload,
        });

        setDescripcion("");
        setServicio("");
      }
    } catch (error) {
      toast.error("Error guardando cambios.");
      console.error(error);
    }
  }; // ===================================================== // SUBIR FOTO PERFIL // =====================================================

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);
    formData.append("userId", userData.id);

    try {
      const res = await axios.post(
        "https://api-node-turnos.onrender.com/api/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        toast.success("Foto actualizada!");
        setUserData({ ...userData, fotoPerfil: res.data.url });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al subir imagen.");
    }
  }; // ===================================================== // RENDERIZAR CATEGORÍA ACTUAL // =====================================================

  const renderCurrentCategory = () => {
    const currentCategoryName = CATEGORIES[userData?.categoria] || "Indefinida";
    return (
      <p
        className={`current-category cat-${userData?.categoria}`}
        style={{ backgroundColor: "#77e3f3ff", marginLeft: "-19px" }}
      >
                Tu categoría es <b>{currentCategoryName}</b>     {" "}
      </p>
    );
  };

  const getProfileImage = () => {
    if (userData?.fotoPerfil) return userData.fotoPerfil;
    return userData?.tipoCuenta === 1 ? tienda : personita;
  }; // ===================================================== // RENDER // =====================================================

  return (
    <main className="main-dashboard">
      <header>
        <Toaster position="top-right" />
        <Navbar />
      </header>

      <div
        style={{
          position: "absolute",
          display: "flex",
          gap: "8px",
          zIndex: 1000,
          left: "7%",
          marginTop: "10px",
        }}
      >
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

      <div className="dashboard-card">
        <h1>Bienvenido/a {userData?.nombre}!</h1>

        <div
          className="profile-container"
          onClick={() => document.getElementById("input-photo-upload").click()}
        >
          <img src={getProfileImage()} alt="Perfil" className="profile-photo" />

          <input
            type="file"
            id="input-photo-upload"
            onChange={handleProfilePhotoUpload}
            style={{ display: "none" }}
            accept="image/*"
          />

          <div className="profile-overlay">
            <i className="fa-solid fa-camera"></i>
            <span>Cambiar foto de perfil</span>
          </div>
        </div>

        {userData?.tipoCuenta === 1 ? (
          <>
            {renderCurrentCategory()}
            <div className="botoneseditarver">
              <button className="btn-view-public" onClick={verperfilpublico}>
                Ver perfil público
              </button>

              <button
                className="btn-edit-info"
                onClick={() => setShowEditPanel(!showEditPanel)}
              >
                {showEditPanel ? "Cerrar edición" : "Editar perfil"}
              </button>
            </div>

            <button
              className="btn-add-service"
              onClick={() => setShowServiceForm(!showServiceForm)}
            >
              {showServiceForm ? "Cerrar Formulario" : "Añadir Servicio"}
            </button>

            <div
              className={`service-panel-wrapper ${
                showServiceForm ? "is-open" : ""
              }`}
            >
              <form onSubmit={handleSubmitService} className="service-panel">
                <h3>Agregar Nuevo Servicio</h3>
                <input
                  type="text"
                  name="nombre"
                  value={serviceData.nombre}
                  onChange={handleServiceChange}
                  placeholder="Nombre del servicio"
                  required
                />
                <input
                  type="number"
                  name="precio"
                  value={serviceData.precio}
                  onChange={handleServiceChange}
                  placeholder="Precio (ej: 50.00)"
                  min="0"
                  step="0.01"
                  required
                />

                <textarea
                  name="descripcion"
                  value={serviceData.descripcion}
                  onChange={handleServiceChange}
                  placeholder="Descripción detallada del servicio (Opcional)"
                />

                <label htmlFor="service-image">
                  Foto del Servicio (Opcional):
                </label>

                <input
                  type="file"
                  id="service-image"
                  name="imagen"
                  onChange={handleServiceFileChange}
                  accept="image/*"
                />
                <button type="submit">Agregar Servicio</button>
              </form>
            </div>

            <div
              className={`edit-panel-wrapper ${showEditPanel ? "is-open" : ""}`}
            >
              <div className="edit-panel-content">
                <div className="category-form">
                  <label htmlFor="category-select">
                    Elegí una nueva categoría:
                  </label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value="">--Seleccioná--</option>
                    {CATEGORIES.map((name, index) => (
                      <option key={index} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleSubmitCategory}
                    className="btn-primary-action"
                  >
                    Cambiar categoría
                  </button>
                </div>
                <form
                  className="divinputdashboard"
                  onSubmit={handleSubmitDescripcionServicio}
                >
                  <input
                    type="text"
                    name="servicio"
                    placeholder="Escribi quien sos o que ofreces"
                    value={servicio}
                    onChange={(e) => setServicio(e.target.value)}
                  />

                  <input
                    type="text"
                    name="descripcion"
                    placeholder="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />

                  <button type="submit" className="btn-primary-action">
                    Guardar descripción y servicio
                  </button>
                </form>

                <p className="info-telefono">
                  <b>Teléfono:</b> {userData?.telefono}
                </p>

                <p className="info-cuenta">
                  Tu cuenta es de <b>Proveedor</b>.
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="info-cuenta">
            Tu cuenta es de <b>Usuario</b>.
          </p>
        )}

        <div className="action-buttons">
          <button type="button" className="btn-logout" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Salir
          </button>

          <button type="button" className="btn-home" onClick={navigateHome}>
            <i className="fa-solid fa-house"></i> Entrar
          </button>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
