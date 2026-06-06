import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Clock, Bookmark, Eye, Drumstick } from "lucide-react";
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
  forceAI,
}) => {
  const navigate = useNavigate();
  const { toggleBookmark, isBookmarked } = useBookmark();

  const [isSaved, setIsSaved] = useState(is_saved);

  const displayTitle = title || meal || "Tasty Recipe";
  const isAI = forceAI !== undefined ? forceAI : is_ai_generated;
  const bookmarkIdentifier = isAI ? displayTitle : id;

  useEffect(() => {
    setIsSaved(is_saved);
  }, [is_saved]);

  useEffect(() => {
    const contextBookmarked = isBookmarked(
      bookmarkIdentifier,
      displayTitle,
      isAI,
    );

    if (contextBookmarked !== isSaved) {
      setIsSaved(contextBookmarked);
    }
  }, [bookmarkIdentifier, displayTitle, isAI, isBookmarked, isSaved]);

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${BACKEND_BASE}${image}`
    : DEFAULT_IMAGES.PLACEHOLDER;

  const handleViewDetail = () => {
    if (
      isAI ||
      (id && id.toString().startsWith("ai-")) ||
      (id && id.toString().includes("seasonal"))
    ) {
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

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      if (onBookmarkToggle) {
        await onBookmarkToggle(id, displayTitle, isAI, newSavedState);
      } else {
        await toggleBookmark(bookmarkIdentifier, displayTitle, isAI, {
          title: displayTitle,
          image,
          kcal,
          prep_time,
        });
      }
    } catch (err) {
      console.error("Bookmark error:", err);
      setIsSaved(!newSavedState);
    }
  };

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg relative">
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <img
          src={imageUrl}
          alt={displayTitle}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = DEFAULT_IMAGES.PLACEHOLDER;
          }}
        />
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-lg font-bold text-foreground line-clamp-1">
          {displayTitle}
        </h3>

        {/* Nutritional Stats Grid - Cleaned & Structured */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center bg-secondary p-2 rounded-md">
            <Flame className="h-4 w-4 text-orange-500 mb-1" />
            <span className="font-semibold text-foreground">
              {kcal || "350"}
            </span>
            <span className="text-muted-foreground">kcal</span>
          </div>

          <div className="flex flex-col items-center bg-secondary p-2 rounded-md">
            <Clock className="h-4 w-4 text-blue-500 mb-1" />
            <span className="font-semibold text-foreground">
              {prep_time || "25"}
            </span>
            <span className="text-muted-foreground">mins</span>
          </div>

          <div className="flex flex-col items-center bg-secondary p-2 rounded-md">
            <Drumstick className="h-4 w-4 text-green-600 mb-1" />
            <span className="font-semibold text-foreground">
              {protein || "20g"}
            </span>
            <span className="text-muted-foreground">protein</span>
          </div>
        </div>

        {/* Action Buttons Footer Area */}
        <div className="flex justify-end gap-1 border-t border-border pt-3">
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-md transition cursor-pointer ${
              isSaved
                ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={handleViewDetail}
            className="p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
            title="View Details"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default DashboardRecipeCard;
