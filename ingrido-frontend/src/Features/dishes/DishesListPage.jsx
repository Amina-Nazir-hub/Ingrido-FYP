import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "./components/PageHeader";
import RecipeCard from "./components/RecipeCard";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import { useDishes } from "./hooks/useDishes";
import { useBookmark } from "./hooks/useBookmark";

const DishesListPage = () => {
  const { cityName } = useParams();
  const navigate = useNavigate();
  
  const { recipes, cityInfo, loading, error, updateRecipeBookmark } = useDishes(cityName);
  const { toggleBookmark } = useBookmark();

  const handleBookmark = async (recipeId) => {
    const updateLocal = (id, isSaved) => {
      updateRecipeBookmark(id, isSaved);
    };
    await toggleBookmark(recipeId, updateLocal);
  };

  // ✅ SMART NAVIGATION - Handles both AI and normal recipes
  const handleViewDetail = (recipeId, recipeTitle, isAiGenerated = false) => {
    console.log("Navigating to recipe:", { recipeId, recipeTitle, isAiGenerated });
    
    if (isAiGenerated || (recipeId && recipeId.toString().startsWith("ai-"))) {
      // AI Recipe - use AI route
      navigate(`/recipe/ai/${encodeURIComponent(recipeTitle || recipeId)}`);
    } else {
      // Normal Recipe - use normal route
      navigate(`/recipe/${recipeId}`);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10">
        
        <PageHeader 
          cityName={cityName} 
          region={cityInfo?.region} 
        />

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                {...recipe}
                onBookmark={handleBookmark}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

export default DishesListPage;