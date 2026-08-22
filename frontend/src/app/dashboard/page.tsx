"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { AuthGuard } from "@/components/auth/auth-guard";
import { BoardingPassCard } from "@/components/editorial/boarding-pass-card";
import { IconPlus, IconArrowRight, IconChartBar } from "@tabler/icons-react";
import { useAuth } from "@/context/auth-context";
import { useTrips } from "@/hooks/use-trips";
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
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email address required"),
  message: z.string().min(10, "Inquiry details required"),
});
type ContactForm = z.infer<typeof contactSchema>;

export default function DashboardPage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { profile } = useAuth();
  const { data: trips, isLoading: tripsLoading } = useTrips();

  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onContactSubmit = (data: ContactForm) => {
    toast.success("Concierge inquiry sent", {
      description: `Thank you, ${data.name}. Our private office will be in touch shortly.`,
    });
    contactForm.reset();
    setIsContactModalOpen(false);
  };

  const userName = profile?.first_name || profile?.full_name?.split(" ")[0] || "Traveler";

  // Filter trips into ongoing/upcoming (you could add logic based on dates)
  const activeTrips = trips?.filter(t => t.status !== "cancelled" && t.status !== "completed") || [];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200] relative overflow-x-hidden">
      <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />

      <main className="flex-1">
        {/* --- Hero Section (Magazine Cover) --- */}
        <section className="w-full h-screen relative flex flex-col justify-end pb-24 px-6 md:px-12">
          <div className="absolute inset-0 z-0">
            <div 
              className="bg-cover bg-center w-full h-full" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwnD1-4L43ChzSWI6AfipFqVKjiRiupQn4oMd6FqwqVdAUWiYPFdn98FEw10AVWYX5_v2cF3lhahRxCgk9gAhdRvw3O4Pj9msn1ZPn65B1qfoUDndJRV-udl5cjF9rTD0hjOXuPde_8GeyRHt2E3tWP951Cr1GQ_9cIGgPTe8RWjS-JvTOLBGPaZvccIZHuDF0pQHYXF14chmntg9pdQLkjTAesyeh3jZhNfpC_fNvnjKpocks44h-')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/40 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto w-full flex flex-col items-start pt-32">
            <h1 className="font-serif text-[80px] md:text-[180px] leading-none text-white mb-6 font-thin tracking-tighter mix-blend-overlay opacity-90">
              Welcome, {userName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <Link 
                href="/itinerary/new" 
                className="bg-[#2d9b4c] text-white px-8 py-3.5 rounded-[10px] font-sans text-sm flex items-center gap-2 hover:bg-[#38a454] transition-colors duration-300 cursor-pointer"
              >
                <IconPlus className="w-4 h-4" />
                <span>Plan New Trip</span>
              </Link>

              <Link 
                href="/profile" 
                className="bg-transparent border border-white/60 text-white px-8 py-3.5 rounded-[10px] font-sans text-sm flex items-center gap-2 hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer backdrop-blur-sm"
              >
                <IconChartBar className="w-4 h-4" />
                <span>Budget & Cost Breakdown</span>
              </Link>
            </div>
          </div>
        </section>

        {/* --- Recent Trips (Boarding Pass Aesthetic) --- */}
        <section className="w-full pt-32 pb-32 pl-6 md:pl-12 bg-[#131313] relative z-20 -mt-10 rounded-t-[40px]">
          <div className="max-w-[1200px] mx-auto mb-12 pr-6 md:pr-12 flex justify-between items-end">
            <EditorialHeading className="text-4xl text-white">Your Active Itineraries</EditorialHeading>
            <Link 
              className="font-sans text-sm text-[#72dc85] border-b border-[#72dc85] pb-1 hover:text-white hover:border-white transition-colors flex items-center gap-1" 
              href="/discover"
            >
              <span>Explore Destinations</span>
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-8 overflow-x-auto hide-scrollbar snap-x snap-mandatory pr-6 md:pr-12 pb-8">
            {tripsLoading ? (
              <div className="text-white/50 text-sm font-sans tracking-widest uppercase">Loading Itineraries...</div>
            ) : activeTrips.length === 0 ? (
              <div className="text-white/50 text-sm font-sans flex flex-col gap-4">
                <p>You have no active itineraries.</p>
                <Link href="/itinerary/new" className="text-[#72dc85] underline underline-offset-4">Plan a new trip</Link>
              </div>
            ) : (
              activeTrips.map((trip) => {
                const start = trip.start_date ? new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase() : "TBD";
                return (
                  <BoardingPassCard 
                    key={trip.id} 
                    flight={`GT-${trip.id.substring(0, 3).toUpperCase()}`}
                    destination={trip.title}
                    date={start}
                    passenger={`${userName} W.`}
                    fromCode="HOME"
                    toCode="DEST"
                    gate="-"
                    seat="-"
                    image={trip.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCd7xK0uE-xLZhJWei4l7EOhJfnBX9LmC97HJO_xmZog8GRUArXTJSlXIuQCJSVasHkxlUIBiyEyuhz59VC_g084l5Wd7xBX9oCS66g6eeJUBGbfdyyREy44noJj2yzFk58X5VA_hPwLXtUMq_hK194wDtwjngRWY6t5e_1zuigFhruBtki5G2vpLIuyERbU3I4fvUY9agKmfpWhl4R3ulfFyoAniL9_ZhHLVUQWKPIA51C0gwdfEFO"}
                    href={`/itinerary/${trip.id}`}
                  />
                );
              })
            )}
          </div>
        </section>

        {/* --- Lower Section (Linen Cream Editorial) --- */}
        <section className="w-full bg-[#e4e9dc] text-[#020202] py-32 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#020202] pb-6">
              <EditorialHeading as="h2" className="text-5xl font-thin tracking-tight">Travel Journal</EditorialHeading>
              <Link href="/discover" className="font-sans text-sm uppercase tracking-widest text-[#020202]/60 hover:text-[#020202] transition-colors mt-4 md:mt-0">
                Browse All Stories →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
              {/* Editorial Entry 1 */}
              <Link href="/discover" className="flex flex-col group cursor-pointer">
                <div className="w-full h-[500px] relative overflow-hidden mb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7VhEL_ibS-oIt6bj3KTRzWfnLpd7qkWydMAsaW41_zeYFambkBiVvLMkwpG9xr3WRJTinNl-uYqqrHiBBJHBcIBvr4eHXLbkNjZm7Lj2fDGSX5rNAkFIngsE59dAN2Z6Z787RS0CWohOXzY2TSgioMQxYezH6kFJBLjTWDuoVc-pNMCPvDC7kTiR8aafEn4FzS-x1vc78UGzmcAk6uGyymr8lZvZIcRMjcu9A6VD_usa4YKqTyiT3" alt="Moroccan tilework" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
                <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-sans text-xs uppercase tracking-widest text-[#020202]/60">Architecture</span>
                    <div className="h-px bg-[#020202]/20 flex-grow"></div>
                    <span className="font-sans text-xs uppercase tracking-widest text-[#020202]/60">Vol. IV</span>
                  </div>
                  <EditorialHeading as="h3" className="text-5xl leading-none mb-6">The Colors of Marrakech</EditorialHeading>
                  <p className="font-sans text-sm text-[#020202]/70 font-light italic border-l-2 border-[#020202] pl-6">
                    Immerse yourself in the vibrant souks and historic riads, where every geometric pattern tells a centuries-old story of craftsmanship.
                  </p>
                </div>
              </Link>

              {/* Editorial Entry 2 */}
              <Link href="/discover" className="flex flex-col group cursor-pointer md:mt-24">
                <div className="w-full h-[500px] relative overflow-hidden mb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaNr4mKX4dToTE2HZdZ_SNs9DJKycwZmTIkZBfSEyDEIcnEOuGmxJxEWbQyE9LkEyupbKT6LxKPlpR2xSinMRdPBdZEZiyfLNB3bVphepR4uK2hQvTpyJs3D3zUb16z10gTq3fpIA1XCHZUJL0TCtjAHW3_zcyZAeVJpH71HEdyQbcH9L2BW_Nr5S4wECy5ZsGLoBFA-fpwWrSQwqNVfl_9trmOlnrwCIYpbEL7YL8bEEs4KpgQrMW" alt="Scottish Highlands" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
                <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-sans text-xs uppercase tracking-widest text-[#020202]/60">Wilderness</span>
                    <div className="h-px bg-[#020202]/20 flex-grow"></div>
                    <span className="font-sans text-xs uppercase tracking-widest text-[#020202]/60">Vol. V</span>
                  </div>
                  <EditorialHeading as="h3" className="text-5xl leading-none mb-6">Highland Whispers</EditorialHeading>
                  <p className="font-sans text-sm text-[#020202]/70 font-light italic border-l-2 border-[#020202] pl-6">
                    Discover the rugged beauty and serene isolation of Scotland, traversing dark lochs and heather-clad hills under dramatic skies.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer onContactClick={() => setIsContactModalOpen(true)} />

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
    </AuthGuard>
  );
}
