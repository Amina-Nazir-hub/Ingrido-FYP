import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { RecipeGrid } from "../layouts/DashBoardLayout";
import { Loader2 } from "lucide-react";

export default function SearchResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const BACKEND_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await axios.get(`${BACKEND_BASE}/api/accounts/recipes/?search=${query}`);
        setResults(res.data);
        
        // --- SMART HISTORY SAVING ---
        // Hum searched word ko clean karke save karte hain taake 
        // DashBoardLayout isay utha kar iski image dhoond sakay
        let history = JSON.parse(localStorage.getItem("search_history") || "[]");
        const cleanQ = query.toLowerCase().trim();
        
        // Purani entry delete karo (agar hai) aur nayi top par lao
        history = history.filter(q => q !== cleanQ);
        history.unshift(cleanQ);
        
        // Sirf top 5 ya 6 searches rakhein taake dropdown professional lage
        localStorage.setItem("search_history", JSON.stringify(history.slice(0, 6)));
        
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="container mx-auto px-4">
        {/* Design wahi purana rakha hai */}
        <h1 className="text-3xl font-extrabold text-black mb-8 border-b pb-4">
          Results for: <span className="text-primary italic">"{query}"</span>
        </h1>
        
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-primary w-14 h-14" />
          </div>
        ) : (
          <RecipeGrid items={results} title="Found for you" isSearch={true} />
        )}
      </div>
    </div>
  );
}