import { ChefHat, Flame, Clock, Video, ShoppingBag } from "lucide-react";

const MealCard = ({ meal, mealType, onViewVideo, onOrderPandamart, onTitleClick }) => {
  if (!meal) return null;
  
  const getDietaryBadge = () => {
    if (meal.dietary_type === 'veg') {
      return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">🌱 Vegetarian</span>;
    } else if (meal.dietary_type === 'non_veg') {
      return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">🍗 Non-Veg</span>;
    } else if (meal.dietary_type === 'mixed') {
      return <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">🥘 Mixed</span>;
    }
    return null;
  };

  return (
    <div className="p-5 transition border-b last:border-b-0 border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="h-4 w-4 text-[#b17b46]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b17b46]">
              {mealType}
            </span>
          </div>
          
          <button
            onClick={() => onTitleClick(meal)}
            className="text-left group w-full"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:underline group-hover:text-[#b17b46] transition-colors">
              {meal.title}
            </h3>
          </button>
          
          <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>

          {meal.dietary_type && <div className="mb-3">{getDietaryBadge()}</div>}

          {(meal.calories || meal.prep_time) && (
            <div className="flex gap-4 text-xs mb-3">
              {meal.calories && (
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-muted-foreground" />
                  <span>{meal.calories} kcal</span>
                </div>
              )}
              {meal.prep_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{meal.prep_time} mins</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => onViewVideo(meal.video_url)}
              className="flex items-center gap-1 text-xs text-[#b17b46] hover:text-[#8B5E3C] transition"
            >
              <Video className="h-3 w-3" />
              Watch Video
            </button>
            <button
              onClick={() => onOrderPandamart(meal.title)}
              className="flex items-center gap-1 text-xs text-[#b17b46] hover:text-[#8B5E3C] transition"
            >
              <ShoppingBag className="h-3 w-3" />
              Order on Pandamart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;