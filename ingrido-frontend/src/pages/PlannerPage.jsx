import {Calendar} from "lucide-react";
import { WEEKLY_PLAN } from '../utils/MealData';
import {DaySchedule} from '../components/DaySchedule';

export function PlannerPage() {
  return (
    <div className="pt-28 pb-16 container mx-auto px-4">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Weekly Meal Plan</h1>
        </div>
        <p className="text-muted-foreground">
          Your personalized 7-day meal schedule based on your preferences.
        </p>
      </div>

      <div className="space-y-6">
        {WEEKLY_PLAN.map((day) => (
          <DaySchedule key={day.day} dayData={day} />
        ))}
      </div>
    </div>
  );
}