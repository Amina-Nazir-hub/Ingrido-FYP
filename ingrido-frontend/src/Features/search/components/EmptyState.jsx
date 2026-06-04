const EmptyState = ({ query }) => {
  return (
    <div className="text-center py-20 border-2 border-dashed rounded-2xl border-border bg-card">
      <p className="text-muted-foreground italic text-lg">
        No matches found for "{query}". Try typing another keyword or recipe!
      </p>
    </div>
  );
};

export default EmptyState;