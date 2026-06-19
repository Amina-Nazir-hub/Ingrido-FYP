import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

export const useRecentlyViewed = () => {
  const [viewHistory, setViewHistory] = useState(() => {
    return JSON.parse(sessionStorage.getItem("dash_view_history")) || [];
  });

  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  const processHistoryData = (data) => {
    if (data && data.recipes) {
      return data.recipes.map((recipe) => ({
        ...recipe,
        is_ai_generated: recipe.is_ai_generated || false,
      }));
    } else if (data && Array.isArray(data)) {
      return data.map((recipe) => ({
        ...recipe,
        is_ai_generated: recipe.is_ai_generated || false,
      }));
    }
    return [];
  };

  const loadHistoryContent = useCallback(async (forceRefresh = false) => {
    // Recommended recipes ki tarah is ka apna cache check aur page reload control
    const cached = sessionStorage.getItem("dash_view_history");

    if (!forceRefresh && cached) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const config = token ? { headers: { Authorization: `Token ${token}` } } : {};

      if (token) {
        const historyRes = await axios.get(API_ENDPOINTS.VIEWED_RECIPES, config);
        const processedHistory = processHistoryData(historyRes.data);
        
        setViewHistory(processedHistory);
        sessionStorage.setItem("dash_view_history", JSON.stringify(processedHistory));
      } else {
        const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]");
        setViewHistory(savedHistory);
        sessionStorage.setItem("dash_view_history", JSON.stringify(savedHistory));
      }
    } catch (err) {
      console.error("Recently viewed module error:", err);
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
    sessionStorage.removeItem("dash_view_history");
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const cached = sessionStorage.getItem("dash_view_history");
    const isPageReload = performance.getEntriesByType("navigation")[0]?.type === "reload";

    if (isPageReload) {
      sessionStorage.removeItem("dash_view_history");
      loadHistoryContent(true);
    } else if (cached) {
      return;
    } else {
      loadHistoryContent(false);
    }
  }, [loadHistoryContent]);

  return {
    viewHistory,
    loading,
    clearHistory,
    refreshViewHistory: () => loadHistoryContent(true),
  };
};

export default useRecentlyViewed;