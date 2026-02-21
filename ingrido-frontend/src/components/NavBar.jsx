import { UtensilsCrossed, Menu } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo Section */}
          <a className="flex items-center gap-2 group" href="/">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-primary/20">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground tracking-tight">
              Ingrido
            </span>
          </a>

          {/* Desktop Navigation (Empty for now, ready for links) */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Add links here later */}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login">
              <button className="h-10 px-5 py-2 text-sm font-semibold rounded-lg transition-colors hover:bg-secondary hover:text-secondary-foreground">
                Login
              </button>
            </a>
            <a href="/register">
              <button className="h-10 px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
                Register
              </button>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Toggle Menu">
            <Menu className="w-6 h-6" />
          </button>
          
        </div>
      </div>
    </header>
  );
}