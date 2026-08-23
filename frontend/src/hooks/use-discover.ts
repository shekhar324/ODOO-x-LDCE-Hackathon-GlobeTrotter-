import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type City = Database["public"]["Tables"]["cities"]["Row"];

export const MOCK_CITIES: City[] = [
  {
    id: 1,
    name: "Kyoto",
    country: "Japan",
    country_code: "JP",
    latitude: 35.0116,
    longitude: 135.7681,
    description: "Historical capital known for classical Buddhist temples, serene bamboo groves, imperial palaces, and traditional wooden tea houses.",
    image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
    cost_index: 4,
    popularity_score: 98.5,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Paris",
    country: "France",
    country_code: "FR",
    latitude: 48.8566,
    longitude: 2.3522,
    description: "Global center for art, fashion, gastronomy, and romance featuring iconic landmark architecture along the Seine.",
    image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop",
    cost_index: 4,
    popularity_score: 97.0,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Bali",
    country: "Indonesia",
    country_code: "ID",
    latitude: -8.4095,
    longitude: 115.1889,
    description: "Indonesian tropical paradise known for forested volcanic mountains, iconic rice paddies, cliffside temples, and coral reefs.",
    image_url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop",
    cost_index: 2,
    popularity_score: 95.0,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "New York",
    country: "United States",
    country_code: "US",
    latitude: 40.7128,
    longitude: -74.006,
    description: "Iconic metropolis featuring global finance, Broadway theater, world-class museums, and diverse culinary neighborhoods.",
    image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200&auto=format&fit=crop",
    cost_index: 5,
    popularity_score: 96.5,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Santorini",
    country: "Greece",
    country_code: "GR",
    latitude: 36.3932,
    longitude: 25.4615,
    description: "Cycladic island famous for whitewashed cliffside villages, breathtaking sunsets over the caldera, and volcanic beaches.",
    image_url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop",
    cost_index: 4,
    popularity_score: 97.8,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Amalfi Coast",
    country: "Italy",
    country_code: "IT",
    latitude: 40.634,
    longitude: 14.6027,
    description: "Dramatic Italian coastline featuring cliffside pastel villages, fragrant lemon groves, and sapphire Tyrrhenian waters.",
    image_url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop",
    cost_index: 5,
    popularity_score: 96.2,
    created_at: new Date().toISOString(),
  },
  {
    id: 7,
    name: "Tokyo",
    country: "Japan",
    country_code: "JP",
    latitude: 35.6762,
    longitude: 139.6503,
    description: "Futuristic capital blending neon-lit skyscrapers, historic Shinto shrines, Michelin-star dining, and pop culture districts.",
    image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop",
    cost_index: 4,
    popularity_score: 99.2,
    created_at: new Date().toISOString(),
  },
  {
    id: 8,
    name: "Swiss Alps",
    country: "Switzerland",
    country_code: "CH",
    latitude: 45.9765,
    longitude: 7.7491,
    description: "Majestic alpine peak wonderland offering world-class skiing, mountain cogwheel railways, and pristine mirror lakes.",
    image_url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop",
    cost_index: 5,
    popularity_score: 98.0,
    created_at: new Date().toISOString(),
  },
];

export function useCities(searchQuery: string = "") {
  const supabase = createClient();

  return useQuery<City[]>({
    queryKey: ["cities", searchQuery],
    queryFn: async () => {
      let dbCities: City[] = [];

      try {
        let query = supabase
          .from("cities")
          .select("*")
          .order("popularity_score", { ascending: false });

        if (searchQuery) {
          query = query.ilike("name", `%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (!error && data) {
          dbCities = data as City[];
        }
      } catch (err) {
        console.warn("Cities fetch warning:", err);
      }

      // Merge database cities with mock seed cities
      const combined = [...dbCities];
      for (const mockCity of MOCK_CITIES) {
        if (!combined.some((c) => c.name.toLowerCase() === mockCity.name.toLowerCase())) {
          combined.push(mockCity);
        }
      }

      if (searchQuery) {
        return combined.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.country.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return combined;
    },
  });
}
