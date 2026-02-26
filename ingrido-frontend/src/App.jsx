import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "./components/NavBar"
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/Register"
import {LandingPage } from "./pages/LandingPage"

function App() {

  return (

    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

      </Routes>

    </BrowserRouter>

  )
}

export default App