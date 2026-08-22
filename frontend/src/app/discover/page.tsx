"use client";

import React, { useState } from "react";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { DestinationCard } from "@/components/editorial/destination-card";
import { IconSearch, IconChevronDown, IconAdjustmentsHorizontal, IconSortAscending } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCities } from "@/hooks/use-discover";

const contactSchema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email address required"),
  message: z.string().min(10, "Inquiry details required"),
});
type ContactForm = z.infer<typeof contactSchema>;

export default function DiscoverPage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: cities, isLoading } = useCities(searchQuery);

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

  return (
    <div className="min-h-screen bg-[#e4e9dc] text-[#020202] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
      <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          {/* Header Section */}
          <header className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-8 mt-12">
            <div>
              <EditorialHeading className="text-5xl md:text-7xl mb-4 font-thin tracking-tight">Discover Destinations</EditorialHeading>
              <p className="font-sans text-xl text-[#020202]/70 max-w-2xl">
                Curated experiences across the globe, tailored for the discerning traveler.
              </p>
            </div>
            
            {/* Search & Filter Bar */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-[300px]">
                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#020202]/50 w-5 h-5" />
                <input 
                  className="w-full bg-[#efefe7] border border-[#020202] rounded-full py-3 pl-12 pr-4 text-[#020202] focus:outline-none focus:ring-1 focus:ring-[#38a454] font-sans text-sm placeholder:text-[#020202]/40 transition-colors" 
                  placeholder="Search cities, activities..." 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
                <button className="px-5 py-2 border border-[#020202] rounded-full text-[#020202] hover:bg-[#020202] hover:text-white transition-colors font-sans text-sm flex items-center gap-2 whitespace-nowrap">
                  Group by <IconChevronDown className="w-4 h-4" />
                </button>
                <button className="px-5 py-2 border border-[#020202] rounded-full text-[#020202] hover:bg-[#020202] hover:text-white transition-colors font-sans text-sm flex items-center gap-2 whitespace-nowrap">
                  Filter <IconAdjustmentsHorizontal className="w-4 h-4" />
                </button>
                <button className="px-5 py-2 border border-[#020202] rounded-full text-[#020202] hover:bg-[#020202] hover:text-white transition-colors font-sans text-sm flex items-center gap-2 whitespace-nowrap">
                  Sort <IconSortAscending className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {isLoading ? (
              <div className="col-span-1 md:col-span-2 py-12 flex justify-center text-[#020202]/50 font-sans tracking-widest text-sm uppercase">
                Searching Destinations...
              </div>
            ) : cities && cities.length > 0 ? (
              cities.map(city => {
                const costMap = ["Budget", "Affordable", "Moderate", "High", "Ultra Luxury"];
                const mappedCost = city.cost_index ? costMap[city.cost_index - 1] : "Moderate";
                return (
                  <DestinationCard 
                    key={city.id} 
                    id={city.id.toString()}
                    title={city.name}
                    location={city.country}
                    description={city.description || "Discover an exceptional travel destination."}
                    image={city.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCQxJzRKGuEnHRXK1O2BqVzZfal-5Vf2neRjGcfbHfphvZigbn7ar8SdbWRyBzn90MExYW5OpOr_d9t8amzvTS6WbPB9kqvvfdZa4ck92bxTUvyFia8hJcfriuLijnhuJ8t6Ok5oopNJGGPx4QkstJ-qPYF7b7BT2sU3T8XIpnidjrx0QIjIg07qnZrh-Xtc9vE1Ah7A6KbufpymueJe1R5zLbqlKV2HKByhnfnozg75zlVVUHBN60d"}
                    tags={["Destination", mappedCost]}
                    costIndex={mappedCost}
                    popularity={city.popularity_score ? `${city.popularity_score}%` : "90%"}
                  />
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 py-12 flex justify-center text-[#020202]/50 font-sans">
                No destinations found for your search.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-16 flex justify-center items-center gap-6">
            <button className="w-12 h-12 rounded-full border border-[#020202] flex items-center justify-center text-[#020202] hover:bg-[#020202] hover:text-white transition-colors opacity-50 cursor-not-allowed">
              <span className="sr-only">Previous Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="font-sans text-sm text-[#020202] flex gap-4">
              <span className="border-b border-[#020202] pb-1">1</span>
              <span className="text-[#020202]/50 hover:text-[#020202] cursor-pointer transition-colors">2</span>
              <span className="text-[#020202]/50 hover:text-[#020202] cursor-pointer transition-colors">3</span>
              <span className="text-[#020202]/50">...</span>
            </div>
            <button className="w-12 h-12 rounded-full border border-[#020202] flex items-center justify-center text-[#020202] hover:bg-[#020202] hover:text-white transition-colors">
              <span className="sr-only">Next Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
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
