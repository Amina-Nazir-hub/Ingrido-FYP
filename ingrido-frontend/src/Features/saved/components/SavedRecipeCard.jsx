import { Bookmark, Eye, Loader2, Sparkles } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { BACKEND_URL, DEFAULT_IMAGE } from "../constants";

const SavedRecipeCard = ({ recipe, onUnsave, isRemoving }) => {
  const navigate = useNavigate();
  
  const recipeId = recipe.recipe_id || recipe.id;
  const recipeTitle = recipe.title || recipe.recipe_details?.title;
  const isAiGenerated = recipe.is_ai_generated || (recipeId && recipeId.toString().startsWith("ai-"));
  
  // Get image URL
  const getImageUrl = () => {
    let image = recipe.image || recipe.recipe_details?.image;
    if (image) {
      if (image.startsWith('http')) return image;
      return `${BACKEND_URL}${image}`;
    }
    return null;
  };
  
  const imageUrl = getImageUrl();
  const calories = recipe.calories || recipe.kcal || recipe.recipe_details?.kcal || "---";
  const prepTime = recipe.prep_time || recipe.recipe_details?.prep_time || 30;
  const dietaryType = recipe.dietary_type || recipe.recipe_details?.dietary_type;

  const handleViewDetail = () => {
    if (isAiGenerated) {
      navigate(`/recipe/ai/${encodeURIComponent(recipeTitle)}`);
    } else {
      navigate(`/recipe/${recipeId}`);
    }
  };

  const handleUnsaveClick = () => {
    if (isAiGenerated) {
      onUnsave(recipeTitle, true); // Pass title and flag for AI recipe
    } else {
      onUnsave(recipeId, false);
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* AI Badge */}
      {isAiGenerated && (
        <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
          <Sparkles size={10} /> AI Generated
        </div>
      )}

      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipeTitle}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = DEFAULT_IMAGE;
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-xs text-muted-foreground">No image available</p>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-md font-bold uppercase tracking-wide text-foreground line-clamp-1">
          {recipeTitle}
        </h3>

        <div className="flex items-center text-xs font-medium text-muted-foreground gap-2 flex-wrap">
          <span className="bg-secondary px-2 py-1 rounded">{calories} kcal</span>
          <span className="text-border">|</span>
          <span>{prepTime} mins</span>
          {dietaryType && (
            <>
              <span className="text-border">|</span>
              <span className={`px-2 py-1 rounded text-[10px] ${
                dietaryType === 'veg' 
                  ? 'bg-green-500/20 text-green-500' 
                  : 'bg-red-500/20 text-red-500'
              }`}>
                {dietaryType === 'veg' ? 'VEG' : 'NON-VEG'}
              </span>
            </>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <span className="text-[10px] text-muted-foreground italic">
            {recipe.category || (isAiGenerated ? "AI Recipe" : "Saved Recipe")}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUnsaveClick}
              disabled={isRemoving}
              className="rounded-md p-2 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              title="Remove from saved"
            >
              {isRemoving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Bookmark className="h-5 w-5 fill-current" />
              )}
            </button>

            <button
              onClick={handleViewDetail}
              className="rounded-md p-2 text-muted-foreground hover:bg-secondary transition-colors"
              title="View Recipe"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default SavedRecipeCard;