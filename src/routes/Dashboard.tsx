import { useAuth } from "../auth/authProvider";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../auth/useLocalStorage";
import Navbar from "../Components/Navbar.jsx";

function Dashboard() {
  const auth = useAuth();
  const navegar = useNavigate();
  const [user, setUser] = useLocalStorage("user", null);

  function handleLogout() {
    auth.logout();
    setUser(null);
    navegar("/");
  }
  function tipoDeCuenta() {
    if (user?.tipoCuenta === 1) {
      return <h3>Tu cuenta es proveedor.</h3>;
    } else {
      return <h3>Tu cuenta es usuario.</h3>;
    }
  }
  function categoria() {
    if (user?.categoria === 0) {
      return <h3>Tu categoria es Educacion</h3>;
    } else if (user?.categoria === 1) {
      return <h3>Tu categoria es Tecnologia</h3>;
    } else if (user?.categoria === 2) {
      return <h3>Tu categoria es Administrativo</h3>;
    } else if (user?.categoria === 3) {
      return <h3>Tu categoria es Mascotas</h3>;
    } else if (user?.categoria === 4) {
      return <h3>Tu categoria es Servicios y Talleres</h3>;
    } else if (user?.categoria === 5) {
      return <h3>Tu categoria es Salud</h3>;
    } else if (user?.categoria === 6) {
      return <h3>Tu categoria es Belleza y Cuidado</h3>;
    }
  }

  return (
    <main>
      <header>
        <Navbar />
      </header>
      <h1>Bienvenido {user?.nombre}!</h1>
      {categoria()}
      {tipoDeCuenta()}
      <p>Este es tu dashboard.</p>
      <button
        type="button"
        className="btn btn-outline-danger"
        onClick={handleLogout}
      >
        Salir
      </button>
    </main>
  );
}

export default Dashboard;
