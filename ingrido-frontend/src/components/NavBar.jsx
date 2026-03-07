import { useState } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Menu, X, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// UI Components Imports
import { Avatar, AvatarImage, AvatarFallback } from "../userinterface/Avatar";
import { Badge } from "../userinterface/Badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "../userinterface/Tooltip";

export function Navbar() {
  const { isLoggedIn, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
                <TooltipProvider delayDuration={200}>
                  <div className="flex items-center gap-5">
                    
                    {/* Notification Icon with Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative cursor-pointer hover:opacity-80 transition-opacity p-1">
                          <Bell className="w-5 h-5 text-muted-foreground" />
                          <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white border-none">
                            3
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>3 New Notifications</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* User Profile Avatar with Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/profile" className="flex items-center gap-3 group">
                          <div className="text-right hidden lg:block">
                            <p className="text-xs font-bold text-foreground leading-none">
                              Chef {user?.name || "User"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">Pro Member</p>
                          </div>
                          <Avatar className="h-9 w-9 border-2 border-primary/10 group-hover:border-primary/40 transition-all shadow-sm">
                            <AvatarImage src={user?.avatarUrl} alt="Profile" />
                            <AvatarFallback className="bg-secondary text-white font-bold text-xs">
                              {user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Open Profile Settings</p>
                      </TooltipContent>
                    </Tooltip>

                  </div>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* 3. Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-border p-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
          {isLoggedIn ? (
            <>
              <Link to="/planner" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2 border-b border-border/50">Weekly Plan</Link>
              <Link to="/saved" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2 border-b border-border/50">Saved Recipes</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 bg-muted rounded-xl mt-2">
                <Avatar className="h-8 w-8"><AvatarFallback>U</AvatarFallback></Avatar>
                <span className="font-medium text-sm text-foreground">My Profile</span>
              </Link>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-3 font-semibold text-foreground border border-border rounded-xl">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="bg-primary text-white py-3 rounded-xl text-center font-bold shadow-lg shadow-primary/20">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}