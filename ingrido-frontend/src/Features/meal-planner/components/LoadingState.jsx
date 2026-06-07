// meal-planner/components/LoadingState.jsx
import { Loader2 } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-muted-foreground">Loading your meal plan...</p>
      </div>
    </div>
  );
};

export default LoadingState;
