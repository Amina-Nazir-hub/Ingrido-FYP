import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardRecipeCard from "./components/DashboardRecipeCard";
import axios from "axios";

// Direct configuration
const BACKEND_BASE = "http://127.0.0.1:8000";
const SEASONAL_RECIPES_URL = `${BACKEND_BASE}/api/dashboard/seasonal/`;

const getAuthConfig = () => {
  const token = localStorage.getItem("ingrido_token");
  return {
    headers: {
      Authorization: token ? `Token ${token}` : undefined,
      "Content-Type": "application/json",
    },
  };
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cache keys
  const CACHE_KEY = "dashboard_recommendations";
  const CACHE_TIMESTAMP_KEY = "dashboard_recommendations_timestamp";
  const SESSION_CACHE_KEY = "dashboard_session_recipes";
  
  // ✅ Store recipes for current session (won't change on navigation)
  const SESSION_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // ✅ Check if this is a manual refresh (F5) or navigation
  const isManualRefresh = () => {
    // Check if page was loaded via navigation or manual refresh
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry && navigationEntry.type === 'reload') {
      console.log("🔄 Manual refresh detected (F5)");
      return true;
    }
    return false;
  };

  // ✅ Load from cache
  const loadFromCache = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const now = Date.now();
        const age = now - parseInt(cachedTimestamp);
        
        // Cache valid for 24 hours
        if (age < 24 * 60 * 60 * 1000) {
          const parsed = JSON.parse(cachedData);
          console.log("📦 Loading from cache (age:", Math.round(age / 3600000), "hours)");
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading cache:", e);
    }
    return null;
  }, []);

  // ✅ Save to cache
  const saveToCache = useCallback((data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log("💾 Saved to cache:", data.length, "recipes");
    } catch (e) {
      console.error("Error saving cache:", e);
    }
  }, []);

  // ✅ Load from session cache (for navigation between pages)
  const loadFromSessionCache = useCallback(() => {
    try {
      const sessionData = sessionStorage.getItem(SESSION_CACHE_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        const timestamp = parsed.timestamp;
        const now = Date.now();
        
        if (now - timestamp < SESSION_CACHE_DURATION) {
          console.log("📦 Loading from session cache (navigation)");
          return parsed.recipes;
        }
      }
    } catch (e) {
      console.error("Error loading session cache:", e);
    }
    return null;
  }, []);

  // ✅ Save to session cache
  const saveToSessionCache = useCallback((data) => {
    try {
      sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
        recipes: data,
        timestamp: Date.now()
      }));
      console.log("💾 Saved to session cache");
    } catch (e) {
      console.error("Error saving session cache:", e);
    }
  }, []);

  // ✅ Fetch recipes
  const fetchRecipes = useCallback(async (forceRefresh = false) => {
    // Check if manual refresh (F5) - ALWAYS fetch new data
    if (isManualRefresh()) {
      console.log("🔄 Manual refresh - fetching fresh recipes");
      forceRefresh = true;
    }
    
    // If not force refresh, check session cache first (for navigation)
    if (!forceRefresh) {
      const sessionCached = loadFromSessionCache();
      if (sessionCached && sessionCached.length > 0) {
        setRecommendations(sessionCached);
        setLoading(false);
        return;
      }
      
      // Then check persistent cache
      const cached = loadFromCache();
      if (cached && cached.length > 0) {
        setRecommendations(cached);
        saveToSessionCache(cached); // Also save to session cache
        setLoading(false);
        return;
      }
    }
    
    // Fetch fresh data from API
    try {
      setLoading(true);
      const response = await axios.get(SEASONAL_RECIPES_URL, getAuthConfig());
      let recipes = response.data;
      
      if (!Array.isArray(recipes)) {
        recipes = recipes.results || recipes.recipes || [];
      }
      
      console.log("🔄 Fetched fresh recipes:", recipes.length);
      
      // Save to all caches
      saveToCache(recipes);
      saveToSessionCache(recipes);
      setRecommendations(recipes);
      
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to load recommendations");
      
      // Try to load from cache as fallback
      const cached = loadFromCache();
      if (cached && cached.length > 0) {
        setRecommendations(cached);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [loadFromCache, loadFromSessionCache, saveToCache, saveToSessionCache]);

  // Initial load
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((recipeId, recipeTitle, isAI, newSavedState) => {
    setRecommendations(prev => prev.map(recipe => {
      const recipeIdentifier = isAI ? recipe.title : recipe.id;
      const targetIdentifier = isAI ? recipeTitle : recipeId;
      
      if (recipeIdentifier === targetIdentifier) {
        return { ...recipe, is_saved: newSavedState };
      }
      return recipe;
    }));
  }, []);

  const handleViewDetail = (id, title, isAI) => {
    if (isAI || (id && id.toString().startsWith("ai-")) || (id && id.toString().includes("seasonal"))) {
      navigate(`/recipe/ai/${encodeURIComponent(title)}`);
    } else {
      navigate(`/recipe/${id}`);
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading delicious recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10 font-sans">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Recommended for You</h1>
            <p className="text-muted-foreground">Discover delicious Pakistani recipes curated just for you</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommendations.map((recipe, index) => (
              <DashboardRecipeCard
                key={recipe.id || recipe.title || index}
                id={recipe.id}
                title={recipe.title}
                meal={recipe.meal}
                image={recipe.image}
                kcal={recipe.kcal}
                prep_time={recipe.prep_time}
                protein={recipe.protein}
                is_saved={recipe.is_saved || false}
                is_ai_generated={recipe.is_ai_generated || false}
                onBookmarkToggle={handleBookmarkToggle}
                forceAI={recipe.is_ai_generated}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No recommendations available</p>
            <button 
              onClick={() => fetchRecipes(true)}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;