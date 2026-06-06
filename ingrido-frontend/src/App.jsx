// App.jsx
import { AuthProvider } from "./context/AuthContext";
import { BookmarkProvider } from "./context/BookmarkContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Features/navbar/Navbar";
import LoginPage from "./Features/auth/LoginPage";
import RegisterPage from "./Features/register/RegisterPage";
import LandingPage from "./Features/landing/LandingPage";
import Dashboard from "./Features/DashBoard/DashBoardPage";
import SearchResultsPage from "./Features/search/SearchResultsPage";
import Footer from "./Features/footer/Footer";
import WeeklyPlanPage from "./Features/meal-planner/WeeklyPlanPage";
import CityPage from "./Features/cities/CityPage";
import DishesListPage from "./Features/dishes/DishesListPage";
import SavedPage from "./Features/saved/SavedPage";
import ProfilePage from "./Features/profile/ProfilePage";
import NotFound from "./Features/not-found/NotFoundPage";
import RecipeDetailPage from "./Features/recipe/RecipeDetailPage";

function App() {
  return (
    <BrowserRouter>
      <BookmarkProvider>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search-results" element={<SearchResultsPage />} />
              <Route path="/planner" element={<WeeklyPlanPage />} />
              <Route path="/city" element={<CityPage />} />
              <Route path="city/:cityName/dishesList" element={<DishesListPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/recipe/:id" element={<RecipeDetailPage />} />
              <Route path="/recipe/ai/:id" element={<RecipeDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </AuthProvider>
      </BookmarkProvider>
    </BrowserRouter>
  );
}

export default App;