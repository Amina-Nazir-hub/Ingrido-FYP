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
      localStorage.setItem("ingrido_token", response.data.token);
      const userName = response.data.user?.first_name || response.data.first_name || "User";
      localStorage.setItem("user_name", userName);
      login({ name: userName }); 
      window.dispatchEvent(new Event("storage_updated"));
      return response.data; 
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      throw error;
    }
  };

  return { loginData, handleChange, handleSubmit };
}