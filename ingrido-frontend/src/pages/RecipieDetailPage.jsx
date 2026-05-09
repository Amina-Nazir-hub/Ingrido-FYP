import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  Loader2, Heart, Clock, Users, Flame, 
  Utensils, ShoppingCart 
} from "lucide-react";

export function RecipieDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [subResult, setSubResult] = useState("");

  const BACKEND_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`${BACKEND_BASE}/api/accounts/recipes/${id}/`);
        const data = response.data;

        // Image URL Fix
        const fullImageUrl = data.image.startsWith('http') ? data.image : `${BACKEND_BASE}${data.image}`;
        const updatedRecipe = { ...data, image: fullImageUrl };
        
        setRecipe(updatedRecipe);
        setLoading(false);

        // SAVE TO HISTORY LOGIC
        const history = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
        const recipeSummary = {
          id: data.id,
          meal: data.title,
          image: fullImageUrl,
          kcal: data.kcal || "0",
          prep_time: data.prep_time || "0",
        };
        
        const filtered = history.filter(item => item.id !== data.id);
        const updatedHistory = [recipeSummary, ...filtered].slice(0, 6);
        localStorage.setItem("ingrido_history", JSON.stringify(updatedHistory));

      } catch (error) {
        console.error("Error fetching recipe:", error);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleCheckSubstitute = () => {
    const key = ingredientSearch.toLowerCase().trim();
    if (!key || !recipe) return;
    const findSub = recipe.substitutions?.[key];
    setSubResult(findSub || "No direct substitute found. Check PandaMart!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;
  if (!recipe) return <div className="text-center py-20 font-bold">Recipe not found!</div>;

  return (
    <div className="pt-24 px-4 max-w-6xl mx-auto mb-20">
      {/* Hero Section */}
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-8 text-left">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-5xl font-black">{recipe.title}</h1>
          <button className="p-3 rounded-full bg-secondary/50 hover:bg-primary/10 transition-all">
            <Heart size={24} className="text-primary" />
          </button>
        </div>
        <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden rounded-2xl shadow-inner bg-muted">
          <img src={recipe.image} className="w-full h-full object-cover" alt={recipe.title} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { icon: <Clock />, label: "Cook Time", value: `${recipe.prep_time} mins` },
          { icon: <Flame />, label: "Calories", value: `${recipe.kcal} kcal` },
          { icon: <Users />, label: "Serves", value: "4-5 People" },
          { icon: <Utensils />, label: "Cuisine", value: "Traditional" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-border p-4 rounded-2xl text-center shadow-sm">
            <div className="flex justify-center mb-2 text-primary">{stat.icon}</div>
            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">{stat.label}</p>
            <p className="font-black text-lg text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Ingredients & Directions */}
      <div className="grid md:grid-cols-2 gap-8 mb-12 text-left">
        <div className="bg-card border border-border p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-primary rounded-full"></span> Ingredients
          </h2>
          <ul className="space-y-4">
            {recipe.ingredients?.split("\n").map((ing, i) => (
              <li key={i} className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary" /> {ing}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-primary/5 border border-primary/10 p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-primary rounded-full"></span> Directions
          </h2>
          <div className="space-y-6">
            {recipe.instructions?.split("\n").filter(s => s.trim()).map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">{i + 1}</span>
                <p className="text-muted-foreground leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Missing Ingredient Section */}
      <div className="bg-secondary/20 rounded-3xl p-8 border-2 border-dashed border-border text-center">
        <h2 className="text-2xl font-bold mb-2">Missing something?</h2>
        <p className="text-muted-foreground mb-6">Find a substitute or order via PandaMart</p>
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <input 
            type="text" 
            placeholder="Search ingredient..." 
            value={ingredientSearch}
            onChange={(e) => setIngredientSearch(e.target.value)}
            className="flex-1 rounded-xl border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          />
          <button onClick={handleCheckSubstitute} className="bg-primary text-white px-6 py-3 rounded-xl font-bold">Substitute</button>
          <button className="bg-[#D70F64] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <ShoppingCart size={18} /> PandaMart
          </button>
        </div>
        {subResult && (
          <div className="mt-4 p-3 bg-white rounded-xl inline-block border border-primary/20 text-primary font-medium text-left">
            💡 {subResult}
          </div>
        )}
      </div>
    </div>
  );
}