import { Link } from "react-router-dom";
import { NAV_LINKS } from "../constants";

export const AuthButtons = () => {
  return (
    <div className="flex items-center gap-4">
      <Link to={NAV_LINKS.AUTH.LOGIN} className="text-sm font-semibold hover:text-primary transition-colors">
        Login
      </Link>
      <Link 
        to={NAV_LINKS.AUTH.REGISTER} 
        className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-secondary shadow-md transition-all"
      >
        Get Started
      </Link>
    </div>
  );
};