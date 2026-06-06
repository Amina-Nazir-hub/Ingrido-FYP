// Features/DashBoard/DashBoardPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import WelcomeHero from "./components/WelcomeHero";
import RecipeGrid from "./components/RecipeGrid";
import { useDashboardData } from "./hooks/useDashboardData";
import { useBookmark } from "../../context/BookmarkContext";

export function DashboardPage() {
  const { user } = useAuth();
  const { viewHistory, recommendedCards, loading, clearHistory } = useDashboardData();
  const { isBookmarked, toggleBookmark, refreshBookmarks } = useBookmark();
  const [localRecommended, setLocalRecommended] = useState([]);
  const [localHistory, setLocalHistory] = useState([]);

  const currentName = user?.first_name || user?.username || localStorage.getItem("user_name") || "Chef";

  // ✅ FIXED: Bookmark status sync for recommended recipes
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

  // ✅ FIXED: Bookmark status sync for history recipes
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

  // ✅ FIXED: Handle bookmark toggle correctly
  const handleBookmarkToggle = async (recipeId, recipeTitle, isAI, currentIsSaved) => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // ✅ CRITICAL: AI recipes ke liye title use karo, ID nahi
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
    
    console.log("handleBookmarkToggle:", { recipeId, recipeTitle, isAI, identifier });
    
    try {
      const newStatus = await toggleBookmark(
        identifier,
        recipeTitle,
        isAIRecipe,
        { title: recipeTitle }
      );
      
      if (newStatus !== false) {
        // Update recommended section
        setLocalRecommended(prev =>
          prev.map(recipe =>
            recipe.id === recipeId || recipe.title === recipeTitle 
              ? { ...recipe, is_saved: newStatus } 
              : recipe
          )
        );
        // Update history section
        setLocalHistory(prev =>
          prev.map(recipe =>
            recipe.id === recipeId || recipe.title === recipeTitle
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
          {/* ✅ Recommended Recipes - Hamesha AI treat karo */}
          {localRecommended.length > 0 && (
            <RecipeGrid 
              items={localRecommended} 
              title="Recommended Recipes"
              onBookmarkToggle={handleBookmarkToggle}
              forceAI={true}  // ✅ Force AI for all recommended recipes
            />
          )}
          
          {/* ✅ Recently Viewed - Original flag respect karo (don't force AI) */}
          {localHistory.length > 0 && (
            <RecipeGrid 
              items={localHistory} 
              title="Recently Viewed Recipes" 
              onClear={handleClearHistory}
              onBookmarkToggle={handleBookmarkToggle}
              // ✅ No forceAI prop - original is_ai_generated flag will be used
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;