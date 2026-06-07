import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Loader2, RefreshCw } from "lucide-react";
import WelcomeHero from "./components/WelcomeHero";
import RecipeGrid from "./components/RecipeGrid";
import { useDashboardData } from "./hooks/useDashboardData";

export function DashboardPage() {
  const { user } = useAuth();
  const { viewHistory, recommendedCards, loading, clearHistory, refreshData } =
    useDashboardData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentName =
    user?.first_name ||
    user?.username ||
    localStorage.getItem("user_name") ||
    "Chef";

  const handleClearHistory = async () => {
    await clearHistory();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  if (loading && recommendedCards.length === 0 && viewHistory.length === 0) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="container mx-auto px-4 py-8">
          <WelcomeHero name={currentName} />
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary w-12 h-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        <WelcomeHero name={currentName} />

        <div className="mt-6">
          {recommendedCards.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Recommended Recipes
              </h2>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh Recommendations"
              >
                <RefreshCw
                  className={`h-5 w-5 text-muted-foreground hover:text-primary transition ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          )}

          {recommendedCards.length > 0 && (
            <RecipeGrid
              items={recommendedCards}
              title=""
              forceAI={true}
              hideTitle={true}
            />
          )}

          {viewHistory.length > 0 && (
            <RecipeGrid
              items={viewHistory}
              title="Recently Viewed Recipes"
              onClear={handleClearHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
