export const BACKEND_URL = "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  PROFILE: `${BACKEND_URL}/api/accounts/profile/`
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
  USER_NAME: "user_name"
};

export const ROUTES = {
  DASHBOARD: "/dashboard"
};

export const HEALTH_OPTIONS = [
  { value: "Diabetes", label: "Diabetes" },
  { value: "High Blood Pressure", label: "High Blood Pressure" },
  { value: "Heart Disease", label: "Heart Disease" },
];

export const DIET_OPTIONS = [
  { value: "Vegetarian", label: "Vegetarian" },
  { value: "Non-Vegetarian", label: "Non-Vegetarian" },
];

export const AVATAR_API_URL = (seed) => 
  `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=00acc1,1e88e5,5e35b1&fontSize=40&fontWeight=700`;