export const BACKEND_URL = "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  // Updated to new endpoint structure
  CITY_RECIPES: (cityName) => `${BACKEND_URL}/api/recipes/by-city/?city=${encodeURIComponent(cityName)}`,
  CITY_RECIPES_ALT: (cityName) => `${BACKEND_URL}/api/account/recipes/?city=${cityName}`,
  BOOKMARK_TOGGLE: (recipeId) => `${BACKEND_URL}/api/account/recipes/${recipeId}/bookmark/`,
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
};

export const ROUTES = {
  CITY: "/city",
  RECIPE_DETAIL: (id) => `/recipe/${id}`,
};

export const DEFAULT_IMAGE = "/placeholder-image.jpg";
export const PLACEHOLDER_IMAGE = "/placeholder-image.jpg";