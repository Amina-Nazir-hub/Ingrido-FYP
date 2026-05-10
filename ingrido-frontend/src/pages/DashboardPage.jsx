import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { WelcomeHero, RecipeGrid } from "../layouts/DashBoardLayout";

export function Dashboard() {
  const { user } = useAuth();
  const [viewHistory, setViewHistory] = useState([]);
  const [displayCards, setDisplayCards] = useState([]); 
  const currentName = user?.name || localStorage.getItem("user_name") || "User";

  const loadContent = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
    setViewHistory(saved);

    const temp = JSON.parse(localStorage.getItem("temp_dashboard_cards") || "[]");
    if (temp.length > 0) {
      setDisplayCards(temp);
    }
  }, []);

  useEffect(() => {
    loadContent();
    window.addEventListener('focus', loadContent);
    return () => window.removeEventListener('focus', loadContent);
  }, [loadContent]);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        <WelcomeHero name={currentName} onSelectRecipe={(items) => { setDisplayCards(items); localStorage.setItem("temp_dashboard_cards", JSON.stringify(items)); }} />
        {displayCards.length > 0 && <RecipeGrid items={displayCards} title="Search Results" isSearch={true} onClear={() => { setDisplayCards([]); localStorage.removeItem("temp_dashboard_cards"); }} />}
        {viewHistory.length > 0 && <RecipeGrid items={viewHistory} title="Recently Viewed" onClear={() => { setViewHistory([]); localStorage.removeItem("ingrido_history"); }} />}
      </div>
    </div>
  );
}