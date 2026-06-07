import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ROUTES } from "../constants";

const SearchHeader = ({ query }) => {
  return (
    <>
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Search Results for: <span className="text-primary italic">"{query}"</span>
        </h1>
      </header>
    </>
  );
};

export default SearchHeader;