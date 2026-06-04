import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

const getAuthConfig = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const savedService = {
  async fetchSavedRecipes() {
    const response = await axios.get(API_ENDPOINTS.SAVED_RECIPES, getAuthConfig());
    
    // Normalize response data
    const actualData = Array.isArray(response.data)
      ? response.data
      : response.data.results || response.data.bookmarks || [];
    
    return actualData;
  },

  async removeBookmark(recipeId) {
    const response = await axios.post(
      API_ENDPOINTS.BOOKMARK_TOGGLE(recipeId),
      {},
      getAuthConfig()
    );
    return response.data;
  },
};