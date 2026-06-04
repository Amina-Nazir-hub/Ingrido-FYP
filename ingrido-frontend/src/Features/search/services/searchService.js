import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS, DEFAULT_SUGGESTIONS } from "../constants";

const getAuthConfig = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    headers: token ? { Authorization: `Token ${token}` } : {},
  };
};

export const searchService = {
  async searchRecipes(query) {
    try {
      const response = await axios.get(API_ENDPOINTS.AI_SEARCH, {
        ...getAuthConfig(),
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      // Try fallback endpoint
      if (error.response?.status === 404 && API_ENDPOINTS.AI_SEARCH_ALT) {
        const response = await axios.get(API_ENDPOINTS.AI_SEARCH_ALT, {
          ...getAuthConfig(),
          params: { q: query }
        });
        return response.data;
      }
      throw error;
    }
  },

  async addToSearchHistory(query) {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return null;
    
    try {
      const response = await axios.post(
        API_ENDPOINTS.SEARCH_HISTORY_ADD,
        { query: query },
        getAuthConfig()
      );
      return response.data;
    } catch (err) {
      console.error("Save search to backend error:", err);
      return null;
    }
  },

  saveToLocalHistory(query) {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES) || "[]");
    const cleanQ = query.trim();
    if (cleanQ) {
      history = history.filter(q => q.toLowerCase() !== cleanQ.toLowerCase());
      history.unshift(cleanQ);
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(history.slice(0, 6)));
    }
    return history;
  },

  async toggleBookmark(recipeId, recipeTitle, isAiRecipe) {
    let endpoint;
    if (isAiRecipe && isNaN(Number(recipeId))) {
      endpoint = API_ENDPOINTS.BOOKMARK_AI_RECIPE(recipeTitle);
    } else {
      endpoint = API_ENDPOINTS.BOOKMARK_RECIPE(recipeId);
    }
    
    const response = await axios.post(endpoint, {}, getAuthConfig());
    return response.data;
  },
};