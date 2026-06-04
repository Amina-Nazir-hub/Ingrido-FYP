import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchHeader from "./components/SearchHeader";
import SearchResultCard from "./components/SearchResultCard";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import { useSearchResults } from "./hooks/useSearchResults";
import { useSearchBookmark } from "./hooks/useSearchBookmark";
import { ROUTES } from "./constants";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("q");
  
  const { results, loading, searchError, suggestions, updateRecipeBookmark } = useSearchResults(query);
  const { toggleBookmark } = useSearchBookmark();

  const handleBookmark = async (recipeId, recipeTitle, isAiRecipe) => {
    const onSuccess = (id, title, isSaved) => {
      updateRecipeBookmark(id, title, isSaved);
    };
    await toggleBookmark(recipeId, recipeTitle, isAiRecipe, onSuccess);
  };

  const handleViewDetail = (recipeId, recipeTitle, isAiRecipe) => {
    if (isAiRecipe) {
      navigate(ROUTES.AI_RECIPE_DETAIL(recipeTitle));
    } else {
      navigate(ROUTES.RECIPE_DETAIL(recipeId));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/search-results?q=${encodeURIComponent(suggestion)}`);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (searchError) {
    return (
      <ErrorState 
        error={searchError} 
        suggestions={suggestions} 
        onSuggestionClick={handleSuggestionClick} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10 pt-28">
        <SearchHeader query={query} />

        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((recipe, idx) => (
              <SearchResultCard
                key={recipe.id || `search-ai-${idx}`}
                {...recipe}
                onBookmark={handleBookmark}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        ) : (
          <EmptyState query={query} />
        )}
      </main>
    </div>
  );
};

export default SearchResultsPage;