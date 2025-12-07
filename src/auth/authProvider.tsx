import { useContext, createContext, useState, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";
interface authProviderPorps {
  children: React.ReactNode;
}

const AuthContext = createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

function AuthProvider({ children }: authProviderPorps) {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage(
    "isAuthenticated",
    false
  );
  const login = () => {
    setIsAuthenticated(true);
  };
  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

export function useAuth() {
  return useContext(AuthContext);
}
