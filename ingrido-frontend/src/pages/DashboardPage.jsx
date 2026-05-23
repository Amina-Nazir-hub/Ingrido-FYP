import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { WelcomeHero } from "../layouts/DashBoardLayout";
import { Loader2, Sparkles, Flame, Clock, Bookmark, Eye, Drumstick } from "lucide-react";
import { useNavigate } from "react-router-dom";
const DashboardRecipeCard = ({
  id,
  title,
  meal,
  image,
  kcal,
  prep_time,
  protein,
  is_saved,
  is_ai_generated,
}) => {
  const BACKEND_BASE = "http://127.0.0.1:8000";
  const navigate = useNavigate();
  const displayTitle = title || meal || "Tasty Recipe";
  const isAI = is_ai_generated || (id && id.toString().startsWith("ai-"));

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${BACKEND_BASE}${image}`
    : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";

  const handleViewDetail = () => {
    if (isAI) {
      navigate(`/recipe/ai/${encodeURIComponent(displayTitle)}`);
    } else {
      navigate(`/recipe/${id}`);
    }
  };

  const handleBookmark = async () => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      let endpoint;
      if (isAI) {
        endpoint = `${BACKEND_BASE}/api/accounts/recipes/ai/${encodeURIComponent(displayTitle)}/bookmark/`;
      } else {
        endpoint = `${BACKEND_BASE}/api/accounts/recipes/${id}/bookmark/`;
      }

      await axios.post(endpoint, {}, {
        headers: { Authorization: `Token ${token}` }
      });
    } catch (err) {
      console.error("Bookmark error:", err);
    }
  };

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
            onClick={handleBookmark}
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
            onClick={handleViewDetail}
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

// Recipe Grid component using same cards as search results
function RecipeGrid({ items, title, onClear }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-12 border-t mt-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-black">{title}</h2>
        {onClear && (
          <button onClick={onClear} className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full transition-all font-medium">
            🗑️ Clear History
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((recipe, index) => (
          <DashboardRecipeCard
            key={recipe.id || `dashboard-${index}`}
            {...recipe}
          />
        ))}
      </div>
    </section>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [viewHistory, setViewHistory] = useState([]);
  const [recommendedCards, setRecommendedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_BASE = "http://127.0.0.1:8000";
  const hasFetched = useRef(false);

  const currentName = user?.first_name || user?.username || localStorage.getItem("user_name") || "Chef";

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("ingrido_token");
      const config = token ? { headers: { Authorization: `Token ${token}` } } : {};
      
      const res = await axios.get(`${BACKEND_BASE}/api/accounts/recipes/seasonal/`, config);
      setRecommendedCards(res.data);
      
      if (token) {
        const historyRes = await axios.get(`${BACKEND_BASE}/api/accounts/viewed-recipes/`, config);
        if (historyRes.data.recipes) {
          setViewHistory(historyRes.data.recipes);
        }
      } else {
        const savedHistory = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
        setViewHistory(savedHistory);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      const savedHistory = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
      setViewHistory(savedHistory);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      loadContent();
    }
  }, [loadContent]);

  const clearHistory = async () => {
    const token = localStorage.getItem("ingrido_token");
    if (token) {
      try {
        await axios.delete(`${BACKEND_BASE}/api/accounts/viewed-recipes/clear/`, {
          headers: { Authorization: `Token ${token}` }
        });
      } catch (err) {
        console.error("Clear history error:", err);
      }
    }
    setViewHistory([]);
    localStorage.removeItem("ingrido_history");
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        <WelcomeHero name={currentName} />
        
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
          ) : (
            <>
              <RecipeGrid items={recommendedCards} title="Recommended Recipes" />
              
              {viewHistory.length > 0 && (
                <RecipeGrid 
                  items={viewHistory} 
                  title="Recently Viewed Recipes" 
                  onClear={clearHistory}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}