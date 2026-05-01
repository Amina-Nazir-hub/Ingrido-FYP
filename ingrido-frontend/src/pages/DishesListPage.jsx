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
  image,
  kcal,
  prep_time,
  protein,
  onBookmark,
  onViewDetail,
}) => {
  const BACKEND_URL = "http://127.0.0.1:8000";

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${BACKEND_URL}${image}`
    : "https://via.placeholder.com/800x500?text=Recipe+Image";

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Flame className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{kcal}</span>
            <span className="text-muted-foreground">kcal</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{prep_time}</span>
            <span className="text-muted-foreground">mins</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Drumstick className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              {protein || "15g"}
            </span>
            <span className="text-muted-foreground">protein</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
          <button
            onClick={() => onBookmark(id)}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-[#b17b46] transition"
            title="Save Recipe"
          >
            <Bookmark className="h-4 w-4" />
          </button>

          <button
            onClick={() => onViewDetail(id)}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

// --- Main DishesListPage Component ---
const DishesListPage = () => {
  // 1. URL Parameter se cityName nikalna (:cityName route se)
  const { cityName } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL = "http://127.0.0.1:8000";

  const [recipes, setRecipes] = useState([]);
  const [cityInfo, setCityInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPandamartAlert, setShowPandamartAlert] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Agar URL mein cityName nahi hai toh request na bhejein
      if (!cityName) return;

      try {
        setLoading(true);
        // Backend API call: Hum ab bhi query filter use kar rahe hain
        // taake Django views ko modify na karna paray.
        const response = await axios.get(
          `${BACKEND_URL}/api/accounts/recipes/?city=${cityName}`,
        );

        // Data mapping
        setRecipes(
          Array.isArray(response.data)
            ? response.data
            : response.data.recipes || [],
        );

        // City information setup
        setCityInfo(response.data.city || null);

        // Pandamart alert check
        if (response.data.pandamart_alert) {
          setShowPandamartAlert(true);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching city recipes:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [cityName]); // Dependency array mein cityName update hone par dubara data fetch hoga

  const handleBookmark = async (recipeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to save recipes!");
      return;
    }
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/accounts/recipes/${recipeId}/bookmark/`,
        {},
        { headers: { Authorization: `Token ${token}` } },
      );
      alert(res.data.message || "Recipe saved!");
    } catch (err) {
      alert("Error saving recipe.");
    }
  };

  const handleViewDetail = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#b17b46]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/city"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cities
        </Link>

        {showPandamartAlert && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-yellow-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Note: Pandamart is currently not available in {cityName}.
              Ingredient delivery might be limited.
            </p>
          </div>
        )}

        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#b17b46]">
            {cityInfo?.region || "Local Cuisine"}
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Famous Recipes of {cityName}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {cityInfo?.tagline ||
              `Discover the most authentic and traditional dishes from ${cityName}.`}
          </p>
        </header>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="text-center py-20 border-2 border-dashed rounded-2xl border-border">
            <p className="text-muted-foreground italic">
              No recipes found for {cityName} yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DishesListPage;
