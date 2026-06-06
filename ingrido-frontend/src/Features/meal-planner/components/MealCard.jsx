// meal-planner/components/MealCard.jsx
import React from "react";
import { ChefHat, Flame, Clock } from "lucide-react";

const MealCard = ({
  meal,
  mealType,
  onViewVideo,
  onOrderPandamart,
  onTitleClick,
}) => {
  if (!meal) return null;

  // Data keys fallback for robust handling
  const title = meal.title || "Meal Item";
  const description = meal.description || "";
  const calories = meal.calories || meal.kcal;
  const prepTime = meal.prep_time || meal.time || meal.prepTime;

  const getDietaryBadge = () => {
    if (meal.dietary_type === "veg") {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-sans font-medium">
          🌱 Vegetarian
        </span>
      );
    } else if (meal.dietary_type === "non_veg") {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-sans font-medium">
          🍗 Non-Veg
        </span>
      );
    } else if (meal.dietary_type === "mixed") {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-sans font-medium">
          🥘 Mixed
        </span>
      );
    }
    return null;
  };

  return (
    /* 🔴 Image container fully removed to match SideCard's design exactly */
    <div className="p-5 border-4 border-[hsl(var(--primary))] rounded-xl bg-card m-3 transform transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/75 overflow-hidden">
      <div className="flex flex-col justify-between min-h-35 h-full">
        {/* Top Content Block */}
        <div>
          {/* Header Tag */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-primary rounded-md border border-red-900/50">
              <ChefHat className="h-4 w-4 text-primary-foreground " />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-primary text-primary-foreground rounded-md shadow-sm border">
              {mealType || "MEAL"}
            </span>
            {meal.dietary_type && (
              <div className="ml-auto">{getDietaryBadge()}</div>
            )}
          </div>

          {/* Title Button */}
          <button
            onClick={() => onTitleClick && onTitleClick(meal)}
            className="text-left group w-full"
          >
            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:underline group-hover:text-primary transition-colors font-display">
              {title}
            </h3>
          </button>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 font-sans leading-relaxed">
            {description}
          </p>
        </div>

        {/* 🔴 FIXED: Bottom Metrics Section styled exactly like SideCard with a divider */}
        <div className="mt-auto pt-2 border-t border-border/20">
          <div className="flex gap-5 text-xs font-sans font-semibold text-muted-foreground">
            {/* Calories Block */}
            <div className="flex items-center gap-1.5 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>{calories ? `${calories} kcal` : "350 kcal"}</span>
            </div>

            {/* Prep Time Block */}
            <div className="flex items-center gap-1.5 bg-blue-950/20 px-2 py-1 rounded border border-blue-900/30">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>{prepTime ? `${prepTime} mins` : "20 mins"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
