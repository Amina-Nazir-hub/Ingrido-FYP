// meal-planner/components/DaySchedule.jsx

import MealCard from "./MealCard";

const DaySchedule = ({ dayData, onViewVideo, onOrderPandamart, onRecipeTitleClick }) => {
  if (!dayData) return null;
  
  // Helper to normalize meal data
  const normalizeMeal = (meal) => {
    if (!meal) return null;
    // If meal is a string, convert to object
    if (typeof meal === 'string') {
      return {
        title: meal,
        description: `Delicious ${meal} recipe`,
        calories: 350,
        prep_time: 30,
        dietary_type: 'mixed'
      };
    }
    return meal;
  };

  const breakfast = normalizeMeal(dayData.breakfast);
  const lunch = normalizeMeal(dayData.lunch);
  const dinner = normalizeMeal(dayData.dinner);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="bg-gradient-to-r from-[#b17b46] to-[#8B5E3C] px-6 py-4">
        <h2 className="text-xl font-bold text-white">{dayData.day || dayData.day_name || `Day ${dayData.index + 1}`}</h2>
        {dayData.date && <p className="text-sm text-white/80 mt-1">{dayData.date}</p>}
        {dayData.health_note && <p className="text-xs text-white/70 mt-1">{dayData.health_note}</p>}
      </div>

      <div className="divide-y divide-border">
        {breakfast && (
          <MealCard
            meal={breakfast}
            mealType="Breakfast"
            onViewVideo={onViewVideo}
            onOrderPandamart={onOrderPandamart}
            onTitleClick={onRecipeTitleClick}
          />
        )}
        {lunch && (
          <MealCard
            meal={lunch}
            mealType="Lunch"
            onViewVideo={onViewVideo}
            onOrderPandamart={onOrderPandamart}
            onTitleClick={onRecipeTitleClick}
          />
        )}
        {dinner && (
          <MealCard
            meal={dinner}
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