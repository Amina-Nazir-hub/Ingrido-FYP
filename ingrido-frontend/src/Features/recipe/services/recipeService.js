import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

const getAuthConfig = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    headers: token ? { Authorization: `Token ${token}` } : {},
    timeout: 30000, 
  };
};

export const recipeService = {
  async fetchRecipeDetail(id, isAI, titleParam) {
    let response;
    
    if (isAI || titleParam) {
      const targetTitle = titleParam || id;
      try {
        response = await axios.get(API_ENDPOINTS.AI_RECIPE_DETAIL(targetTitle), getAuthConfig());
      } catch (error) {
        // Fallback to old endpoint
        response = await axios.get(API_ENDPOINTS.AI_RECIPE_DETAIL_ALT(targetTitle), getAuthConfig());
      }
    } else {
      try {
        response = await axios.get(API_ENDPOINTS.RECIPE_DETAIL(id), getAuthConfig());
      } catch (error) {
        response = await axios.get(API_ENDPOINTS.RECIPE_DETAIL_ALT(id), getAuthConfig());
      }
    }
    
    return response.data;
  },

  async saveToBackendHistory(recipeData) {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return;
    
    try {
      await axios.post(
        API_ENDPOINTS.VIEWED_RECIPES_ADD,
        { recipe_data: recipeData },
        getAuthConfig()
      );
    } catch (err) {
      console.error("Save to backend error:", err);
    }
  },

  async getAISubstitute(ingredient, recipeTitle, recipeId, isAiGenerated) {
    let endpoint;
    const payload = { ingredient, recipe_title: recipeTitle };
    
    if (recipeId && !isAiGenerated) {
      try {
        endpoint = API_ENDPOINTS.AI_SUBSTITUTE_WITH_ID(recipeId);
        const response = await axios.post(endpoint, payload, getAuthConfig());
        return response.data;
      } catch (error) {
        endpoint = API_ENDPOINTS.AI_SUBSTITUTE_ALT(recipeId);
        const response = await axios.post(endpoint, payload, getAuthConfig());
        return response.data;
      }
    } else {
      const response = await axios.post(API_ENDPOINTS.AI_SUBSTITUTE, payload, getAuthConfig());
      return response.data;
    }
  },

  async toggleBookmark(recipeId, recipeTitle, isAiGenerated) {
    let endpoint;
    
    if (isAiGenerated) {
      endpoint = API_ENDPOINTS.BOOKMARK_AI_TOGGLE(recipeTitle);
    } else {
      endpoint = API_ENDPOINTS.BOOKMARK_TOGGLE(recipeId);
    }
    
    const response = await axios.post(endpoint, {}, getAuthConfig());
    return response.data;
  },
};