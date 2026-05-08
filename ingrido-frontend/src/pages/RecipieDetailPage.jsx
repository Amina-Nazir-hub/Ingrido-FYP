import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Loader2,
  Heart,
  Clock,
  Users,
  Flame,
  Utensils,
  ShoppingCart,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";

export function RecipieDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [subResult, setSubResult] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Track suggested ingredients history
  const [suggestedIngredients, setSuggestedIngredients] = useState([]);

  // ─── Backend se Recipe Data Fetch Karna ───
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/accounts/recipes/${id}/`
        );
        setRecipe(response.data);
        setIsSaved(response.data.is_saved);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recipe details:", error);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // ─── AI Substitution Logic ───
  const handleCheckSubstitute = async () => {
    const ingredient = ingredientSearch.trim();
    if (!ingredient || !recipe) return;

    setIsAiLoading(true);
    setSubResult("");

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/accounts/recipes/${id}/ai-substitute/`,
        { ingredient: ingredient },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      let aiMessage = "";
      if (response.data.substitute) {
        aiMessage = response.data.substitute;
      } else if (response.data.suggestions) {
        aiMessage = response.data.suggestions;
      } else if (response.data.substitutes) {
        aiMessage = response.data.substitutes;
      } else if (response.data.message) {
        aiMessage = response.data.message;
      } else {
        aiMessage = JSON.stringify(response.data, null, 2);
      }

      setSubResult(aiMessage);
      
      // Add to suggested ingredients history
      const newSuggestion = {
        id: Date.now(),
        ingredient: ingredient,
        suggestion: aiMessage,
        timestamp: new Date()
      };
      setSuggestedIngredients(prev => [newSuggestion, ...prev]);

    } catch (error) {
      console.error("AI Error:", error);
      
      if (error.response) {
        if (error.response.status === 429) {
          setSubResult("⚠️ AI quota exceeded. Please try again in a few minutes.");
        } else if (error.response.status === 500) {
          setSubResult("⚠️ Server error. Please check if GROQ_API_KEY is configured.");
        } else if (error.response.data && error.response.data.error) {
          setSubResult(`⚠️ ${error.response.data.error}`);
        } else {
          setSubResult("⚠️ AI service is temporarily unavailable. Please try again later.");
        }
      } else if (error.request) {
        setSubResult("⚠️ Cannot connect to AI service. Please check if server is running.");
      } else {
        setSubResult(`⚠️ Error: ${error.message}`);
      }
    } finally {
      setIsAiLoading(false);
      setIngredientSearch("");
    }
  };

  // ─── Load suggestion from history (clickable) ───
  const loadSuggestionFromHistory = (suggestion) => {
    setSubResult(suggestion.suggestion);
    setIngredientSearch(suggestion.ingredient);
    // Optional: Scroll to current suggestion
    document.getElementById('currentSuggestion')?.scrollIntoView({ behavior: 'smooth' });
  };

  // ─── Remove suggestion from history ───
  const removeSuggestion = (id, e) => {
    e.stopPropagation(); // Prevent triggering the click on parent
    setSuggestedIngredients(prev => prev.filter(item => item.id !== id));
  };

  // ─── Clear all suggestions ───
  const clearAllSuggestions = () => {
    setSuggestedIngredients([]);
    setSubResult("");
    setIngredientSearch("");
  };

  // ─── Save/Bookmark Logic ───
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to save this recipe!");
      return;
    }

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/accounts/recipes/${id}/bookmark/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setIsSaved(!isSaved);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Error saving recipe. Please try again.");
    }
  };

  const handlePandaMartOrder = () => {
    if (!navigator.geolocation) {
      window.open("https://www.foodpanda.pk/brand/pandamart", "_blank");
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      window.open(
        `https://www.foodpanda.pk/brand/pandamart?lat=${latitude}&lng=${longitude}`,
        "_blank"
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe)
    return <div className="text-center py-20">Recipe not found!</div>;

  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-border bg-secondary/40 mt-20 px-2">
        <div className="container py-8 mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-card p-6 shadow-sm md:p-8">
            <div className="space-y-3">
              <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
                {recipe.title}{" "}
                <span className="text-primary text-2xl block md:inline">
                  Traditional Style
                </span>
              </h1>
            </div>

            <button
              onClick={handleSave}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all 
                ${isSaved ? "border-primary bg-primary text-white" : "border-border bg-background hover:bg-primary/10"}`}
            >
              <Heart fill={isSaved ? "white" : "none"} className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] px-4">
        {/* Left: Image/Video */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-muted aspect-video shadow-lg">
            <img
              src={recipe.image || "/assets/placeholder-food.jpg"}
              alt={recipe.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = "/assets/placeholder-food.jpg";
              }}
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-primary p-4 rounded-full text-white scale-125 cursor-pointer hover:scale-150 transition-transform">
                ▶
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-4 lg:grid-cols-2">
            <div className="flex items-center gap-3">
              <Clock className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Cook Time</p>
                <p className="font-bold text-sm">{recipe.prep_time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Serves</p>
                <p className="font-bold text-sm">4-5 People</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Flame className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Calories</p>
                <p className="font-bold text-sm">{recipe.kcal} kcal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Utensils className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Cuisine</p>
                <p className="font-bold text-sm">Pakistani</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 font-serif text-xl font-bold">About this dish</h2>
            <p className="text-muted-foreground leading-relaxed">
              Experience the authentic taste of {recipe.city_name || "this city"}. This recipe
              has been passed down through generations, ensuring a perfect
              balance of spices and texture.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content: Ingredients & Directions */}
      <section className="container mx-auto max-w-6xl mt-12 px-4">
        <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            {/* Ingredients Side */}
            <div className="p-6 md:p-10 border-b md:border-b-0 md:border-r border-border">
              <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-primary rounded-full"></span> Ingredients
              </h2>
              <ul className="space-y-4">
                {(recipe.ingredients || "").split("\n").map((item, index) => (
                  item.trim() && (
                    <li key={index} className="flex items-center gap-3 text-foreground/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>

            {/* Directions Side */}
            <div className="p-6 md:p-10 bg-secondary/5">
              <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-primary rounded-full"></span> Directions
              </h2>
              <div className="space-y-8">
                {(recipe.instructions || "").split("\n").filter((s) => s.trim()).map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-foreground/80 leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tools: AI Substitutes & PandaMart */}
      <section className="container mx-auto max-w-6xl mt-12 px-4 mb-20">
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 md:p-10">
          <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
                <Sparkles className="text-primary" /> Missing an Ingredient?
              </h2>
              <p className="text-muted-foreground">
                Ask our **Chef AI** for a quick substitute or order via PandaMart
              </p>
            </div>
            {suggestedIngredients.length > 0 && (
              <button
                onClick={clearAllSuggestions}
                className="text-sm text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear All ({suggestedIngredients.length})
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative grow">
              <input
                type="text"
                placeholder="e.g. yogurt, cream, butter, onion, garlic, green chili..."
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && ingredientSearch.trim() && !isAiLoading) {
                    handleCheckSubstitute();
                  }
                }}
                className="w-full rounded-xl border border-border bg-background px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <button
              onClick={handleCheckSubstitute}
              disabled={isAiLoading || !ingredientSearch.trim()}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAiLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              {isAiLoading ? "Thinking..." : "Ask Chef AI"}
            </button>

            <button
              onClick={handlePandaMartOrder}
              className="bg-[#D70F64] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              <ShoppingCart size={20} /> Order on PandaMart
            </button>
          </div>

          {/* Current AI Response - with ID for scrolling */}
          <div id="currentSuggestion">
            {subResult && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-l-4 border-primary animate-in fade-in slide-in-from-top-2">
                <span className="font-bold text-primary flex items-center gap-2">
                  <Sparkles size={16} /> Current Suggestion:
                </span>
                <p className="mt-2 text-foreground leading-relaxed whitespace-pre-wrap">
                  {subResult}
                </p>
              </div>
            )}
          </div>

          {/* Clickable History of all Chef Suggestions */}
          {suggestedIngredients.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-primary" /> 
                📜 Click on any suggestion to view again
                <span className="text-xs text-muted-foreground ml-2">
                  ({suggestedIngredients.length} saved)
                </span>
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {suggestedIngredients.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => loadSuggestionFromHistory(item)}
                    className="group p-3 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                            #{index + 1}
                          </span>
                          <span className="font-bold text-primary text-sm">🍳 Missing:</span>
                          <span className="font-semibold text-foreground">
                            {item.ingredient}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-2 border-l-2 border-primary/30 line-clamp-2 group-hover:line-clamp-none transition-all">
                          {item.suggestion}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                        <button
                          onClick={(e) => removeSuggestion(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-100 rounded-full text-red-500"
                          title="Remove this suggestion"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Tip message */}
              <div className="mt-3 text-center text-xs text-muted-foreground">
                💡 Tip: Click any suggestion to view it above
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}