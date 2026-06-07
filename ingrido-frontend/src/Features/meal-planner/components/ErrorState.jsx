// meal-planner/components/ErrorState.jsx
import { AlertCircle } from "lucide-react";

const ErrorState = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
      <AlertCircle /> {error}
      <button
        onClick={onDismiss}
        className="ml-auto text-destructive hover:text-destructive/80"
      >
        ×
      </button>
    </div>
  );
};

export default ErrorState;
