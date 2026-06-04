import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import axios from "axios";
import WelcomeHero from "./components/WelcomeHero";
import RecipeGrid from "./components/RecipeGrid";
import { useDashboardData } from "./hooks/useDashboardData";
import { useBookmarkStatus } from "../shared/hooks/useBookmark";

const BACKEND_BASE = "http://127.0.0.1:8000";

export function DashboardPage() {
  const { user } = useAuth();
  const { viewHistory, recommendedCards, loading, clearHistory, refreshData } = useDashboardData();
  const { isBookmarked, toggleBookmark, fetchBookmarks } = useBookmarkStatus();
  const [localRecommended, setLocalRecommended] = useState([]);
  const [localHistory, setLocalHistory] = useState([]);

  const currentName = user?.first_name || user?.username || localStorage.getItem("user_name") || "Chef";

  // Update local state when data loads
  useEffect(() => {
    if (recommendedCards.length > 0) {
      const updatedRecommended = recommendedCards.map(recipe => ({
        ...recipe,
        is_saved: isBookmarked(recipe.id)
      }));
      setLocalRecommended(updatedRecommended);
    }
  }, [recommendedCards, isBookmarked]);

  useEffect(() => {
    if (viewHistory.length > 0) {
      const updatedHistory = viewHistory.map(recipe => ({
        ...recipe,
        is_saved: isBookmarked(recipe.id)
      }));
      setLocalHistory(updatedHistory);
    }
  }, [viewHistory, isBookmarked]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async (recipeId, recipeTitle, isAI, currentIsSaved) => {
    const result = await toggleBookmark(recipeId, recipeTitle, isAI);
    
    if (result.success) {
      // Update local state immediately
      setLocalRecommended(prev =>
        prev.map(recipe =>
          recipe.id === recipeId ? { ...recipe, is_saved: result.isSaved } : recipe
        )
      );
      setLocalHistory(prev =>
        prev.map(recipe =>
          recipe.id === recipeId ? { ...recipe, is_saved: result.isSaved } : recipe
        )
      );
    }
  };

  // Handle clear history
  const handleClearHistory = async () => {
    await clearHistory();
    setLocalHistory([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="container mx-auto px-4 py-8">
          <WelcomeHero name={currentName} />
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary w-12 h-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        <WelcomeHero name={currentName} />
        
        <div className="mt-6">
          {localRecommended.length > 0 && (
            <RecipeGrid 
              items={localRecommended} 
              title="Recommended Recipes"
              onBookmarkToggle={handleBookmarkToggle}
            />
          )}
          
          {localHistory.length > 0 && (
            <RecipeGrid 
              items={localHistory} 
              title="Recently Viewed Recipes" 
              onClear={handleClearHistory}
              onBookmarkToggle={handleBookmarkToggle}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;