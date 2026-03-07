import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/NavBar";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/DashboardPage"; 
import { Footer } from "./components/Footer";
import { PlannerPage } from "./pages/PlannerPage";

// NotFound component ko import karna mat bhooliye ga
import NotFound from "./pages/NotFoundPage"; 

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="min-h-screen"> {/* Taake footer hamesha bottom par rahe */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} /> 
            <Route path="/planner" element={<PlannerPage />} />

            {/* Catch-all route: Ye hamesha sab se niche hona chahiye */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;