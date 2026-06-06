import { CalendarDays } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="text-center py-12 bg-secondary/20 rounded-xl">
      <CalendarDays className="h-12 w-12 text-primary mx-auto mb-3" />
      <p className="text-foreground">
        Select health and diet options above to see your plan.
      </p>
    </div>
  );
};

export default EmptyState;
