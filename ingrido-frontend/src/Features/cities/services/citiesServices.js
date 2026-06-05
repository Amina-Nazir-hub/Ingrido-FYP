import axios from "axios";
import { API_ENDPOINTS } from "../constants";

export const citiesService = {
  async fetchCities() {
    try {
      // Try primary endpoint first
      const response = await axios.get(API_ENDPOINTS.CITIES);
      return response.data;
    } catch (error) {
      // Try fallback endpoint if primary fails (404)
      if (API_ENDPOINTS.CITIES_ALT && error.response?.status === 404) {
        const response = await axios.get(API_ENDPOINTS.CITIES_ALT);
        return response.data;
      }
      throw error;
    }
  },
  
  // Add this new method - won't affect existing functionality
  async fetchCityById(cityId) {
    try {
      const response = await axios.get(`${API_ENDPOINTS.CITIES}${cityId}/`);
      return response.data;
    } catch (error) {
      if (API_ENDPOINTS.CITIES_ALT && error.response?.status === 404) {
        const response = await axios.get(`${API_ENDPOINTS.CITIES_ALT}${cityId}/`);
        return response.data;
      }
      throw error;
    }
  }
};