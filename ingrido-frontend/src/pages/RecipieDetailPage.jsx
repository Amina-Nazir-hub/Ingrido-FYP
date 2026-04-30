import { useState } from "react";

export function RecipieDetail() {
  const [ingredient, setIngredient] = useState("");
  const [result, setResult] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Substitute logic
  const substitutes = {
    milk: "You can use yogurt, almond milk, or evaporated milk.",
    cream: "Mix 3/4 cup milk + 1/4 cup melted butter.",
    butter: "Use margarine, cooking oil, or ghee.",
    chicken: "Turkey or Paneer (for a vegetarian twist) works well.",
    yogurt: "Use sour cream or 1 cup milk + 1 tbsp lemon juice.",
    garlic: "Use 1/8 tsp garlic powder per clove.",
    onion: "Use shallots or 1 tsp onion powder for one small onion.",
    cheese: "Try Gouda or Monterey Jack as an alternative to Cheddar.",
  };

  const handleCheck = () => {
    const key = ingredient.toLowerCase().trim();
    if (!key) return;
    setResult(substitutes[key] || "No direct substitute found. You might want to check PandaMart!");
  };
  const handleSave = () => {
    setIsSaved(!isSaved);
    // Yahan aap console ya toast message bhi dikha sakte hain
    if (!isSaved) {
      console.log("Recipe saved to your collection!");
    }
  };
  const handlePandaMartOrder = () => {
    if (!navigator.geolocation) {
      alert("Aapka browser location support nahi karta.");
      window.open("https://www.foodpanda.pk/brand/pandamart", "_blank");
      return;
    }

    // Browser se location mangna
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        console.log(`Lat: ${lat}, Lng: ${lng}`);

        // Yahan aap location ke coordinates ko URL mein ya backend par bhej sakte hain
        // Filhal hum user ko PandaMart par redirect kar rahe hain
        const pandaUrl = `https://www.foodpanda.pk/brand/pandamart?lat=${lat}&lng=${lng}`;
        window.open(pandaUrl, "_blank");
      },
      (error) => {
        console.error("Location Error:", error);
        // Agar user 'Block' karde to default link khol do
        alert("Location nahi mil saki. Hum aapko general PandaMart page par le ja rahe hain.");
        window.open("https://www.foodpanda.pk/brand/pandamart", "_blank");
      }
      );
  };
  return (
    <>
    <section className="border-b border-border bg-secondary/40 mt-20 px-2">
      <div className="container py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-card p-6 shadow-[var(--shadow-soft)] md:p-8">
          <div className="space-y-3">
            <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
              Chicken Reshmi Kabab{" "}
              <span className="text-primary">with Storage</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
              {/* 2. Button par onClick lagaya aur class ko dynamic kiya */}
              <button
                onClick={handleSave}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all 
                  ${isSaved 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/10"
                  }`}
                aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  // 3. Fill property ko state ke mutabiq change kiya
                  fill={isSaved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>
        </div>
      </div>
    </section>
    <section className="container mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] px-2">
  <div className="space-y-4">
    
    <div className="relative overflow-hidden rounded-2xl bg-muted shadow-[var(--shadow-card)]">
      
      <div className="aspect-video w-full">
        <img
          src="/assets/kabab-hero-7_ZD7fAG.jpg"
          alt="Chicken Reshmi Kabab with green chutney"
          className="h-full w-full object-cover transition-opacity duration-500"
        />
      </div>

      <button
        aria-label="Play video"
        className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition-colors hover:bg-foreground/30"
      >
        <span className="flex h-20 w-28 items-center justify-center rounded-2xl bg-destructive shadow-2xl transition-transform hover:scale-110">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 h-9 w-9 fill-primary-foreground text-primary-foreground"
          >
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        </span>
      </button>

      <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start gap-3 bg-gradient-to-b from-foreground/60 to-transparent p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow">
          <span className="text-xs font-bold uppercase text-primary-foreground">FF</span>
        </div>
        <div className="text-primary-foreground">
          <p className="line-clamp-1 text-sm font-semibold">
            Chicken Reshmi Kabab with Storage Ramzan Special Recipe
          </p>
          <p className="text-xs opacity-80">Food Fusion</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        <button className="h-2 w-6 rounded-full bg-primary transition-all" />
        <button className="h-2 w-2 rounded-full bg-background/70 transition-all" />
        <button className="h-2 w-2 rounded-full bg-background/70 transition-all" />
        <button className="h-2 w-2 rounded-full bg-background/70 transition-all" />
        <button className="h-2 w-2 rounded-full bg-background/70 transition-all" />
      </div>
    </div>
  </div>

  <div className="space-y-6">
    
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] sm:grid-cols-4">
      
      {/* Time */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          🕒
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Prep + Cook</p>
          <p className="font-semibold text-foreground">1 hr 15 min</p>
        </div>
      </div>

      {/* Serves */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          👥
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Serves</p>
          <p className="font-semibold text-foreground">12 kababs</p>
        </div>
      </div>

      {/* Difficulty */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          🔥
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Difficulty</p>
          <p className="font-semibold text-foreground">Easy</p>
        </div>
      </div>

      {/* Cuisine */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          🍽️
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Cuisine</p>
          <p className="font-semibold text-foreground">Pakistani</p>
        </div>
      </div>

    </div>

    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <h2 className="mb-3 font-serif text-xl font-bold text-foreground">
        About this recipe
      </h2>

      <p className="leading-relaxed text-foreground/80">
        Soft, cheesy and melt-in-the-mouth — these Chicken Reshmi Kababs are pure comfort food.
        Plus we’re showing you how to <strong className="text-primary">store them</strong> so you can enjoy them anytime.
        Perfect for Ramzan, daawats, or quick snacks.
      </p>
    </div>

  </div>
</section>
<section className="container mt-12 px-2">
  <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
    <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
      
      {/* Ingredients */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-glow"></span>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Ingredients
          </h2>
        </div>

        <div className="space-y-6">

          {/* Yogurt Sauce */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
              Yogurt Green Sauce
            </h3>
            <ul className="space-y-2">
              {[
                "Hara dhania (Fresh coriander) — handful",
                "Podina (Mint leaves) — handful",
                "Lehsan (Garlic) — 2 cloves",
                "Hari mirch (Green chilli) — 1–2",
                "Dahi (Yogurt) — ¼ cup",
                "Zeera (Cumin seeds) roasted & crushed — 1 tsp",
                "Iodized Himalayan pink salt — ½ tsp or to taste",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/90">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cheese Filling */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
              Cheese Filling
            </h3>
            <ul className="space-y-2">
              {[
                "Cheddar cheese, grated — 100g",
                "Cream — 3 tbs",
                "Hara dhania (Fresh coriander), chopped — 1 tbs",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/90">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chicken Kabab */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
              Chicken Reshmi Kabab
            </h3>
            <ul className="space-y-2">
              {[
                "Boiling water — as required",
                "Pyaz (Onion) — 1 large",
                "Boneless chicken — 1 kg (mix of breast & thigh)",
                "Hara dhania & Podina — handful each",
                "Hari mirch (Green chillies), chopped — 4–5",
                "Kaju powder (Cashew powder) — 3 tbs",
                "Bhunay chanay (Roasted gram) powder — ¼ cup",
                "Zeera, Elaichi & Kasuri methi — to taste",
                "Pink salt, Kali mirch & Safed mirch powder",
                "Cream — 2 tbs, Ghee — 2 tbs, Dahi — 1–2 tbs",
                "Adrak lehsan paste — 1½ tbs",
                "Cooking oil — ½ cup",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/90">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Directions */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-glow"></span>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Directions
          </h2>
        </div>

        <div className="space-y-6">

          {/* Yogurt Sauce Steps */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
              Yogurt Green Sauce
            </h3>
            <ol className="space-y-3">
              <li className="flex gap-3 text-foreground/90">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  1
                </span>
                <p className="pt-0.5 leading-relaxed">
                  Blend all ingredients until smooth. Sauce is ready!
                </p>
              </li>
            </ol>
          </div>

          {/* Cheese Filling Steps */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
              Cheese Filling
            </h3>
            <ol className="space-y-3">
              <li className="flex gap-3 text-foreground/90">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  1
                </span>
                <p className="pt-0.5 leading-relaxed">
                  Mix all ingredients well. Filling is ready!
                </p>
              </li>
            </ol>
          </div>

          {/* Chicken Steps */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
              Chicken Reshmi Kabab
            </h3>
            <ol className="space-y-3">
              {[
                "Blanch onion and set aside.",
                "Mix all ingredients and refrigerate for 30 minutes.",
                "Shape kababs with cheese filling.",
                "Store up to 1 month in freezer.",
                "Shallow fry until golden.",
                "Serve hot with sauce.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-foreground/90">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>
<section className="px-2">
<div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-primary"></span>
            <h2 className="font-serif text-xl font-bold text-foreground">
              Missing an Ingredient?
            </h2>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Enter missing ingredient (e.g. cream, butter)..."
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <button
              onClick={handleCheck}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            >
              Find Substitute
            </button>

            <div className="hidden h-8 w-[1px] bg-border md:block"></div>

            <button
              onClick={handlePandaMartOrder}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#D70F64] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
            >
              <span className="text-lg">🛒</span>
              Order from PandaMart
            </button>
          </div>

          {result && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 rounded-lg bg-primary/5 p-4 text-sm text-foreground">
              <strong className="text-primary">Suggestion:</strong> {result}
            </div>
          )}
        </div>
      </section>
      
      {/* Spacer for bottom */}
      <div className="h-16"></div>

</>
  );
}