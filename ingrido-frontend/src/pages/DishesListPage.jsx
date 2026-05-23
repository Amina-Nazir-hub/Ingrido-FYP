import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Flame,
  Clock,
  Drumstick,
  Bookmark,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";

// --- Recipe Card Component ---
const RecipeCard = ({
  id,
  title,
  image,       // Backend se aane wala image string
  kcal,        
  prep_time,
  dietary_type,
  is_saved,    
  onBookmark,
  onViewDetail,
}) => {
  const BACKEND_URL = "http://127.0.0.1:8000";

  // IMAGE LOGIC: 
  // 1. Agar image empty hai, toh placeholder use karo.
  // 2. Agar image "http" se start ho rahi hai, toh wahi use karo.
  // 3. Agar image sirf path hai ("/media/..."), toh backend URL prefix karo.
  const getFullImageUrl = () => {
    if (!image) {
      return "/placeholder-image.jpg"; // Use a local placeholder image
    }
    if (image.startsWith('http')) {
      return image;
    }
    // Agar absolute URL nahi hai toh local server ka path joro
    return `${BACKEND_URL}${image.startsWith('/') ? '' : '/'}${image}`;
  };

  const imageUrl = getFullImageUrl();

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback placeholder image if loading fails
            e.target.onerror = null; 
            e.target.src = "/placeholder-image.jpg";
          }}
        />
      </div>

      <div className="space-y-3 p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
            dietary_type === 'veg' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
          }`}>
            {dietary_type === 'veg' ? 'VEG' : 'NON-VEG'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center rounded-md bg-secondary/50 p-2">
            <Flame className="mb-1 h-4 w-4 text-[#b17b46]" />
            <span className="font-semibold text-foreground">{kcal || '0'}</span>
            <span className="text-muted-foreground uppercase text-[9px]">kcal</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary/50 p-2">
            <Clock className="mb-1 h-4 w-4 text-[#b17b46]" />
            <span className="font-semibold text-foreground">{prep_time || '0'}</span>
            <span className="text-muted-foreground uppercase text-[9px]">mins</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary/50 p-2 text-center">
            <Drumstick className="mb-1 h-4 w-4 text-[#b17b46]" />
            <span className="font-semibold text-foreground leading-none">15g</span>
            <span className="text-muted-foreground uppercase text-[9px]">protein</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
          <button
            onClick={() => onBookmark(id)}
            className={`rounded-md p-2 transition ${
                is_saved 
                ? "text-[#b17b46] bg-[#b17b46]/10" 
                : "text-muted-foreground hover:bg-secondary hover:text-[#b17b46]"
            }`}
          >
            <Bookmark className={`h-5 w-5 ${is_saved ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => onViewDetail(id)}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
};

// --- Main DishesListPage Component ---
const DishesListPage = () => {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL = "http://127.0.0.1:8000";

  const [recipes, setRecipes] = useState([]);
  const [cityInfo, setCityInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!cityName) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("ingrido_token");
        const config = {
          headers: token ? { Authorization: `Token ${token}` } : {}
        };

        const response = await axios.get(
          `${BACKEND_URL}/api/accounts/recipes/?city=${cityName}`,
          config
        );

        setRecipes(response.data.recipes || []);
        setCityInfo(response.data.city || null);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dishes:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [cityName]);

  const handleBookmark = async (recipeId) => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/accounts/recipes/${recipeId}/bookmark/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );

      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, is_saved: res.data.saved } : recipe
        )
      );
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  const handleViewDetail = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-[#b17b46]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/city"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#b17b46]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cities
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-8 bg-[#b17b46]"></span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b17b46]">
                {cityInfo?.region || "Traditional Cuisine"}
            </p>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Famous Recipes of <span className="text-[#b17b46]">{cityName}</span>
          </h1>
        </header>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                {...recipe}
                onBookmark={handleBookmark}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed rounded-3xl border-border bg-secondary/20">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium text-muted-foreground">No recipes found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DishesListPage;