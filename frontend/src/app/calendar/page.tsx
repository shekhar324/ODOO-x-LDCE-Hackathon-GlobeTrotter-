"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { ConciergeModal } from "@/components/editorial/concierge-modal";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconTrash,
  IconX,
  IconSparkles,
  IconPlane,
  IconPencil,
} from "@tabler/icons-react";
import { useAuth } from "@/context/auth-context";
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  CalendarEvent,
} from "@/hooks/use-calendar";
import { useTrips } from "@/hooks/use-trips";
import { toast } from "sonner";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const EMPTY_EVENT_FORM = {
  title: "",
  description: "",
  start_time: "10:00",
  end_time: "12:00",
  location: "",
  event_type: "personal",
};

function useBodyScrollLock(locked: boolean) {
  React.useEffect(() => {
    if (locked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [locked]);
}

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [newEvent, setNewEvent] = useState(EMPTY_EVENT_FORM);

  const anyModalOpen = isCreateModalOpen || !!editingEvent;
  useBodyScrollLock(anyModalOpen);

  const { data: events = [], isLoading: eventsLoading } = useCalendarEvents();
  const { data: trips = [] } = useTrips();
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) {
      toast.error("Please enter an event title.");
      return;
    }
    try {
      await createEventMutation.mutateAsync({
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        event_date: selectedDate,
        start_time: newEvent.start_time || undefined,
        end_time: newEvent.end_time || undefined,
        location: newEvent.location.trim() || undefined,
        event_type: newEvent.event_type,
      });
      toast.success("Event added to your calendar!");
      setIsCreateModalOpen(false);
      setNewEvent(EMPTY_EVENT_FORM);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error("Failed to add event", { description: msg });
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !newEvent.title.trim()) {
      toast.error("Please enter an event title.");
      return;
    }
    try {
      await updateEventMutation.mutateAsync({
        id: editingEvent.id,
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        event_date: selectedDate,
        start_time: newEvent.start_time || undefined,
        end_time: newEvent.end_time || undefined,
        location: newEvent.location.trim() || undefined,
        event_type: newEvent.event_type,
      });
      toast.success("Event updated successfully!");
      setEditingEvent(null);
      setNewEvent(EMPTY_EVENT_FORM);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error("Failed to update event", { description: msg });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync(eventId);
      toast.success("Event removed from calendar.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error("Failed to delete event", { description: msg });
    }
  };

  const openCreateModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setNewEvent(EMPTY_EVENT_FORM);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setSelectedDate(event.event_date);
    setNewEvent({
      title: event.title,
      description: event.description || "",
      start_time: event.start_time || "10:00",
      end_time: event.end_time || "12:00",
      location: event.location || "",
      event_type: event.event_type || "personal",
    });
  };

  const EventFormFields = (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Date *</label>
        <input
          type="date"
          required
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-400 text-sm [color-scheme:dark]"
        />
      </div>
      <div>
        <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Event Title *</label>
        <input
          type="text"
          required
          placeholder="e.g. Flight to Narita / Museum Tour"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Start Time</label>
          <input
            type="time"
            value={newEvent.start_time}
            onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-400 text-xs [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-300 block mb-1.5 font-mono">End Time</label>
          <input
            type="time"
            value={newEvent.end_time}
            onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-400 text-xs [color-scheme:dark]"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Location</label>
        <input
          type="text"
          placeholder="e.g. Haneda Terminal 3"
          value={newEvent.location}
          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Description</label>
        <textarea
          rows={2}
          placeholder="Notes or confirmation codes..."
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm resize-none"
        />
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0e0e0e] text-[#e2e2e2] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
        <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />

        <main className="flex-1 max-w-[1200px] mx-auto w-full pt-32 sm:pt-40 pb-32 px-6 md:px-12 z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-apple-pill text-xs text-emerald-300 mb-4">
                <IconCalendar className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono tracking-wide uppercase text-[11px]">Travel Schedule & Itineraries</span>
              </div>
              <EditorialHeading className="text-[44px] sm:text-[64px] md:text-[80px] leading-none text-white font-thin tracking-tight">
                Calendar
              </EditorialHeading>
              <p className="font-sans text-lg text-[#becabb] mt-4 max-w-xl">
                Organize your upcoming travel schedules, flight times, and destination activities.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => openCreateModal(new Date().toISOString().split("T")[0])}
                className="bg-[#2d9b4c] hover:bg-[#38a454] text-white px-6 py-3.5 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-[#2d9b4c]/20 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-light text-white">
                {MONTH_NAMES[month]} <span className="text-neutral-500 font-extralight">{year}</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="p-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <IconChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="p-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <IconChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-emerald-400 mb-4 border-b border-white/10 pb-3">
              {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d) => <span key={d}>{d}</span>)}
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-24 sm:h-32 rounded-xl bg-white/[0.02] opacity-30" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
                const dayEvents = events.filter((e) => e.event_date === dateStr);
                const matchingTrips = trips.filter((t) => {
                  if (!t.start_date || !t.end_date) return false;
                  return dateStr >= t.start_date && dateStr <= t.end_date;
                });
                const isToday = dateStr === new Date().toISOString().split("T")[0];

                return (
                  <div
                    key={dateStr}
                    onClick={() => openCreateModal(dateStr)}
                    className={`h-24 sm:h-32 rounded-xl border p-2 sm:p-3 flex flex-col justify-between hover:border-emerald-400/40 transition-all cursor-pointer overflow-hidden group ${
                      isToday ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-mono group-hover:text-white transition-colors ${isToday ? "text-emerald-400 font-bold" : "text-neutral-400"}`}>
                        {dayNumber}
                      </span>
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[70%] hide-scrollbar">
                      {matchingTrips.map((t) => (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/itinerary/${t.id}`);
                          }}
                          className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded text-[10px] truncate flex items-center gap-1 cursor-pointer transition-colors"
                          title={`View ${t.title} Itinerary`}
                        >
                          <IconPlane className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                      {dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="bg-white/10 text-white border border-white/20 px-1.5 py-0.5 rounded text-[10px] truncate flex items-center justify-between group/pill"
                        >
                          <span className="truncate">{ev.title}</span>
                          <div className="flex items-center gap-0.5 shrink-0 ml-1 opacity-0 group-hover/pill:opacity-100">
                            <button
                              onClick={(e) => openEditModal(ev, e)}
                              className="hover:text-emerald-400 transition-colors"
                              title="Edit event"
                            >
                              <IconPencil className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}
                              className="hover:text-red-400 transition-colors"
                              title="Delete event"
                            >
                              <IconX className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events List */}
          {!eventsLoading && events.length > 0 && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg font-light text-white mb-6">Upcoming Events</h3>
              <div className="space-y-3">
                {events
                  .filter((e) => e.event_date >= new Date().toISOString().split("T")[0])
                  .slice(0, 8)
                  .map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[40px]">
                          <p className="text-xs font-mono text-emerald-400 uppercase">{new Date(ev.event_date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}</p>
                          <p className="text-xl font-light text-white">{new Date(ev.event_date + "T00:00:00").getDate()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{ev.title}</p>
                          {ev.location && <p className="text-xs text-neutral-500">{ev.location}</p>}
                          {ev.start_time && <p className="text-xs text-neutral-500">{ev.start_time}{ev.end_time ? ` – ${ev.end_time}` : ""}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => openEditModal(ev, e)}
                          className="text-neutral-500 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <IconPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          disabled={deleteEventMutation.isPending}
                          className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {!eventsLoading && events.length === 0 && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center max-w-md mx-auto">
              <IconSparkles className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl text-white font-light mb-2">No Events Scheduled</h3>
              <p className="text-xs text-[#becabb] mb-6">Click any date on the calendar or use the button above to add travel events.</p>
              <button
                onClick={() => openCreateModal(new Date().toISOString().split("T")[0])}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer"
              >
                Add First Event
              </button>
            </div>
          )}
        </main>

        {/* Create / Edit Event Modal */}
        {(isCreateModalOpen || editingEvent) && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="backdrop-blur-2xl bg-[#141414] border border-white/15 text-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6" data-lenis-prevent>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-light text-white">{editingEvent ? "Edit Event" : "Add Schedule Event"}</h2>
                <button
                  onClick={() => { setIsCreateModalOpen(false); setEditingEvent(null); setNewEvent(EMPTY_EVENT_FORM); }}
                  className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
                {EventFormFields}
                <button
                  type="submit"
                  disabled={createEventMutation.isPending || updateEventMutation.isPending}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium py-3.5 rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-4"
                >
                  {createEventMutation.isPending || updateEventMutation.isPending ? "Saving..." : editingEvent ? "Save Changes" : "Save Event"}
                </button>
              </form>
            </div>
          </div>
        )}

        <Footer />
        <ConciergeModal isOpen={isContactModalOpen} onOpenChange={setIsContactModalOpen} />
      </div>
    </AuthGuard>
  );
}
