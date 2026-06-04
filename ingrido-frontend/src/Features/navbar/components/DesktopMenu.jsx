import { Link } from "react-router-dom";
import { NAV_LINKS } from "../constants";

export const DesktopMenu = ({ isLoggedIn, displayLetter, displayName }) => {
  if (!isLoggedIn) {
    return (
      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-4">
          <Link to={NAV_LINKS.AUTH.LOGIN} className="text-sm font-semibold hover:text-primary">Login</Link>
          <Link to={NAV_LINKS.AUTH.REGISTER} className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-secondary shadow-md transition-all">
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-8">
      <div className="flex items-center gap-6">
        <nav className="flex items-center gap-6 text-sm font-semibold text-muted-foreground">
          <Link to={NAV_LINKS.PROTECTED.DASHBOARD} className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to={NAV_LINKS.PROTECTED.PLANNER} className="hover:text-primary transition-colors">
            Weekly Plan
          </Link>
          <Link to={NAV_LINKS.PROTECTED.SAVED} className="hover:text-primary transition-colors">
            Saved
          </Link>
          <Link to={NAV_LINKS.PROTECTED.CITY} className="hover:text-primary transition-colors">
            ExploreCity
          </Link>
        </nav>
        <div className="flex items-center gap-4 border-l pl-6 border-border">
          <Link to={NAV_LINKS.PROTECTED.PROFILE} className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all border border-primary/20">
            <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              {displayLetter}
            </div>
            <span className="text-sm font-bold text-primary">Chef {displayName}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};