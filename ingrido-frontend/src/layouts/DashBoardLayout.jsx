import { useState, useEffect, useRef } from "react";
import { History, Trash2, Eye, Search, Loader2, Flame, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

export function WelcomeHero({ name, onSelectRecipe }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const BACKEND_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim() === "") {
        const history = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
        setSuggestions(history.slice(0, 5)); 
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_BASE}/api/accounts/recipes/`, {
          params: { search: query }
        });
        setSuggestions(response.data);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    const delayDebounceFn = setTimeout(handleSearch, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <section className="flex flex-col items-center justify-center w-full pt-32 pb-12 relative" ref={dropdownRef}>
      <div className="w-full max-w-3xl text-center mb-8">
        <h2 className="text-xl text-muted-foreground mb-3 font-sans text-black">Hello, {name}!</h2>
        <h1 className="text-3xl md:text-5xl font-bold px-4 leading-tight text-black">Ready to discover delicious meals today?</h1>
      </div>
      <div className="w-full max-w-xl relative mx-4 z-50">
        <div className={`flex items-center bg-white border-2 transition-all p-1 shadow-md ${showSuggestions ? 'rounded-t-3xl border-primary' : 'rounded-full border-border'}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search recipes here"
            className="w-full px-6 outline-none bg-transparent h-12 text-lg text-black"
          />
          <button className="bg-primary text-white p-3 rounded-full">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </div>
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 bg-white border-x-2 border-b-2 border-primary rounded-b-3xl shadow-2xl overflow-hidden">
            <div className="max-h-[350px] overflow-y-auto pt-2">
              {suggestions.map((item) => (
                <div key={item.id} onClick={() => { onSelectRecipe([item]); setShowSuggestions(false); setQuery(""); }} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer border-b text-black text-left">
                  <div className="flex items-center gap-4">
                    {query === "" ? <History size={18} /> : <Search size={18} />}
                    <div>
                      <p className="font-bold">{item.title || item.meal}</p>
                      <p className="text-[11px] text-muted-foreground">{item.kcal} kcal • {item.prep_time}m</p>
                    </div>
                  </div>
                  <img src={item.image?.startsWith('http') ? item.image : `${BACKEND_BASE}${item.image}`} className="w-10 h-10 rounded-lg object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function RecipeGrid({ items, title, onClear, isSearch = false }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="py-12 border-t mt-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isSearch ? 'bg-primary' : 'bg-[#2D6A4F]'}`}>
            {isSearch ? <Search className="h-5 w-5 text-white" /> : <History className="h-5 w-5 text-white" />}
          </div>
          <h2 className="text-2xl font-bold text-black">{title}</h2>
        </div>
        <button onClick={onClear} className="text-sm text-muted-foreground hover:text-red-500 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
          <Trash2 size={14} /> {isSearch ? "Close" : "Clear"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        {items.map((recipe) => (
          <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="group bg-white rounded-[2.5rem] border shadow-sm overflow-hidden hover:shadow-xl transition-all">
            <div className="h-52 w-full bg-gray-50 relative">
              <img src={recipe.image} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-primary"><Eye size={20} /></div>
            </div>
            <div className="p-6">
              {/* REMOVED 'uppercase' - ab title database wala aayega */}
              <h3 className="text-xl font-extrabold text-black mb-3 line-clamp-1">
                {recipe.title || recipe.meal}
              </h3>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                <div className="flex items-center gap-1"><Flame size={14} className="text-orange-500" />{recipe.kcal} kcal</div>
                <div className="flex items-center gap-1"><Clock size={14} className="text-blue-500" />{recipe.prep_time}m</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
