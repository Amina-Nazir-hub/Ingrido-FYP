import { Link } from "react-router-dom";
import { NAV_LINKS } from "../constants";

export const AuthButtons = () => {
  return (
    <div className="flex items-center gap-4">
      <Link
        to={NAV_LINKS.AUTH.LOGIN}
        className="text-sm font-semibold text-primary-foreground px-3 py-2 rounded-md hover:bg-primary-foreground hover:text-primary transition-all"
      >
        Login
      </Link>
      <Link
        to={NAV_LINKS.AUTH.REGISTER}
        className="px-5 py-2.5 bg-primary-foreground text-primary text-sm font-semibold rounded-xl hover:bg-opacity-90 shadow-md transition-all"
      >
        Get Started
      </Link>
    </div>
  );
};
