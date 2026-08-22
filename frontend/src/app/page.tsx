"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";

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

// --- Zod Schemas ---
const planTripSchema = z.object({
  destination: z.string().min(2, "Destination city or region required"),
  travelerCount: z.coerce.number().min(1, "At least 1 traveler required").max(20, "Maximum 20 travelers"),
  dates: z.string().min(3, "Travel timing required"),
  email: z.string().email("Valid email address required"),
});

type PlanTripForm = z.infer<typeof planTripSchema>;

const contactSchema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email address required"),
  message: z.string().min(10, "Inquiry details required"),
});

type ContactForm = z.infer<typeof contactSchema>;

// --- Data Types ---
interface DestinationCard {
  id: string;
  title: string;
  country: string;
  tag: string;
  image: string;
  subtitle: string;
}

interface CuratedItinerary {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  image: string;
  days: string;
}

// Data fetching via TanStack Query
const fetchHeroDestinations = async (): Promise<DestinationCard[]> => {
  await new Promise((res) => setTimeout(res, 200));
  return [
    {
      id: "amalfi",
      title: "Amalfi Coast",
      country: "Italy",
      tag: "Amalfi Coast",
      subtitle: "Pastel cliffside villas along Mediterranean waters",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDgdVwRVuya7lHyM8jkHySLOZ1RuqM75Rdhnn8GgHhI6FicfrH_YNz_MMY0BfVHv_OhAWrmaZb9lwWJlHxpKp6sVSdbV7bZkq_1oxEVQlXL6ydYBHnSRXjpiqGhoOc0O9svU57DglK2IdbQrO_c7pT74FIxdqrTn1N7JitdvL_T1YYTUpbGaCC-gDbhIhtyWUJxkgBADpSKzoL2FoI7oqTC_frX_6A0ybZTdUWM6k8Z5YZcOIiCT_aH",
    },
    {
      id: "kyoto",
      title: "Kyoto",
      country: "Japan",
      tag: "Kyoto, Japan",
      subtitle: "Zen gardens, cedar forests, and historic tea houses",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB8oRGpwXq_3iNhwW6t-v6gmfVRhNuOeAtvbIIAsIllUkUmiN-uk1QkyL36c9RbXCzLOxRBVfTzGYxFEOs78leUbdt-oKDbZdTh8JerRcJ8z0gHUcmnn2QiXusSOj9iqMRxYNKAoYlGeKT44Ofvx8wboJAKc7paIaej0M2_Ods6l5581QaNYyiOPVkmh8TOAPfX7HlhqK_BdVkPsPm4c-0LtGszE5pTkO-0JhpTuv1c3OOenNLin-O-",
    },
    {
      id: "marrakech",
      title: "Marrakech",
      country: "Morocco",
      tag: "Marrakech",
      subtitle: "Private riad sanctuaries with handcrafted tilework",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC6hrT16e1LQEJHRDMdchNYvKMYTOpNbOOPGtFE9DPeG5_Q3pvVxpGW4RnA-O72gbpD44LC0AMujWGZs9tv84uUu5Iot_ef_bpe8d7btRDUvMWfx4BMiBD9tR4111VSApT2MMvnLLBQxlrvXTib6AotRvHou5D_46Z0QWsTHeIGyHQqKm9WGDQAgyu8Ef5HERsbQSGTXSJyEIwPbwFmyj3kdwyw57BKvx9YF-tHUiC0nhDpox_YQ3q-",
    },
    {
      id: "bigsur",
      title: "Big Sur",
      country: "USA",
      tag: "Big Sur",
      subtitle: "Pacific coastal bluffs and ancient redwood canopy",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBmsOlPDifSWOyuL2KXOyQ1bXFj4vg6WTd8KcbYYE-EJZNEuFRgW-kUsDNpggxRo0YudE4H5nMHFCBeDrNps1sJu7oEWKIaZTa4flgFkLu7BdU5yGzQnECojd_yEN6O5aZ9UQ4WBQUJqHDLLldtdoIkhfbioZ7lWCEafvGX3j0SxdT6_2OWC9YQHwWUuevGNCzmxcwyI6FeqTI6xa7-ugGd7cj6hKghCoWCWgGxVI_kHb4gt0Jci2_7",
    },
  ];
};

const fetchItineraries = async (): Promise<CuratedItinerary[]> => {
  await new Promise((res) => setTimeout(res, 250));
  return [
    {
      id: "alpine-summer",
      title: "Alpine Summer",
      subtitle: "A seven-day retreat through the serene valleys of Switzerland.",
      location: "Valais & Engadin, Switzerland",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCW64Y9cnH9bUOLbuann0TXmlkgmIptbsyGcn7in8Fg0zaplyZjV722xn2HGyPDh8SL6JPmigPgNuaWpFff_K5vv27-JnTuFBFWZE5WUTZ24BLMl7FbH_rlQuyP6ESc3pg1wegOuDi2t1mYyiS179f1Nqk6OgjEyqEA188DFxKkCD0o9-wzW5dGtLVpVXeXMxCmAAI8v8onaHbJp0qMYKil0abbg5tuGS07DvUjfVf0uUYnVmvWJo53",
      days: "7 Days",
    },
    {
      id: "desert-silence",
      title: "Desert Silence",
      subtitle: "Immerse yourself in the stark, breathtaking architecture of the American Southwest.",
      location: "Canyon Point, Utah",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuACAsF3U5uz7598o32N4_iyafLJ6bpId-KJV6s3SJdruLtb_1KnXtJWOhqQpscjyWzBMU8VlgBstVZnCxGSkPLQ97Hk9XuSAwD2b6qjPY86MN0cFHvDzMsy0o0iXNxZwtNXb8JJ7LFaZZfuNngx8LQ1SIVpuRmbftxWVqoxWwtnB7ueSlAR_KY_YJ439nsphidi2jZK-egCP9RNRGmnjIoBlGPweyx0rjVxt1CAqAzck5-yxEtJpo8v",
      days: "5 Days",
    },
    {
      id: "aegean-solitude",
      title: "Aegean Solitude",
      subtitle: "Private yacht chartering through secluded Cycladic coves.",
      location: "Greek Archipelago",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAuTLsGsIx7aeU2LkxJvZGM4Ba-z39e-W0jvT-tq5S817QsvAZTQqumwWmzUC5jnOUDZX5w_OCTbU3cY7tyOHnvnQ6iRAYxKNSk506A2HnLa1ujasOQ8yfL4DOrh1WBpEN2QlSwbQnI5wXEztnIols0HTUMsSj_8CQF72EeIXaaiRKNO-DcrmFEltLjW6xwVBHfHNFzTxsx7ElPIZ_m9142elJ27YvsMmqwMe1mrHFmZX7Q0sAjkOh8",
      days: "10 Days",
    },
  ];
};

const editorialChapters = [
  {
    number: "01",
    title: "Unlisted Sanctuary Access",
    text: "Direct access to private estates, historic villas, and off-market island buyouts never published on public channels.",
  },
  {
    number: "02",
    title: "Bespoke Air & Sea Charters",
    text: "Seamless long-range jet routing and door-to-deck helicopter transfers synchronized precisely with your arrival.",
  },
  {
    number: "03",
    title: "Curated Culinary Expeditions",
    text: "Private chef tables hosted by Michelin-starred culinary artists in rare, secluded backdrops around the globe.",
  },
];

export default function HomePage() {
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
      travelerCount: 2,
      dates: "",
      email: "",
    },
  });

  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onPlanSubmit = (data: PlanTripForm) => {
    toast.success(`Itinerary proposal requested for ${data.destination}`, {
      description: `A private curator will respond to ${data.email} within 24 hours.`,
    });
    planForm.reset();
    setIsPlanModalOpen(false);
  };

  const onContactSubmit = (data: ContactForm) => {
    toast.success("Concierge inquiry sent", {
      description: `Thank you, ${data.name}. Our private office will be in touch shortly.`,
    });
    contactForm.reset();
    setIsContactModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200] relative overflow-x-hidden">
      {/* --- Sticky Mint Boarding Pass Navigation --- */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-[94%] max-w-[1200px] z-50 mt-4 mx-auto">
        <nav
          aria-label="Main Navigation"
          className="flex justify-between items-center px-6 sm:px-8 py-3.5 bg-[#c3eeb4] text-[#002200] rounded-full transition-transform duration-200"
        >
          <div className="font-sans text-xl sm:text-2xl font-normal tracking-tighter text-[#002200]">
            GlobeTrotter
          </div>

          <div className="hidden md:flex gap-8 items-center text-sm font-normal text-[#2b4f24]">
            <a
              href="#trips"
              className="hover:text-[#002200] transition-colors"
            >
              Trips
            </a>
            <a
              href="#discover"
              className="text-[#002200] font-normal border-b border-[#002200] pb-0.5"
            >
              Discover
            </a>
            <a
              href="#concierge"
              onClick={(e) => {
                e.preventDefault();
                setIsContactModalOpen(true);
              }}
              className="hover:text-[#002200] transition-colors"
            >
              Concierge
            </a>
          </div>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="bg-[#020202] text-white px-5 py-2.5 rounded-full text-xs font-normal hover:bg-neutral-800 transition-opacity flex items-center gap-2"
          >
            <span>Get in touch</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </button>
        </nav>
      </header>

      {/* --- Main Body --- */}
      <main className="flex-1">
        {/* --- Hero Section (Obsidian Canvas) --- */}
        <section className="w-full bg-[#131313] pt-32 sm:pt-36 pb-24 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Decorative Giant Hero Display Text - Dynamic Fluid Width (No Clipping) */}
          <div className="w-full max-w-[1200px] px-6 relative z-0 flex justify-center items-center pointer-events-none select-none overflow-hidden">
            <h1 className="font-sans text-[16vw] sm:text-[18vw] lg:text-[220px] font-normal leading-none text-white/5 tracking-tighter text-center uppercase whitespace-nowrap">
              DREAM
            </h1>
          </div>

          {/* Functional Headline & Primary Action */}
          <div className="relative z-10 text-center flex flex-col items-center -mt-8 sm:-mt-16 md:-mt-24 px-6 max-w-4xl">
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extralight text-white tracking-tight mb-8 leading-tight">
              Your World, Curated
            </h2>

            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="bg-[#38a454] text-white px-8 py-3.5 rounded-[10px] text-sm font-normal hover:bg-[#2d9b4c] transition-opacity cursor-pointer inline-flex items-center gap-2"
            >
              <span>Plan New Trip</span>
            </button>
          </div>

          {/* Horizontal Scroll Service/Destination Cards */}
          <div className="w-full mt-20 overflow-x-auto hide-scrollbar snap-x snap-mandatory">
            <div className="flex gap-6 px-6 sm:px-12 md:px-24 w-max mx-auto pb-4">
              {(heroCards || []).map((card) => (
                <div
                  key={card.id}
                  onClick={() => setIsPlanModalOpen(true)}
                  className="w-[300px] sm:w-[380px] h-[480px] sm:h-[530px] bg-[#1f1f1f] rounded-none relative snap-center flex-shrink-0 group overflow-hidden border border-[#353535] cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />

                  <div className="absolute top-6 left-6 z-10">
                    <span className="text-xs text-white border border-white/30 px-3.5 py-1.5 rounded-full backdrop-blur-sm font-normal">
                      {card.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 z-10 text-left">
                    <h3 className="font-serif text-2xl text-white font-light mb-1">
                      {card.title}
                    </h3>
                    <p className="font-sans text-xs text-neutral-300 opacity-90 line-clamp-2">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Middle Section (Linen Cream Canvas #e4e9dc) --- */}
        <section id="discover" className="w-full bg-[#e4e9dc] text-[#020202] py-24 sm:py-32 flex flex-col items-center">
          <div className="w-full max-w-[1200px] px-6 sm:px-8">
            {/* Journal Header */}
            <div className="mb-12">
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-[#020202]">
                The Travel Journal
              </h2>
            </div>

            {/* Featured Editorial Article */}
            <article
              onClick={() => setIsPlanModalOpen(true)}
              className="flex flex-col md:flex-row border border-[#020202]/10 bg-[#ffffff] mb-24 group cursor-pointer transition-colors duration-300 hover:border-[#020202]/30"
            >
              <div className="w-full md:w-1/2 relative min-h-[360px] sm:min-h-[440px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuTLsGsIx7aeU2LkxJvZGM4Ba-z39e-W0jvT-tq5S817QsvAZTQqumwWmzUC5jnOUDZX5w_OCTbU3cY7tyOHnvnQ6iRAYxKNSk506A2HnLa1ujasOQ8yfL4DOrh1WBpEN2QlSwbQnI5wXEztnIols0HTUMsSj_8CQF72EeIXaaiRKNO-DcrmFEltLjW6xwVBHfHNFzTxsx7ElPIZ_m9142elJ27YvsMmqwMe1mrHFmZX7Q0sAjkOh8"
                  alt="Aegean Travel"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between bg-[#ffffff]">
                <div>
                  <div className="mb-6">
                    <span className="text-xs font-normal text-[#38a454] border border-[#38a454] px-4 py-1 rounded-full uppercase tracking-wider">
                      Editor&apos;s Pick
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#020202] font-light leading-snug mb-6 pr-4">
                    Navigating the Aegean: A Masterclass in Slow Travel
                  </h3>

                  <p className="font-sans text-sm sm:text-base text-[#020202]/70 leading-relaxed mb-8">
                    Discover the hidden coves and ancient rhythms of the Greek Isles, where time expands and luxury is found in the simplicity of sun, sea, and locally sourced perfection.
                  </p>
                </div>

                <div className="pt-6 border-t border-[#020202]/10 flex justify-between items-center">
                  <span className="font-sans text-xs text-[#020202]/50">8 Min Read</span>
                  <div className="w-11 h-11 rounded-full border border-[#020202] flex items-center justify-center group-hover:bg-[#020202] group-hover:text-[#ffffff] transition-colors">
                    <IconArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </article>

            {/* Curated Itineraries Section Header */}
            <div id="trips" className="mb-8 border-b border-[#020202]/10 pb-4">
              <h3 className="font-sans text-2xl sm:text-3xl text-[#020202] font-normal tracking-tight">
                Curated Itineraries
              </h3>
            </div>

            {/* Curated Itineraries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-28">
              {(itineraries || []).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItinerary(item);
                    setIsPlanModalOpen(true);
                  }}
                  className="group block bg-[#ffffff] border border-[#020202]/10 hover:border-[#020202]/30 transition-colors p-6 flex flex-col h-full relative cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full relative mb-6 overflow-hidden bg-[#efefe7]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-[#020202]/80 text-white text-[11px] px-3 py-1 rounded-full font-sans">
                      {item.days}
                    </div>
                  </div>

                  <span className="text-[11px] uppercase tracking-widest text-[#020202]/50 font-normal mb-1">
                    {item.location}
                  </span>
                  <h4 className="font-serif text-2xl text-[#020202] font-light mb-2">
                    {item.title}
                  </h4>
                  <p className="font-sans text-xs text-[#020202]/60 leading-relaxed flex-grow">
                    {item.subtitle}
                  </p>

                  <div className="mt-6 pt-4 border-t border-[#020202]/10 flex items-center justify-between text-xs text-[#020202] font-normal group-hover:text-[#2d9b4c] transition-colors">
                    <span>Explore Itinerary</span>
                    <IconArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>

            {/* --- The Art of Curation (Pure Editorial Magazine Chapters) --- */}
            <div className="pt-16 border-t border-[#020202]/15">
              <div className="max-w-3xl mb-16">
                <span className="text-xs uppercase tracking-widest text-[#2d9b4c] font-normal block mb-2">
                  Editorial Standard
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#020202] font-light leading-tight">
                  The Art of Discreet Luxury
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {editorialChapters.map((chapter) => (
                  <div key={chapter.number} className="border-t border-[#020202]/20 pt-6">
                    <span className="font-serif text-3xl text-[#020202]/30 font-light block mb-4">
                      {chapter.number}
                    </span>
                    <h4 className="font-sans text-lg font-normal text-[#020202] mb-3">
                      {chapter.title}
                    </h4>
                    <p className="font-sans text-xs text-[#020202]/65 leading-relaxed">
                      {chapter.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer Component --- */}
      <footer className="w-full py-12 px-6 sm:px-12 bg-[#0e0e0e] border-t border-[#353535] flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#becabb]">
        <div className="font-sans text-2xl font-normal text-[#e2e2e2] tracking-tighter">
          GlobeTrotter
        </div>

        <nav className="flex flex-wrap justify-center gap-8 font-normal">
          <a href="#" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Sustainability
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsContactModalOpen(true);
            }}
            className="hover:text-white transition-colors"
          >
            Contact Private Office
          </a>
        </nav>

        <div className="text-center md:text-right text-neutral-500 font-normal">
          © 2026 GlobeTrotter Luxury Travel Planning. All rights reserved.
        </div>
      </footer>

      {/* --- Plan New Trip Modal --- */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="bg-[#191919] border border-neutral-800 text-white max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-light text-white">
              {selectedItinerary ? `Reserve ${selectedItinerary.title}` : "Plan Your Itinerary"}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400 font-sans">
              Provide your details below to receive a private consultation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="destination" className="text-xs text-neutral-300 font-normal">
                Destination
              </Label>
              <Input
                id="destination"
                placeholder="e.g. Kyoto or Amalfi Coast"
                className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-[#38a454]"
                {...planForm.register("destination")}
              />
              {planForm.formState.errors.destination && (
                <p className="text-xs text-red-400">
                  {planForm.formState.errors.destination.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="travelerCount" className="text-xs text-neutral-300 font-normal">
                  Guests
                </Label>
                <Input
                  id="travelerCount"
                  type="number"
                  min={1}
                  max={20}
                  className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-[#38a454]"
                  {...planForm.register("travelerCount")}
                />
                {planForm.formState.errors.travelerCount && (
                  <p className="text-xs text-red-400">
                    {planForm.formState.errors.travelerCount.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dates" className="text-xs text-neutral-300 font-normal">
                  Dates
                </Label>
                <Input
                  id="dates"
                  placeholder="e.g. Summer 2026"
                  className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-[#38a454]"
                  {...planForm.register("dates")}
                />
                {planForm.formState.errors.dates && (
                  <p className="text-xs text-red-400">
                    {planForm.formState.errors.dates.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-neutral-300 font-normal">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@domain.com"
                className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-[#38a454]"
                {...planForm.register("email")}
              />
              {planForm.formState.errors.email && (
                <p className="text-xs text-red-400">
                  {planForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full bg-[#38a454] hover:bg-[#2d9b4c] text-white font-normal text-sm py-2.5 transition-colors cursor-pointer"
              >
                Request Consultation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Concierge Contact Modal --- */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="bg-[#191919] border border-neutral-800 text-white max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-light text-white">
              Private Concierge Office
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400 font-sans">
              Direct access for private charters, resort buyouts, and custom arrangements.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name" className="text-xs text-neutral-300 font-normal">
                Full Name
              </Label>
              <Input
                id="contact-name"
                placeholder="Full Name"
                className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-[#38a454]"
                {...contactForm.register("name")}
              />
              {contactForm.formState.errors.name && (
                <p className="text-xs text-red-400">
                  {contactForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-email" className="text-xs text-neutral-300 font-normal">
                Email Address
              </Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="name@domain.com"
                className="bg-neutral-900 border-neutral-800 text-sm focus-visible:ring-[#38a454]"
                {...contactForm.register("email")}
              />
              {contactForm.formState.errors.email && (
                <p className="text-xs text-red-400">
                  {contactForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs text-neutral-300 font-normal">
                Private Request
              </Label>
              <textarea
                id="message"
                rows={3}
                placeholder="Specify your private travel requirement..."
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-3 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38a454]"
                {...contactForm.register("message")}
              />
              {contactForm.formState.errors.message && (
                <p className="text-xs text-red-400">
                  {contactForm.formState.errors.message.message}
                </p>
              )}
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full bg-[#020202] hover:bg-neutral-800 text-white font-normal text-sm py-2.5 transition-colors border border-neutral-700 cursor-pointer"
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
