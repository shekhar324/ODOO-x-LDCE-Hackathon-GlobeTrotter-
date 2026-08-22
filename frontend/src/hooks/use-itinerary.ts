import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useItinerary(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["itinerary", tripId],
    queryFn: async () => {
      if (!tripId) throw new Error("No trip ID");

      // Fetch the trip
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();
        
      if (tripError) throw tripError;

      // Fetch trip stops
      const { data: stops, error: stopsError } = await supabase
        .from("trip_stops")
        .select("*, cities(name, country)")
        .eq("trip_id", tripId)
        .order("stop_order", { ascending: true });

      if (stopsError) throw stopsError;

      // Fetch activities for these stops
      const stopIds = stops.map(s => s.id);
      const { data: activities, error: activitiesError } = await supabase
        .from("trip_activities")
        .select("*, activities(name, category)")
        .in("trip_stop_id", stopIds.length ? stopIds : ["none"])
        .order("activity_date", { ascending: true })
        .order("position", { ascending: true });

      if (activitiesError) throw activitiesError;

      // Group activities by stop_id
      const stopsWithActivities = stops.map(stop => ({
        ...stop,
        activities: activities.filter(a => a.trip_stop_id === stop.id)
      }));

      return {
        trip,
        stops: stopsWithActivities
      };
    },
    enabled: !!tripId,
  });
}
