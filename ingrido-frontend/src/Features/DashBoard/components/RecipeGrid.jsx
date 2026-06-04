import DashboardRecipeCard from "./DashboardRecipeCard";

const RecipeGrid = ({ items, title, onClear, onBookmarkToggle }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-12 border-t border-gray-100 dark:border-gray-800 mt-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {onClear && (
          <button 
            onClick={onClear} 
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full transition-all font-medium"
          >
            🗑️ Clear History
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