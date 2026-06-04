import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { STORAGE_KEYS } from "../constants";

export const useNavbar = () => {
  const { isLoggedIn, user, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const rawName = user?.name || localStorage.getItem(STORAGE_KEYS.USER_NAME) || "User";
  const firstName = rawName.split(" ")[0];
  const displayLetter = rawName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return {
    isLoggedIn,
    loading,
    isOpen,
    toggleMenu,
    closeMenu,
    logout: handleLogout,
    userInfo: {
      firstName,
      displayLetter,
      fullName: rawName,
    },
  };
};