import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { Database } from "@/lib/supabase/types";

export type Trip = Database["public"]["Tables"]["trips"]["Row"];

const LOCAL_TRIPS_KEY = "GT_LOCAL_TRIPS";

export function getLocalTrips(ownerId?: string): Trip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_TRIPS_KEY);
    const trips: Trip[] = raw ? JSON.parse(raw) : [];
    if (ownerId) {
      return trips.filter((t) => t.owner_id === ownerId);
    }
    return trips;
  } catch {
    return [];
  }
}

export function saveLocalTrip(trip: Trip): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalTrips();
    const updated = [trip, ...current.filter((t) => t.id !== trip.id)];
    localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save trip to local storage:", err);
  }
}

export function useTrips() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery<Trip[]>({
    queryKey: ["trips", user?.id],
    queryFn: async () => {
      let dbTrips: Trip[] = [];
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from("trips")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

          if (!error && data) {
            dbTrips = data as Trip[];
          }
        } catch (err) {
          console.warn("Fetch trips warning:", err);
        }
      }

      const activeOwnerId = user?.id || "guest-user-123";
      const localTrips = getLocalTrips(activeOwnerId);
      const combined = [...dbTrips];
      for (const lt of localTrips) {
        if (!combined.some((t) => t.id === lt.id)) {
          combined.push(lt);
        }
      }
      return combined;
    },
    enabled: true,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (newTripData: {
      title: string;
      description?: string | null;
      start_date?: string | null;
      end_date?: string | null;
      budget?: number | null;
      currency?: string;
      visibility?: "private" | "friends" | "public";
      cover_image_url?: string;
    }) => {
      const tripId = "trip-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      const ownerId = user?.id || "guest-user-123";

      const tripRecord: Trip = {
        id: tripId,
        owner_id: ownerId,
        title: newTripData.title,
        description: newTripData.description || null,
        start_date: newTripData.start_date || null,
        end_date: newTripData.end_date || null,
        budget: newTripData.budget || null,
        currency: newTripData.currency || "INR",
        visibility: newTripData.visibility || "private",
        cover_image_url: newTripData.cover_image_url || null,
        status: "planned",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try inserting into Supabase
      if (user?.id) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase.from("trips") as any)
            .insert({
              owner_id: ownerId,
              title: newTripData.title,
              description: newTripData.description || null,
              start_date: newTripData.start_date || null,
              end_date: newTripData.end_date || null,
              budget: newTripData.budget || null,
              currency: newTripData.currency || "INR",
              visibility: newTripData.visibility || "private",
              cover_image_url: newTripData.cover_image_url || null,
              status: "planned",
            })
            .select()
            .single();

          if (!error && data) {
            saveLocalTrip(data as Trip);
            return data as Trip;
          }
        } catch (dbErr) {
          console.warn("Supabase trip insert fallback:", dbErr);
        }
      }

      // Always save locally so trip creation is 100% resilient
      saveLocalTrip(tripRecord);
      return tripRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
