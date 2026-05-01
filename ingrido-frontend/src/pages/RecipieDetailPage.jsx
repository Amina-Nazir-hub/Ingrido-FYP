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
} from "lucide-react";

export function RecipieDetail() {
  const { id } = useParams(); // URL se Recipe ID lega
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [subResult, setSubResult] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // ─── Backend se Recipe Data Fetch Karna ───
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/accounts/recipes/${id}/`,
        );
        setRecipe(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recipe details:", error);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // ─── Substitute Logic (Backend Data se) ───
  const handleCheckSubstitute = () => {
    const key = ingredientSearch.toLowerCase().trim();
    if (!key || !recipe) return;

    // Backend se aayi hui substitutions dictionary mein check karega
    const findSub = recipe.substitutions[key];

    setSubResult(
      findSub ||
        "No direct substitute found in our database. You might want to check PandaMart!",
    );
  };

  // ─── Save/Bookmark Logic ───
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login to save this recipe!");

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/accounts/recipes/${id}/bookmark/`,
        {},
        { headers: { Authorization: `Token ${token}` } },
      );
      setIsSaved(!isSaved);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
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
        "_blank",
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
        {/* Left: Image/Video Placeholder */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-muted aspect-video shadow-lg">
            <img
              src={recipe.image || "/assets/placeholder-food.jpg"}
              alt={recipe.title}
              className="h-full w-full object-cover"
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
                <p className="text-[10px] uppercase text-muted-foreground">
                  Cook Time
                </p>
                <p className="font-bold text-sm">{recipe.prep_time} mins</p>
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
              Experience the authentic taste of {recipe.city?.name}. This recipe
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
                <span className="w-1.5 h-8 bg-primary rounded-full"></span>{" "}
                Ingredients
              </h2>
              <ul className="space-y-4">
                {recipe.ingredients.split("\n").map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-foreground/80"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Directions Side */}
            <div className="p-6 md:p-10 bg-secondary/5">
              <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-primary rounded-full"></span>{" "}
                Directions
              </h2>
              <div className="space-y-8">
                {recipe.instructions
                  .split("\n")
                  .filter((s) => s.trim())
                  .map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                        {index + 1}
                      </span>
                      <p className="text-foreground/80 leading-relaxed pt-1">
                        {step}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tools: Substitutes & PandaMart */}
      <section className="container mx-auto max-w-6xl mt-12 px-4 mb-20">
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 md:p-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-serif">
              Missing an Ingredient?
            </h2>
            <p className="text-muted-foreground">
              Find a quick substitute or order via PandaMart
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative grow">
              <input
                type="text"
                placeholder="e.g. yogurt, cream, butter..."
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <button
              onClick={handleCheckSubstitute}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Find Substitute
            </button>

            <button
              onClick={handlePandaMartOrder}
              className="bg-[#D70F64] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90"
            >
              <ShoppingCart size={20} /> Order on PandaMart
            </button>
          </div>

          {subResult && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-2">
              <span className="font-bold text-primary">
                Chef's Suggestion:{" "}
              </span>
              <span className="text-foreground">{subResult}</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
