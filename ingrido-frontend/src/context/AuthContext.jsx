// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useBookmark } from "./BookmarkContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshBookmarks, clearBookmarks } = useBookmark();

  useEffect(() => {
    const token = localStorage.getItem("ingrido_token");
    const name = localStorage.getItem("user_name");
    if (token && name) {
      setIsLoggedIn(true);
      setUser({ name: name });
      setTimeout(() => {
        refreshBookmarks();
      }, 100);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setIsLoggedIn(true);
    const name = userData?.name || "User";
    setUser({ name });
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user_name", name);
    setTimeout(() => {
      refreshBookmarks();
    }, 100);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    clearBookmarks();
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