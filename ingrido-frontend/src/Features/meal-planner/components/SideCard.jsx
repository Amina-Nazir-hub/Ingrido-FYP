import { Coffee, IceCream, Flame, Clock, Video, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SideCard = ({ side, mealType, onViewVideo, onOrderPandamart, onTitleClick }) => {
  const navigate = useNavigate();
  
  if (!side) return null;
  
  const isDessert = side.type === 'dessert';
  
  const handleTitleClick = () => {
    if (onTitleClick) {
      onTitleClick(side);
    } else {
      const encodedTitle = encodeURIComponent(side.title);
      navigate(`/recipe/ai/${encodedTitle}`);
    }
  };
  
  const handleViewVideo = () => {
    if (onViewVideo) {
      onViewVideo(side.video_url);
    }
  };
  
  const handleOrderPandamart = () => {
    if (onOrderPandamart) {
      onOrderPandamart(side.title);
    }
  };
  
  return (
    <div className="p-5 transition border-b last:border-b-0 border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header - Same as MealCard */}
          <div className="flex items-center gap-2 mb-2">
            {isDessert ? (
              <IceCream className="h-4 w-4 text-[#b17b46]" />
            ) : (
              <Coffee className="h-4 w-4 text-[#b17b46]" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b17b46]">
              {mealType || (isDessert ? 'Dessert' : 'Drink')}
            </span>
          </div>
          
          {/* Title - Same font as MealCard */}
          <button
            onClick={handleTitleClick}
            className="text-left group w-full"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:underline group-hover:text-[#b17b46] transition-colors">
              {side.title}
            </h3>
          </button>
          
          {/* Description - Same as MealCard */}
          <p className="text-sm text-muted-foreground mb-3">{side.description}</p>

          {/* Badge - Same as MealCard */}
          <div className="mb-3">
            <span className={`text-xs px-2 py-1 rounded-full ${
              isDessert 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-teal-100 text-teal-700'
            }`}>
              {isDessert ? '🍰 Dessert' : '🥤 Drink'}
            </span>
          </div>

          {/* Calories & Prep Time - Same as MealCard */}
          <div className="flex gap-4 text-xs mb-3">
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-muted-foreground" />
              <span>{side.calories || (isDessert ? '250' : '120')} kcal</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{side.prep_time || (isDessert ? '15' : '5')} mins</span>
            </div>
          </div>

          {/* Action Buttons - Same as MealCard */}
          <div className="flex gap-3">
            <button
              onClick={handleViewVideo}
              className="flex items-center gap-1 text-xs text-[#b17b46] hover:text-[#8B5E3C] transition"
            >
              <Video className="h-3 w-3" />
              Watch Video
            </button>
            <button
              onClick={handleOrderPandamart}
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

export default SideCard;