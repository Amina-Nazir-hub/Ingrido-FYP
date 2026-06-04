import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const PlanHeader = ({ daysRemaining, weeklyPlan, isExpired }) => {
  return (
    <>
      <div className="mb-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-[#b17b46]">Home</Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="text-sm text-foreground">Meal Planner</span>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#b17b46]/10 rounded-lg">
              <Calendar className="h-8 w-8 text-[#b17b46]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Weekly Meal Plan</h1>
          </div>
          <p className="text-muted-foreground">
            Select your preferences to generate a personalized 7-day meal plan.
          </p>
          {daysRemaining > 0 && weeklyPlan.length > 0 && !isExpired && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Plan active for {daysRemaining} more {daysRemaining === 1 ? 'day' : 'days'}
            </p>
          )}
          {isExpired && weeklyPlan.length > 0 && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ This plan has expired. Please generate a new plan.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default PlanHeader;