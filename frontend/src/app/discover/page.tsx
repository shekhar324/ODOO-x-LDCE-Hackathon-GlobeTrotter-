"use client";

import React, { useState } from "react";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { DestinationCard } from "@/components/editorial/destination-card";
import { ConciergeModal } from "@/components/editorial/concierge-modal";
import { IconSearch, IconSortAscending, IconFilter } from "@tabler/icons-react";
import { useCities } from "@/hooks/use-discover";

export default function DiscoverPage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popularity" | "name" | "cost">("popularity");
  const [filterCountry, setFilterCountry] = useState<string>("all");

  const { data: rawCities, isLoading } = useCities(searchQuery);

  // Extract list of countries for filter options
  const countries = Array.from(new Set(rawCities?.map((c) => c.country) || []));

  // Process sorting and filtering
  const processedCities = (rawCities || [])
    .filter((city) => filterCountry === "all" || city.country === filterCountry)
    .sort((a, b) => {
      if (sortBy === "popularity") {
        return (b.popularity_score || 0) - (a.popularity_score || 0);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "cost") {
        return (a.cost_index || 0) - (b.cost_index || 0);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#e4e9dc] text-[#020202] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
      <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          {/* Header Section */}
          <header className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-8 mt-12">
            <div>
              <EditorialHeading className="text-5xl md:text-7xl mb-4 font-thin tracking-tight">
                Discover Destinations
              </EditorialHeading>
              <p className="font-sans text-xl text-[#020202]/70 max-w-2xl">
                Curated experiences across the globe, tailored for the discerning traveler.
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-[300px]">
                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#020202]/50 w-5 h-5" />
                <input
                  className="w-full bg-[#efefe7] border border-[#020202] rounded-full py-3 pl-12 pr-4 text-[#020202] focus:outline-none focus:ring-1 focus:ring-[#38a454] font-sans text-sm placeholder:text-[#020202]/40 transition-colors"
                  placeholder="Search cities, activities..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
                {/* Country Filter Select */}
                <div className="relative flex items-center">
                  <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="appearance-none px-5 py-2 pr-8 border border-[#020202] rounded-full text-[#020202] bg-transparent hover:bg-[#020202] hover:text-white transition-colors font-sans text-sm cursor-pointer focus:outline-none"
                  >
                    <option value="all" className="bg-[#e4e9dc] text-black">
                      All Countries
                    </option>
                    {countries.map((country) => (
                      <option key={country} value={country} className="bg-[#e4e9dc] text-black">
                        {country}
                      </option>
                    ))}
                  </select>
                  <IconFilter className="w-4 h-4 pointer-events-none absolute right-3 text-current" />
                </div>

                {/* Sort Option Select */}
                <div className="relative flex items-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none px-5 py-2 pr-8 border border-[#020202] rounded-full text-[#020202] bg-transparent hover:bg-[#020202] hover:text-white transition-colors font-sans text-sm cursor-pointer focus:outline-none"
                  >
                    <option value="popularity" className="bg-[#e4e9dc] text-black">
                      Sort by Popularity
                    </option>
                    <option value="name" className="bg-[#e4e9dc] text-black">
                      Sort by Name
                    </option>
                    <option value="cost" className="bg-[#e4e9dc] text-black">
                      Sort by Cost Index
                    </option>
                  </select>
                  <IconSortAscending className="w-4 h-4 pointer-events-none absolute right-3 text-current" />
                </div>
              </div>
            </div>
          </header>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {isLoading ? (
              <div className="col-span-1 md:col-span-2 py-12 flex justify-center text-[#020202]/50 font-sans tracking-widest text-sm uppercase">
                Searching Destinations...
              </div>
            ) : processedCities && processedCities.length > 0 ? (
              processedCities.map((city) => {
                const costMap = ["Budget", "Affordable", "Moderate", "High", "Ultra Luxury"];
                const mappedCost = city.cost_index ? costMap[city.cost_index - 1] : "Moderate";
                return (
                  <DestinationCard
                    key={city.id}
                    id={city.id.toString()}
                    title={city.name}
                    location={city.country}
                    description={city.description || "Discover an exceptional travel destination."}
                    image={
                      city.image_url ||
                      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000"
                    }
                    tags={["Destination", mappedCost]}
                    costIndex={mappedCost}
                    popularity={city.popularity_score ? `${city.popularity_score}%` : "90%"}
                  />
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 py-12 flex justify-center text-[#020202]/50 font-sans">
                No destinations found matching your filter criteria.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer onContactClick={() => setIsContactModalOpen(true)} />
      <ConciergeModal
        isOpen={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
      />
    </div>
  );
}
