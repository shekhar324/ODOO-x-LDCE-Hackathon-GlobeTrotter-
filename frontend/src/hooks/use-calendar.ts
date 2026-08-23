import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: string;
  trip_id?: string | null;
  trip_activity_id?: string | null;
  created_at: string;
  updated_at: string;
}

const LOCAL_CALENDAR_KEY = "GT_LOCAL_CALENDAR_EVENTS";

export function getLocalCalendarEvents(userId?: string): CalendarEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_CALENDAR_KEY);
    const events: CalendarEvent[] = raw ? JSON.parse(raw) : [];
    if (userId) {
      return events.filter((e) => e.user_id === userId);
    }
    return events;
  } catch {
    return [];
  }
}

export function saveLocalCalendarEvent(evt: CalendarEvent): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalCalendarEvents();
    const updated = [evt, ...current.filter((e) => e.id !== evt.id)];
    localStorage.setItem(LOCAL_CALENDAR_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save local calendar event:", err);
  }
}

export function removeLocalCalendarEvent(eventId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalCalendarEvents();
    const updated = current.filter((e) => e.id !== eventId);
    localStorage.setItem(LOCAL_CALENDAR_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to remove local calendar event:", err);
  }
}

/**
 * Idempotently syncs a batch of itinerary calendar events for a specific trip_id.
 * Updates existing events and creates missing ones, preventing duplicate event spam.
 */
export function batchSyncTripCalendarEvents(
  tripId: string,
  incomingEvents: Array<{
    title: string;
    description?: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    event_type?: string;
    trip_activity_id?: string;
  }>,
  userId: string = "guest-user-123"
): CalendarEvent[] {
  if (typeof window === "undefined") return [];

  const existingLocal = getLocalCalendarEvents(userId);
  const syncedEvents: CalendarEvent[] = [];

  for (const inc of incomingEvents) {
    // Check for existing event matching trip_id AND (trip_activity_id OR title + date)
    const existing = existingLocal.find((e) => {
      if (inc.trip_activity_id && e.trip_activity_id === inc.trip_activity_id) {
        return true;
      }
      return e.trip_id === tripId && e.title === inc.title && e.event_date === inc.event_date;
    });

    const eventRecord: CalendarEvent = {
      id: existing ? existing.id : "cal-act-" + (inc.trip_activity_id || Date.now() + "-" + Math.random().toString(36).substr(2, 4)),
      user_id: userId,
      title: inc.title,
      description: inc.description || null,
      event_date: inc.event_date,
      start_time: inc.start_time || null,
      end_time: inc.end_time || null,
      location: inc.location || null,
      event_type: inc.event_type || "trip",
      trip_id: tripId,
      trip_activity_id: inc.trip_activity_id || null,
      created_at: existing ? existing.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveLocalCalendarEvent(eventRecord);
    syncedEvents.push(eventRecord);
  }

  return syncedEvents;
}

export function useCalendarEvents() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ["calendar-events", user?.id],
    queryFn: async () => {
      let dbEvents: CalendarEvent[] = [];

      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from("calendar_events")
            .select("*")
            .eq("user_id", user.id)
            .order("event_date", { ascending: true });

          if (!error && data) {
            dbEvents = data as unknown as CalendarEvent[];
          }
        } catch (err) {
          console.warn("Calendar events fetch warning:", err);
        }
      }

      const activeUserId = user?.id || "guest-user-123";
      const localEvents = getLocalCalendarEvents(activeUserId);
      const combined = [...dbEvents];
      for (const le of localEvents) {
        if (!combined.some((e) => e.id === le.id)) {
          combined.push(le);
        }
      }

      return combined.sort((a, b) => (a.event_date > b.event_date ? 1 : -1));
    },
    enabled: true,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (newEvent: {
      title: string;
      description?: string;
      event_date: string;
      start_time?: string;
      end_time?: string;
      location?: string;
      event_type?: string;
      trip_id?: string;
      trip_activity_id?: string;
    }) => {
      const eventId = "cal-evt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      const userId = user?.id || "guest-user-123";

      const eventRecord: CalendarEvent = {
        id: eventId,
        user_id: userId,
        title: newEvent.title,
        description: newEvent.description || null,
        event_date: newEvent.event_date,
        start_time: newEvent.start_time || null,
        end_time: newEvent.end_time || null,
        location: newEvent.location || null,
        event_type: newEvent.event_type || "personal",
        trip_id: newEvent.trip_id || null,
        trip_activity_id: newEvent.trip_activity_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (user?.id) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase.from("calendar_events") as any)
            .insert({
              user_id: userId,
              ...newEvent,
            })
            .select()
            .single();

          if (!error && data) {
            saveLocalCalendarEvent(data as CalendarEvent);
            return data as CalendarEvent;
          }
        } catch (dbErr) {
          console.warn("Supabase calendar insert fallback:", dbErr);
        }
      }

      // Save locally to ensure 100% success
      saveLocalCalendarEvent(eventRecord);
      return eventRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      description?: string;
      event_date?: string;
      start_time?: string;
      end_time?: string;
      location?: string;
      event_type?: string;
      trip_id?: string;
      trip_activity_id?: string;
    }) => {
      if (user?.id) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase.from("calendar_events") as any)
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

          if (!error && data) {
            saveLocalCalendarEvent(data as CalendarEvent);
            return data as CalendarEvent;
          }
        } catch (err) {
          console.warn("Supabase update event warning:", err);
        }
      }

      // Local update fallback
      const localEvents = getLocalCalendarEvents();
      const existing = localEvents.find((e) => e.id === id);
      if (existing) {
        const updatedRecord: CalendarEvent = {
          ...existing,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        saveLocalCalendarEvent(updatedRecord);
        return updatedRecord;
      }

      throw new Error("Event not found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (user?.id) {
        try {
          await supabase
            .from("calendar_events")
            .delete()
            .eq("id", eventId);
        } catch (err) {
          console.warn("Supabase delete event warning:", err);
        }
      }

      removeLocalCalendarEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

