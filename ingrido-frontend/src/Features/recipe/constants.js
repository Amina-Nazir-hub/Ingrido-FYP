import { BACKEND_URL } from "../../config/api";

export const API_ENDPOINTS = {
  // Database recipe
  RECIPE_DETAIL: (id) => `${BACKEND_URL}/api/recipes/${id}/`,
  RECIPE_DETAIL_ALT: (id) => `${BACKEND_URL}/api/account/recipes/${id}/`,
  
  // AI recipe
  AI_RECIPE_DETAIL: (title) => `${BACKEND_URL}/api/recipes/ai/${encodeURIComponent(title)}/`,
  AI_RECIPE_DETAIL_ALT: (title) => `${BACKEND_URL}/api/account/recipes/ai/${encodeURIComponent(title)}/`,
  
  // AI Substitute
  AI_SUBSTITUTE: `${BACKEND_URL}/api/recipes/ai-substitute/`,
  AI_SUBSTITUTE_WITH_ID: (id) => `${BACKEND_URL}/api/recipes/${id}/ai-substitute/`,
  AI_SUBSTITUTE_ALT: (id) => `${BACKEND_URL}/api/account/recipes/${id}/ai-substitute/`,
  
  // Bookmark
  BOOKMARK_TOGGLE: (id) => `${BACKEND_URL}/api/account/recipes/${id}/bookmark/`,
  BOOKMARK_AI_TOGGLE: (title) => `${BACKEND_URL}/api/account/recipes/ai/${encodeURIComponent(title)}/bookmark/`,
  
  // Viewed History
  VIEWED_RECIPES_ADD: `${BACKEND_URL}/api/account/viewed-recipes/add/`,
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
  HISTORY: "ingrido_history",
};

export const ROUTES = {
  LOGIN: "/login",
};

export const DEFAULT_GROCERY_URL = "https://www.foodpanda.pk/brand/pandamart";