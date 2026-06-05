import { Bookmark, Eye, Loader2, Sparkles, Flame, Clock, Drumstick } from "lucide-react";
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
    return DEFAULT_IMAGE;
  };
  
  const imageUrl = getImageUrl();
  const calories = recipe.calories || recipe.kcal || recipe.recipe_details?.kcal || "350";
  const prepTime = recipe.prep_time || recipe.recipe_details?.prep_time || "25";
  const protein = recipe.protein || recipe.recipe_details?.protein || "20g";
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
      onUnsave(recipeTitle, true);
    } else {
      onUnsave(recipeId, false);
    }
  };

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg relative">
      {/* AI Badge */}
      {isAiGenerated && (
        <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
          <Sparkles size={10} /> AI Generated
        </div>
      )}

      {/* Image Section */}
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <img
          src={imageUrl}
          alt={recipeTitle}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = DEFAULT_IMAGE;
          }}
        />
      </div>

      {/* Content Section */}
      <div className="space-y-3 p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-foreground line-clamp-1">
            {recipeTitle}
          </h3>
          {dietaryType && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
              dietaryType === 'veg' 
                ? 'border-green-500 text-green-500' 
                : 'border-red-500 text-red-500'
            }`}>
              {dietaryType === 'veg' ? 'VEG' : 'NON-VEG'}
            </span>
          )}
        </div>

        {/* Nutrition Grid - Same as Dashboard/DishList cards */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Flame className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{calories}</span>
            <span className="text-muted-foreground">kcal</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{prepTime}</span>
            <span className="text-muted-foreground">mins</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Drumstick className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{protein}</span>
            <span className="text-muted-foreground">protein</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
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
    </article>
  );
};

export default SavedRecipeCard;