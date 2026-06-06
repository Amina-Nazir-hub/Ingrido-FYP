import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants";

const EmptySavedState = () => {
  return (
    <div className="text-center py-20 border-2 border-dashed rounded-3xl border-border">
      <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground text-lg">No saved recipes yet.</p>
      <Link
        to={ROUTES.CITY}
        className="mt-4 inline-block text-primary font-bold hover:underline"
      >
        Explore Cities & Save Recipes
      </Link>
    </div>
  );
};

export default EmptySavedState;
