import { Trash2 } from "lucide-react";
import DashboardRecipeCard from "./DashboardRecipeCard";

const RecipeGrid = ({ items, title, onClear, onBookmarkToggle }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-12 border-t border-border mt-10">
      {/* Main Container flex items-center ke sath perfectly centered hai */}
      <div className="flex items-center justify-between mb-8 min-h-10">
        <h2 className="text-2xl font-bold text-foreground leading-none">
          {title}
        </h2>

        {onClear && (
          <button
            onClick={onClear}
            className="px-3 py-2 rounded-md text-sm text-primary-foreground bg-primary hover:bg-primary/75 transition-all border border-primary-foreground/10 cursor-pointer flex items-center gap-2 h-9 leading-none"
          >
            <Trash2 size={16} strokeWidth={2.2} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((recipe, index) => (
          <DashboardRecipeCard
            key={recipe.id || `dashboard-${index}`}
            {...recipe}
            onBookmarkToggle={onBookmarkToggle}
          />
        ))}
      </div>
    </section>
  );
};

export default RecipeGrid;
