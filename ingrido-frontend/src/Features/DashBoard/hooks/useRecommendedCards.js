import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

const CACHE_KEY = "dash_recommended";

export const useRecommendedCards = () => {
  const [recommendedCards, setRecommendedCards] = useState(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchRecommendedCards = async (token, config, forceRefresh = false) => {
    if (forceRefresh) {
      sessionStorage.removeItem(CACHE_KEY);
    }

    const cachedRecommended = sessionStorage.getItem(CACHE_KEY);
    if (cachedRecommended && !forceRefresh) {
      console.log("Using cached recommended cards:", JSON.parse(cachedRecommended).length);
      setRecommendedCards(JSON.parse(cachedRecommended));
      return JSON.parse(cachedRecommended);
    }

    console.log("Fetching seasonal recipes...");
    const url = forceRefresh 
      ? `${API_ENDPOINTS.SEASONAL_RECIPES}?refresh=true`
      : API_ENDPOINTS.SEASONAL_RECIPES;
    
    const res = await axios.get(url, config);
    console.log("Seasonal recipes response:", res.data.length);
    
    const processedRecipes = res.data.map((recipe) => ({
      ...recipe,
      is_ai_generated: true,
    }));
    
    setRecommendedCards(processedRecipes);
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(processedRecipes));
    
    return processedRecipes;
  };

  const refreshRecommendedCards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const config = token
        ? { headers: { Authorization: `Token ${token}` } }
        : {};
      
      const recipes = await fetchRecommendedCards(token, config, true);
      return recipes;
    } catch (err) {
      console.error("Refresh recommended cards error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadRecommendedCards = async () => {
      const cachedRecommended = sessionStorage.getItem(CACHE_KEY);
      if (cachedRecommended) {
        console.log("Using cached recommended cards on mount");
        const parsed = JSON.parse(cachedRecommended);
        if (isMounted && parsed.length > 0) {
          setRecommendedCards(parsed);
          setLoading(false);
          setInitialized(true);
          return;
        }
      }

      setLoading(true);
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const config = token
          ? { headers: { Authorization: `Token ${token}` } }
          : {};

        await fetchRecommendedCards(token, config, false);
      } catch (err) {
        console.error("Recommended cards error:", err);
        if (err.response) {
          console.error("Error response:", err.response.data);
          console.error("Error status:", err.response.status);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    loadRecommendedCards();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    recommendedCards,
    loading,
    initialized,
    refreshRecommendedCards,
  };
};

// Default export for backward compatibility
export default useRecommendedCards;