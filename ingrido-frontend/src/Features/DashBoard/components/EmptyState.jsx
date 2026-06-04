import { Bookmark } from "lucide-react";

const EmptyState = ({ title, message, actionText, onAction }) => {
  return (
    <div className="text-center py-20 border-2 border-dashed rounded-3xl border-border">
      <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground text-lg">{message || "No items found"}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-block text-primary font-bold hover:underline"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;