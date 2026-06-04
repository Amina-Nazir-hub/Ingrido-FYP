export const BACKEND_BASE = "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  LOGIN: `${BACKEND_BASE}/api/account/login/`,
  REGISTER: `${BACKEND_BASE}/api/account/register/`,
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
  USER_NAME: "user_name",
  USER_ID: "user_id",
};

export const ROUTES = {
  DASHBOARD: "/dashboard",
  REGISTER: "/register",
};

export const FORM_VALIDATION = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
};