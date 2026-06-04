import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
        <UtensilsCrossed className="w-5 h-5 text-white" />
      </div>
      <span className="font-display text-2xl font-bold text-foreground">Ingrido</span>
    </Link>
  );
};