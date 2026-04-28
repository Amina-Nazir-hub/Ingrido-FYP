import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export function useLoginForm() {
  const navigate = useNavigate();
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
      // Backend ko login request bhejna
      const response = await axios.post("http://127.0.0.1:8000/api/accounts/login/", {
        email: loginData.email,
        password: loginData.password
      });

      // Token save karna
      localStorage.setItem("ingrido_token", response.data.token);
      
      // Global Auth state update karna
      login(); 

      // Dashboard par redirect
      navigate("/dashboard"); 
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      alert("Invalid email or password!");
    }
  };

  return { loginData, handleChange, handleSubmit };
}