import { BACKEND_URL } from "../../config/api";

export const API_ENDPOINTS = {
  // AI Search endpoints
  AI_SEARCH: `${BACKEND_URL}/api/recipes/ai-search/`,
  AI_SEARCH_ALT: `${BACKEND_URL}/api/account/recipes/ai-search/`,
  
  // Search History
  SEARCH_HISTORY_ADD: `${BACKEND_URL}/api/account/search-history/add/`,
  
  // Bookmark endpoints
  BOOKMARK_RECIPE: (id) => `${BACKEND_URL}/api/account/recipes/${id}/bookmark/`,
  BOOKMARK_AI_RECIPE: (title) => `${BACKEND_URL}/api/account/recipes/ai/${encodeURIComponent(title)}/bookmark/`,
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
  RECENT_SEARCHES: "ingrido_recent_searches",
};

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  RECIPE_DETAIL: (id) => `/recipe/${id}`,
  AI_RECIPE_DETAIL: (title) => `/recipe/ai/${encodeURIComponent(title)}`,
};

export const DEFAULT_SUGGESTIONS = ['Biryani', 'Chicken Karahi', 'Daal', 'Nihari', 'Korma'];

export const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";