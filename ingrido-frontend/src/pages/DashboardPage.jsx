import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { WelcomeHero, RecipeGrid } from "../layouts/DashBoardLayout";
export function Dashboard() {
  const { user } = useAuth();
  const [viewHistory, setViewHistory] = useState([]);
  const [displayCards, setDisplayCards] = useState([]); 
  const currentName = user?.name || localStorage.getItem("user_name") || "User";
  useEffect(() => {
    // 1. Load Recently Viewed
    const saved = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
    setViewHistory(saved);
    // 2. Load Temp Search 
    const tempSearch = JSON.parse(localStorage.getItem("temp_dashboard_cards") || "[]");
    if (tempSearch.length > 0) {
      setDisplayCards(tempSearch);
    }
  }, []);
  const handleSelectRecipe = (items) => {
    setDisplayCards(items);
    localStorage.setItem("temp_dashboard_cards", JSON.stringify(items));
  };
  const handleClearSearch = () => {
    setDisplayCards([]);
    localStorage.removeItem("temp_dashboard_cards");
  };
  const handleClearHistory = () => {
    localStorage.removeItem("ingrido_history");
    setViewHistory([]);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        
        <WelcomeHero 
          name={currentName} 
          onSelectRecipe={handleSelectRecipe} 
        />
        {displayCards.length > 0 && (
          <RecipeGrid 
            items={displayCards} 
            title={displayCards.length === 1 ? "Selected Recipe" : "Search Results"} 
            isSearch={true}
            onClear={handleClearSearch} 
          />
        )}
        <RecipeGrid 
          items={viewHistory} 
          title="Recently Viewed" 
          onClear={handleClearHistory} 
        />
        
      </div>
    </div>
  );
}