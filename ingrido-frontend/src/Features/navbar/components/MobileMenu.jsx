import { Link } from "react-router-dom";
import { NAV_LINKS } from "../constants";

export const MobileMenu = ({ isOpen, isLoggedIn, onClose, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-0 right-0 bg-card border-b border-border p-6 flex flex-col gap-4 md:hidden shadow-2xl animate-in slide-in-from-top">
      {isLoggedIn ? (
        <>
          <Link to={NAV_LINKS.PROTECTED.DASHBOARD} onClick={onClose} className="font-bold py-2 border-b border-border">
            Dashboard
          </Link>
          <Link to={NAV_LINKS.PROTECTED.PLANNER} onClick={onClose} className="font-bold py-2 border-b border-border">
            Weekly Plan
          </Link>
          <Link to={NAV_LINKS.PROTECTED.SAVED} onClick={onClose} className="font-bold py-2 border-b border-border">
            Saved
          </Link>
          <Link to={NAV_LINKS.PROTECTED.CITY} onClick={onClose} className="font-bold py-2 border-b border-border">
            Explore City
          </Link>
          <Link to={NAV_LINKS.PROTECTED.PROFILE} onClick={onClose} className="font-bold py-2 border-b border-border">
            My Profile
          </Link>
          <button 
            onClick={onLogout} 
            className="bg-red-500 text-white p-3 rounded-xl text-center font-bold"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to={NAV_LINKS.AUTH.LOGIN} onClick={onClose} className="font-bold py-2 text-center">
            Login
          </Link>
          <Link to={NAV_LINKS.AUTH.REGISTER} onClick={onClose} className="bg-primary text-white p-3 rounded-xl text-center font-bold">
            Get Started
          </Link>
        </>
      )}
    </div>
  );
};