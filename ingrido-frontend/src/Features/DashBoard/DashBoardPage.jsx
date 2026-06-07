// 

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Loader2, RefreshCw } from "lucide-react";
import WelcomeHero from "./components/WelcomeHero";
import RecipeGrid from "./components/RecipeGrid";
import { useDashboardData } from "./hooks/useDashboardData";
import { useBookmark } from "../../context/BookmarkContext";

export function DashboardPage() {
  const { user } = useAuth();
  const { viewHistory, recommendedCards, loading, clearHistory, refreshData } = useDashboardData();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const [localRecommended, setLocalRecommended] = useState([]);
  const [localHistory, setLocalHistory] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentName = user?.first_name || user?.username || localStorage.getItem("user_name") || "Chef";

  // Update local state when recommendedCards changes
  useEffect(() => {
    if (recommendedCards.length > 0) {
      const updatedRecommended = recommendedCards.map(recipe => ({
        ...recipe,
        is_saved: isBookmarked(
          recipe.is_ai_generated ? recipe.title : recipe.id,
          recipe.title,
          recipe.is_ai_generated || false
        )
      }));
      setLocalRecommended(updatedRecommended);
    }
  }, [recommendedCards, isBookmarked]);

  // Update local state when viewHistory changes
  useEffect(() => {
    if (viewHistory.length > 0) {
      const updatedHistory = viewHistory.map(recipe => ({
        ...recipe,
        is_saved: isBookmarked(
          recipe.is_ai_generated ? recipe.title : recipe.id,
          recipe.title,
          recipe.is_ai_generated || false
        )
      }));
      setLocalHistory(updatedHistory);
    }
  }, [viewHistory, isBookmarked]);

  const handleBookmarkToggle = async (recipeId, recipeTitle, isAI, currentIsSaved) => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
    let identifier;
    let isAIRecipe = isAI;
    
    const isSeasonalOrAI = isAI || 
      (recipeId && typeof recipeId === 'string' && 
       (recipeId.toString().startsWith("ai-") || recipeId.toString().includes("seasonal")));
    
    if (isSeasonalOrAI) {
      isAIRecipe = true;
      identifier = recipeTitle;
    } else {
      identifier = recipeId;
    }
    
    try {
      const newStatus = await toggleBookmark(
        identifier,
        recipeTitle,
        isAIRecipe,
        { title: recipeTitle }
      );
      
      if (newStatus !== false) {
        setLocalRecommended(prev =>
          prev.map(recipe =>
            (recipe.id === recipeId || recipe.title === recipeTitle) 
              ? { ...recipe, is_saved: newStatus } 
              : recipe
          )
        );
        setLocalHistory(prev =>
          prev.map(recipe =>
            (recipe.id === recipeId || recipe.title === recipeTitle)
              ? { ...recipe, is_saved: newStatus }
              : recipe
          )
        );
      }
      
      return newStatus;
    } catch (err) {
      console.error("Bookmark toggle error:", err);
      return false;
    }
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setLocalHistory([]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  if (loading && localRecommended.length === 0 && localHistory.length === 0) {
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
          {(localRecommended.length > 0 || recommendedCards.length > 0) && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Recommended Recipes
              </h2>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh Recommendations"
              >
                <RefreshCw 
                  className={`h-5 w-5 text-muted-foreground hover:text-primary transition ${
                    isRefreshing ? "animate-spin" : ""
                  }`} 
                />
              </button>
            </div>
          )}
        
          {localRecommended.length > 0 && (
            <RecipeGrid 
              items={localRecommended} 
              title="" 
              onBookmarkToggle={handleBookmarkToggle}
              forceAI={true}  
              hideTitle={true}
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