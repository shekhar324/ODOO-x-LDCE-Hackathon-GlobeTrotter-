import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { getLocalTrips } from "./use-trips";
import { saveLocalCalendarEvent, batchSyncTripCalendarEvents } from "./use-calendar";

export type TripStopRow = Database["public"]["Tables"]["trip_stops"]["Row"] & {
  cities: { name: string; country: string } | null;
};

export type TripActivityRow = Database["public"]["Tables"]["trip_activities"]["Row"] & {
  activities: { name: string; category: string } | null;
};

export interface FullStopWithActivities extends TripStopRow {
  activities: TripActivityRow[];
}

const LOCAL_STOPS_KEY = "GT_LOCAL_STOPS";
const LOCAL_ACTIVITIES_KEY = "GT_LOCAL_ACTIVITIES";

export function getLocalStops(tripId?: string): TripStopRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STOPS_KEY);
    const stops: TripStopRow[] = raw ? JSON.parse(raw) : [];
    return tripId ? stops.filter((s) => s.trip_id === tripId) : stops;
  } catch {
    return [];
  }
}

export function saveLocalStop(stop: TripStopRow): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalStops();
    const updated = [stop, ...current.filter((s) => s.id !== stop.id)];
    localStorage.setItem(LOCAL_STOPS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save local stop:", err);
  }
}

export function getLocalActivities(tripStopId?: string): TripActivityRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    const acts: TripActivityRow[] = raw ? JSON.parse(raw) : [];
    return tripStopId ? acts.filter((a) => a.trip_stop_id === tripStopId) : acts;
  } catch {
    return [];
  }
}

export function saveLocalActivity(act: TripActivityRow): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalActivities();
    const updated = [act, ...current.filter((a) => a.id !== act.id)];
    localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save local activity:", err);
  }
}

export interface GeneratedAIActivity {
  title: string;
  category?: string;
  cost?: number;
  description?: string;
  image?: string;
}

export interface GeneratedAIStop {
  title: string;
  city?: string;
  country?: string;
  notes?: string;
  activities?: GeneratedAIActivity[];
}

export interface GeneratedAIItinerary {
  title?: string;
  description?: string;
  currency: string;
  budget?: number;
  stops: GeneratedAIStop[];
}

export interface FetchAIItineraryParams {
  destination: string;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
  currency?: string;
  interests?: string[];
  travelStyle?: string;
  travelers?: number;
  customInstructions?: string;
}

/**
 * Non-mutating Gemini AI itinerary generation preview call.
 * Does NOT write to Supabase, localStorage, or Calendar.
 */
export async function fetchAIItineraryPreview(
  params: FetchAIItineraryParams
): Promise<GeneratedAIItinerary> {
  const {
    destination,
    startDate,
    endDate,
    budget = 0,
    currency = "USD",
    interests = [],
    travelStyle = "Balanced",
    travelers = 1,
    customInstructions = "",
  } = params;

  const response = await fetch("/api/generate-itinerary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      destination,
      start_date: startDate || "",
      end_date: endDate || "",
      budget: budget || 0,
      currency: currency || "USD",
      interests: interests || [],
      travel_style: travelStyle || "Balanced",
      travelers: travelers || 1,
      custom_instructions: customInstructions || "",
    }),
  });

  const aiData = await response.json().catch(() => null);

  if (!response.ok || !aiData || aiData.error || !Array.isArray(aiData.stops) || aiData.stops.length === 0) {
    const errorMsg = aiData?.error || `AI generation failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return {
    title: aiData.title || `Bespoke Journey in ${destination}`,
    description: aiData.description || `Curated ${travelStyle.toLowerCase()} trip to ${destination}.`,
    currency: aiData.currency || currency || "USD",
    budget: typeof aiData.budget === "number" ? aiData.budget : budget || 50000,
    stops: aiData.stops,
  };
}

export interface PersistItineraryParams {
  tripId: string;
  destination: string;
  startDate?: string | null;
  currency: string;
  aiData: GeneratedAIItinerary;
  userId?: string;
}

/**
 * Explicit user confirmation step: Saves generated AI itinerary stops and activities,
 * and idempotently syncs calendar events.
 */
export async function persistGeneratedItinerary(
  params: PersistItineraryParams
): Promise<{ stops: TripStopRow[]; activities: TripActivityRow[] }> {
  const { tripId, destination, startDate, currency, aiData, userId } = params;
  const createdStops: TripStopRow[] = [];
  const createdActivities: TripActivityRow[] = [];
  const baseDate = startDate ? new Date(startDate) : new Date();

  const calendarEventsToSync: Array<{
    title: string;
    description?: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    event_type?: string;
    trip_activity_id?: string;
  }> = [];

  const supabase = createClient();

  aiData.stops.forEach((stop: GeneratedAIStop, sIdx: number) => {
    const stopDate = new Date(baseDate);
    stopDate.setDate(stopDate.getDate() + sIdx);
    const stopDateStr = stopDate.toISOString().split("T")[0];
    const stopId = `stop-${tripId}-${sIdx + 1}-${Date.now()}`;

    const stopRow: TripStopRow = {
      id: stopId,
      trip_id: tripId,
      city_id: sIdx + 1,
      stop_order: sIdx + 1,
      arrival_date: stopDateStr,
      departure_date: stopDateStr,
      notes: stop.notes || stop.title || `Day ${sIdx + 1} in ${destination}`,
      created_at: new Date().toISOString(),
      cities: {
        name: stop.city || destination,
        country: stop.country || "Destination",
      },
    };

    saveLocalStop(stopRow);
    createdStops.push(stopRow);

    if (supabase) {
      supabase
        .from("trip_stops")
        .insert({
          id: stopId,
          trip_id: tripId,
          stop_order: sIdx + 1,
          arrival_date: stopDateStr,
          departure_date: stopDateStr,
          notes: stopRow.notes,
        } as any)
        .then(() => {})
        .catch(() => {});
    }

    const activities = Array.isArray(stop.activities) ? stop.activities : [];
    activities.forEach((act: GeneratedAIActivity, aIdx: number) => {
      const actId = `act-${stopId}-${aIdx + 1}-${Date.now()}`;
      const actRow: TripActivityRow = {
        id: actId,
        trip_stop_id: stopId,
        activity_id: aIdx + 1,
        position: aIdx + 1,
        custom_title: act.title || `Activity ${aIdx + 1}`,
        custom_description: act.description || `Experience in ${destination}`,
        estimated_cost: typeof act.cost === "number" ? act.cost : parseFloat(String(act.cost)) || 0,
        activity_date: stopDateStr,
        created_at: new Date().toISOString(),
        activities: {
          name: act.title || `Activity ${aIdx + 1}`,
          category: act.category || "Sightseeing",
        },
      };

      saveLocalActivity(actRow);
      createdActivities.push(actRow);

      if (supabase) {
        supabase
          .from("trip_activities")
          .insert({
            id: actId,
            trip_stop_id: stopId,
            position: aIdx + 1,
            custom_title: actRow.custom_title,
            custom_description: actRow.custom_description,
            estimated_cost: actRow.estimated_cost,
          } as any)
          .then(() => {})
          .catch(() => {});
      }

      calendarEventsToSync.push({
        title: `${actRow.custom_title} (${stop.city || destination})`,
        description: `${actRow.custom_description || ""} — Cost: ${actRow.estimated_cost} ${currency}`,
        event_date: stopDateStr,
        start_time: aIdx === 0 ? "09:30:00" : aIdx === 1 ? "14:00:00" : "19:00:00",
        end_time: aIdx === 0 ? "12:00:00" : aIdx === 1 ? "16:30:00" : "21:30:00",
        location: stop.city || destination,
        event_type: "activity",
        trip_activity_id: actId,
      });
    });
  });

  // Departure event
  const startDateStr = startDate || baseDate.toISOString().split("T")[0];
  calendarEventsToSync.push({
    title: `✈️ Trip Departure: ${destination}`,
    description: `Journey to ${destination} begins!`,
    event_date: startDateStr,
    start_time: "08:00:00",
    end_time: "18:00:00",
    location: destination,
    event_type: "flight",
    trip_activity_id: `dep-${tripId}`,
  });

  if (calendarEventsToSync.length > 0) {
    batchSyncTripCalendarEvents(tripId, calendarEventsToSync, userId);
  }

  return { stops: createdStops, activities: createdActivities };
}


export function useItinerary(tripId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["itinerary", tripId],
    queryFn: async () => {
      if (!tripId) throw new Error("No trip ID");

      // 1. Fetch trip
      let trip = null;

      try {
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("id", tripId)
          .single();

        if (!error && data) {
          trip = data;
        }
      } catch (err) {
        console.warn("Supabase fetch trip warning:", err);
      }

      if (!trip) {
        const localTrips = getLocalTrips();
        trip = localTrips.find((t) => t.id === tripId) || null;
      }

      if (!trip) {
        // Fallback default trip object if loading direct ID
        trip = {
          id: tripId,
          owner_id: "guest",
          title: "Custom Journey",
          description: "Curated travel itinerary",
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          budget: 50000,
          currency: "INR",
          visibility: "private",
          cover_image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
          status: "planned",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      // 2. Fetch trip stops
      let stops: TripStopRow[] = [];
      try {
        const { data, error } = await supabase
          .from("trip_stops")
          .select("*, cities(name, country)")
          .eq("trip_id", tripId)
          .order("stop_order", { ascending: true });

        if (!error && data && data.length > 0) {
          stops = data as unknown as TripStopRow[];
        }
      } catch (err) {
        console.warn("Supabase trip_stops fetch warning:", err);
      }

      const localStops = getLocalStops(tripId);
      const combinedStops = [...stops];
      for (const ls of localStops) {
        if (!combinedStops.some((s) => s.id === ls.id)) {
          combinedStops.push(ls);
        }
      }



      // 3. Fetch activities for these stops
      const stopIds = combinedStops.map((s) => s.id);
      let activities: TripActivityRow[] = [];

      try {
        const { data, error } = await supabase
          .from("trip_activities")
          .select("*, activities(name, category)")
          .in("trip_stop_id", stopIds.length ? stopIds : ["none"])
          .order("activity_date", { ascending: true })
          .order("position", { ascending: true });

        if (!error && data) {
          activities = data as unknown as TripActivityRow[];
        }
      } catch (err) {
        console.warn("Supabase trip_activities fetch warning:", err);
      }

      const localActs = getLocalActivities();
      const combinedActs = [...activities];
      for (const la of localActs) {
        if (stopIds.includes(la.trip_stop_id) && !combinedActs.some((a) => a.id === la.id)) {
          combinedActs.push(la);
        }
      }

      // Group activities by stop
      const stopsWithActivities: FullStopWithActivities[] = combinedStops.map((stop) => ({
        ...stop,
        activities: combinedActs.filter((a) => a.trip_stop_id === stop.id),
      }));

      return {
        trip,
        stops: stopsWithActivities,
      };
    },
    enabled: !!tripId,
  });
}

export function useCreateTripStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newStop: {
      trip_id: string;
      city_name: string;
      country?: string;
      arrival_date?: string;
    }) => {
      const stopId = `stop-${Date.now()}`;
      const stopRow: TripStopRow = {
        id: stopId,
        trip_id: newStop.trip_id,
        city_id: 1,
        stop_order: Date.now(),
        arrival_date: newStop.arrival_date || new Date().toISOString().split("T")[0],
        departure_date: newStop.arrival_date || new Date().toISOString().split("T")[0],
        notes: `${newStop.city_name} Stop`,
        created_at: new Date().toISOString(),
        cities: {
          name: newStop.city_name,
          country: newStop.country || "Destination",
        },
      };

      saveLocalStop(stopRow);
      return stopRow;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", vars.trip_id] });
    },
  });
}

export function useCreateTripActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAct: {
      trip_id: string;
      trip_stop_id: string;
      title: string;
      description?: string;
      category?: string;
      estimated_cost?: number;
      activity_date?: string;
    }) => {
      const actId = `act-${Date.now()}`;
      const actRow: TripActivityRow = {
        id: actId,
        trip_stop_id: newAct.trip_stop_id,
        activity_id: 1,
        position: Date.now(),
        custom_title: newAct.title,
        custom_description: newAct.description || null,
        estimated_cost: newAct.estimated_cost || 0,
        activity_date: newAct.activity_date || new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
        activities: {
          name: newAct.title,
          category: newAct.category || "General",
        },
      };

      saveLocalActivity(actRow);

      // Auto add to calendar
      saveLocalCalendarEvent({
        id: `cal-evt-${actId}`,
        user_id: "user",
        title: newAct.title,
        description: newAct.description || null,
        event_date: newAct.activity_date || new Date().toISOString().split("T")[0],
        start_time: "10:00",
        end_time: "12:00",
        location: "Destination Stop",
        event_type: "activity",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return actRow;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", vars.trip_id] });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}
