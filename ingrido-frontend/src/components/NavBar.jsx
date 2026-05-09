import { useState } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
export function Navbar() {
  const { isLoggedIn, user, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  if (loading) return <header className="h-16 md:h-20 bg-card border-b" />;
  const rawName = user?.name || localStorage.getItem("user_name") || "User";
  const displayName = rawName.split(" ")[0]; // Sirf pehla name (e.g. "Chef Asad")
  const displayLetter = rawName.charAt(0).toUpperCase(); // Sirf 1 letter icon ke liye
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 h-16 md:h-20 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">Ingrido</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-6 text-sm font-semibold text-muted-foreground">
                <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/planner" className="hover:text-primary transition-colors">Weekly Plan</Link>
                <Link to="/saved" className="hover:text-primary transition-colors">Saved</Link>
                <Link to="/city" className="hover:text-primary transition-colors">ExploreCity</Link>
              </nav>

              <div className="flex items-center gap-4 border-l pl-6 border-border">
                <Link to="/profile" className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all border border-primary/20">
                  <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {displayLetter}
                  </div>
                  <span className="text-sm font-bold text-primary">Chef {displayName}</span>
                </Link>
                <button onClick={logout} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold hover:text-primary">Login</Link>
              <Link to="/register" className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-secondary shadow-md transition-all">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border p-6 flex flex-col gap-4 md:hidden shadow-2xl animate-in slide-in-from-top">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="font-bold py-2 border-b">Dashboard</Link>
              <Link to="/planner" onClick={() => setIsOpen(false)} className="font-bold py-2 border-b">Weekly Plan</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="font-bold py-2 border-b">My Profile</Link>
              <button onClick={logout} className="text-left text-red-500 font-bold py-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="font-bold py-2">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="bg-primary text-white p-3 rounded-xl text-center">Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}