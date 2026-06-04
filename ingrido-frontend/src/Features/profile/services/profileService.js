import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

const getAuthConfig = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    headers: { Authorization: `Token ${token}` },
  };
};

export const profileService = {
  async fetchProfile() {
    const response = await axios.get(API_ENDPOINTS.PROFILE, getAuthConfig());
    return response.data;
  },

  async updateProfile(data) {
    const response = await axios.put(API_ENDPOINTS.PROFILE, data, getAuthConfig());
    return response.data;
  },

  async deleteAccount() {
    const response = await axios.delete(API_ENDPOINTS.DELETE_ACCOUNT, getAuthConfig());
    return response.data;
  },
};