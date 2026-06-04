export const BACKEND_BASE = "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  // Dashboard endpoints (Updated as per new structure)
  SEASONAL_RECIPES: `${BACKEND_BASE}/api/dashboard/seasonal/`,
  VIEWED_RECIPES: `${BACKEND_BASE}/api/account/viewed-recipes/`,
  VIEWED_RECIPES_CLEAR: `${BACKEND_BASE}/api/account/viewed-recipes/clear/`,
  
  // Bookmark endpoints
  BOOKMARK_RECIPE: (id) => `${BACKEND_BASE}/api/account/recipes/${id}/bookmark/`,
  BOOKMARK_AI_RECIPE: (title) => `${BACKEND_BASE}/api/account/recipes/ai/${encodeURIComponent(title)}/bookmark/`,
  
  // Search History endpoints
  SEARCH_HISTORY: `${BACKEND_BASE}/api/account/search-history/`,
  SEARCH_HISTORY_ADD: `${BACKEND_BASE}/api/account/search-history/add/`,
  SEARCH_HISTORY_REMOVE: (query) => `${BACKEND_BASE}/api/account/search-history/remove/${encodeURIComponent(query)}/`,
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
  USER_NAME: "user_name",
  HISTORY: "ingrido_history",
  RECENT_SEARCHES: "ingrido_recent_searches",
};

export const DEFAULT_IMAGES = {
  PLACEHOLDER: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
};