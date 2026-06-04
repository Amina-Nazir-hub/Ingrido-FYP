import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

class ProfileService {
  static getAuthConfig() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return {
      headers: { Authorization: `Token ${token}` }
    };
  }

  static async fetchProfile() {
    const config = this.getAuthConfig();
    const response = await axios.get(API_ENDPOINTS.PROFILE, config);
    return response.data;
  }

  static async updateProfile(profileData) {
    const config = this.getAuthConfig();
    const dataToSend = {
      first_name: profileData.first_name,
      health_conditions: profileData.health_conditions.map(o => o.value),
      dietary_preferences: profileData.dietary_preferences.map(o => o.value),
    };
    
    const response = await axios.put(API_ENDPOINTS.PROFILE, dataToSend, config);
    return response.data;
  }

  static updateLocalStorage(firstName) {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, firstName);
    window.dispatchEvent(new Event("storage_updated"));
  }
}

export default ProfileService;