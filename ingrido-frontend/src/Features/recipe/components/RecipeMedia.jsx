import { Utensils } from "lucide-react";
import { BACKEND_URL } from "../constants";
import { getFullImageUrl } from "../utils/recipeUtils";

const RecipeMedia = ({ recipe, displayTitle }) => {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-black aspect-video shadow-lg ring-1 ring-border">
        {recipe.youtube_video_id ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${recipe.youtube_video_id}?rel=0`}
            title={displayTitle}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        ) : recipe.image ? (
          <img
            src={getFullImageUrl(recipe.image, BACKEND_URL)}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
            <Utensils className="h-20 w-20 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeMedia;