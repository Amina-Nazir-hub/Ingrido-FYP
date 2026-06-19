import { BACKEND_URL } from "../../config/api";

export const API_ENDPOINTS = {
  PROFILE: `${BACKEND_URL}/api/account/profile/`,
  DELETE_ACCOUNT: `${BACKEND_URL}/api/account/delete-account/`,
};

export const STORAGE_KEYS = {
  TOKEN: "ingrido_token",
  USER_NAME: "user_name",
};

export const ROUTES = {
  DASHBOARD: "/dashboard",
  HOME: "/",
};

export const AVATAR_URL = (initial) => 
  `https://api.dicebear.com/7.x/initials/svg?seed=${initial}&backgroundColor=00acc1,1e88e5,5e35b1&fontSize=40&fontWeight=700`;