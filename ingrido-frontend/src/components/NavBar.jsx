import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UtensilsCrossed, Menu, X, } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo Section - Icon changes based on login state as per your images */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="flex items-center justify-center transition-transform group-hover:scale-110">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
                </div>
            </div>
            <span className="font-display text-2xl font-bold text-foreground tracking-tight">
              Ingrido
            </span>
          </Link>

          {/* Desktop Navigation - Conditional Logic */}
          <div className="hidden md:flex items-center gap-6">
            {!isLoggedIn ? (
              /* Before Login State */
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link to="/register">
                  <button className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-secondary transition-all shadow-md">
                    Register
                  </button>
                </Link>
              </div>
            ) : (
              /* After Login State */
              <nav className="flex items-center justify-between  gap-8 mx-auto">
                <Link
                  to="/planner"
                  className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  Weekly Plan
                </Link>
                <Link
                  to="/saved"
                  className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  Saved
                </Link>
                <Link
                  to="/profile"
                  className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  Profile
                </Link>
              </nav>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-border p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-center font-semibold"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="bg-primary text-white p-3 rounded-xl text-center"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/meals"
                onClick={() => setIsOpen(false)}
                className="text-center"
              >
                Meals
              </Link>
              <Link
                to="/weekly-plan"
                onClick={() => setIsOpen(false)}
                className="text-center"
              >
                Weekly Plan
              </Link>
              <Link
                to="/get-started"
                onClick={() => setIsOpen(false)}
                className="bg-primary text-white p-3 rounded-xl text-center"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
