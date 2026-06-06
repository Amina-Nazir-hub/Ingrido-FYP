import { Link } from "react-router-dom";
import { NAV_LINKS } from "../constants";

export const UserProfile = ({ displayLetter, displayName }) => {
  return (
    <div className="flex items-center gap-6">
      <nav className="flex items-center gap-2 text-sm font-semibold text-primary-foreground">
        <Link
          to={NAV_LINKS.PROTECTED.DASHBOARD}
          className="px-3 py-2 rounded-md hover:bg-primary-foreground hover:text-primary transition-all"
        >
          Dashboard
        </Link>
        <Link
          to={NAV_LINKS.PROTECTED.PLANNER}
          className="px-3 py-2 rounded-md hover:bg-primary-foreground hover:text-primary transition-all"
        >
          Weekly Plan
        </Link>
        <Link
          to={NAV_LINKS.PROTECTED.SAVED}
          className="px-3 py-2 rounded-md hover:bg-primary-foreground hover:text-primary transition-all"
        >
          Saved
        </Link>
        <Link
          to={NAV_LINKS.PROTECTED.CITY}
          className="px-3 py-2 rounded-md hover:bg-primary-foreground hover:text-primary transition-all"
        >
          ExploreCity
        </Link>
      </nav>
      <div className="flex items-center gap-4 border-l pl-6 border-primary-foreground/20">
        <Link
          to={NAV_LINKS.PROTECTED.PROFILE}
          className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full hover:bg-primary-foreground/20 transition-all border border-primary-foreground/10"
        >
          <div className="h-7 w-7 rounded-full bg-primary-foreground text-primary flex items-center justify-center text-xs font-bold">
            {displayLetter}
          </div>
          <span className="text-sm font-bold text-primary-foreground">
            {displayName}
          </span>
        </Link>
      </div>
    </div>
  );
};
