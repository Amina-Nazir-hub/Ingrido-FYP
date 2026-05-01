import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("ingrido_token");
    const name = localStorage.getItem("user_name");
    if (token && name) {
      setIsLoggedIn(true);
      setUser({ name: name });
    }
    setLoading(false);
  }, []);
  const login = (userData) => {
    setIsLoggedIn(true);
    const name = userData?.name || localStorage.getItem("user_name") || "User";
    setUser({ name });
    localStorage.setItem("isLoggedIn", "true");
  };
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
