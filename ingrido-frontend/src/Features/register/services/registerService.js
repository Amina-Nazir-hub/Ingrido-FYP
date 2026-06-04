import axios from "axios";
import { API_ENDPOINTS } from "../constants";

export const registerService = {
  async register(userData) {
    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, {
        first_name: userData.name,
        email: userData.email,
        password: userData.password,
        health_conditions: userData.healthConditions,
        dietary_preferences: userData.dietaryPreferences,
      });
      return response.data;
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      throw error;
    }
  },
};