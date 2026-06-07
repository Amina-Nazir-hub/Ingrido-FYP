import { Clock, Flame, Utensils, Sparkles } from "lucide-react";

const RecipeInfo = ({ recipe, isAiGenerated }) => {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-4 lg:grid-cols-2">
      <div className="flex items-center gap-3">
        <Clock className="text-blue-500 h-5 w-5" />
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">
            Cook Time
          </p>
          <p className="font-bold text-sm">{recipe.prep_time || "25"} mins</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Flame className="h-5 w-5 text-amber-500" />
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">
            Calories
          </p>
          <p className="font-bold text-sm">{recipe.kcal || "350"} kcal</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Utensils className="text-primary h-5 w-5" />
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">Cuisine</p>
          <p className="font-bold text-sm">{recipe.cuisine || "Pakistani"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Sparkles className="text-primary h-5 w-5" />
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">Source</p>
          <p className="font-bold text-sm">
            {isAiGenerated ? "AI Generated" : "Database"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecipeInfo;
