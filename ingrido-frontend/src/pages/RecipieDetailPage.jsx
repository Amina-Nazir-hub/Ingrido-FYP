import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Loader2, Utensils, ShoppingCart, Sparkles } from "lucide-react";

export function RecipieDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/accounts/recipes/${id}/`);
        setRecipe(response.data);
        setLoading(false);

        const history = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
        const filtered = history.filter(item => item.id !== response.data.id);
        const updated = [response.data, ...filtered].slice(0, 10);
        localStorage.setItem("ingrido_history", JSON.stringify(updated));
      } catch (err) {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary" size={48} /></div>;
  if (!recipe) return <div className="text-center p-20 text-black">Recipe not found.</div>;

  return (
    <div className="pt-24 px-4 max-w-6xl mx-auto mb-20 text-left">
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-8">
        {/* REMOVED 'uppercase' - Title will follow database casing */}
        <h1 className="text-3xl md:text-5xl font-black mb-6 text-black">
          {recipe.title}
        </h1>
        <img src={recipe.image} className="w-full h-[400px] object-cover rounded-2xl shadow-lg" alt={recipe.title} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-black">
            <Utensils className="text-primary" /> Ingredients
          </h2>
          <ul className="space-y-3 text-black">
            {(recipe.ingredients || "").split('\n').map((ing, i) => (
              ing.trim() && <li key={i} className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full" />{ing}</li>
            ))}
          </ul>
        </div>

        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 shadow-sm flex flex-col justify-center items-center">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-black">AI Helper</h2>
            <button 
              onClick={() => window.open("https://www.foodpanda.pk/darkstore", "_blank")} 
              className="w-full bg-[#D70F64] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <ShoppingCart size={20} /> PandaMart Link
            </button>
        </div>
      </div>
    </div>
  );
}