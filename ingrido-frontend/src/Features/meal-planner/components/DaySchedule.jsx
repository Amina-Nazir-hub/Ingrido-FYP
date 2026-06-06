// meal-planner/components/DaySchedule.jsx
import MealCard from "./MealCard";
import SideCard from "./SideCard";

const DaySchedule = ({
  dayData,
  onViewVideo,
  onOrderPandamart,
  onRecipeTitleClick,
}) => {
  if (!dayData) return null;

  return (
    <div className="overflow-hidden card shadow-card hover:shadow-card-hover transition-all duration-300">
      {/* Day Header */}
      <div className="bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.85)] px-6 py-4">
        <h2 className="text-xl font-bold text-white font-display">
          {dayData.day}
        </h2>
        {dayData.date && (
          <p className="text-sm text-white/80 mt-1 font-sans">{dayData.date}</p>
        )}
        {dayData.health_note && (
          <p className="text-xs text-white/70 mt-1 italic font-sans">
            {dayData.health_note}
          </p>
        )}
      </div>

      <div className="p-3 bg-background/50 grid grid-cols-1 gap-2">
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

        {/* Lunch + Side (Dessert/Drink) Layout */}
        {dayData.lunch && dayData.side && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-1">
            <MealCard
              meal={dayData.lunch}
              mealType="Lunch"
              onViewVideo={onViewVideo}
              onOrderPandamart={onOrderPandamart}
              onTitleClick={onRecipeTitleClick}
            />

            <SideCard
              side={dayData.side}
              mealType={dayData.side.type === "dessert" ? "Dessert" : "Drink"}
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
