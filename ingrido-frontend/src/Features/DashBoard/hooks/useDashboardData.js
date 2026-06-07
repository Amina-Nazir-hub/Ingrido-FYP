import { useState, useEffect, useCallback, useRef } from "react";
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
  const hasFetched = useRef(false);

  const loadContent = useCallback(async (forceRefresh = false) => {
    const cached = sessionStorage.getItem("dash_recommended");

    // if cached and not forcing refresh → skip API
    if (!forceRefresh && cached) {
      setRecommendedCards(JSON.parse(cached));
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

      const config = token
        ? { headers: { Authorization: `Token ${token}` } }
        : {};

      const url = forceRefresh
        ? `${API_ENDPOINTS.SEASONAL_RECIPES}?refresh=true`
        : API_ENDPOINTS.SEASONAL_RECIPES;

      // ✅ ONLY ONE API CALL (FIXED)
      const res = await axios.get(url, config);

      const processedRecipes = (res.data || []).map((recipe) => ({
        ...recipe,
        is_ai_generated: true,
      }));

      setRecommendedCards(processedRecipes);
      sessionStorage.setItem(
        "dash_recommended",
        JSON.stringify(processedRecipes)
      );

      // ================= HISTORY =================
      if (token) {
        const historyRes = await axios.get(
          API_ENDPOINTS.VIEWED_RECIPES,
          config
        );

        const historyData = historyRes.data?.recipes || [];

        const processedHistory = historyData.map((recipe) => ({
          ...recipe,
          is_ai_generated: recipe.is_ai_generated || false,
        }));

        setViewHistory(processedHistory);
        sessionStorage.setItem(
          "dash_view_history",
          JSON.stringify(processedHistory)
        );
      } else {
        const savedHistory = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]"
        );

        setViewHistory(savedHistory);
        sessionStorage.setItem(
          "dash_view_history",
          JSON.stringify(savedHistory)
        );
      }
    } catch (err) {
      console.error("Dashboard error:", err);

      const savedHistory = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]"
      );

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

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const cached = sessionStorage.getItem("dash_recommended");
    const isReload =
      performance.getEntriesByType("navigation")[0]?.type === "reload";

    if (isReload) {
      sessionStorage.removeItem("dash_recommended");
      sessionStorage.removeItem("dash_view_history");
      loadContent(true);
    } else if (cached) {
      setRecommendedCards(JSON.parse(cached));
      setLoading(false);
    } else {
      loadContent(false);
    }
  }, [loadContent]);

  return {
    viewHistory,
    recommendedCards,
    loading,
    clearHistory,
    refreshData: () => loadContent(true),
  };
};