// config/constants.js

export const BASE_URL = "http://127.0.0.1:8000/api";

export const API_ENDPOINTS = {
  // ==========================================
  // ACCOUNTS APP (Authentication & User Data)
  // ==========================================
  // Authentication
  LOGIN: `${BASE_URL}/account/login/`,
  REGISTER: `${BASE_URL}/account/register/`,
  PROFILE: `${BASE_URL}/account/profile/`,
  
  // Bookmarks (Saved Recipes)
  SAVED_RECIPES: `${BASE_URL}/account/saved/`,
  TOGGLE_BOOKMARK: (id) => `${BASE_URL}/account/recipes/${id}/bookmark/`,
  TOGGLE_AI_BOOKMARK: (title) => `${BASE_URL}/account/recipes/ai/${encodeURIComponent(title)}/bookmark/`,
  
  // Search History
  SEARCH_HISTORY: `${BASE_URL}/account/search-history/`,
  SEARCH_HISTORY_ADD: `${BASE_URL}/account/search-history/add/`,
  SEARCH_HISTORY_CLEAR: `${BASE_URL}/account/search-history/clear/`,
  SEARCH_HISTORY_REMOVE: (query) => `${BASE_URL}/account/search-history/remove/${encodeURIComponent(query)}/`,
  
  // Viewed History
  VIEWED_RECIPES: `${BASE_URL}/account/viewed-recipes/`,
  VIEWED_RECIPES_ADD: `${BASE_URL}/account/viewed-recipes/add/`,
  VIEWED_RECIPES_CLEAR: `${BASE_URL}/account/viewed-recipes/clear/`,

  // ==========================================
  // RECIPES APP (Cities, Recipes, AI Search)
  // ==========================================
  // Cities & Recipes
  CITIES: `${BASE_URL}/recipes/cities/`,
  CITY_RECIPES: `${BASE_URL}/recipes/by-city/`,  
  RECIPE_DETAIL: (id) => `${BASE_URL}/recipes/${id}/`,
  
  // AI Recipe Features
  AI_SEARCH: `${BASE_URL}/recipes/ai-search/`,
  AI_RECIPE_DETAIL: (title) => `${BASE_URL}/recipes/ai/${encodeURIComponent(title)}/`,
  AI_SUBSTITUTE: `${BASE_URL}/recipes/ai-substitute/`,
  AI_SUBSTITUTE_WITH_ID: (id) => `${BASE_URL}/recipes/${id}/ai-substitute/`,

  // ==========================================
  // DASHBOARD APP (Dashboard Specific)
  // ==========================================
  SEASONAL_RECIPES: `${BASE_URL}/dashboard/seasonal/`,
  DASHBOARD_RECIPES: `${BASE_URL}/dashboard/dashboard-recipes/`,

  // ==========================================
  // MEAL PLANNER APP
  // ==========================================
  GENERATE_MEAL_PLAN: `${BASE_URL}/meal-planner/generate/`,        
  CURRENT_MEAL_PLAN: `${BASE_URL}/meal-planner/current/`,          
  DELETE_MEAL_PLAN: (planId) => `${BASE_URL}/meal-planner/delete/${planId}/`,
  REGENERATE_MEAL_PLAN: `${BASE_URL}/meal-planner/regenerate/`,
  HEALTH_PREFERENCES: `${BASE_URL}/meal-planner/health-preferences/`,
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
  USER_NAME: "user_name",
  USER_ID: "user_id",
  RECENT_SEARCHES: "ingrido_recent_searches",
  VIEW_HISTORY: "ingrido_history"
};

export const ROUTES = {
  DASHBOARD: "/dashboard",
  REGISTER: "/register",
  LOGIN: "/login",
  RECIPE_DETAILS: "/recipe/:id",
  MEAL_PLANNER: "/meal-planner",
  SAVED: "/saved",
  CITY: "/city",
  PROFILE: "/profile"
};

export const DEFAULT_IMAGES = {
  PLACEHOLDER: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
};