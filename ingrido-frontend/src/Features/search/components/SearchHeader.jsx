import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ROUTES } from "../constants";

const SearchHeader = ({ query }) => {
  return (
    <>
      <Link
        to={ROUTES.DASHBOARD}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <header className="mb-8 border-b border-border pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#b17b46] flex items-center gap-1">
          <Sparkles size={12} className="text-purple-500 animate-pulse" /> 
          Global AI Search Core Engine
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Search Results for: <span className="text-[#b17b46] italic">"{query}"</span>
        </h1>
      </header>
    </>
  );
};

export default SearchHeader;