import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../auth/authProvider";

function ProtectedRoute() {
  const auth = useAuth();

  return auth.isAuthenticated ? <Outlet /> : <Navigate to="/Login" />;
}

export default ProtectedRoute;
