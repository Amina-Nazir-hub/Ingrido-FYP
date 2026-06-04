import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};