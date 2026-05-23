import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Flame,
  Clock,
  Drumstick,
  Bookmark,
  Eye,
  Loader2,
  Sparkles,
} from "lucide-react";

const AIRecipeCard = ({
  id,
  title,
  meal,
  image,
  kcal,
  prep_time,
  protein,
  is_saved,
  is_ai_generated,
  onBookmark,
  onViewDetail,
}) => {
  const BACKEND_BASE = "http://127.0.0.1:8000";
  const displayTitle = title || meal || "Tasty Recipe";
  const isAI = is_ai_generated || (id && id.toString().startsWith("ai-"));

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${BACKEND_BASE}${image}`
    : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg relative">
      {isAI && (
        <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
          <Sparkles size={10} /> AI Generated
        </div>
      )}

      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <img
          src={imageUrl}
          alt={displayTitle}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-lg font-bold text-foreground line-clamp-1">{displayTitle}</h3>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Flame className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{kcal || "350"}</span>
            <span className="text-muted-foreground">kcal</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{prep_time || "25"}</span>
            <span className="text-muted-foreground">mins</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Drumstick className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{protein || "20g"}</span>
            <span className="text-muted-foreground">protein</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
          <button
            onClick={() => onBookmark(id, displayTitle, isAI)}
            className={`rounded-md p-2 transition ${
              is_saved
                ? "text-[#b17b46] bg-[#b17b46]/10"
                : "text-muted-foreground hover:bg-secondary hover:text-[#b17b46]"
            }`}
            title={is_saved ? "Remove from saved" : "Save Recipe"}
          >
            <Bookmark className={`h-5 w-5 ${is_saved ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => onViewDetail(id, displayTitle, isAI)}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default function SearchResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("q");
  const BACKEND_BASE = "http://127.0.0.1:8000";
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchAIResults = async () => {
      if (!query) return;
      setLoading(true);
      setSearchError(null);
      try {
        const token = localStorage.getItem("ingrido_token");
        const config = {
          headers: token ? { Authorization: `Token ${token}` } : {},
          params: { q: query }
        };

        const res = await axios.get(`${BACKEND_BASE}/api/accounts/recipes/ai-search/`, config);
        
        if (res.data && res.data.is_invalid) {
          setResults([]);
          setSearchError(res.data.error);
          setSuggestions(res.data.suggestions || ['Biryani', 'Chicken Karahi', 'Daal', 'Nihari', 'Korma']);
          setLoading(false);
          return;
        }
        
        if (Array.isArray(res.data)) {
          setResults(res.data);
        } else {
          setResults([]);
        }
        
        const token2 = localStorage.getItem("ingrido_token");
        if (token2) {
          try {
            await axios.post(`${BACKEND_BASE}/api/accounts/search-history/add/`, 
              { query: query },
              { headers: { Authorization: `Token ${token2}` } }
            );
          } catch (err) {
            let history = JSON.parse(localStorage.getItem("ingrido_recent_searches") || "[]");
            const cleanQ = query.trim();
            if (cleanQ) {
              history = history.filter(q => q.toLowerCase() !== cleanQ.toLowerCase());
              history.unshift(cleanQ);
              localStorage.setItem("ingrido_recent_searches", JSON.stringify(history.slice(0, 6)));
            }
          }
        } else {
          let history = JSON.parse(localStorage.getItem("ingrido_recent_searches") || "[]");
          const cleanQ = query.trim();
          if (cleanQ) {
            history = history.filter(q => q.toLowerCase() !== cleanQ.toLowerCase());
            history.unshift(cleanQ);
            localStorage.setItem("ingrido_recent_searches", JSON.stringify(history.slice(0, 6)));
          }
        }
        
      } catch (err) {
        console.error("AI Search logic error:", err);
        if (err.response?.data?.is_invalid) {
          setSearchError(err.response.data.error);
          setSuggestions(err.response.data.suggestions || ['Biryani', 'Chicken Karahi', 'Daal', 'Nihari', 'Korma']);
          setResults([]);
        } else {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAIResults();
    }
  }, [query]);

  const handleBookmark = async (recipeId, recipeTitle, isAiRecipe) => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      let endpoint;
      if (isAiRecipe && isNaN(Number(recipeId))) {
        endpoint = `${BACKEND_BASE}/api/accounts/recipes/ai/${encodeURIComponent(recipeTitle)}/bookmark/`;
      } else {
        endpoint = `${BACKEND_BASE}/api/accounts/recipes/${recipeId}/bookmark/`;
      }

      const res = await axios.post(endpoint, {}, {
        headers: { Authorization: `Token ${token}` }
      });

      setResults((prevResults) =>
        prevResults.map((recipe) => {
          const matchCondition = recipe.id === recipeId || (recipe.title === recipeTitle || recipe.meal === recipeTitle);
          return matchCondition ? { ...recipe, is_saved: res.data.saved === undefined ? true : res.data.saved } : recipe;
        })
      );
    } catch (err) {
      console.error("Error updating bookmark:", err);
    }
  };

  const handleViewDetail = (recipeId, recipeTitle, isAiRecipe) => {
    if (isAiRecipe) {
      navigate(`/recipe/ai/${encodeURIComponent(recipeTitle)}`);
    } else {
      navigate(`/recipe/${recipeId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#b17b46]" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse flex items-center gap-1.5">
          <Sparkles size={14} className="text-purple-500 animate-spin" /> AI Chef is extracting matching dish profiles...
        </p>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-6 py-10 pt-28">
          <Link
            to="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          
          <div className="text-center py-20 border-2 border-red-200 rounded-2xl bg-red-50">
            <p className="text-red-600 font-bold text-lg mb-2">⚠️ {searchError}</p>
            <p className="text-gray-600 mb-4">Try searching for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchError(null);
                    navigate(`/search-results?q=${encodeURIComponent(sug)}`);
                  }}
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
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10 pt-28">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <header className="mb-8 border-b border-border pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#b17b46] flex items-center gap-1">
            <Sparkles size={12} className="text-purple-500 animate-pulse" /> Global AI Search Core Engine
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Search Results for: <span className="text-[#b17b46] italic">"{query}"</span>
          </h1>
        </header>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((recipe, idx) => (
              <AIRecipeCard
                key={recipe.id || `search-ai-${idx}`}
                {...recipe}
                onBookmark={handleBookmark}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl border-border bg-card">
            <p className="text-muted-foreground italic text-lg">
              No matches found for "{query}". Try typing another keyword or recipe!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}