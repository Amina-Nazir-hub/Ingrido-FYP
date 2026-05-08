import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export function useLoginForm() {
  const { login } = useAuth();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/accounts/login/", {
        email: loginData.email,
        password: loginData.password
      });

      // 1. Token save karein
      localStorage.setItem("ingrido_token", response.data.token);
      
      // 2. Name nikaalein (Backend se first_name aa raha hai ya nahi, usay check karein)
      const userName = response.data.first_name || loginData.email.split('@')[0];
      localStorage.setItem("user_name", userName);

      // 3. Global State update karein
      login({ name: userName }); 

      return response.data; 
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      throw error; // Isay LoginPage handle karegi
    }
  };

  return { loginData, handleChange, handleSubmit };
}