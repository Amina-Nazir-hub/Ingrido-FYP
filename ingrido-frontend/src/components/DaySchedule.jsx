import MealCard from './MealCard';

export function DaySchedule ({ dayData }) {
  return(
  <div className="bg-card rounded-lg shadow-card overflow-hidden">
    <div className="bg-primary px-6 py-3">
      <h2 className="font-display text-lg font-semibold text-primary-foreground">
        {dayData.day}
      </h2>
    </div>
    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
      {dayData.meals.map((meal, idx) => (
        <MealCard key={idx} meal={meal} />
      ))}
    </div>
  </div>
);
}