const SavedHeader = () => {
  return (
    <section className="mt-20 border-b border-border bg-secondary/10 animate-fade-in">
      <div className="mx-auto px-6 py-14 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl font-display">
          Your Saved <span className="text-primary">Collection</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground md:text-lg font-sans">
          Quick access to your curated culinary library.
        </p>
      </div>
    </section>
  );
};

export default SavedHeader;