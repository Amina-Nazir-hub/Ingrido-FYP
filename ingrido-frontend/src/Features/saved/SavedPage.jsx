import React from "react";
import { useNavigate } from "react-router-dom";  
import SavedHeader from "./components/SavedHeader";
import SavedStats from "./components/SavedStats";
import SavedRecipeCard from "./components/SavedRecipeCard";
import LoadingState from "./components/LoadingState";
import EmptySavedState from "./components/EmptySavedState";
import { useBookmark } from "../../context/BookmarkContext"; 

const SavedPage = () => {
  const navigate = useNavigate();  
  const { bookmarkedRecipes, loading, toggleBookmark, refreshBookmarks } = useBookmark();

  const handleUnsave = async (identifier, isAiGenerated) => {
    await toggleBookmark(identifier, identifier, isAiGenerated);
    await refreshBookmarks(); // Refresh after unsave
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SavedHeader />

      <main className="mx-auto max-w-7xl px-6 py-10 font-sans">
        <SavedStats count={bookmarkedRecipes.length} />

        {bookmarkedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {bookmarkedRecipes.map((recipe) => (
              <SavedRecipeCard
                key={recipe.id || recipe.bookmark_id || recipe.recipe_id}
                recipe={recipe}
                onUnsave={handleUnsave}
                isRemoving={false}
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