import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

export const useDashboardData = () => {
  const [viewHistory, setViewHistory] = useState([]);
  const [recommendedCards, setRecommendedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const config = token ? { headers: { Authorization: `Token ${token}` } } : {};
      
      const res = await axios.get(API_ENDPOINTS.SEASONAL_RECIPES, config);
      
      // ✅ FIX: Mark all seasonal recipes as AI generated
      const processedRecipes = res.data.map(recipe => ({
        ...recipe,
        is_ai_generated: true
      }));
      
      setRecommendedCards(processedRecipes);
      
      if (token) {
        const historyRes = await axios.get(API_ENDPOINTS.VIEWED_RECIPES, config);
        if (historyRes.data.recipes) {
          const processedHistory = historyRes.data.recipes.map(recipe => ({
            ...recipe,
            is_ai_generated: recipe.is_ai_generated || false
          }));
          setViewHistory(processedHistory);
        }
      } else {
        const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]");
        setViewHistory(savedHistory);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]");
      setViewHistory(savedHistory);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      try {
        await axios.delete(API_ENDPOINTS.VIEWED_RECIPES_CLEAR, {
          headers: { Authorization: `Token ${token}` }
        });
      } catch (err) {
        console.error("Clear history error:", err);
      }
    }
    setViewHistory([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      loadContent();
    }
  }, [loadContent]);

  return {
    viewHistory,
    recommendedCards,
    loading,
    clearHistory,
    refreshData: loadContent,
  };
};