// meal-planner/components/DaySchedule.jsx
import MealCard from "./MealCard";
import SideCard from "./SideCard";

const DaySchedule = ({ dayData, onViewVideo, onOrderPandamart, onRecipeTitleClick }) => {
  if (!dayData) return null;
  
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-[#b17b46] to-[#8B5E3C] px-6 py-4">
        <h2 className="text-xl font-bold text-white">{dayData.day}</h2>
        {dayData.date && <p className="text-sm text-white/80 mt-1">{dayData.date}</p>}
        {dayData.health_note && <p className="text-xs text-white/70 mt-1">{dayData.health_note}</p>}
      </div>

      <div className="divide-y divide-border">
        {/* Breakfast */}
        {dayData.breakfast && (
          <MealCard
            meal={dayData.breakfast}
            mealType="Breakfast"
            onViewVideo={onViewVideo}
            onOrderPandamart={onOrderPandamart}
            onTitleClick={onRecipeTitleClick}
          />
        )}
        
        {/* Lunch + Side (Dessert/Drink) - Same row, same style */}
        {dayData.lunch && dayData.side && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Lunch Card */}
            <MealCard
              meal={dayData.lunch}
              mealType="Lunch"
              onViewVideo={onViewVideo}
              onOrderPandamart={onOrderPandamart}
              onTitleClick={onRecipeTitleClick}
            />
            
            {/* Side Card (Dessert/Drink) - Same style as MealCard */}
            <SideCard
              side={dayData.side}
              mealType={dayData.side.type === 'dessert' ? 'Dessert' : 'Drink'}
              onViewVideo={onViewVideo}
              onOrderPandamart={onOrderPandamart}
              onTitleClick={onRecipeTitleClick}
            />
          </div>
        )}
        
        {/* If only lunch exists without side */}
        {dayData.lunch && !dayData.side && (
          <MealCard
            meal={dayData.lunch}
            mealType="Lunch"
            onViewVideo={onViewVideo}
            onOrderPandamart={onOrderPandamart}
            onTitleClick={onRecipeTitleClick}
          />
        )}
        
        {/* Dinner */}
        {dayData.dinner && (
          <MealCard
            meal={dayData.dinner}
            mealType="Dinner"
            onViewVideo={onViewVideo}
            onOrderPandamart={onOrderPandamart}
            onTitleClick={onRecipeTitleClick}
          />
        )}
      </div>
    </div>
  );
};

export default DaySchedule;