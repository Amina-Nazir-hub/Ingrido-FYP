import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

export const useDashboardData = () => {
  const [viewHistory, setViewHistory] = useState(() => {
    return JSON.parse(sessionStorage.getItem("dash_view_history")) || [];
  });
  const [recommendedCards, setRecommendedCards] = useState(() => {
    return JSON.parse(sessionStorage.getItem("dash_recommended")) || [];
  });
  const [loading, setLoading] = useState(false);

  // Initial load - only once when component mounts
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      // Check if we already have cached data
      const cachedRecommended = sessionStorage.getItem("dash_recommended");
      const cachedHistory = sessionStorage.getItem("dash_view_history");

      // If both caches exist, don't fetch again
      if (cachedRecommended && cachedHistory) {
        console.log("Using cached dashboard data");
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const config = token
          ? { headers: { Authorization: `Token ${token}` } }
          : {};

        // Only fetch if no cache
        if (!cachedRecommended) {
          const res = await axios.get(API_ENDPOINTS.SEASONAL_RECIPES, config);
          const processedRecipes = res.data.map((recipe) => ({
            ...recipe,
            is_ai_generated: true,
          }));
          if (isMounted) {
            setRecommendedCards(processedRecipes);
          }
          sessionStorage.setItem(
            "dash_recommended",
            JSON.stringify(processedRecipes),
          );
        }

        if (token && !cachedHistory) {
          const historyRes = await axios.get(
            API_ENDPOINTS.VIEWED_RECIPES,
            config,
          );
          if (historyRes.data.recipes && isMounted) {
            const processedHistory = historyRes.data.recipes.map((recipe) => ({
              ...recipe,
              is_ai_generated: recipe.is_ai_generated || false,
            }));
            setViewHistory(processedHistory);
            sessionStorage.setItem(
              "dash_view_history",
              JSON.stringify(processedHistory),
            );
          }
        } else if (!token && !cachedHistory) {
          const savedHistory = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]",
          );
          if (isMounted) {
            setViewHistory(savedHistory);
          }
          sessionStorage.setItem(
            "dash_view_history",
            JSON.stringify(savedHistory),
          );
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - runs only once

  const refreshData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const config = token
        ? { headers: { Authorization: `Token ${token}` } }
        : {};

      // Clear old cache
      sessionStorage.removeItem("dash_recommended");
      sessionStorage.removeItem("dash_view_history");

      // Fetch fresh data
      const url = `${API_ENDPOINTS.SEASONAL_RECIPES}?refresh=true`;
      const res = await axios.get(url, config);

      const processedRecipes = res.data.map((recipe) => ({
        ...recipe,
        is_ai_generated: true,
      }));

      setRecommendedCards(processedRecipes);
      sessionStorage.setItem(
        "dash_recommended",
        JSON.stringify(processedRecipes),
      );

      if (token) {
        const historyRes = await axios.get(
          API_ENDPOINTS.VIEWED_RECIPES,
          config,
        );
        if (historyRes.data.recipes) {
          const processedHistory = historyRes.data.recipes.map((recipe) => ({
            ...recipe,
            is_ai_generated: recipe.is_ai_generated || false,
          }));
          setViewHistory(processedHistory);
          sessionStorage.setItem(
            "dash_view_history",
            JSON.stringify(processedHistory),
          );
        }
      } else {
        const savedHistory = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]",
        );
        setViewHistory(savedHistory);
        sessionStorage.setItem(
          "dash_view_history",
          JSON.stringify(savedHistory),
        );
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      try {
        await axios.delete(API_ENDPOINTS.VIEWED_RECIPES_CLEAR, {
          headers: { Authorization: `Token ${token}` },
        });
      } catch (err) {
        console.error("Clear history error:", err);
      }
    }
    setViewHistory([]);
    sessionStorage.removeItem("dash_view_history");
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

  return {
    viewHistory,
    recommendedCards,
    loading,
    clearHistory,
    refreshData,
  };
};
