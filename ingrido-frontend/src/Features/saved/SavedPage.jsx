import React from "react";
import { useNavigate } from "react-router-dom";  
import SavedHeader from "./components/SavedHeader";
import SavedStats from "./components/SavedStats";
import SavedRecipeCard from "./components/SavedRecipeCard";
import LoadingState from "./components/LoadingState";
import EmptySavedState from "./components/EmptySavedState";
import { useSavedRecipes } from "./hooks/useSavedRecipes";

const SavedPage = () => {
  const navigate = useNavigate();  
  const { savedRecipes, loading, removingId, error, handleUnsave, clearError } =
    useSavedRecipes();

  const handleViewDetail = (recipe) => {
    if (recipe.is_ai_generated) {
      navigate(`/recipe/ai/${encodeURIComponent(recipe.title)}`);
    } else {
      navigate(`/recipe/${recipe.id}`);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SavedHeader />

      <main className="mx-auto max-w-7xl px-6 py-10 font-sans">
        <SavedStats count={savedRecipes.length} />

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {savedRecipes.map((recipe) => (
              <SavedRecipeCard
                key={recipe.id || recipe.bookmark_id}
                recipe={recipe}
                onUnsave={handleUnsave}
                onViewDetail={handleViewDetail} 
                isRemoving={removingId === (recipe.recipe_id || recipe.id)}
              />
            ))}
          </div>
        ) : (
          <EmptySavedState />
        )}
      </main>
    </div>
  );
};

export default SavedPage;