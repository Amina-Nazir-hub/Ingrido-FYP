import React from "react";
import CityHero from "./components/CityHero";
import CitySearchBar from "./components/CitySearchBar";
import CityInfoStrip from "./components/CityInfoStrip";
import CityCard from "./components/CityCard";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import { useCities } from "./hooks/useCities";

const CityPage = () => {
  const {
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filteredCities,
    cities,
  } = useCities();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-12">
      <main className="mx-auto max-w-7xl px-6 py-12">
        
        {/* Hero Section */}
        <CityHero citiesCount={cities.length} />

        {/* Search Bar */}
        <CitySearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Info Strip */}
        <CityInfoStrip filteredCount={filteredCities.length} />

        {/* City Cards Grid */}
        {filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

export default CityPage;