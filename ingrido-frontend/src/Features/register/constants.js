export const BACKEND_BASE = "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  REGISTER: `${BACKEND_BASE}/api/account/register/`,
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
  USER_NAME: "user_name",
};

export const ROUTES = {
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
};

export const HEALTH_OPTIONS = ["Diabetes", "High Blood Pressure", "Heart Disease"];
export const DIET_OPTIONS = ["Vegetarian", "Non-Vegetarian"];

export const PASSWORD_VALIDATIONS = [
  { label: "Minimum 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "Uppercase letter (A-Z)", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "Lowercase letter (a-z)", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "Numerical digit (0-9)", test: (pwd) => /[0-9]/.test(pwd) },
  { label: "Special symbol (!@#$%)", test: (pwd) => /[!@#$%^&*(),.?":{}|<>+=-]/.test(pwd) },
];