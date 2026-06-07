import React from "react";
import { useNavigate } from "react-router-dom";
import PlanHeader from "./components/PlanHeader";
import PlanActions from "./components/PlanActions";
import PreferencesSection from "./components/PreferencesSection";
import DaySchedule from "./components/DaySchedule";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import { Loader2, Calendar } from "lucide-react";
import { useMealPlan } from "./hooks/useMealPlan";
import { useMealActions } from "./hooks/useMealActions";

const WeeklyPlanPage = () => {
  const navigate = useNavigate();

  const {
    weeklyPlan,
    generating,
    error,
    setError,
    selectedHealthCondition,
    selectedDietaryPref,
    currentPlanId,
    isExpired,
    daysRemaining,
    isLoading,
    regeneratePlan,
    deletePlan,
    clearPlan,
    selectHealthCondition,
    selectDietaryPref,
  } = useMealPlan();

  const {
    handleViewVideo,
    handleOrderPandamart,
    handleClearAndStartOver,
    handleDeletePlan,
  } = useMealActions();

  const handleRecipeTitleClick = (meal) => {
    if (!meal || !meal.title) {
      console.error("No meal title provided");
      return;
    }

    const encodedTitle = encodeURIComponent(meal.title);
    console.log("Navigating to recipe:", meal.title);

    navigate(`/recipe/ai/${encodedTitle}`);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <PlanHeader
          daysRemaining={daysRemaining}
          weeklyPlan={weeklyPlan}
          isExpired={isExpired}
        />

        {weeklyPlan.length > 0 && !isExpired && (
          <PlanActions
            onRegenerate={regeneratePlan}
            onDelete={() => handleDeletePlan(deletePlan, currentPlanId)}
            generating={generating}
          />
        )}

        <ErrorState error={error} onDismiss={() => setError(null)} />

        {(weeklyPlan.length === 0 || isExpired) && (
          <PreferencesSection
            selectedHealthCondition={selectedHealthCondition}
            selectedDietaryPref={selectedDietaryPref}
            onHealthSelect={selectHealthCondition}
            onDietarySelect={selectDietaryPref}
          />
        )}

        {generating && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#b17b46] mx-auto mb-3" />
            <p className="text-muted-foreground">
              Creating your personalized 7-day plan...
            </p>
          </div>
        )}

        {weeklyPlan.length > 0 && !generating && !isExpired && (
          <div id="meal-plan" className="space-y-6 mt-10">
            <div className="flex items-center gap-2 mb-6">
              {/* 🔴 Line color updated here */}
              <div className="h-1.5 w-12 bg-[hsl(var(--primary))] rounded-full shadow-sm"></div>
              <h2 className="text-2xl font-bold">Your Weekly Meal Plan</h2>
            </div>

            {weeklyPlan.map((day, index) => (
              <DaySchedule
                key={index}
                dayData={day}
                onViewVideo={handleViewVideo}
                onOrderPandamart={handleOrderPandamart}
                onRecipeTitleClick={handleRecipeTitleClick} // ✅ Use the local function
              />
            ))}

            <div className="mt-10 text-center">
              <button
                onClick={() => handleClearAndStartOver(clearPlan)}
                className="px-6 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                Clear Plan & Start Over
              </button>
            </div>
          </div>
        )}

        {weeklyPlan.length > 0 && isExpired && !generating && (
          <div className="text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
            <Calendar className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-700 mb-4">
              Your previous meal plan has expired after 7 days.
            </p>
            <button
              onClick={() => {
                clearPlan();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-6 py-2 bg-[#b17b46] text-white rounded-lg hover:bg-[#8B5E3C] transition"
            >
              Create New Plan
            </button>
          </div>
        )}

        {weeklyPlan.length === 0 && !generating && !isExpired && <EmptyState />}
      </main>
    </div>
  );
};

export default WeeklyPlanPage;
