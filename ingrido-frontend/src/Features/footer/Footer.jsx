import { UtensilsCrossed } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary border-t border-border py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-primary-foreground">
              <img
                className="w-7 h-7"
                src="/android-chrome-192x192.png"
                alt="Ingrido Logo"
              />
            </div>
            <span className="font-display text-primary-foreground text-xl font-bold tracking-tight">
              Ingrido
            </span>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm font-medium text-primary-foreground tracking-wide">
              © {currentYear} Ingrido.
              <span className="hidden md:inline mx-2 text-border">|</span>
              <span className="block md:inline mt-1 md:mt-0">
                All rights reserved.
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
