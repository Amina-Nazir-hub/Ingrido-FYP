import { Loader2 } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-[#b17b46]" />
    </div>
  );
};

export default LoadingState;