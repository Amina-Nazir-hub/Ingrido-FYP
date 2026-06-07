import { Loader2, Sparkles } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse flex items-center gap-1.5">
        <Sparkles size={14} className="text-primary animate-spin" /> 
        Finding the perfect recipes for you…
      </p>
    </div>
  );
};

export default LoadingState;