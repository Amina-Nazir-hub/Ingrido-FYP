import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Loader2,
  Utensils,
  ShoppingCart,
  Sparkles,
  Clock,
  Flame,
  ArrowLeft,
  Bookmark,
} from "lucide-react";

export function RecipieDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const titleParam = searchParams.get("title");

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [subResult, setSubResult] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const BACKEND_URL = "http://127.0.0.1:8000";

  // Get auth token
  const getAuthToken = () => localStorage.getItem("ingrido_token");

  // Check if user is authenticated
  const isAuthenticated = () => !!getAuthToken();

  // Helper function to format ingredients list
  const formatIngredients = (ingredients) => {
    if (!ingredients) return [];
    // Split by comma or newline
    const items = ingredients.split(/,|\n/);
    return items.filter((item) => item.trim());
  };

  // Helper function to format instructions
  const formatInstructions = (instructions) => {
    if (!instructions) return [];
    // Split by numbers with dots or newlines
    const steps = instructions.split(/\d+\.|\n/);
    return steps.filter((step) => step.trim());
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        let response;
        const token = localStorage.getItem("ingrido_token");
        const config = token ? { headers: { Authorization: `Token ${token}` } } : {};
        
        if ((id && id.toString().startsWith("ai-")) || titleParam || !Number.isInteger(Number(id))) {
          const targetTitle = titleParam || id;
          response = await axios.get(`${BACKEND_URL}/api/accounts/recipes/ai/${encodeURIComponent(targetTitle)}/`, config);
          setIsAiGenerated(true);
        } else {
          response = await axios.get(`${BACKEND_URL}/api/accounts/recipes/${id}/`, config);
          setIsAiGenerated(false);
        }
        
        if (response.data) {
          setRecipe(response.data);
          setIsSaved(response.data.is_saved || false);
          
          const currentRecipe = {
            id: response.data.id || id,
            title: response.data.title || response.data.meal,
            meal: response.data.title || response.data.meal,
            kcal: response.data.kcal,
            prep_time: response.data.prep_time,
            image: response.data.image || null,
            is_ai_generated: response.data.is_ai_generated || (id && id.toString().startsWith("ai-")) || false
          };

          // Save to localStorage history
          let history = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
          history = history.filter(item => item.title?.toLowerCase() !== currentRecipe.title?.toLowerCase());
          history.unshift(currentRecipe);
          history = history.slice(0, 10);
          localStorage.setItem("ingrido_history", JSON.stringify(history));
          
          // Save to backend history if authenticated
          if (token) {
            try {
              await axios.post(`${BACKEND_URL}/api/accounts/viewed-recipes/add/`, {
                recipe_data: currentRecipe
              }, { headers: { Authorization: `Token ${token}` } });
            } catch (err) {
              console.error("Save to backend error:", err);
            }
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response?.status === 404) setRecipe(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, titleParam]);

  const handleCheckSubstitute = async () => {
    const ingredient = ingredientSearch.trim();
    if (!ingredient || !recipe) return;
    setIsAiLoading(true);
    setSubResult("");

    try {
      const endpoint = recipe?.id && !isAiGenerated
        ? `${BACKEND_URL}/api/accounts/recipes/${recipe.id}/ai-substitute/`
        : `${BACKEND_URL}/api/accounts/recipes/ai-substitute/`;
      
      const payload = {
        ingredient,
        recipe_title: recipe?.title || recipe?.meal || ""
      };
      
      const res = await axios.post(endpoint, payload);
      setSubResult(res.data.substitute || res.data.message || "No substitute found.");
    } catch (error) {
      console.error("AI substitute error:", error);
      setSubResult(
        "⚠️ AI service is temporarily unavailable. Please try again later.",
      );
    } finally {
      setIsAiLoading(false);
      setIngredientSearch("");
    }
  };

  const handleSave = async () => {
    const token = getAuthToken();

    // Check if user is logged in
    if (!token) {
      const confirmLogin = window.confirm(
        "Please login to save recipes. Would you like to login now?",
      );
      if (confirmLogin) {
        navigate("/login");
      }
      return;
    }

    try {
      let endpoint;
      if (isAiGenerated) {
        endpoint = `${BACKEND_URL}/api/accounts/recipes/ai/${encodeURIComponent(recipe?.title || recipe?.meal)}/bookmark/`;
      } else {
        endpoint = `${BACKEND_URL}/api/accounts/recipes/${id}/bookmark/`;
      }

      const res = await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Token ${token}` } },
      );
      
      const newSavedStatus = res.data.saved !== undefined ? res.data.saved : !isSaved;
      setIsSaved(newSavedStatus);
      
      if (newSavedStatus) {
        console.log("Recipe saved to bookmarks!");
      } else {
        console.log("Recipe removed from bookmarks!");
      }
    } catch (err) {
      console.error("Save error:", err);

      // Handle different error cases
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("ingrido_token");
        navigate("/login");
      } else if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Error saving recipe. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black">
        <div className="text-center">
          <p className="mb-4">Recipe not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayTitle = recipe.title || recipe.meal || "Tasty Recipe";

  return (
    <>
      <section className="border-b border-border bg-secondary/40 mt-20 px-4">
        <div className="container py-8 mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-6 rounded-2xl bg-card p-6 shadow-sm md:p-8">
            <div className="flex-1">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-2 transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl leading-tight">
                {displayTitle}
              </h1>
            </div>

            <button
              onClick={handleSave}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                isSaved
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary shadow-sm"
              }`}
              title={isSaved ? "Remove from saved" : "Save Recipe"}
            >
              <Bookmark
                className={`h-6 w-6 transition-all ${isSaved ? "fill-current" : ""}`}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] px-4">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-black aspect-video shadow-lg ring-1 ring-border">
            {isAiGenerated && (
              <div className="absolute top-4 left-4 z-10 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1 animate-pulse">
                <Sparkles size={12} /> AI Chef Masterpiece
              </div>
            )}
            
            {recipe.youtube_video_id ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${recipe.youtube_video_id}?rel=0`}
                title={displayTitle}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            ) : recipe.image ? (
              <img
                src={recipe.image.startsWith("http") ? recipe.image : `${BACKEND_URL}${recipe.image}`}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                <Utensils className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-4 lg:grid-cols-2">
            <div className="flex items-center gap-3">
              <Clock className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  Cook Time
                </p>
                <p className="font-bold text-sm">
                  {recipe.prep_time || "25"} mins
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Flame className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  Calories
                </p>
                <p className="font-bold text-sm">
                  {recipe.kcal || "350"} kcal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Utensils className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  Cuisine
                </p>
                <p className="font-bold text-sm">
                  {recipe.cuisine || "Pakistani"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  Source
                </p>
                <p className="font-bold text-sm">
                  {isAiGenerated ? "AI Generated" : "Database"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 font-serif text-xl font-bold">
              About this dish
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {recipe.description ||
                `Experience the authentic taste of ${displayTitle}.`}
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl mt-12 px-4">
        <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden grid md:grid-cols-2">
          
          <div className="p-6 md:p-10 border-b md:border-b-0 md:border-r border-border">
            <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-primary rounded-full"></span>{" "}
              Ingredients
            </h2>
            <ul className="space-y-4">
              {formatIngredients(recipe.ingredients).map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-foreground/80 pb-2 last:pb-0"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>
                  {item.trim()}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-6 md:p-10 bg-secondary/5">
            <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-primary rounded-full"></span>{" "}
              Directions
            </h2>
            <div className="space-y-6">
              {formatInstructions(recipe.instructions).map((step, i) => (
                <div key={i} className="flex gap-4 pb-4 last:pb-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                    {i + 1}
                  </span>
                  <p className="text-foreground/80 leading-relaxed pt-1">
                    {step.trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <section className="container mx-auto max-w-6xl mt-12 px-4 mb-20">
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 md:p-10">
          <h2 className="text-2xl font-bold font-serif flex items-center gap-2 mb-6">
            <Sparkles className="text-primary" /> Missing an Ingredient?
          </h2>
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="Ask Chef AI..."
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              className="grow rounded-xl border border-border bg-background px-5 py-4 outline-none focus:ring-2 focus:ring-primary/50"
              onKeyPress={(e) => e.key === "Enter" && handleCheckSubstitute()}
            />
            <button
              onClick={handleCheckSubstitute}
              disabled={isAiLoading}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold transition-opacity disabled:opacity-50 hover:bg-primary/90"
            >
              {isAiLoading ? "Thinking..." : "Ask Chef AI"}
            </button>
            <button
              onClick={() =>
                window.open(recipe.grocery_url || "https://www.foodpanda.pk/brand/pandamart", "_blank")
              }
              className="bg-[#D70F64] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#D70F64]/90 transition"
            >
              <ShoppingCart size={20} /> Order on PandaMart
            </button>
          </div>
          
          {subResult && (
            <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-primary shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1 flex items-center gap-1">
                <Sparkles size={12} /> AI Suggestions
              </h4>
              <p className="text-foreground whitespace-pre-wrap font-medium">{subResult}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}