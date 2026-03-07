import * as React from "react";
import { cn } from "../lib/theme";

const RecipeNotes = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md border-border/60 focus:border-primary",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

RecipeNotes.displayName = "RecipeNotes";

export { RecipeNotes };