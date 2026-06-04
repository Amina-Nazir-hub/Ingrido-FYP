import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "../constants";

const ErrorState = ({ error, suggestions, onSuggestionClick }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10 pt-28">
        <Link
          to={ROUTES.DASHBOARD}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        
        <div className="text-center py-20 border-2 border-red-200 rounded-2xl bg-red-50">
          <p className="text-red-600 font-bold text-lg mb-2">⚠️ {error}</p>
          <p className="text-gray-600 mb-4">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick(sug)}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/80 transition"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ErrorState;