import { useState } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Menu, X, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../userinterface/Badge";

export function Navbar() {
  const { isLoggedIn, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // LOGIC: Extracts first two letters for the avatar initial
  const rawName = user?.first_name || localStorage.getItem("user_name") || "User";
  const displayName = rawName.split(" ")[0]; 
  const userInitial = (rawName.length > 1) ? rawName.substring(0, 2).toUpperCase() : rawName.charAt(0).toUpperCase();

  // DiceBear URL with initials
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${userInitial}&backgroundColor=00acc1,1e88e5,5e35b1,d81b60&fontSize=40&fontWeight=700`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* 1. Logo Section */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground tracking-tight">
              Ingrido
            </span>
          </Link>

          {/* 2. Desktop Navigation & User Actions */}
          <div className="hidden md:flex items-center gap-8">
            {isLoggedIn && (
              <nav className="flex items-center gap-6">
                <Link to="/planner" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Weekly Plan
                </Link>
                <Link to="/saved" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Saved Recipes
                </Link>
                <Link to="/city" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Explore City
                </Link>
              </nav>
            )}

            <div className="flex items-center gap-4 border-l pl-6 border-border/50">
              {!isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                    Login
                  </Link>
                  <Link to="/register">
                    <button className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-secondary transition-all shadow-md">
                      Get Started
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  {/* Notification Icon */}
                  <div className="relative cursor-pointer hover:opacity-80 transition-opacity p-1">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white border-none rounded-full">
                      3
                    </Badge>
                  </div>

                  {/* User Profile Avatar */}
                  <Link to="/profile" className="flex items-center gap-3 group">
                    <div className="text-right hidden lg:block leading-tight">
                      <p className="text-xs font-bold text-foreground">
                        Chef {displayName}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">Pro Member</p>
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-primary/30 overflow-hidden bg-secondary shadow-sm group-hover:border-primary transition-all">
                      <img src={avatarUrl} alt={userInitial} className="h-full w-full object-cover" />
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 3. Mobile Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* 4. Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-6 pt-2 border-t border-border/50 flex flex-col gap-4">
            {isLoggedIn ? (
              <>
                <Link to="/planner" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2">Weekly Plan</Link>
                <Link to="/saved" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2">Saved Recipes</Link>
                <Link to="/city" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2 text-primary">Explore City</Link>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                   <img src={avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full" />
                   <span className="font-medium text-sm">My Profile</span>
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="bg-primary text-white px-5 py-2.5 rounded-xl text-center text-sm font-bold">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}