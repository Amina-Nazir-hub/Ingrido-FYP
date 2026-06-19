import { BACKEND_URL } from "../../config/api";

export const API_ENDPOINTS = {
  GENERATE_PLAN: `${BACKEND_URL}/api/meal-planner/generate/`,
  CURRENT_PLAN: `${BACKEND_URL}/api/meal-planner/current/`,
  DELETE_PLAN: (planId) => `${BACKEND_URL}/api/meal-planner/delete/${planId}/`,
  REGENERATE_PLAN: `${BACKEND_URL}/api/meal-planner/regenerate/`,
  HEALTH_PREFERENCES: `${BACKEND_URL}/api/meal-planner/health-preferences/`,
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
  CURRENT_MEAL_PLAN: "current_meal_plan",
};

export const HEALTH_OPTIONS = [
  { id: "diabetes", title: "Diabetes", description: "Low sugar, controlled carbs", icon: "Droplet" },
  { id: "blood_pressure", title: "Blood Pressure", description: "Low sodium, heart-healthy", icon: "Activity" },
  { id: "heart_condition", title: "Heart Condition", description: "Low cholesterol, lean proteins", icon: "Heart" },
  { id: "balanced", title: "Balanced", description: "Perfect mix of taste and nutrition", icon: "Apple" },
];

export const DIETARY_OPTIONS = [
  { id: "veg", title: "Vegetarian", description: "Plant-based meals only", icon: "Salad" },
  { id: "non_veg", title: "Non-Vegetarian", description: "Includes meat and eggs", icon: "ChefHat" },
  { id: "both", title: "Both", description: "Mix of veg & non-veg", icon: "Utensils" },
];