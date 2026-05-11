import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/NavBar";
import LoginPage from "./pages/LoginPage";        // ✅ Default import (no curly braces)
import RegisterPage from "./pages/RegisterPage";  // ✅ Default import (no curly braces)
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage as Dashboard } from "./pages/DashboardPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import { Footer } from "./components/Footer";
import PlannerPage from "./pages/WeeklyPlanPage";
import CityPage from "./pages/CityPage";
import DishesListPage from "./pages/DishesListPage";
import SavedPage from "./pages/SavedPage";
import { UserProfileSettings } from "./components/UserProfileSettings";
import NotFound from "./pages/NotFoundPage";
import { RecipieDetail } from "./pages/RecipieDetailPage";

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
            <Route path="/search-results" element={<SearchResultsPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/city" element={<CityPage />} />
            <Route path="city/:cityName/dishesList" element={<DishesListPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/profile" element={<UserProfileSettings />} />
            <Route path="/recipe/:id" element={<RecipieDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;