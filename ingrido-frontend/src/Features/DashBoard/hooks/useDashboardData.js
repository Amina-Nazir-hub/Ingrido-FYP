// import { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";
// import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

// export const useDashboardData = () => {
//   const [viewHistory, setViewHistory] = useState(() => {
//     return JSON.parse(sessionStorage.getItem("dash_view_history")) || [];
//   });
//   const [recommendedCards, setRecommendedCards] = useState(() => {
//     return JSON.parse(sessionStorage.getItem("dash_recommended")) || [];
//   });

//   const hasCachedData = sessionStorage.getItem("dash_recommended") !== null;
//   const [loading, setLoading] = useState(!hasCachedData);
//   const hasFetched = useRef(false);

//   const loadContent = useCallback(async (forceRefresh = false) => {
//     if (!forceRefresh && sessionStorage.getItem("dash_recommended")) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
//       const config = token ? { headers: { Authorization: `Token ${token}` } } : {};

//       const res = await axios.get(API_ENDPOINTS.SEASONAL_RECIPES, config);

//       const processedRecipes = res.data.map(recipe => ({
//         ...recipe,
//         is_ai_generated: true
//       }));

//       setRecommendedCards(processedRecipes);
//       sessionStorage.setItem("dash_recommended", JSON.stringify(processedRecipes));

//       if (token) {
//         const historyRes = await axios.get(API_ENDPOINTS.VIEWED_RECIPES, config);
//         if (historyRes.data.recipes) {
//           const processedHistory = historyRes.data.recipes.map(recipe => ({
//             ...recipe,
//             is_ai_generated: recipe.is_ai_generated || false
//           }));
//           setViewHistory(processedHistory);
//           sessionStorage.setItem("dash_view_history", JSON.stringify(processedHistory));
//         }
//       } else {
//         const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]");
//         setViewHistory(savedHistory);
//         sessionStorage.setItem("dash_view_history", JSON.stringify(savedHistory));
//       }
//     } catch (err) {
//       console.error("Dashboard error:", err);
//       const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]");
//       setViewHistory(savedHistory);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!hasFetched.current) {
//       hasFetched.current = true;

//       const isRefreshed = performance.getEntriesByType("navigation")[0]?.type === "reload";

//       if (isRefreshed || !sessionStorage.getItem("dash_recommended")) {
//         loadContent(true);
//       } else {
//         setLoading(false);
//       }
//     }
//   }, [loadContent]);

//   return {
//     viewHistory,
//     recommendedCards,
//     loading,
//     clearHistory,
//     refreshData: () => loadContent(true),
//   };
// };

// const clearHistory = async () => {
//   const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
//   if (token) {
//     try {
//       await axios.delete(API_ENDPOINTS.VIEWED_RECIPES_CLEAR, {
//         headers: { Authorization: `Token ${token}` }
//       });
//     } catch (err) {
//       console.error("Clear history error:", err);
//     }
//   }
//   setViewHistory([]);
//   sessionStorage.removeItem("dash_view_history");
//   localStorage.removeItem(STORAGE_KEYS.HISTORY);
// };

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

    if (!forceRefresh && cached) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const config = token ? { headers: { Authorization: `Token ${token}` } } : {};

      const url = forceRefresh
        ? `${API_ENDPOINTS.SEASONAL_RECIPES}?refresh=true`
        : API_ENDPOINTS.SEASONAL_RECIPES;

      const res = await axios.get(url, config);

      const processedRecipes = res.data.map(recipe => ({
        ...recipe,
        is_ai_generated: true
      }));

      setRecommendedCards(processedRecipes);
      sessionStorage.setItem("dash_recommended", JSON.stringify(processedRecipes));

      if (token) {
        const historyRes = await axios.get(API_ENDPOINTS.VIEWED_RECIPES, config);
        if (historyRes.data.recipes) {
          const processedHistory = historyRes.data.recipes.map(recipe => ({
            ...recipe,
            is_ai_generated: recipe.is_ai_generated || false
          }));
          setViewHistory(processedHistory);
          sessionStorage.setItem("dash_view_history", JSON.stringify(processedHistory));
        }
      } else {
        const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]");
        setViewHistory(savedHistory);
        sessionStorage.setItem("dash_view_history", JSON.stringify(savedHistory));
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
    sessionStorage.removeItem("dash_view_history");
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const cached = sessionStorage.getItem("dash_recommended");
    const isPageReload = performance.getEntriesByType("navigation")[0]?.type === "reload";

    if (isPageReload) {
      sessionStorage.removeItem("dash_recommended");
      sessionStorage.removeItem("dash_view_history");
      loadContent(true);
    } else if (cached) {
      return;
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