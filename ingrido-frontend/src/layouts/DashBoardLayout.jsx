import { useState, useEffect, useRef } from "react";
import { Search, Trash2, Eye, Sparkles, Flame, Clock, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export function WelcomeHero({ name }) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const BACKEND_BASE = "http://127.0.0.1:8000";

  const loadSearchHistory = async () => {
    const token = localStorage.getItem("ingrido_token");
    if (token) {
      try {
        const res = await axios.get(`${BACKEND_BASE}/api/accounts/search-history/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setSearchHistory(res.data.searches || []);
      } catch (err) {
        console.error("Load search history error:", err);
        const history = JSON.parse(localStorage.getItem("ingrido_recent_searches") || "[]");
        setSearchHistory(history);
      }
    } else {
      const history = JSON.parse(localStorage.getItem("ingrido_recent_searches") || "[]");
      setSearchHistory(history);
    }
  };

  useEffect(() => {
    loadSearchHistory();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (q) => {
    const cleanQ = q.trim();
    if (cleanQ) {
      const token = localStorage.getItem("ingrido_token");
      
      if (token) {
        try {
          await axios.post(`${BACKEND_BASE}/api/accounts/search-history/add/`, 
            { query: cleanQ },
            { headers: { Authorization: `Token ${token}` } }
          );
          const res = await axios.get(`${BACKEND_BASE}/api/accounts/search-history/`, {
            headers: { Authorization: `Token ${token}` }
          });
          setSearchHistory(res.data.searches || []);
        } catch (err) {
          console.error("Save search error:", err);
          let currentHistory = JSON.parse(localStorage.getItem("ingrido_recent_searches") || "[]");
          currentHistory = currentHistory.filter(item => item.toLowerCase() !== cleanQ.toLowerCase());
          currentHistory.unshift(cleanQ);
          localStorage.setItem("ingrido_recent_searches", JSON.stringify(currentHistory.slice(0, 6)));
          setSearchHistory(currentHistory.slice(0, 6));
        }
      } else {
        let currentHistory = JSON.parse(localStorage.getItem("ingrido_recent_searches") || "[]");
        currentHistory = currentHistory.filter(item => item.toLowerCase() !== cleanQ.toLowerCase());
        currentHistory.unshift(cleanQ);
        localStorage.setItem("ingrido_recent_searches", JSON.stringify(currentHistory.slice(0, 6)));
        setSearchHistory(currentHistory.slice(0, 6));
      }
      
      setShowDropdown(false);
      navigate(`/search-results?q=${encodeURIComponent(cleanQ)}`);
      setQuery("");
    }
  };

  const removeHistoryItem = async (e, itemToRemove) => {
    e.stopPropagation();
    const token = localStorage.getItem("ingrido_token");
    
    if (token) {
      try {
        await axios.delete(`${BACKEND_BASE}/api/accounts/search-history/remove/${encodeURIComponent(itemToRemove)}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        const res = await axios.get(`${BACKEND_BASE}/api/accounts/search-history/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setSearchHistory(res.data.searches || []);
      } catch (err) {
        console.error("Remove search error:", err);
        const updated = searchHistory.filter(h => h !== itemToRemove);
        setSearchHistory(updated);
        localStorage.setItem("ingrido_recent_searches", JSON.stringify(updated));
      }
    } else {
      const updated = searchHistory.filter(h => h !== itemToRemove);
      setSearchHistory(updated);
      localStorage.setItem("ingrido_recent_searches", JSON.stringify(updated));
    }
  };

  const filteredHistory = query.trim() === "" 
    ? searchHistory 
    : searchHistory.filter(item => item.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="flex flex-col items-center justify-center w-full pt-20 pb-8 relative">
      <div className="w-full max-w-2xl text-center mb-6">
        <h2 className="text-lg font-medium text-gray-500">Hello, {name}!</h2>
        <h1 className="text-3xl md:text-4xl font-bold text-black">What are we cooking today?</h1>
        <p className="text-xs text-primary font-semibold mt-1 flex items-center justify-center gap-1">
          <Sparkles size={12} className="animate-pulse" /> Powered by Groq AI Chef
        </p>
      </div>

      <div ref={dropdownRef} className="w-full max-w-lg relative z-50">
        <div className="flex items-center bg-white border-2 border-gray-200 focus-within:border-primary transition-all rounded-full shadow-sm pr-2 pl-4">
          <Search size={18} className="text-gray-400 mr-1" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Search dish name, ingredient (e.g., Biryani, Chicken)..."
            className="w-full px-2 h-12 text-black outline-none bg-transparent placeholder-gray-400 font-medium text-sm"
          />
          <button 
            onClick={() => handleSearch(query)} 
            className="bg-primary text-white p-2.5 rounded-full hover:bg-opacity-90 transition-all shadow-sm"
          >
            <Search size={18} />
          </button>
        </div>

        {showDropdown && (filteredHistory.length > 0 || query.trim() !== "") && (
          <div className="absolute top-14 left-0 w-full bg-white border rounded-2xl shadow-xl mt-1 overflow-hidden py-2 border-gray-100 animate-fadeIn">
            {query.trim() !== "" && !searchHistory.some(h => h.toLowerCase() === query.trim().toLowerCase()) && (
              <div
                onClick={() => handleSearch(query)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-purple-50 cursor-pointer text-sm font-bold text-purple-700 transition-colors border-b border-gray-50"
              >
                <Sparkles size={15} className="text-purple-500 animate-pulse" />
                <span>Ask AI to generate recipe for: <span className="italic">"{query}"</span></span>
              </div>
            )}

            {filteredHistory.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSearch(item)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer text-sm font-bold text-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock size={15} className="text-gray-400" />
                  <span>{item}</span>
                </div>
                <button
                  onClick={(e) => removeHistoryItem(e, item)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-all"
                  title="Remove search"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}