import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/NavBar";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/DashboardPage";
import { Footer } from "./components/Footer";
import { PlannerPage } from "./pages/PlannerPage";
<<<<<<< HEAD
import SavedPage from "./pages/SavedPage";
import NotFound from "./pages/NotFoundPage";
=======
import { UserProfileSettings } from "./components/UserProfileSettings"; // Naya Component
import NotFound from "./pages/NotFoundPage"; 
>>>>>>> 05cd5818892c16dd5757a71e5dcb401bb3153312

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/planner" element={<PlannerPage />} />
<<<<<<< HEAD
            <Route path="/saved" element={<SavedPage />} />
=======
            
            {/* Profile Settings ka Route */}
            <Route path="/profile" element={<UserProfileSettings />} />
            
>>>>>>> 05cd5818892c16dd5757a71e5dcb401bb3153312
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
