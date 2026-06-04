import { AlertCircle } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="text-center py-24 border-2 border-dashed rounded-3xl border-border bg-secondary/20">
      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
      <p className="text-xl font-medium text-muted-foreground">No recipes found.</p>
    </div>
  );
};

export default EmptyState;