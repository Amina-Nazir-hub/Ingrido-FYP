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
  const [suggestedIngredients, setSuggestedIngredients] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/accounts/recipes/${id}/`,
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

  const handleCheckSubstitute = async () => {
    const ingredient = ingredientSearch.trim();
    if (!ingredient || !recipe) return;
    setIsAiLoading(true);
    setSubResult("");

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/accounts/recipes/${id}/ai-substitute/`,
        { ingredient: ingredient },
      );

      let aiMessage =
        response.data.substitute ||
        response.data.message ||
        "No substitute found.";
      setSubResult(aiMessage);

      const newSuggestion = {
        id: Date.now(),
        ingredient: ingredient,
        suggestion: aiMessage,
        timestamp: new Date(),
      };
      setSuggestedIngredients((prev) => [newSuggestion, ...prev]);
    } catch (error) {
      setSubResult("⚠️ AI service is temporarily unavailable.");
    } finally {
      setIsAiLoading(false);
      setIngredientSearch("");
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login to save!");
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/accounts/recipes/${id}/bookmark/`,
        {},
        { headers: { Authorization: `Token ${token}` } },
      );
      setIsSaved(!isSaved);
    } catch (err) {
      alert("Error saving recipe.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );

  return (
    <>
      {/* Hero Section - Purana Style */}
      <section className="border-b border-border bg-secondary/40 mt-20 px-2">
        <div className="container py-8 mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-card p-6 shadow-sm md:p-8">
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              {recipe.title}{" "}
              <span className="text-primary text-2xl block md:inline">
                Traditional Style
              </span>
            </h1>
            <button
              onClick={handleSave}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all ${isSaved ? "bg-primary text-white" : "bg-background hover:bg-primary/10"}`}
            >
              <Heart fill={isSaved ? "white" : "none"} className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] px-4">
        {/* Left: Video ya Image (Updated Logic) */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-black aspect-video shadow-lg ring-1 ring-border">
            {recipe.youtube_video_id ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${recipe.youtube_video_id}?rel=0&modestbranding=1`}
                title={recipe.title}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            ) : (
              <img
                src={recipe.image || "/assets/placeholder-food.jpg"}
                alt={recipe.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Right: Quick Stats - Purana Style */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-4 lg:grid-cols-2">
            <div className="flex items-center gap-3">
              <Clock className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  Cook Time
                </p>
                <p className="font-bold text-sm">{recipe.prep_time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  Serves
                </p>
                <p className="font-bold text-sm">4-5 People</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Flame className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  Calories
                </p>
                <p className="font-bold text-sm">{recipe.kcal} kcal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Utensils className="text-primary h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  Cuisine
                </p>
                <p className="font-bold text-sm">Pakistani</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 font-serif text-xl font-bold">
              About this dish
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Experience the authentic taste of {recipe.city_name || "Pakistan"}
              .
            </p>
          </div>
        </div>
      </section>

      {/* Main Content (Ingredients & Directions) - Purana Style */}
      <section className="container mx-auto max-w-6xl mt-12 px-4">
        <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden grid md:grid-cols-2">
          <div className="p-6 md:p-10 border-b md:border-b-0 md:border-r border-border">
            <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-primary rounded-full"></span>{" "}
              Ingredients
            </h2>
            <ul className="space-y-4">
              {recipe.ingredients.split("\n").map(
                (item, i) =>
                  item.trim() && (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-foreground/80"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>
                      {item}
                    </li>
                  ),
              )}
            </ul>
          </div>
          <div className="p-6 md:p-10 bg-secondary/5">
            <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-primary rounded-full"></span>{" "}
              Directions
            </h2>
            <div className="space-y-8">
              {recipe.instructions
                .split("\n")
                .filter((s) => s.trim())
                .map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                      {i + 1}
                    </span>
                    <p className="text-foreground/80 leading-relaxed pt-1">
                      {step}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant - Purana Bottom Style */}
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
              className="grow rounded-xl border border-border bg-background px-5 py-4 outline-none"
            />
            <button
              onClick={handleCheckSubstitute}
              disabled={isAiLoading}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold"
            >
              {isAiLoading ? "Thinking..." : "Ask Chef AI"}
            </button>
            <button
              onClick={() => window.open("https://www.foodpanda.pk", "_blank")}
              className="bg-[#D70F64] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2"
            >
              <ShoppingCart size={20} /> Order on PandaMart
            </button>
          </div>
          {subResult && (
            <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-primary shadow-sm">
              <p className="text-foreground whitespace-pre-wrap">{subResult}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
