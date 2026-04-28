import { useState } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Menu, X, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../userinterface/Badge";

export function Navbar() {
  const { isLoggedIn, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // LOGIC: Pehle 2 letters uthaye hain taake 'AB' nazar aaye
  const rawName = user?.first_name || localStorage.getItem("user_name") || "User";
  const displayName = rawName.split(" ")[0]; 
  const userInitial = (rawName.length > 1) ? rawName.substring(0, 2).toUpperCase() : rawName.charAt(0).toUpperCase();

  // DiceBear URL with 2 letters seed
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${userInitial}&backgroundColor=00acc1,1e88e5,5e35b1,d81b60&fontSize=40&fontWeight=700`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50 h-16 md:h-20 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">Ingrido</span>
        </Link>

        {/* Desktop Navigation & Profile */}
        <div className="hidden md:flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <nav className="flex items-center gap-6 mr-4">
                <Link to="/planner" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Weekly Plan</Link>
                <Link to="/saved" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Saved Recipes</Link>
              </nav>

              <div className="flex items-center gap-5 border-l pl-6 border-border/50">
                <div className="relative cursor-pointer">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-primary text-white text-[10px] flex items-center justify-center border-none rounded-full">3</Badge>
                </div>

                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="text-right hidden lg:block leading-tight">
                    <p className="text-sm font-bold text-foreground">Chef {displayName}</p>
                    <p className="text-[10px] text-muted-foreground">Pro Member</p>
                  </div>
                  {/* Circle with 'AB' */}
                  <div className="h-10 w-10 rounded-full border-2 border-primary/30 overflow-hidden bg-secondary shadow-sm group-hover:border-primary transition-all">
                    <img key={displayName} src={avatarUrl} alt={userInitial} className="h-full w-full object-cover" />
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold">Login</Link>
              <Link to="/register" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
}