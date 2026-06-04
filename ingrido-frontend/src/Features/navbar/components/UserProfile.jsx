import { Link } from "react-router-dom";
import { NAV_LINKS } from "../constants";

export const UserProfile = ({ displayLetter, displayName, onLogout }) => {
  return (
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
  );
};