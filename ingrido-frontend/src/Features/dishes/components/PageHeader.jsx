import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "../constants";

const PageHeader = ({ cityName, region }) => {
  return (
    <>
      <Link
        to={ROUTES.CITY}
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#b17b46]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Cities
      </Link>

      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-px w-8 bg-[#b17b46]"></span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b17b46]">
            {region || "Traditional Cuisine"}
          </p>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Famous Recipes of <span className="text-[#b17b46]">{cityName}</span>
        </h1>
      </header>
    </>
  );
};

export default PageHeader;