// meal-planner/components/PlanActions.jsx
import { RefreshCw, Trash2 } from "lucide-react";

const PlanActions = ({ onRegenerate, onDelete, generating }) => {
  return (
    <div className="flex gap-3 py-2">
      <button
        onClick={onRegenerate}
        disabled={generating}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md shadow-lg hover:bg-primary/75 transition cursor-pointer"
      >
        <RefreshCw className={generating ? "animate-spin" : ""} />
        {generating ? "Generating..." : "Regenerate"}
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/75 transition  cursor-pointer"
      >
        <Trash2 /> Delete
      </button>
    </div>
  );
};

export default PlanActions;
