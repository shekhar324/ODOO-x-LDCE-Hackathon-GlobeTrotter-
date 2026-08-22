"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { IconPlaneArrival, IconBed, IconToolsKitchen2, IconTrain, IconBuildingMonument, IconMail, IconLink, IconArrowLeft } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams } from "next/navigation";
import { useItinerary } from "@/hooks/use-itinerary";

const contactSchema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email address required"),
  message: z.string().min(10, "Inquiry details required"),
});
type ContactForm = z.infer<typeof contactSchema>;

export default function PublicItineraryView() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  const { data, isLoading } = useItinerary(tripId);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  const handleCopyTrip = () => {
    toast.success("Itinerary Copied to Builder", {
      description: "You can now edit and customize this trip in your Itinerary Builder.",
    });
    router.push("/itinerary/new");
  };

  const handleShareLink = () => {
    toast.success("Link Copied to Clipboard", {
      description: "Public itinerary URL is ready to share.",
    });
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
      
      {/* Persistent Navigation Pill (TopNavBar) */}
      <div className={`transition-transform duration-300 ${isNavVisible ? 'translate-y-0' : '-translate-y-[150%]'} fixed top-0 left-0 right-0 z-50`}>
        <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />
      </div>

      {/* Main Content Canvas */}
      <main className="w-full">
        {/* Hero Section (Dark Canvas) */}
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
                style={{ backgroundImage: `url('${data.trip.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuB-XusGtLDp62pNDiNNKIfj47j_juooJIdvYb4DHVlOn0IIR9ZCh3jPnD3raL1PtOlhjWHf5sqvFpC3C9iy7fjaAHqiR1LzSoaBEhgAHZFUksHoOPEApjBLdJ9sKmj4pdTHWizDaI--wHto8TrXm8MYf6wCvgTD_pfADcxfacqW62eK6HAYBP3Gu_V76Z3dDqF-Zx4R4OOF3Ti08WOkp8QyiFTTwfvdWxSJNd2uDouyuPfc2F6IFPZp"}')` }}
              ></div>
              {/* Gradient Overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0e0e0e]/70"></div>
              
              {/* Hero Content */}
              <div className="relative z-10 w-full max-w-[1200px] mx-auto h-full flex flex-col justify-end px-6 md:px-12 pb-16 pt-[200px]">
                <div className="mb-6">
                  <Link href="/discover" className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors">
                    <IconArrowLeft className="w-4 h-4" />
                    <span>Explore More Trips</span>
                  </Link>
                </div>

                <div className="flex flex-col gap-4 max-w-3xl">
                  {/* Tags */}
                  <div className="flex gap-4 mb-2">
                    <span className="px-5 py-2 rounded-full border border-white text-white font-sans text-[12px] uppercase tracking-widest">
                      {data.stops.length > 0 ? data.stops[0].cities?.country : "Global"}
                    </span>
                    <span className="px-5 py-2 rounded-full border border-white text-white font-sans text-[12px] uppercase tracking-widest">
                      {data.stops.length} Stops
                    </span>
                  </div>
                  {/* Heading (Serif) */}
                  <EditorialHeading className="text-[53px] md:text-[80px] leading-none font-thin text-white tracking-tight">
                    {data.trip.title}
                  </EditorialHeading>
                  {/* Subheading */}
                  <p className="font-sans text-[23px] leading-[1.4] text-[#e2e2e2] mt-4 max-w-2xl">
                    {data.trip.description || "A meticulously curated journey through stunning destinations."}
                  </p>
                </div>
              </div>
            </section>

            {/* Itinerary Details Section (Light Canvas - Linen Cream) */}
            <section className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-32">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                
                {/* Left Column: Timeline */}
                <div className="md:col-span-8 flex flex-col gap-16">
                  
                  {data.stops.map((stop: any, stopIndex: number) => (
                    <div key={stop.id} className="bg-[#efefe7] p-10 border border-[#0e0e0e] flex flex-col gap-6 relative">
                      <div className="flex justify-between items-start border-b border-[#0e0e0e] pb-4">
                        <div>
                          <h3 className="font-sans text-[39px] leading-[1.2] text-[#0e0e0e]">
                            Stop {stopIndex + 1}: {stop.cities?.name}
                          </h3>
                          <p className="font-sans text-[16px] text-[#0e0e0e]/70 mt-1">
                            {stop.arrival_date ? new Date(stop.arrival_date).toLocaleDateString() : "Date TBD"}
                          </p>
                        </div>
                        <span className="font-sans text-[20px] border border-[#0e0e0e] px-4 py-1 rounded-full text-[#0e0e0e]">
                          {stop.cities?.country || "Destination"}
                        </span>
                      </div>
                      
                      {stop.activities.length === 0 ? (
                        <div className="py-8 text-center text-[#0e0e0e]/50 font-sans italic">
                          No specific activities planned for this stop yet.
                        </div>
                      ) : (
                        stop.activities.map((act: any, actIndex: number) => (
                          <div key={act.id} className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4 pb-10 border-b border-[#0e0e0e]/20 last:border-0 last:pb-0">
                            <div className="flex flex-col gap-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                alt={act.custom_title || act.activities?.name} 
                                className="w-full h-64 object-cover border border-[#0e0e0e]" 
                                src={act.activities?.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDX8GoF3rdnrnVGYNn5rGoQQj2tfOCIWoCGQLbWwwu0U1K1R3ZBKmSXiwe7wuU_p4MURdYNSNXvY1t-CjXf85Dbg_8TFr6Pl0az53ypI9Y3_gpXFWVXEL-qU0fzoxMzqexikpLSlkkrvz2Jjn0JRFy_z4wLQaem7Xv22xHlGu4AByHElNoU5Gz7eT7BoGYorQASdoWOH2R6ZdJhHFg136Gl2BSyB0w3Y0mJfVTOKj6lcDm5rY3JZJ24"}
                              />
                              <p className="font-sans text-[16px] leading-[1.5] text-[#0e0e0e]">
                                {act.custom_description || act.activities?.description || "Experience the best of what this destination has to offer."}
                              </p>
                            </div>
                            <div className="flex flex-col gap-4 justify-between">
                              <ul className="flex flex-col gap-4 font-sans text-[16px] text-[#0e0e0e]">
                                <li className="flex items-center gap-4">
                                  <IconBuildingMonument className="w-5 h-5 text-[#0e0e0e]" />
                                  <span className="font-bold">{act.custom_title || act.activities?.name || "Activity"}</span>
                                </li>
                                <li className="flex items-center gap-4">
                                  <IconToolsKitchen2 className="w-5 h-5 text-[#0e0e0e]" />
                                  {act.activities?.category || "General"}
                                </li>
                              </ul>
                              <div className="mt-auto pt-6 border-t border-[#0e0e0e] flex justify-between items-center font-sans text-[20px] text-[#0e0e0e]">
                                <span>Est. Cost</span>
                                <span>${act.estimated_cost || "---"}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>

                {/* Right Column: Summary & Actions */}
                <div className="md:col-span-4 flex flex-col gap-16">
                  
                  {/* Trip Summary Card */}
                  <div className="bg-[#0e0e0e] text-white p-10 flex flex-col gap-6 sticky top-32">
                    <EditorialHeading as="h4" className="text-[39px] text-white mb-4">Itinerary Brief</EditorialHeading>
                    
                    <div className="flex flex-col gap-4 font-sans text-[16px] border-b border-white/20 pb-6">
                      <div className="flex justify-between">
                        <span className="text-[#e2e2e2]">Status</span>
                        <span className="uppercase">{data.trip.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#e2e2e2]">Start Date</span>
                        <span>{data.trip.start_date ? new Date(data.trip.start_date).toLocaleDateString() : "TBD"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#e2e2e2]">Est. Total</span>
                        <span>${data.trip.budget?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                    
                    <p className="font-sans text-[16px] text-[#e2e2e2] italic">
                      Curated by GlobeTrotter AI Concierge.
                    </p>
                
                {/* Primary CTA */}
                <button 
                  onClick={handleCopyTrip}
                  className="bg-[#2d9b4c] text-white rounded-[10.08px] px-10 py-4 font-sans text-[20px] hover:opacity-90 transition-opacity mt-6 w-full cursor-pointer"
                >
                  Copy This Trip
                </button>

                <Link 
                  href="/profile" 
                  className="border border-white/30 text-white rounded-[10.08px] px-10 py-3 font-sans text-sm text-center hover:bg-white hover:text-black transition-colors"
                >
                  View Cost Breakdown
                </Link>
                
                {/* Social Share (1px Outline minimal) */}
                <div className="flex justify-center gap-6 mt-2 pt-6 border-t border-white/20">
                  <button 
                    onClick={() => setIsContactModalOpen(true)}
                    className="w-10 h-10 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#0e0e0e] transition-colors cursor-pointer" 
                    title="Email Concierge"
                  >
                    <IconMail className="w-5 h-5" stroke={1.5} />
                  </button>
                  <button 
                    onClick={handleShareLink}
                    className="w-10 h-10 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#0e0e0e] transition-colors cursor-pointer" 
                    title="Copy Share Link"
                  >
                    <IconLink className="w-5 h-5" stroke={1.5} />
                  </button>
                </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="relative w-full h-screen bg-[#0e0e0e] text-white flex items-center justify-center font-sans uppercase tracking-widest text-sm text-[#93000a]">
            Failed to load itinerary
          </section>
        )}
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
  );
}
