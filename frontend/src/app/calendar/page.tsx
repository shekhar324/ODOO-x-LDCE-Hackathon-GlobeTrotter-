"use client";

import React, { useState } from "react";
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
  IconClock,
  IconMapPin,
  IconTrash,
  IconX,
  IconSparkles,
  IconPlane,
} from "@tabler/icons-react";
import { useAuth } from "@/context/auth-context";
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  CalendarEvent,
} from "@/hooks/use-calendar";
import { useTrips } from "@/hooks/use-trips";
import { toast } from "sonner";

export default function CalendarPage() {
  const { user } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026

  // Supabase hooks
  const { data: events = [], isLoading: eventsLoading } = useCalendarEvents();
  const { data: trips = [] } = useTrips();

  const createEventMutation = useCreateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();

  // Form state
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "10:00",
    end_time: "12:00",
    location: "",
    event_type: "personal",
  });

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

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
      setNewEvent({
        title: "",
        description: "",
        start_time: "10:00",
        end_time: "12:00",
        location: "",
        event_type: "personal",
      });
    } catch (err: any) {
      toast.error("Failed to add event", {
        description: err.message || "An error occurred",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync(eventId);
      toast.success("Event removed from calendar.");
    } catch (err: any) {
      toast.error("Failed to delete event", {
        description: err.message || "An error occurred",
      });
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0e0e0e] text-[#e2e2e2] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
        <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />

        <main className="flex-1 max-w-[1200px] mx-auto w-full pt-32 sm:pt-40 pb-32 px-6 md:px-12 z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-apple-pill text-xs text-emerald-300 mb-4">
                <IconCalendar className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono tracking-wide uppercase text-[11px]">
                  Travel Schedule & Itineraries
                </span>
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
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split("T")[0]);
                  setIsCreateModalOpen(true);
                }}
                className="bg-[#2d9b4c] hover:bg-[#38a454] text-white px-6 py-3.5 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-[#2d9b4c]/20 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>
          </div>

          {/* Month Header Navigation */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-light text-white">
                {monthNames[month]} <span className="text-neutral-500 font-extralight">{year}</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <IconChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <IconChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-emerald-400 mb-4 border-b border-white/10 pb-3">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {/* Blank leading slots */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-24 sm:h-32 rounded-xl bg-white/[0.02] opacity-30" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;

                // Filter events matching this date
                const dayEvents = events.filter((e) => e.event_date === dateStr);

                // Filter trips matching this date range
                const matchingTrips = trips.filter((t) => {
                  if (!t.start_date || !t.end_date) return false;
                  return dateStr >= t.start_date && dateStr <= t.end_date;
                });

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setIsCreateModalOpen(true);
                    }}
                    className="h-24 sm:h-32 rounded-xl bg-white/5 border border-white/10 p-2 sm:p-3 flex flex-col justify-between hover:border-emerald-400/40 transition-all cursor-pointer overflow-hidden group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-neutral-400 group-hover:text-white transition-colors">
                        {dayNumber}
                      </span>
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[70%] hide-scrollbar">
                      {/* Trip Pills */}
                      {matchingTrips.map((t) => (
                        <div
                          key={t.id}
                          className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px] truncate flex items-center gap-1"
                        >
                          <IconPlane className="w-2.5 h-2.5 shrink-0" />
                          <span>{t.title}</span>
                        </div>
                      ))}

                      {/* Event Pills */}
                      {dayEvents.map((e) => (
                        <div
                          key={e.id}
                          className="bg-white/10 text-white border border-white/20 px-1.5 py-0.5 rounded text-[10px] truncate flex items-center justify-between group/pill"
                        >
                          <span className="truncate">{e.title}</span>
                          <button
                            onClick={(evt) => {
                              evt.stopPropagation();
                              handleDeleteEvent(e.id);
                            }}
                            className="opacity-0 group-hover/pill:opacity-100 hover:text-red-400 shrink-0 ml-1"
                          >
                            <IconX className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Create Event Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="backdrop-blur-2xl bg-[#141414] border border-white/15 text-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-light text-white">Add Schedule Event</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium py-3.5 rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-4"
                >
                  {createEventMutation.isPending ? "Adding..." : "Save Event"}
                </button>
              </form>
            </div>
          </div>
        )}

        <Footer />
        <ConciergeModal
          isOpen={isContactModalOpen}
          onOpenChange={setIsContactModalOpen}
        />
      </div>
    </AuthGuard>
  );
}
