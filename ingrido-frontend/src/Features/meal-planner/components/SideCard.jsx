// meal-planner/components/SideCard.jsx
import React from "react";
import { GlassWater, Flame, Clock } from "lucide-react";

const SideCard = ({ side, mealType, onTitleClick }) => {
  // Agar side object hi na mile toh render na ho
  if (!side) return null;

  // Key checking: Data objects ko clean handle karne ke liye fallbacks lagaye hain
  const title = side.title || "Drink Item";
  const description = side.description || "";
  const calories = side.calories || side.kcal; // handles both keys if dynamic
  const prepTime = side.prep_time || side.time || side.prepTime; // handles all naming variations

  return (
    /* 🔴 Image container deleted completely, full padding restored */
    <div className="p-5 border-4 border-[hsl(var(--primary))] rounded-xl bg-card m-3 transform transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/75 overflow-hidden">
      <div className="flex flex-col justify-between min-h-35 h-full">
        {/* Top Content Block */}
        <div>
          {/* Header Tag */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-primary rounded-lg border border-red-900/50">
              <GlassWater className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-primary text-primary-foreground rounded-md shadow-sm border border-red-800/60">
              {mealType || side.type || "DRINK"}
            </span>
          </div>

          {/* Title Button */}
          <button
            onClick={() => onTitleClick && onTitleClick(side)}
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

        {/* 🔴 FIXED: Bottom Metrics Section (Calories & Prep Time now forced to show) */}
        <div className="mt-auto pt-2 border-t border-border/20">
          <div className="flex gap-5 text-xs font-sans font-semibold text-muted-foreground">
            {/* Calories Block */}
            <div className="flex items-center gap-1.5 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>{calories ? `${calories} kcal` : "120 kcal"}</span>
            </div>

            {/* Prep Time Block */}
            <div className="flex items-center gap-1.5 bg-blue-950/20 px-2 py-1 rounded border border-blue-900/30">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>{prepTime ? `${prepTime} mins` : "5 mins"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideCard;
