import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { WelcomeHero, RecipeGrid } from "../layouts/DashBoardLayout";
import { Loader2 } from "lucide-react";

export function DashboardPage() {
  const { user } = useAuth();
  const [viewHistory, setViewHistory] = useState([]);
  const [recommendedCards, setRecommendedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_BASE = "http://127.0.0.1:8000";

  const currentName = user?.first_name || user?.username || localStorage.getItem("user_name") || "Chef";

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_BASE}/api/accounts/recipes/dashboard/`);
      setRecommendedCards(res.data);
      const saved = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
      setViewHistory(saved);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        <WelcomeHero name={currentName} />
        
        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
          ) : (
            <>
              <RecipeGrid items={recommendedCards} title="Recommended Recipes" />
              {viewHistory.length > 0 && (
                <RecipeGrid 
                  items={viewHistory} 
                  title="Recently Viewed" 
                  onClear={() => { setViewHistory([]); localStorage.removeItem("ingrido_history"); }} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default DashboardPage;