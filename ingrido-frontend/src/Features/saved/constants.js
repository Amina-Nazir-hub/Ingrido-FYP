export const BACKEND_URL = "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  SAVED_RECIPES: `${BACKEND_URL}/api/account/saved/`,
  BOOKMARK_TOGGLE: (recipeId) =>
    `${BACKEND_URL}/api/account/recipes/${recipeId}/bookmark/`,
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
};

export const ROUTES = {
  LOGIN: "/login",
  RECIPE_DETAIL: (id) => `/recipe/${id}`,
  DASHBOARD: "/dashboard",
};

export const DEFAULT_IMAGE =
  "https://placehold.co/800x500/3f3f46/ffffff?text=Recipe";
