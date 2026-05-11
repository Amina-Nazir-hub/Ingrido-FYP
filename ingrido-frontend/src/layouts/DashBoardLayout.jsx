import { useState, useEffect, useRef } from "react";
import { History, Search, Loader2, Flame, Clock, Trash2, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export function WelcomeHero({ name }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const BACKEND_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const getSuggestions = async () => {
      if (query.trim() === "") {
        const historyWords = JSON.parse(localStorage.getItem("search_history") || "[]");
        if (historyWords.length === 0) { setSuggestions([]); return; }
        try {
          const historyWithImages = await Promise.all(
            historyWords.map(async (word) => {
              const res = await axios.get(`${BACKEND_BASE}/api/accounts/recipes/`, { params: { search: word } });
              const perfectRecipeMatch = res.data.find(r => (r.title || r.meal).toLowerCase() === word.toLowerCase());
              return { title: word, image: perfectRecipeMatch?.image || null };
            })
          );
          setSuggestions(historyWithImages);
        } catch { setSuggestions(historyWords.map(w => ({ title: w, image: null }))); }
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`${BACKEND_BASE}/api/accounts/recipes/`, { params: { search: query } });
        setSuggestions(res.data);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    };
    const timeout = setTimeout(getSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearch = (q) => {
    if (q.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(q)}`);
      setShowSuggestions(false);
      setQuery("");
    }
  };

  return (
    <section className="flex flex-col items-center justify-center w-full pt-20 pb-8 relative">
      <div className="w-full max-w-2xl text-center mb-6">
        <h2 className="text-lg font-medium text-gray-500">Hello, {name}!</h2>
        <h1 className="text-3xl md:text-4xl font-bold text-black">What are we cooking today?</h1>
      </div>

      <div className="w-full max-w-lg relative z-50" ref={dropdownRef}>
        {/* Latest Clean Search Bar */}
        <div className={`flex items-center bg-white border-2 border-gray-200 transition-all ${showSuggestions && suggestions.length > 0 ? 'rounded-t-3xl border-b-0' : 'rounded-full'}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Search recipes..."
            className="w-full px-6 h-12 text-black outline-none bg-transparent"
          />
          <div className="pr-2">
            <button onClick={() => handleSearch(query)} className="bg-primary text-white p-2.5 rounded-full hover:bg-opacity-90 transition-all">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            </button>
          </div>
        </div>

        {/* Suggestion List */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border-2 border-t-0 border-gray-200 rounded-b-3xl overflow-hidden shadow-sm">
            {suggestions.map((item, index) => (
              <div 
                key={index} 
                onClick={() => handleSearch(item.title || item.meal)}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <History size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-700 capitalize">{item.title || item.meal}</span>
                </div>
                {item.image && (
                  <img 
                    src={item.image.startsWith('http') ? item.image : `${BACKEND_BASE}${item.image}`} 
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100" 
                    alt="preview"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function RecipeGrid({ items, title, onClear }) {
  if (!items || items.length === 0) return null;
  const BACKEND_BASE = "http://127.0.0.1:8000";

  return (
    <section className="py-12 border-t mt-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-black">{title}</h2>
        {onClear && (
          <button onClick={onClear} className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full transition-all font-medium">
            <Trash2 size={14} /> Clear History
          </button>
        )}
      </div>

      {/* Purani Detailed Grid (Wahi Cards, Shadows aur Info) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((recipe) => (
          <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="group bg-white rounded-[2.5rem] border shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="h-52 w-full relative overflow-hidden">
              <img 
                src={recipe.image?.startsWith('http') ? recipe.image : `${BACKEND_BASE}${recipe.image}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt={recipe.title || recipe.meal}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white p-3 rounded-full text-primary shadow-lg">
                  <Eye size={24} />
                </div>
              </div>
            </div>
            <div className="p-6 text-black">
              <h3 className="text-xl font-extrabold mb-2 line-clamp-1">{recipe.title || recipe.meal}</h3>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                <div className="flex items-center gap-1"><Flame size={14} className="text-orange-500" />350 kcal</div>
                <div className="flex items-center gap-1"><Clock size={14} className="text-blue-500" />25m</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}