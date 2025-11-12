import ReactDOM from "react-dom/client";
import Home from "./Components/Home";
import App from "./Components/App";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Productos, DetalleProducto, Carrito } from "./Components/Home";
import Login from "./routes/Login";
import Singup from "./routes/Singup";
import Dashboard from "./routes/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthProvider from "./auth/authProvider";
import TurnosDisponible from "./routes/TurnosDisponible";
import TurnosPublicados from "./routes/TurnosPublicados";
import TusTurnos from "./routes/TusTurnos";
import AgendarTurno from "./routes/AgendarTurno";
import TurnosAgendados from "./routes/TurnosAgendados";
import TurnosAgendadosUsuario from "./routes/TurnosAgendadosUsuario";
import ProveedoresPorCategoria from "./routes/TurnosCategoria";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrarse" element={<Singup />} />
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
        </Route>
        <Route path="/turnos" element={<TurnosPublicados />} />
        <Route path="/asignarturnos/:proveedorid" element={<AgendarTurno />} />
        <Route path="/agendarturno" element={<AgendarTurno />} />
        <Route path="/turnospublicados" element={<TurnosPublicados />} />
        <Route path="/turnosdisponibles" element={<TurnosDisponible />} />
        <Route path="/turnosagendados" element={<TurnosAgendados />} />
        <Route
          path="/turnosagendadosusuario"
          element={<TurnosAgendadosUsuario />}
        />
        <Route
          path="/proveedores/:categoriaId"
          element={<ProveedoresPorCategoria />}
        />
        <Route path="/tusturnos" element={<TusTurnos />} />
        <Route path="/detalle" element={<DetalleProducto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/app" element={<App />} />

        <Route path="/turnosagendadosjson" element={<TurnosAgendados />} />
      </Routes>
    </Router>
  </AuthProvider>
);
