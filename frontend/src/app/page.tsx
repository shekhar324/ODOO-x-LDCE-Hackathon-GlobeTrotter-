"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconSparkles,
  IconUsers,
  IconCoin,
} from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { ThreeAmbientCanvas } from "@/components/editorial/three-ambient-canvas";

// --- Form Validation Schemas ---
const planTripSchema = z.object({
  destination: z.string().min(2, "Destination required"),
  travelerType: z.enum(["nomad", "group", "family", "solo"]),
  travelerCount: z.coerce.number().min(1).max(30),
  dates: z.string().min(3, "Timing required"),
  email: z.string().email("Valid email required"),
});

type PlanTripForm = z.infer<typeof planTripSchema>;

const contactSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Email required"),
  message: z.string().min(10, "Message required"),
});

type ContactForm = z.infer<typeof contactSchema>;

// --- Visual Data Sets ---
interface DestinationCard {
  id: string;
  title: string;
  country: string;
  badge: string;
  subtitle: string;
  image: string;
  persona: "nomad" | "group" | "family" | "solo" | "all";
}

interface CuratedItinerary {
  id: string;
  title: string;
  scriptAccent: string;
  subtitle: string;
  location: string;
  image: string;
  days: string;
  cost: string;
  pacing: string;
}

const fetchHeroDestinations = async (): Promise<DestinationCard[]> => {
  await new Promise((res) => setTimeout(res, 150));
  return [
    {
      id: "kyoto",
      title: "Kyoto",
      country: "Japan",
      badge: "350 Mbps • Fiber",
      subtitle: "Zen studios & fiber mesh connectivity.",
      persona: "nomad",
      image:
        "https://images.unsplash.com/photo-1522547902298-51566e4fb383?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0",
    },
    {
      id: "amalfi",
      title: "Amalfi Coast",
      country: "Italy",
      badge: "Multi-Villa • Split",
      subtitle: "Cliffside sanctuaries with shared yacht charters.",
      persona: "group",
      image:
        "https://images.unsplash.com/photo-1596736743518-eef8c49026b7?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0",
    },
    {
      id: "engadin",
      title: "Engadin Valley",
      country: "Switzerland",
      badge: "Gentle Tempo • All Ages",
      subtitle: "Alpine chalets & zero-friction family transit.",
      persona: "family",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCW64Y9cnH9bUOLbuann0TXmlkgmIptbsyGcn7in8Fg0zaplyZjV722xn2HGyPDh8SL6JPmigPgNuaWpFff_K5vv27-JnTuFBFWZE5WUTZ24BLMl7FbH_rlQuyP6ESc3pg1wegOuDi2t1mYyiS179f1Nqk6OgjEyqEA188DFxKkCD0o9-wzW5dGtLVpVXeXMxCmAAI8v8onaHbJp0qMYKil0abbg5tuGS07DvUjfVf0uUYnVmvWJo53",
    },
    {
      id: "marrakech",
      title: "Marrakech",
      country: "Morocco",
      badge: "Private Sanctuary",
      subtitle: "Handcrafted riads & quiet culinary courtyards.",
      persona: "solo",
      image:
        "https://images.unsplash.com/photo-1653323792487-6ecc6217040b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0",
    },
  ];
};

const fetchItineraries = async (): Promise<CuratedItinerary[]> => {
  await new Promise((res) => setTimeout(res, 200));
  return [
    {
      id: "alpine-summer",
      title: "Alpine Sanctuary",
      scriptAccent: "unhurried heights",
      subtitle: "Seven days through serene Swiss valleys with effortless panoramic rail.",
      location: "Valais & Engadin",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCW64Y9cnH9bUOLbuann0TXmlkgmIptbsyGcn7in8Fg0zaplyZjV722xn2HGyPDh8SL6JPmigPgNuaWpFff_K5vv27-JnTuFBFWZE5WUTZ24BLMl7FbH_rlQuyP6ESc3pg1wegOuDi2t1mYyiS179f1Nqk6OgjEyqEA188DFxKkCD0o9-wzW5dGtLVpVXeXMxCmAAI8v8onaHbJp0qMYKil0abbg5tuGS07DvUjfVf0uUYnVmvWJo53",
      days: "7 Days",
      cost: "$2,400 / guest",
      pacing: "Gentle",
    },
    {
      id: "desert-silence",
      title: "Desert Silence",
      scriptAccent: "architectural solitude",
      subtitle: "Minimalist sanctuaries in Canyon Point with dedicated remote focus suites.",
      location: "Canyon Point, Utah",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuACAsF3U5uz7598o32N4_iyafLJ6bpId-KJV6s3SJdruLtb_1KnXtJWOhqQpscjyWzBMU8VlgBstVZnCxGSkPLQ97Hk9XuSAwD2b6qjPY86MN0cFHvDzMsy0o0iXNxZwtNXb8JJ7LFaZZfuNngx8LQ1SIVpuRmbftxWVqoxWwtnB7ueSlAR_KY_YJ439nsphidi2jZK-egCP9RNRGmnjIoBlGPweyx0rjVxt1CAqAzck5-yxEtJpo8v",
      days: "5 Days",
      cost: "$1,850 / guest",
      pacing: "Deep Focus",
    },
    {
      id: "aegean-solitude",
      title: "Aegean Solitude",
      scriptAccent: "endless blue",
      subtitle: "Private yacht hopping across secluded Cycladic coves with live group polling.",
      location: "Greek Archipelago",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAuTLsGsIx7aeU2LkxJvZGM4Ba-z39e-W0jvT-tq5S817QsvAZTQqumwWmzUC5jnOUDZX5w_OCTbU3cY7tyOHnvnQ6iRAYxKNSk506A2HnLa1ujasOQ8yfL4DOrh1WBpEN2QlSwbQnI5wXEztnIols0HTUMsSj_8CQF72EeIXaaiRKNO-DcrmFEltLjW6xwVBHfHNFzTxsx7ElPIZ_m9142elJ27YvsMmqwMe1mrHFmZX7Q0sAjkOh8",
      days: "10 Days",
      cost: "$3,100 / guest",
      pacing: "Balanced",
    },
  ];
};

export default function HomePage() {
  const [selectedPersona, setSelectedPersona] = useState<string>("all");
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<CuratedItinerary | null>(null);

  // TanStack Query
  const { data: heroCards } = useQuery({
    queryKey: ["hero-destinations"],
    queryFn: fetchHeroDestinations,
  });

  const { data: itineraries } = useQuery({
    queryKey: ["curated-itineraries"],
    queryFn: fetchItineraries,
  });

  // Forms
  const planForm = useForm<PlanTripForm>({
    resolver: zodResolver(planTripSchema),
    defaultValues: {
      destination: "",
      travelerType: "nomad",
      travelerCount: 2,
      dates: "",
      email: "",
    },
  });

  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onPlanSubmit = (data: PlanTripForm) => {
    toast.success("Blueprint Generated", {
      description: `Tailored itinerary for ${data.destination} sent to ${data.email}.`,
    });
    planForm.reset();
    setIsPlanModalOpen(false);
  };

  const onContactSubmit = (data: ContactForm) => {
    toast.success("Concierge Connected", {
      description: `Thank you, ${data.name}. Our private office will respond shortly.`,
    });
    contactForm.reset();
    setIsContactModalOpen(false);
  };

  const filteredCards = (heroCards || []).filter(
    (card) => selectedPersona === "all" || card.persona === selectedPersona || card.persona === "all"
  );

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-[#f5f5f7] flex flex-col font-sans selection:bg-[#72dc85] selection:text-[#003914] relative overflow-x-hidden">
      {/* --- Ambient Radial Glows (Apple Atmospheric Lighting) --- */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-48 w-[600px] h-[600px] bg-emerald-600/5 blur-[160px] pointer-events-none z-0" />

      {/* --- Sticky Glassmorphic Navigation --- */}
      <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />

      {/* --- Main Viewport --- */}
      <main className="flex-1 relative z-10">
        {/* ========================================================================= */}
        {/* --- Hero Section with Interactive Three.js Canvas --- */}
        {/* ========================================================================= */}
        <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center pt-32 sm:pt-36 pb-20 px-6 overflow-hidden">
          {/* 3D Three.js Interactive Particle Globe */}
          <ThreeAmbientCanvas />

          <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
            {/* Apple Micro-Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-apple-pill text-xs text-emerald-300 mb-8 animate-fade-in">
              <IconSparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono tracking-wide uppercase text-[11px]">The Collective Travel Engine</span>
            </div>

            {/* High-Impact 3-Word Headline with Calligraphic Accent */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-extralight tracking-tight text-white mb-6 leading-[1.08] max-w-4xl">
              Dream. <span className="font-calligraphy italic font-light text-emerald-300">Design.</span> Depart.
            </h1>

            {/* Punchy 2-to-3 Word Impact Statement */}
            <p className="text-lg sm:text-2xl text-neutral-400 font-light max-w-2xl mb-10 leading-relaxed">
              Zero chaos. <span className="text-white font-normal">Pure clarity.</span> One aesthetic canvas for modern journeys.
            </p>

            {/* Apple Glass Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#00280e] font-medium text-sm transition-all duration-300 shadow-[0_0_30px_rgba(114,220,133,0.3)] hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <span>Plan Trip</span>
                <IconArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/discover"
                className="px-8 py-4 rounded-full glass-apple hover:bg-white/10 text-white font-normal text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Blueprints</span>
                <IconArrowUpRight className="w-4 h-4 text-neutral-400" />
              </Link>
            </div>

            {/* Minimalist Persona Filter Pills */}
            <div className="mt-14 flex flex-wrap justify-center items-center gap-2 sm:gap-3">
              {[
                { id: "all", label: "All Collections" },
                { id: "nomad", label: "Digital Nomads" },
                { id: "group", label: "Friend Groups" },
                { id: "family", label: "Families" },
                { id: "solo", label: "Solo Seekers" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedPersona(filter.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all duration-300 cursor-pointer ${
                    selectedPersona === filter.id
                      ? "bg-white text-black font-medium scale-105 shadow-md"
                      : "glass-apple-subtle text-neutral-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Frosted Glass Horizon Cards (Horizontal Snap) */}
          <div className="w-full mt-16 overflow-x-auto hide-scrollbar snap-x snap-mandatory">
            <div className="flex gap-6 px-6 sm:px-12 md:px-24 w-max mx-auto pb-4">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setIsPlanModalOpen(true)}
                  className="group w-[280px] sm:w-[320px] h-[400px] rounded-[28px] relative overflow-hidden glass-apple snap-center cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-white/25"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute top-5 left-5 right-5 flex justify-between items-center">
                    <span className="glass-apple-pill px-3 py-1 rounded-full text-[11px] font-mono text-emerald-300">
                      {card.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono mb-1">
                      {card.country}
                    </span>
                    <h3 className="text-2xl font-light text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* --- 3-Phase Continuum: Apple Glass Cards --- */}
        {/* ========================================================================= */}
        <section className="w-full py-28 px-6 max-w-[1240px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="font-calligraphy italic text-2xl text-emerald-300 block mb-2">
              pure intentionality
            </span>
            <h2 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white mb-4">
              Three Steps. Total Clarity.
            </h2>
            <p className="text-sm text-neutral-400 font-light">
              From initial spark to live itinerary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phase 01 */}
            <div className="glass-apple p-8 rounded-[32px] flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-500 group">
              <div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-mono text-emerald-400">PHASE 01</span>
                  <span className="font-calligraphy italic text-2xl text-neutral-500 group-hover:text-emerald-300 transition-colors">
                    dream
                  </span>
                </div>
                <h3 className="text-2xl font-light text-white mb-3">
                  Visual Canvas
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Fork curated master itineraries in 1-click. Zero research fatigue.
                </p>
              </div>
              <div className="pt-6 mt-8 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300 font-mono">
                <span>Cloneable Blueprints</span>
                <IconSparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Phase 02 */}
            <div className="glass-apple p-8 rounded-[32px] flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-500 group">
              <div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-mono text-emerald-400">PHASE 02</span>
                  <span className="font-calligraphy italic text-2xl text-neutral-500 group-hover:text-emerald-300 transition-colors">
                    co-create
                  </span>
                </div>
                <h3 className="text-2xl font-light text-white mb-3">
                  Multiplayer Sync
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Democratic polls on villas & excursions. Shared consensus in real time.
                </p>
              </div>
              <div className="pt-6 mt-8 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300 font-mono">
                <span>Democratic Polling</span>
                <IconUsers className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Phase 03 */}
            <div className="glass-apple p-8 rounded-[32px] flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-500 group">
              <div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-mono text-emerald-400">PHASE 03</span>
                  <span className="font-calligraphy italic text-2xl text-neutral-500 group-hover:text-emerald-300 transition-colors">
                    execute
                  </span>
                </div>
                <h3 className="text-2xl font-light text-white mb-3">
                  Split Ledger
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Automatic per-guest accounting. Itemized receipts & offline passes.
                </p>
              </div>
              <div className="pt-6 mt-8 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300 font-mono">
                <span>Auto Cost Split</span>
                <IconCoin className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </section>



        {/* ========================================================================= */}
        {/* --- Curated Itineraries Archive: Apple Frosted Minimalist --- */}
        {/* ========================================================================= */}
        <section id="trips" className="w-full py-28 px-6 max-w-[1240px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 border-b border-white/10 pb-8">
            <div>
              <span className="font-calligraphy italic text-2xl text-emerald-300 block mb-1">
                curated sanctuaries
              </span>
              <h2 className="text-4xl sm:text-5xl font-extralight text-white">
                Forkable Blueprints.
              </h2>
            </div>
            <Link
              href="/discover"
              className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors mt-4 sm:mt-0 font-mono"
            >
              Browse All Archive →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(itineraries || []).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItinerary(item);
                  setIsPlanModalOpen(true);
                }}
                className="group glass-apple rounded-[32px] overflow-hidden p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-500 cursor-pointer"
              >
                <div>
                  <div className="aspect-[4/3] w-full relative rounded-2xl overflow-hidden mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
                    />
                    <div className="absolute top-3 right-3 glass-apple-pill px-3 py-0.5 text-[11px] font-mono text-white">
                      {item.days}
                    </div>
                    <div className="absolute bottom-3 left-3 glass-apple-pill px-2.5 py-0.5 text-[10px] font-mono text-emerald-300">
                      {item.pacing}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-mono">
                      {item.location}
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      {item.cost}
                    </span>
                  </div>

                  <h3 className="text-2xl font-light text-white mb-1">
                    {item.title}
                  </h3>
                  <span className="font-calligraphy italic text-lg text-emerald-300/80 block mb-3">
                    {item.scriptAccent}
                  </span>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300 group-hover:text-emerald-300 transition-colors font-mono">
                  <span>Clone Blueprint</span>
                  <IconArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* --- Final High-Impact Call to Action --- */}
        {/* ========================================================================= */}
        <section className="w-full py-32 px-6 max-w-4xl mx-auto text-center">
          <div className="glass-apple p-12 sm:p-20 rounded-[40px] relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

            <span className="font-calligraphy italic text-3xl text-emerald-300 block mb-4">
              effortless elegance
            </span>
            <h2 className="text-4xl sm:text-6xl font-extralight tracking-tight text-white mb-6">
              Your World. Beautifully Curated.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base font-light max-w-lg mx-auto mb-10">
              Zero clutter. Seamless co-planning. Start your journey today.
            </p>

            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="px-10 py-4 rounded-full bg-white hover:bg-neutral-200 text-black font-medium text-sm transition-all duration-300 shadow-xl hover:scale-105 cursor-pointer"
            >
              Begin Consultation
            </button>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <Footer onContactClick={() => setIsContactModalOpen(true)} />

      {/* ========================================================================= */}
      {/* --- Smart Glass Modal: Plan Journey --- */}
      {/* ========================================================================= */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="glass-apple border border-white/15 text-white max-w-lg p-8 rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-extralight text-white">
              {selectedItinerary ? selectedItinerary.title : "Design Journey"}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400 font-light mt-1">
              Select your travel profile to generate a tailored blueprint.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300">Destination</Label>
              <Input
                placeholder="Kyoto, Amalfi, or Swiss Alps"
                className="glass-apple-subtle border-white/10 text-sm focus-visible:ring-emerald-400 rounded-xl"
                {...planForm.register("destination")}
              />
              {planForm.formState.errors.destination && (
                <p className="text-xs text-red-400">{planForm.formState.errors.destination.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300">Travel Archetype</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "nomad", label: "💻 Digital Nomad" },
                  { value: "group", label: "👥 Friend Group" },
                  { value: "family", label: "👶 Family Journey" },
                  { value: "solo", label: "🧭 Solo Seeker" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      planForm.watch("travelerType") === item.value
                        ? "border-emerald-400 bg-emerald-400/10 text-white"
                        : "border-white/10 glass-apple-subtle text-neutral-400 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      value={item.value}
                      className="sr-only"
                      {...planForm.register("travelerType")}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-300">Guests</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  className="glass-apple-subtle border-white/10 text-sm focus-visible:ring-emerald-400 rounded-xl"
                  {...planForm.register("travelerCount")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-300">Timing</Label>
                <Input
                  placeholder="e.g. October 2026"
                  className="glass-apple-subtle border-white/10 text-sm focus-visible:ring-emerald-400 rounded-xl"
                  {...planForm.register("dates")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300">Email</Label>
              <Input
                type="email"
                placeholder="alexander@domain.com"
                className="glass-apple-subtle border-white/10 text-sm focus-visible:ring-emerald-400 rounded-xl"
                {...planForm.register("email")}
              />
              {planForm.formState.errors.email && (
                <p className="text-xs text-red-400">{planForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm py-3.5 rounded-full transition-all cursor-pointer shadow-lg"
              >
                Generate Blueprint
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* --- Glass Modal: Private Concierge Office --- */}
      {/* ========================================================================= */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="glass-apple border border-white/15 text-white max-w-md p-8 rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extralight text-white">
              Private Concierge
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400 font-light mt-1">
              Direct access for private charters and off-market sanctuaries.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300">Full Name</Label>
              <Input
                placeholder="Alexander Wright"
                className="glass-apple-subtle border-white/10 text-sm focus-visible:ring-emerald-400 rounded-xl"
                {...contactForm.register("name")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300">Email</Label>
              <Input
                type="email"
                placeholder="name@domain.com"
                className="glass-apple-subtle border-white/10 text-sm focus-visible:ring-emerald-400 rounded-xl"
                {...contactForm.register("email")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300">Private Requirement</Label>
              <textarea
                rows={3}
                placeholder="Specify private yacht, villa buyout, or remote work requirements..."
                className="w-full rounded-xl border border-white/10 glass-apple-subtle p-3 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                {...contactForm.register("message")}
              />
            </div>
            <div className="pt-3">
              <Button
                type="submit"
                className="w-full bg-white hover:bg-neutral-200 text-black font-medium text-sm py-3.5 rounded-full transition-all cursor-pointer"
              >
                Send Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
