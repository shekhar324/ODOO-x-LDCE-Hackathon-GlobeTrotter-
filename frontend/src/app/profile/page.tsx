"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { IconStarFilled, IconArrowRight, IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export default function ProfilePage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
    <AuthGuard>
      <div className="bg-[#e4e9dc] text-[#020202] min-h-screen font-sans selection:bg-[#38a454] selection:text-white pt-24 pb-16">
      <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />

      {/* Main Content Container */}
      <main className="max-w-[1200px] mx-auto mt-24 px-6 lg:px-0 flex flex-col gap-32">
        
        {/* Profile Header Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="col-span-1 md:col-span-4 flex justify-center md:justify-start">
            <div className="w-48 h-48 rounded-full border border-[#020202] overflow-hidden p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                className="w-full h-full object-cover rounded-full" 
                alt="Eleanor Vance" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQXweEahHINIjm8wTk4JDPQ0oFqvkq_ylbrP9KZOVM3ErdkvsYfN-O3nhE6xnTr7U5DL98bVwQkNAVMsikB8LxTE735JTAOKStWBVQypt02_sCz75D4HF-eoeBgS_GiHgjyz8TCHr9LOXQUHfjXp014OEWPOMMyq0wmv0OK7cN6mSlrcAZgS7-9y6G5yQsrAwRH9jxotAX3H66zQfY-5KG2ZQQr3WHmspM4vVx1k2t9HLYX-qV_7oH" 
              />
            </div>
          </div>
          <div className="col-span-1 md:col-span-8 flex flex-col gap-4">
            <EditorialHeading className="text-[53px] leading-[1.1] text-[#020202]">Eleanor Vance</EditorialHeading>
            <div className="flex flex-col gap-2 mt-6">
              <div className="flex items-center gap-4">
                <span className="font-sans text-[14px] text-[#3e4a3e] w-32 uppercase tracking-widest">Email</span>
                <span className="font-sans text-[23px] text-[#020202]">eleanor.vance@example.com</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-sans text-[14px] text-[#3e4a3e] w-32 uppercase tracking-widest">Status</span>
                <span className="font-sans text-[23px] text-[#020202] flex items-center gap-2">
                  <IconStarFilled className="w-5 h-5 text-[#38a454]" />
                  Elite Voyager
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-sans text-[14px] text-[#3e4a3e] w-32 uppercase tracking-widest">Member Since</span>
                <span className="font-sans text-[23px] text-[#020202]">October 2021</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-10">
              <button 
                onClick={() => toast.info("Profile settings opened")}
                className="bg-[#020202] text-white rounded-full px-10 py-4 font-sans text-[20px] hover:opacity-80 transition-opacity border border-[#020202] cursor-pointer"
              >
                Edit Profile
              </button>
              <Link 
                href="/dashboard"
                className="bg-transparent text-[#020202] rounded-full px-10 py-4 font-sans text-[20px] hover:bg-[#020202] hover:text-white transition-colors border border-[#020202] cursor-pointer"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Preplanned Trips / Itineraries (Bento Style) */}
        <section className="flex flex-col gap-10">
          <div className="flex justify-between items-end border-b border-[#020202] pb-4">
            <h2 className="font-sans text-[43px] leading-[1.1] text-[#020202]">Active Itineraries</h2>
            <Link className="font-sans text-[20px] text-[#020202] flex items-center gap-2 hover:opacity-60 transition-opacity" href="/dashboard">
              View Dashboard <IconArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Itinerary Card 1 */}
            <Link 
              href="/itinerary/kyoto-autumn-retreat"
              className="bg-[#efefe7] border border-[#020202] p-10 flex flex-col justify-between min-h-[300px] group cursor-pointer hover:bg-[#393939] hover:text-white transition-colors rounded-[15.04px]"
            >
              <div>
                <span className="font-sans text-[12px] uppercase tracking-widest border border-current rounded-full px-4 py-1 mb-6 inline-block">Upcoming</span>
                <EditorialHeading as="h3" className="text-[39px] mt-4 mb-2 group-hover:text-white transition-colors">Kyoto Autumn</EditorialHeading>
                <p className="font-sans text-[16px] opacity-80">Nov 12 - Nov 24, 2026</p>
              </div>
              <div className="flex justify-between items-center mt-16">
                <span className="font-sans text-[16px]">4 Guests</span>
                <IconArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
            
            {/* Itinerary Card 2 */}
            <Link 
              href="/build"
              className="bg-[#020202] text-white p-10 flex flex-col justify-between min-h-[300px] group cursor-pointer rounded-[15.04px]"
            >
              <div>
                <span className="font-sans text-[12px] uppercase tracking-widest border border-[#889486] text-[#8efa9e] rounded-full px-4 py-1 mb-6 inline-block">Planning</span>
                <EditorialHeading as="h3" className="text-[39px] mt-4 mb-2 text-white">Amalfi Coast</EditorialHeading>
                <p className="font-sans text-[16px] text-[#becabb]">May 05 - May 15, 2026</p>
              </div>
              <div className="flex justify-between items-center mt-16">
                <span className="font-sans text-[16px] text-[#becabb]">2 Guests</span>
                <IconArrowRight className="w-6 h-6 text-[#8efa9e] group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
            
            {/* Action Card */}
            <Link 
              href="/build"
              className="bg-transparent border border-[#020202] p-10 flex flex-col justify-center items-center min-h-[300px] group cursor-pointer hover:bg-[#353535] hover:text-white hover:border-[#353535] transition-colors text-center border-dashed rounded-[15.04px]"
            >
              <IconPlus className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" stroke={1.5} />
              <h3 className="font-sans text-[39px] leading-[1.2]">New Trip</h3>
              <p className="font-sans text-[16px] opacity-70 mt-2">Start a blank canvas</p>
            </Link>
          </div>
        </section>

        {/* Previous Trips (Horizontal Scroll) */}
        <section className="flex flex-col gap-10 bg-[#131313] text-white -mx-6 lg:-mx-[calc((100vw-1200px)/2)] px-6 lg:px-[calc((100vw-1200px)/2)] py-16">
          <div className="flex justify-between items-end border-b border-[#353535] pb-4 max-w-[1200px] mx-auto w-full">
            <h2 className="font-sans text-[43px] leading-[1.1] text-white">Travel Archive</h2>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full border border-[#353535] flex items-center justify-center hover:bg-[#353535] transition-colors cursor-pointer">
                <IconArrowLeft className="w-6 h-6 text-white" stroke={1.5} />
              </button>
              <button className="w-12 h-12 rounded-full border border-[#353535] flex items-center justify-center hover:bg-[#353535] transition-colors cursor-pointer">
                <IconArrowRight className="w-6 h-6 text-white" stroke={1.5} />
              </button>
            </div>
          </div>
          
          <div className="flex overflow-x-auto gap-6 pb-6 pt-4 no-scrollbar snap-x max-w-[1200px] mx-auto w-full">
            
            {/* Archive Card 1 */}
            <Link href="/itinerary/paris-noir" className="snap-start shrink-0 w-[300px] group cursor-pointer">
              <div className="h-[400px] w-full bg-[#353535] relative overflow-hidden rounded-[15.04px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Paris Noir" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVqJ3r7VIvlzIN4OBziatklLqrnvibX00_1UlaE0k1rIt6ADC3C9jQz6yzdQkjTF_rMwd1VXSwsyjJbFC09ERrCyD4hNemZzc8BGm8FetETNXph49_A4RsnlAUIHRYBLAx6BIuj9cGJhToxKx0T8-CbYpyTJTvSzApkkUTcpyI1HvRmR0250vKipSYidJ8EP9mGaNtMlBegrsNJLdbXq1PKnrB32ReOxnSeT5aLMjsXXt6H5CDFccl" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="font-sans text-[12px] uppercase tracking-widest text-[#becabb] mb-2 block">Spring 2025</span>
                  <h3 className="font-sans text-[39px] leading-[1.2] text-white">Paris Noir</h3>
                </div>
              </div>
            </Link>
            
            {/* Archive Card 2 */}
            <Link href="/itinerary/swiss-alps" className="snap-start shrink-0 w-[300px] group cursor-pointer">
              <div className="h-[400px] w-full bg-[#353535] relative overflow-hidden rounded-[15.04px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Swiss Alps" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGKL-btYDT9fzhpMzUkaGcwlSzwc3iD14zZpJhvpAAiDgJWo-GuNcfM-eZnrQ-BPB8vz2l3T775FTf3B2rEhp3ja88LWAzeB3qbb4ufQtBx5ECD9eHqte79OTowI4mG3d4Af9iF5WnPrcfQl8lgHPj2eoRnWl_XyLiZMrghqE5DRCdN0om57XPt0S5NYD7Aq142sJGeECarNh3v0olphnL0dzYBxCkESm31Mex2ntMpU5qS4m1AEpu" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="font-sans text-[12px] uppercase tracking-widest text-[#becabb] mb-2 block">Winter 2024</span>
                  <h3 className="font-sans text-[39px] leading-[1.2] text-white">Swiss Alps</h3>
                </div>
              </div>
            </Link>
            
            {/* Archive Card 3 */}
            <Link href="/itinerary/marrakesh" className="snap-start shrink-0 w-[300px] group cursor-pointer">
              <div className="h-[400px] w-full bg-[#353535] relative overflow-hidden rounded-[15.04px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Marrakesh" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDexnfXjW7rrgFiF4v5Zg11MG1mfl3Ctbxd10OFWo_rduM4yZxj_d5vAXL7C_JEkojfXqmwHFRqAJ_Hr3QGw7NepCS4jzovSQYmpBaLMNuUF9PWzDWyezze38u6KbCoZAegTSylh5pP8zoiAWdkOXfWHEmiGNfrbDzsXuEbNXJJeucC-A6hnXVomQfVGZBC3Vu6mvZ-xynuFUkCxAo9gyoyz2LnMOlD-bqz9PnOA4Q5Do_2ek_0bY3B" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="font-sans text-[12px] uppercase tracking-widest text-[#becabb] mb-2 block">Autumn 2024</span>
                  <h3 className="font-sans text-[39px] leading-[1.2] text-white">Marrakesh</h3>
                </div>
              </div>
            </Link>
            
            {/* Archive Card 4 */}
            <Link href="/discover" className="snap-start shrink-0 w-[300px] group cursor-pointer">
              <div className="h-[400px] w-full bg-[#353535] relative overflow-hidden flex items-center justify-center border border-[#353535] rounded-[15.04px]">
                <span className="font-sans text-[20px] text-[#becabb] flex items-center gap-2 hover:text-white transition-colors">
                  View Archive <IconArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
            
          </div>
        </section>
      </main>

      <div className="mt-32">
        <Footer onContactClick={() => setIsContactModalOpen(true)} />
      </div>

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
