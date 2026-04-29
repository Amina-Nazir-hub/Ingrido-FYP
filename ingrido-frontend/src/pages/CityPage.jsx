import React, { useState } from 'react';
import { Search, Eye, MapPin } from 'lucide-react';

const CityPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const cities = [
    { 
      id: 1, 
      name: 'Karachi', 
      dishes: '50+', 
      region: 'Sindh', 
      selected: 120, 
      img: '/assets/Karachi.jpeg',
      tagline: 'diverse local dishes and the best places to eat'
    },
    { 
      id: 2, 
      name: 'Lahore', 
      dishes: '45+', 
      region: 'Punjab', 
      selected: 150, 
      img: '/assets/Lahore.jpeg',
      tagline: 'rich traditional dishes and iconic food spots'
    },
    { 
      id: 3, 
      name: 'Islamabad', 
      dishes: '25+', 
      region: 'Capital Territory', 
      selected: 90, 
      img: '/assets/Islamabad.jpeg',
      tagline: 'modern local cuisine and top dining places'
    },
    { 
      id: 4, 
      name: 'Peshawar', 
      dishes: '30+', 
      region: 'Khyber Pakhtunkhwa', 
      selected: 110, 
      img: '/assets/Peshawar.jpeg',
      tagline: 'traditional Pashtun dishes and authentic eateries'
    },
    { 
      id: 5, 
      name: 'Quetta', 
      dishes: '20+', 
      region: 'Balochistan', 
      selected: 80, 
      img: '/assets/Quetta.jpeg',
      tagline: 'hearty regional dishes and popular food spots'
    },
    { 
      id: 6, 
      name: 'Multan', 
      dishes: '18+', 
      region: 'Punjab', 
      selected: 100, 
      img: '/assets/Multan.jpeg',
      tagline: 'traditional southern dishes and local dining places'
    },
    { 
      id: 7, 
      name: 'Faisalabad', 
      dishes: '22+', 
      region: 'Punjab', 
      selected: 95, 
      img: '/assets/Faisalabad.jpeg',
      tagline: 'flavorful local dishes and well-known food spots'
    },
    { 
      id: 8, 
      name: 'Sialkot', 
      dishes: '15+', 
      region: 'Punjab', 
      selected: 75, 
      img: '/assets/Sialkot.jpeg',
      tagline: 'classic local dishes and trusted food spots'
    },
    { 
      id: 9, 
      name: 'Hyderabad', 
      dishes: '20+', 
      region: 'Sindh', 
      selected: 85, 
      img: '/assets/Hyderabad.jpeg',
      tagline: 'rich Sindhi dishes and popular food destinations'
    },
    { 
      id: 10, 
      name: 'Skardu', 
      dishes: '12+', 
      region: 'Gilgit-Baltistan', 
      selected: 130, 
      img: '/assets/Skardu.jpeg',
      tagline: 'unique mountain cuisine and scenic eateries'
    },
  ];

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    city.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-24 md:pt-32"> 
      <main className="mx-auto max-w-7xl px-6 py-12 animate-fade-in">
        
        {/* Hero Section */}
        <header className="mb-16 text-center animate-fade-up">
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl font-display text-foreground">
            Savor the Flavors of <span className="text-primary">Pakistan</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore 10 of the most iconic culinary cities, from coastal Karachi to the peaks of Skardu.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-xl group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input 
              type="text"
              className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-6 py-2 text-base shadow-sm focus:ring-2 focus:ring-ring outline-none transition-all"
              placeholder="Search by city or province..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Info Strip */}
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-secondary" />
            <span className="font-bold font-display text-lg">Top 10 Culinary Hubs</span>
          </div>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
            {filteredCities.length} {filteredCities.length === 1 ? 'City' : 'Cities'} Found
          </span>
        </div>

        {/* City Cards Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCities.map((city) => (
            <div 
              key={city.id} 
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img 
                  src={city.img} 
                  alt={city.name} 
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => { 
                    e.target.src = 'https://via.placeholder.com/800x500?text=Image+Not+Found'; 
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-background/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-border shadow-sm">
                    {city.region}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold font-display group-hover:text-primary transition-colors">
                  {city.name}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Famous for <span className="text-secondary font-bold">{city.tagline}</span>.
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground italic">
                    Explored {city.selected}k times
                  </span>

                  <button className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110 active:scale-95 transition-all">
                    <Eye size={14} /> EXPLORE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results State */}
        {filteredCities.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg italic">
              Aapke search ke mutabiq koi city nahi mili...
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CityPage;