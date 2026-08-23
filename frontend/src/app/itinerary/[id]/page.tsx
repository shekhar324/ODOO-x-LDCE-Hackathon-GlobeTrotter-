"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import {
  IconToolsKitchen2,
  IconBuildingMonument,
  IconMail,
  IconLink,
  IconArrowLeft,
  IconCalendarEvent,
  IconPlus,
  IconMapPin,
  IconSparkles,
} from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams } from "next/navigation";
import {
  useItinerary,
  useCreateTripStop,
  useCreateTripActivity,
} from "@/hooks/use-itinerary";
import { batchSyncTripCalendarEvents } from "@/hooks/use-calendar";
import { useAuth } from "@/context/auth-context";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

const contactSchema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email address required"),
  message: z.string().min(10, "Inquiry details required"),
});
type ContactForm = z.infer<typeof contactSchema>;

export default function PublicItineraryView() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const tripId = params.id as string;
  const { data, isLoading, refetch } = useItinerary(tripId);
  const trip = data?.trip;

  const createStopMutation = useCreateTripStop();
  const createActivityMutation = useCreateTripActivity();

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string>("");

  const [newStopCity, setNewStopCity] = useState("");
  const [newStopCountry, setNewStopCountry] = useState("");
  const [newActTitle, setNewActTitle] = useState("");
  const [newActDesc, setNewActDesc] = useState("");
  const [newActCost, setNewActCost] = useState("1500");
  const [newActCat, setNewActCat] = useState("Sightseeing");

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onContactSubmit = (cData: ContactForm) => {
    toast.success("Concierge inquiry sent", {
      description: `Thank you, ${cData.name}. Our private office will be in touch shortly.`,
    });
    contactForm.reset();
    setIsContactModalOpen(false);
  };

  const handleSyncToCalendar = () => {
    if (trip && data?.stops) {
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

      data.stops.forEach((stop, sIdx) => {
        const stopDate = stop.arrival_date || trip.start_date || new Date().toISOString().split("T")[0];
        (stop.activities || []).forEach((act, aIdx) => {
          calendarEventsToSync.push({
            title: `${act.custom_title || act.activities?.name || "Activity"} (${stop.cities?.name || trip.title})`,
            description: `${act.custom_description || ""} — Cost: ${formatCurrency(act.estimated_cost, trip.currency)}`,
            event_date: stopDate,
            start_time: aIdx === 0 ? "09:30:00" : aIdx === 1 ? "14:00:00" : "19:00:00",
            end_time: aIdx === 0 ? "12:00:00" : aIdx === 1 ? "16:30:00" : "21:30:00",
            location: stop.cities?.name || trip.title,
            event_type: "activity",
            trip_activity_id: act.id,
          });
        });
      });

      if (calendarEventsToSync.length > 0) {
        batchSyncTripCalendarEvents(trip.id, calendarEventsToSync, user?.id);
        toast.success("Itinerary Synced with Calendar!", {
          description: "All stops and activities are now visible on your Travel Calendar.",
        });
      } else {
        toast.info("No activities found to sync yet.");
      }
      router.push("/calendar");
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopCity.trim()) {
      toast.error("City name required");
      return;
    }
    try {
      await createStopMutation.mutateAsync({
        trip_id: tripId,
        city_name: newStopCity.trim(),
        country: newStopCountry.trim() || "Destination",
      });
      toast.success(`Stop added: ${newStopCity}`);
      setNewStopCity("");
      setNewStopCountry("");
      setIsAddStopModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating stop";
      toast.error(msg);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActTitle.trim() || !selectedStopId) {
      toast.error("Title & stop selection required");
      return;
    }
    try {
      await createActivityMutation.mutateAsync({
        trip_id: tripId,
        trip_stop_id: selectedStopId,
        title: newActTitle.trim(),
        description: newActDesc.trim(),
        category: newActCat,
        estimated_cost: parseFloat(newActCost) || 0,
      });
      toast.success(`Activity added: ${newActTitle}`);
      setNewActTitle("");
      setNewActDesc("");
      setIsAddActivityModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating activity";
      toast.error(msg);
    }
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link Copied to Clipboard", {
        description: "Public itinerary URL is ready to share.",
      });
    } catch {
      toast.error("Could not copy link", { description: "Please copy the URL from the address bar manually." });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="bg-[#e4e9dc] text-[#020202] font-sans min-h-screen selection:bg-[#38a454] selection:text-white relative">
      {/* Persistent Navigation Pill */}
      <div className={`transition-transform duration-300 ${isNavVisible ? "translate-y-0" : "-translate-y-[150%]"} fixed top-0 left-0 right-0 z-50`}>
        <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />
      </div>

      {/* Main Content Canvas */}
      <main className="w-full">
        {isLoading ? (
          <section className="relative w-full h-[870px] bg-[#0e0e0e] text-white flex items-center justify-center font-sans uppercase tracking-widest text-sm text-white/50">
            Loading Itinerary...
          </section>
        ) : data ? (
          <>
            <section className="relative w-full h-[870px] bg-[#0e0e0e] text-white overflow-hidden">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center w-full h-full"
                style={{
                  backgroundImage: `url('${
                    trip?.cover_image_url ||
                    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop"
                  }')`,
                }}
              ></div>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0e0e0e]/70"></div>

              {/* Hero Content */}
              <div className="relative z-10 w-full max-w-[1200px] mx-auto h-full flex flex-col justify-end px-6 md:px-12 pb-16 pt-[200px]">
                <div className="mb-6 flex items-center justify-between">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                  >
                    <IconArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                  </Link>
                  <button
                    onClick={handleSyncToCalendar}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-full font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                  >
                    <IconCalendarEvent className="w-4 h-4" />
                    <span>Sync with Calendar</span>
                  </button>
                </div>

                <div className="flex flex-col gap-4 max-w-3xl">
                  {/* Tags */}
                  <div className="flex gap-4 mb-2">
                    <span className="px-5 py-2 rounded-full border border-white text-white font-sans text-[12px] uppercase tracking-widest">
                      {data.stops.length > 0 ? data.stops[0].cities?.country || "Japan" : "Japan"}
                    </span>
                    <span className="px-5 py-2 rounded-full border border-white text-white font-sans text-[12px] uppercase tracking-widest">
                      {data.stops.length} Stops
                    </span>
                  </div>
                  {/* Heading */}
                  <EditorialHeading className="text-[53px] md:text-[80px] leading-none font-thin text-white tracking-tight">
                    {trip?.title}
                  </EditorialHeading>
                  {/* Subheading */}
                  <p className="font-sans text-[23px] leading-[1.4] text-[#e2e2e2] mt-4 max-w-2xl">
                    {trip?.description || "A meticulously curated journey through stunning destinations."}
                  </p>
                </div>
              </div>
            </section>

            {/* Itinerary Details Section */}
            <section className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-24">
              <div className="flex justify-between items-center mb-12 border-b border-[#0e0e0e]/20 pb-6">
                <div>
                  <h2 className="font-serif text-4xl text-[#0e0e0e]">Itinerary Schedule & Timeline</h2>
                  <p className="text-sm text-[#0e0e0e]/70 mt-1">Add custom stops, activities, and sync events with your calendar.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddStopModalOpen(true)}
                    className="bg-[#0e0e0e] hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <IconPlus className="w-4 h-4" />
                    <span>Add Stop</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Left Column: Timeline */}
                <div className="md:col-span-8 flex flex-col gap-12">
                  {data.stops.map((stop, stopIndex) => (
                    <div key={stop.id} className="bg-[#efefe7] p-8 md:p-10 border border-[#0e0e0e] flex flex-col gap-6 relative rounded-xl">
                      <div className="flex justify-between items-start border-b border-[#0e0e0e] pb-4">
                        <div>
                          <h3 className="font-sans text-[32px] md:text-[39px] leading-[1.2] text-[#0e0e0e]">
                            Stop {stopIndex + 1}: {stop.cities?.name || "Destination"}
                          </h3>
                          <p className="font-sans text-[16px] text-[#0e0e0e]/70 mt-1">
                            {stop.arrival_date ? new Date(stop.arrival_date).toLocaleDateString() : "Scheduled Stop"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-[14px] border border-[#0e0e0e] px-4 py-1 rounded-full text-[#0e0e0e]">
                            {stop.cities?.country || "Japan"}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedStopId(stop.id);
                              setIsAddActivityModalOpen(true);
                            }}
                            className="bg-[#2d9b4c] text-white p-2 rounded-full hover:bg-[#38a454] transition-colors cursor-pointer"
                            title="Add Activity to Stop"
                          >
                            <IconPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {stop.activities.length === 0 ? (
                        <div className="py-8 text-center text-[#0e0e0e]/50 font-sans italic flex flex-col items-center gap-2">
                          <span>No specific activities planned for this stop yet.</span>
                          <button
                            onClick={() => {
                              setSelectedStopId(stop.id);
                              setIsAddActivityModalOpen(true);
                            }}
                            className="text-xs text-[#2d9b4c] font-semibold underline underline-offset-4 cursor-pointer"
                          >
                            + Add First Activity
                          </button>
                        </div>
                      ) : (
                        stop.activities.map((act) => (
                          <div key={act.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 pb-8 border-b border-[#0e0e0e]/20 last:border-0 last:pb-0">
                            <div className="flex flex-col gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                alt={act.custom_title || act.activities?.name || "Activity"}
                                className="w-full h-56 object-cover border border-[#0e0e0e] rounded-lg"
                                src={
                                  act.activities?.name?.includes("Tea")
                                    ? "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?q=80&w=800&auto=format&fit=crop"
                                    : "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop"
                                }
                              />
                              <p className="font-sans text-[15px] leading-[1.5] text-[#0e0e0e]/80">
                                {act.custom_description || "Experience authentic local heritage and breathtaking views."}
                              </p>
                            </div>
                            <div className="flex flex-col justify-between gap-4">
                              <ul className="flex flex-col gap-3 font-sans text-[15px] text-[#0e0e0e]">
                                <li className="flex items-center gap-3">
                                  <IconBuildingMonument className="w-5 h-5 text-[#2d9b4c]" />
                                  <span className="font-bold text-lg">{act.custom_title || act.activities?.name || "Activity"}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[#0e0e0e]/70">
                                  <IconToolsKitchen2 className="w-4 h-4 text-[#0e0e0e]/60" />
                                  <span>{act.activities?.category || "Culture & Experience"}</span>
                                </li>
                              </ul>
                              <div className="mt-auto pt-4 border-t border-[#0e0e0e] flex justify-between items-center font-sans text-[18px] text-[#0e0e0e]">
                                <span className="text-sm uppercase tracking-wider text-[#0e0e0e]/60">Est. Cost</span>
                                <span className="font-bold">{formatCurrency(act.estimated_cost, trip?.currency)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>

                {/* Right Column: Summary & Actions */}
                <div className="md:col-span-4 flex flex-col gap-10">
                  <div className="bg-[#0e0e0e] text-white p-8 md:p-10 flex flex-col gap-6 sticky top-32 rounded-2xl border border-white/10 shadow-2xl">
                    <EditorialHeading as="h4" className="text-[36px] text-white mb-2 font-thin">
                      Itinerary Summary
                    </EditorialHeading>

                    <div className="flex flex-col gap-4 font-sans text-[15px] border-b border-white/20 pb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Status</span>
                        <span className="uppercase text-emerald-400 font-mono text-xs">{trip?.status || "Planned"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Departure</span>
                        <span>{trip?.start_date ? new Date(trip.start_date).toLocaleDateString() : "TBD"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Return</span>
                        <span>{trip?.end_date ? new Date(trip.end_date).toLocaleDateString() : "TBD"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Total Budget</span>
                        <span className="text-emerald-300 font-semibold">{formatCurrency(trip?.budget, trip?.currency)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSyncToCalendar}
                      className="bg-[#2d9b4c] hover:bg-[#38a454] text-white rounded-xl py-4 font-sans text-base font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <IconCalendarEvent className="w-5 h-5" />
                      <span>Sync to Built-In Calendar</span>
                    </button>

                    <Link
                      href="/calendar"
                      className="border border-white/30 text-white rounded-xl py-3 font-sans text-xs text-center uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
                    >
                      View Calendar Schedule
                    </Link>

                    <div className="flex justify-center gap-4 mt-2 pt-6 border-t border-white/20">
                      <button
                        onClick={() => setIsContactModalOpen(true)}
                        className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-[#0e0e0e] transition-colors cursor-pointer"
                        title="Email Concierge"
                      >
                        <IconMail className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleShareLink}
                        className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-[#0e0e0e] transition-colors cursor-pointer"
                        title="Copy Share Link"
                      >
                        <IconLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="relative w-full h-screen bg-[#0e0e0e] text-white flex items-center justify-center font-sans uppercase tracking-widest text-sm text-neutral-400">
            Itinerary Not Found
          </section>
        )}
      </main>

      <Footer onContactClick={() => setIsContactModalOpen(true)} />

      {/* --- Add Stop Modal --- */}
      <Dialog open={isAddStopModalOpen} onOpenChange={setIsAddStopModalOpen}>
        <DialogContent className="bg-[#191919] border border-neutral-800 text-white max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-light text-white flex items-center gap-2">
              <IconMapPin className="w-5 h-5 text-emerald-400" />
              Add Itinerary Stop
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400 font-sans">
              Add a new city destination stop to this journey.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStop} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-normal">City Name *</Label>
              <Input
                placeholder="e.g. Osaka / Nara"
                value={newStopCity}
                onChange={(e) => setNewStopCity(e.target.value)}
                className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-normal">Country</Label>
              <Input
                placeholder="Japan"
                value={newStopCountry}
                onChange={(e) => setNewStopCountry(e.target.value)}
                className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-emerald-500"
              />
            </div>
            <div className="pt-3">
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm py-2.5 cursor-pointer">
                Save Stop
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Add Activity Modal --- */}
      <Dialog open={isAddActivityModalOpen} onOpenChange={setIsAddActivityModalOpen}>
        <DialogContent className="bg-[#191919] border border-neutral-800 text-white max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-light text-white flex items-center gap-2">
              <IconSparkles className="w-5 h-5 text-emerald-400" />
              Add Activity to Stop
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400 font-sans">
              Create a custom experience and automatically sync it with your Calendar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddActivity} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-normal">Activity Title *</Label>
              <Input
                placeholder="e.g. Traditional Pottery Workshop"
                value={newActTitle}
                onChange={(e) => setNewActTitle(e.target.value)}
                className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-normal">Description</Label>
              <textarea
                rows={2}
                placeholder="Experience details or timing..."
                value={newActDesc}
                onChange={(e) => setNewActDesc(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-3 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-300 font-normal">Estimated Cost ({getCurrencySymbol(trip?.currency)})</Label>
                <Input
                  type="number"
                  value={newActCost}
                  onChange={(e) => setNewActCost(e.target.value)}
                  className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-300 font-normal">Category</Label>
                <select
                  value={newActCat}
                  onChange={(e) => setNewActCat(e.target.value)}
                  className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                >
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Culture">Culture</option>
                  <option value="Dining">Dining</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Nature">Nature</option>
                </select>
              </div>
            </div>
            <div className="pt-3">
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm py-2.5 cursor-pointer">
                Save & Add to Calendar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Concierge Contact Modal --- */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="bg-[#191919] border border-neutral-800 text-white max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-light text-white">Private Concierge Office</DialogTitle>
            <DialogDescription className="text-xs text-neutral-400 font-sans">
              Direct access for private charters, resort buyouts, and custom arrangements.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-normal">Full Name</Label>
              <Input
                placeholder="Full Name"
                className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-[#38a454]"
                {...contactForm.register("name")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-normal">Email Address</Label>
              <Input
                type="email"
                placeholder="name@domain.com"
                className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-[#38a454]"
                {...contactForm.register("email")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-normal">Private Request</Label>
              <textarea
                rows={3}
                placeholder="Specify your private travel requirement..."
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-3 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38a454]"
                {...contactForm.register("message")}
              />
            </div>
            <div className="pt-3">
              <Button type="submit" className="w-full bg-[#020202] hover:bg-neutral-800 text-white font-normal text-sm py-2.5 transition-colors border border-neutral-700 cursor-pointer">
                Send Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
