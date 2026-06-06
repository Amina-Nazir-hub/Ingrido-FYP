import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Clock, Bookmark, Eye, Drumstick } from "lucide-react";
import axios from "axios"; // ✅ Added missing axios import
import { BACKEND_BASE, DEFAULT_IMAGES } from "../constants";
import { useBookmark } from "../../../context/BookmarkContext";

const DashboardRecipeCard = ({
  id,
  title,
  meal,
  image,
  kcal,
  prep_time,
  protein,
  is_saved = false,
  is_ai_generated = false,
  onBookmarkToggle,
}) => {
  const navigate = useNavigate();
  const [isSavedState, setIsSavedState] = useState(is_saved); // ✅ Renamed to avoid identifier clashes
  const [loading, setLoading] = useState(false); // ✅ Keeps a single loading instance
  const { isBookmarked, toggleBookmark } = useBookmark();
  const displayTitle = title || meal || "Tasty Recipe";

  // ✅ Detect if it's AI recipe or Seasonal recipe
  const isAI =
    is_ai_generated ||
    (id && id.toString().startsWith("ai-")) ||
    (id && id.toString().includes("seasonal"));

  // ✅ For seasonal/weird IDs, use title for bookmark check
  let bookmarkId = id;
  let isAIRecipe = isAI;

  // If ID contains 'seasonal' or weird patterns, treat as AI and use title
  if (
    id &&
    (id.toString().includes("seasonal") ||
      id.toString().includes("ai-seasonal") ||
      id.toString().startsWith("ai-seasonal"))
  ) {
    isAIRecipe = true;
    bookmarkId = displayTitle; // Use title instead of weird ID
  }

  const isSaved = isBookmarked(bookmarkId, displayTitle, isAIRecipe);

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${BACKEND_BASE}${image}`
    : DEFAULT_IMAGES.PLACEHOLDER;

  const handleViewDetail = () => {
    if (isAI) {
      navigate(`/recipe/ai/${encodeURIComponent(displayTitle)}`);
    } else {
      navigate(`/recipe/${id}`);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      let endpoint;
      if (isAI) {
        endpoint = `${BACKEND_BASE}/api/account/recipes/ai/${encodeURIComponent(displayTitle)}/bookmark/`;
      } else {
        endpoint = `${BACKEND_BASE}/api/account/recipes/${id}/bookmark/`;
      }

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      const newSavedStatus =
        response.data.saved === true || response.data.status === "saved";
      setIsSavedState(newSavedStatus);

      if (onBookmarkToggle) {
        onBookmarkToggle(id, newSavedStatus);
      }

      // ✅ Use correct identifier for context sync
      let bookmarkIdentifier = id;
      let isAIForBookmark = isAI;

      if (
        id &&
        (id.toString().includes("seasonal") ||
          id.toString().includes("ai-seasonal"))
      ) {
        isAIForBookmark = true;
        bookmarkIdentifier = displayTitle;
      }

      const newStatus = await toggleBookmark(
        bookmarkIdentifier,
        displayTitle,
        isAIForBookmark,
        {
          title: displayTitle,
          image: image,
          kcal: kcal,
          prep_time: prep_time,
        },
      );

      if (onBookmarkToggle) {
        onBookmarkToggle(id, newStatus);
      }
    } catch (err) {
      console.error("Bookmark error:", err);
    } finally {
      setLoading(false); // ✅ Properly fires exactly once at completion
    }
  };

  // ✅ Return block is now properly aligned with the component tree scope
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg relative">
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <img
          src={imageUrl}
          alt={displayTitle}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-lg font-bold text-foreground line-clamp-1">
          {displayTitle}
        </h3>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center rounded-md bg-primary p-2">
            <Flame className="mb-1 h-4 w-4  text-amber-500" />
            <span className="font-semibold text-primary-foreground">
              {kcal || "350"}
            </span>
            <span className="text-primary-foreground">kcal</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-primary p-2">
            <Clock className="mb-1 h-4 w-4 text-blue-500" />
            <span className="font-semibold text-primary-foreground">
              {prep_time || "25"}
            </span>
            <span className="text-primary-foreground">mins</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-primary p-2">
            <Drumstick className="mb-1 h-4 w-4 text-green-600" />
            <span className="font-semibold text-primary-foreground">
              {protein || "20g"}
            </span>
            <span className="text-primary-foreground">protein</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
          <button
            onClick={handleBookmark}
            disabled={loading}
            className={`rounded-md p-2 transition ${
              isSaved
                ? "text-amber-600 bg-amber-50"
                : "text-primary hover:bg-primary  hover:text-primary-foreground transition"
            }`}
            title={isSaved ? "Remove from saved" : "Save Recipe"}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={handleViewDetail}
            className="rounded-md p-2 text-primary hover:bg-primary hover:text-primary-foreground transition"
            title="View Details"
          >
            <Eye className="text/90" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default DashboardRecipeCard;
