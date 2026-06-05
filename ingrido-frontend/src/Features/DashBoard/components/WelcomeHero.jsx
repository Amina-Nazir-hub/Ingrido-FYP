import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Clock, X } from "lucide-react";
import { useSearchHistory } from "../hooks/useSearchHistory";

const WelcomeHero = ({ name }) => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { searchHistory, addSearch, removeSearch } = useSearchHistory();

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
      await addSearch(cleanQ);
      setShowDropdown(false);
      navigate(`/search-results?q=${encodeURIComponent(cleanQ)}`);
      setQuery("");
    }
  };

  const removeHistoryItem = async (e, itemToRemove) => {
    e.stopPropagation();
    await removeSearch(itemToRemove);
  };

  const filteredHistory =
    query.trim() === ""
      ? searchHistory
      : searchHistory.filter((item) =>
          item.toLowerCase().includes(query.toLowerCase()),
        );

  const hasNewSearch =
    query.trim() !== "" &&
    !searchHistory.some((h) => h.toLowerCase() === query.trim().toLowerCase());

  return (
    <section className="flex flex-col items-center justify-center w-full pt-20 pb-8 relative">
      <div className="w-full max-w-2xl text-center mb-6">
        <h2 className="text-lg font-medium text-gray-500">Hello, {name}!</h2>
        <h1 className="text-3xl md:text-4xl font-bold text-black">
          What are we cooking today?
        </h1>
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

        {showDropdown && (filteredHistory.length > 0 || hasNewSearch) && (
          <div className="absolute top-14 left-0 w-full bg-white border rounded-2xl shadow-xl mt-1 overflow-hidden py-2 border-gray-100 animate-fadeIn">
            {hasNewSearch && (
              <div
                onClick={() => handleSearch(query)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-purple-50 cursor-pointer text-sm font-bold text-purple-700 transition-colors border-b border-gray-50"
              >
                <Sparkles size={15} className="text-purple-500 animate-pulse" />
                <span>
                  Ask AI to generate recipe for:{" "}
                  <span className="italic">"{query}"</span>
                </span>
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
};

export default WelcomeHero;
