import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

const getAuthConfig = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    headers: token ? { Authorization: `Token ${token}` } : {},
  };
};

export const dishesService = {
  async fetchCityRecipes(cityName) {
    try {
      // Try primary endpoint first (new structure)
      const response = await axios.get(
        API_ENDPOINTS.CITY_RECIPES(cityName),
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      // Try fallback endpoint (old structure)
      if (error.response?.status === 404 && API_ENDPOINTS.CITY_RECIPES_ALT) {
        const response = await axios.get(
          API_ENDPOINTS.CITY_RECIPES_ALT(cityName),
          getAuthConfig()
        );
        return response.data;
      }
      throw error;
    }
  },

  async toggleBookmark(recipeId) {
    const response = await axios.post(
      API_ENDPOINTS.BOOKMARK_TOGGLE(recipeId),
      {},
      getAuthConfig()
    );
    return response.data;
  },
};