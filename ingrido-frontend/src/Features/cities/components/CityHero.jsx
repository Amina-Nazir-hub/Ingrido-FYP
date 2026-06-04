const CityHero = ({ citiesCount }) => {
  return (
    <header className="mb-12 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl font-display">
        Savor the Flavors of <span className="text-primary">Pakistan</span>
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
        Explore {citiesCount} of the most iconic culinary cities.
      </p>
    </header>
  );
};

export default CityHero;