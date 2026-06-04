// meal-planner/services/mealPlannerService.js

import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

const getAuthConfig = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    headers: { Authorization: `Token ${token}` }
  };
};

export const mealPlannerService = {
  async generatePlan(healthCondition, dietaryPref) {
    try {
      // Try primary endpoint
      const response = await axios.post(
        API_ENDPOINTS.GENERATE_PLAN,
        { health_condition: healthCondition, dietary_preference: dietaryPref },
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      // Try alternative endpoint
      if (API_ENDPOINTS.GENERATE_PLAN_ALT) {
        const response = await axios.post(
          API_ENDPOINTS.GENERATE_PLAN_ALT,
          { health_condition: healthCondition, dietary_preference: dietaryPref },
          getAuthConfig()
        );
        return response.data;
      }
      throw error;
    }
  },

  async getCurrentPlan() {
    try {
      const response = await axios.get(API_ENDPOINTS.CURRENT_PLAN, getAuthConfig());
      return response.data;
    } catch (error) {
      if (API_ENDPOINTS.CURRENT_PLAN_ALT && error.response?.status === 404) {
        const response = await axios.get(API_ENDPOINTS.CURRENT_PLAN_ALT, getAuthConfig());
        return response.data;
      }
      throw error;
    }
  },

  async deletePlan(planId) {
    try {
      const response = await axios.delete(API_ENDPOINTS.DELETE_PLAN(planId), getAuthConfig());
      return response.data;
    } catch (error) {
      if (API_ENDPOINTS.DELETE_PLAN_ALT) {
        const response = await axios.delete(API_ENDPOINTS.DELETE_PLAN_ALT(planId), getAuthConfig());
        return response.data;
      }
      throw error;
    }
  },

  async regeneratePlan() {
    const response = await axios.post(API_ENDPOINTS.REGENERATE_PLAN, {}, getAuthConfig());
    return response.data;
  },
};