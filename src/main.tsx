import ReactDOM from "react-dom/client";
import Home from "./Components/Home";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./Components/App";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./routes/Login";
import Singup from "./routes/Singup";
import Dashboard from "./routes/Dashboard";
import VerPerfil from "./routes/VerPerfil";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthProvider from "./auth/authProvider";
import TurnosDisponible from "./routes/TurnosDisponible";
import TurnosPublicados from "./routes/TurnosPublicados";
import TusTurnos from "./routes/TusTurnos";
import AgendarTurno from "./routes/AgendarTurno";
import TurnosAgendadoProveedor from "./routes/TurnosAgendadosProveeedor";
import TurnosAgendadosUsuario from "./routes/TurnosAgendadosUsuario";
import ProveedoresPorCategoria from "./routes/TurnosCategoria";
import VerTurnosProveedor from "./routes/VerTurnosProveedor";
import VerPerfilUsuario from "./routes/verPerfilUsuario";
import TurnosAgendadosProveedor from "./routes/TurnosAgendadosProveeedor";
import PagoExitoso from "./routes/PagoExitoso";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrarse" element={<Singup />} />

        <Route path="/turnos" element={<TurnosPublicados />} />
        <Route path="/asignarturnos/:proveedorid" element={<AgendarTurno />} />
        <Route path="/agendarturno" element={<AgendarTurno />} />
        <Route path="/turnospublicados" element={<TurnosPublicados />} />
        <Route path="/turnosdisponibles" element={<TurnosDisponible />} />
        <Route
          path="/verturnosproveedor/:proveedorid"
          element={<VerTurnosProveedor />}
        />
        <Route
          path="/turnosagendadosproveedor"
          element={<TurnosAgendadosProveedor />}
        />
        <Route
          path="/turnosagendadosusuario"
          element={<TurnosAgendadosUsuario />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/verperfilproveedor/:proveedorid"
          element={<VerPerfil />}
        />
        <Route
          path="/verperfilusuario/:usuarioid"
          element={<VerPerfilUsuario />}
        />

        <Route
          path="/proveedores/:categoriaId"
          element={<ProveedoresPorCategoria />}
        />
        <Route path="/tusturnos" element={<TusTurnos />} />
        <Route path="/app" element={<App />} />

        <Route
          path="/turnosagendadosjson"
          element={<TurnosAgendadosProveedor />}
        />
        <Route path="/pago-exitoso" element={<PagoExitoso />} />
      </Routes>
    </Router>
  </AuthProvider>
);
