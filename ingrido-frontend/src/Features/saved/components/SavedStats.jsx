import { Link } from "react-router-dom";
import { STORAGE_KEYS, ROUTES } from "../constants";

const SavedStats = ({ count }) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  return (
    <header className="mb-8 rounded-xl border border-border bg-card px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-bold text-foreground">Saved Recipes</h2>
        <p className="text-sm text-muted-foreground">Total: {count} Items</p>
      </div>

      {!token && (
        <Link
          to={ROUTES.LOGIN}
          className="text-primary font-bold text-sm underline"
        >
          Login to see your saves
        </Link>
      )}
    </header>
  );
};

export default SavedStats;
