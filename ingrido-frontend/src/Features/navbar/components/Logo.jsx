import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-primary-foreground">
        <img className="w-7 h-7" src="/android-chrome-192x192.png" alt="Ingrido Logo" />
      </div>
      <span className="font-display text-2xl font-bold text-primary-foreground">
        Ingrido
      </span>
    </Link>
  );
};
