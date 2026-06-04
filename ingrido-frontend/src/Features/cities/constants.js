export const BACKEND_URL = "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  CITIES: `${BACKEND_URL}/api/recipes/cities/`,  
  CITIES_ALT: `${BACKEND_URL}/api/account/cities/`, 
};

export const ROUTES = {
  CITY_DISHES: (cityName) => `/city/${encodeURIComponent(cityName)}/dishesList`,
};

export const DEFAULT_IMAGE = "https://via.placeholder.com/800x500?text=Image+Not+Found";

export const PLACEHOLDER_IMAGE = "https://via.placeholder.com/800x500?text=Image+Not+Found";