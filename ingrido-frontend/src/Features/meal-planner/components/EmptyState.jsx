import { Calendar } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="text-center py-12 bg-secondary/20 rounded-xl">
      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">Select health and diet options above to see your plan.</p>
    </div>
  );
};

export default EmptyState;