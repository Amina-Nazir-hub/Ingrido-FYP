import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBookmark } from "../../context/BookmarkContext";
import { Bookmark, ArrowLeft, Trash2 } from "lucide-react";
import { BACKEND_BASE, DEFAULT_IMAGES } from "../constants";

const SavedRecipeCard = ({ recipe, onRemove }) => {
  const navigate = useNavigate();

  const imageUrl = recipe.image
    ? recipe.image.startsWith("http")
      ? recipe.image
      : `${BACKEND_BASE}${recipe.image}`
    : DEFAULT_IMAGES.PLACEHOLDER;

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <img
          src={imageUrl}
          alt={recipe.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = DEFAULT_IMAGES.PLACEHOLDER;
          }}
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-2">
          {recipe.title}
        </h3>
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              if (recipe.is_ai_generated) {
                navigate(`/recipe/ai/${encodeURIComponent(recipe.title)}`);
              } else {
                navigate(`/recipe/${recipe.id}`);
              }
            }}
            className="text-primary hover:underline text-sm"
          >
            View Recipe
          </button>
          <button
            onClick={() => onRemove(recipe)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
            title="Remove from saved"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};

export function SavedPage() {
  const navigate = useNavigate();
  const { bookmarkedRecipes, toggleBookmark, loading } = useBookmark();
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    setSavedRecipes(bookmarkedRecipes);
  }, [bookmarkedRecipes]);

  const handleRemove = async (recipe) => {
    const isAI = recipe.is_ai_generated || false;
    const identifier = isAI ? recipe.title : recipe.id;

    await toggleBookmark(identifier, recipe.title, isAI, recipe);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-secondary transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bookmark className="h-7 w-7 text-amber-600" />
              Saved Recipes
            </h1>
            <p className="text-muted-foreground mt-1">
              {savedRecipes.length} recipe{savedRecipes.length !== 1 ? "s" : ""}{" "}
              saved
            </p>
          </div>
        </div>

        {/* Saved Recipes Grid */}
        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {savedRecipes.map((recipe, index) => (
              <SavedRecipeCard
                key={recipe.id || `saved-${index}`}
                recipe={recipe}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bookmark className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No saved recipes yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start saving your favorite recipes by clicking the bookmark icon!
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              Explore Recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedPage;
