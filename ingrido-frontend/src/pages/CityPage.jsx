import React, { useState, useEffect } from "react";
import { Search, Eye, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CityPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Backend base URL (Aapke Django server ka address)
  const BACKEND_URL = "http://127.0.0.1:8000";

  // ─── Backend se Cities Fetch Karna ───
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/accounts/cities/`);
        setCities(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  // ─── Search Filter ───
  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.region.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ─── Navigation Logic ───
  const handleExplore = (cityName) => {
    navigate(`/city/${cityName}/dishesList`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground animate-pulse">
            Loading culinary hubs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-12">
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Hero Section */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl font-display">
            Savor the Flavors of <span className="text-primary">Pakistan</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore {cities.length} of the most iconic culinary cities.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-6 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Search by city or province..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Info Strip */}
        <div className="mb-10 flex items-center justify-between rounded-xl border border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-secondary" />
            <span className="font-bold text-lg">Top Culinary Hubs</span>
          </div>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
            {filteredCities.length}{" "}
            {filteredCities.length === 1 ? "City" : "Cities"} Found
          </span>
        </div>

        {/* City Cards Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative aspect-16/10 overflow-hidden bg-muted">
                <img
                  // Yahan hum check kar rahe hain ke URL complete hai ya nahi
                  src={
                    city.image && city.image.startsWith("http")
                      ? city.image
                      : `${BACKEND_URL}${city.image}`
                  }
                  alt={city.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/800x500?text=Image+Not+Found";
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-border text-black">
                    {city.region}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl font-bold font-display group-hover:text-primary transition-colors">
                  {city.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Discover authentic recipes and traditional dishes from{" "}
                  <span className="text-secondary font-bold">
                    {city.name}, {city.region}
                  </span>
                  .
                </p>

                {/* Bottom Section */}
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-border">
                  <span className="text-xs text-muted-foreground italic">
                    {city.dishes_count || 0} Dishes Available
                  </span>

                  <button
                    onClick={() => handleExplore(city.name)}
                    className="flex items-center gap-2 bg-[#b17b46] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider"
                  >
                    <Eye size={14} /> Explore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCities.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg italic">
              City Not Found...
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CityPage;
