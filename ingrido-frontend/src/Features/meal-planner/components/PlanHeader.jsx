// meal-planner/components/PlanHeader.jsx
import { CalendarDays, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const PlanHeader = ({ daysRemaining, weeklyPlan, isExpired }) => {
  return (
    <>
      {/* Breadcrumbs Navigation */}
      <div className="mb-8">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Dashboard
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="text-sm text-foreground font-medium">Weekly Plan</span>
      </div>

      {/* Main Header Layout Container */}
      <div className="mb-10 py-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Premium Glossy Calendar Icon Box */}
          <div className="p-3.5 bg-linear-to-br bg-primary rounded-md border border-red-700/40 shadow-[0_0_15px_rgba(185,28,28,0.15)] shrink-0 backdrop-blur-xs group">
            <CalendarDays className="h-8 w-8 text-primary-foreground " />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display tracking-tight">
              Weekly Meal Plan
            </h1>
            <p className="text-foreground mt-1">
              Your personalized 7-day meal plan based on your preferences
            </p>
          </div>
        </div>

        {/* Active Badge */}
        {weeklyPlan && weeklyPlan.length > 0 && (
          <div className="self-start md:self-center text-primary-foreground flex items-center gap-2 px-4 py-2 rounded-full bg-primary">
            <Sparkles
              className="h-4 w-4 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            {daysRemaining > 0 && !isExpired ? (
              <span className="text-sm font-bold tracking-wide">
                Active for{" "}
                <span className="font-extrabold underline decoration-2">
                  {daysRemaining}
                </span>{" "}
                more {daysRemaining === 1 ? "day" : "days"}
              </span>
            ) : isExpired ? (
              <span className="text-sm font-bold tracking-wide ">
                Plan expired - Generate new plan
              </span>
            ) : null}
          </div>
        )}
      </div>

      <hr className="border-border/40 my-4" />
      {/* 🔴 Yahan se humne sub-heading section hata diya hai taake duplication khatam ho jaye */}
    </>
  );
};

export default PlanHeader;
