"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { IconWallet, IconArrowLeft, IconCheck } from "@tabler/icons-react";
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

export default function AnalyticsPage() {
  const router = useRouter();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

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

  const handlePayment = () => {
    setIsPaid(true);
    toast.success("Payment Confirmed", {
      description: "Receipt processed for Kyoto Autumn Retreat ($14,250.00)",
    });
    setTimeout(() => {
      router.push("/itinerary/kyoto-autumn-retreat");
    }, 1500);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
      <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />

      <main className="w-full">
        {/* Obsidian Section: Summary */}
        <section className="w-full bg-[#020202] text-white min-h-[614px] flex flex-col justify-center items-center px-6 md:px-12 py-32 relative overflow-hidden pt-40">
          
          {/* Top Return Link */}
          <div className="w-full max-w-[1200px] mb-8 z-20">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#becabb] hover:text-white transition-colors"
            >
              <IconArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>

          <div className="max-w-[1200px] mx-auto w-full flex flex-col items-center text-center gap-10 relative z-10">
            <p className="font-sans text-sm uppercase tracking-widest text-[#becabb]">Cost Breakdown</p>
            <EditorialHeading className="text-[96px] md:text-[180px] leading-none tracking-tighter text-white font-thin">
              $14,250
            </EditorialHeading>
            <p className="font-sans text-xl text-[#becabb] max-w-2xl">
              Total estimated expenditure for the Kyoto Autumn Retreat. Includes accommodations, guided tours, and premium dining experiences.
            </p>
            
            {/* Simple Architectural Bar Chart */}
            <div className="w-full max-w-3xl flex h-16 rounded-full overflow-hidden mt-8">
              <div className="bg-[#006e2d] h-full" style={{ width: "45%" }} title="Accommodation"></div>
              <div className="bg-[#9e8f77] h-full" style={{ width: "30%" }} title="Flights & Transport"></div>
              <div className="bg-[#889486] h-full" style={{ width: "15%" }} title="Dining"></div>
              <div className="bg-[#393939] h-full" style={{ width: "10%" }} title="Activities"></div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 font-sans text-sm uppercase tracking-wide text-[#becabb] mt-4">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#006e2d]"></span> Stays</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#9e8f77]"></span> Travel</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#889486]"></span> Food</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#393939]"></span> Extras</span>
            </div>
          </div>
        </section>

        {/* Linen Cream Section: Detailed Breakdown */}
        <section className="w-full bg-[#e4e9dc] text-[#020202] min-h-screen py-32 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
            
            {/* Left Column: Context */}
            <div className="md:col-span-4 flex flex-col gap-10 md:sticky md:top-32 h-fit">
              <EditorialHeading as="h2" className="text-[39px] leading-tight text-[#020202]">
                Itemized<br />Receipt
              </EditorialHeading>
              <p className="font-sans text-[23px] leading-[1.4] text-[#020202]/70">
                A comprehensive review of all planned expenses. Adjustments can be made through your dedicated concierge.
              </p>
              <div className="w-24 h-[1px] bg-[#020202] mt-4"></div>
              <div className="flex flex-col gap-6 mt-8">
                <div className="p-8 border border-[#020202] rounded-lg bg-transparent flex flex-col gap-4">
                  <IconWallet className="w-8 h-8 text-[#020202]" stroke={1.5} />
                  <span className="font-sans text-[20px] text-[#020202]">Budget Status</span>
                  <span className="font-sans text-[39px] leading-[1.2] text-[#020202]">{isPaid ? "Paid in Full" : "On Track"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: The Receipt Stub */}
            <div className="md:col-span-8">
              <div className="bg-[#efefe7] text-[#020202] border border-[#020202] rounded-[0.25rem] p-8 md:p-16 shadow-none">
                
                {/* Header */}
                <div className="flex justify-between items-end border-b border-[#020202] pb-6 mb-12">
                  <div>
                    <p className="font-sans text-sm uppercase tracking-widest text-[#020202]/60">Itinerary No.</p>
                    <p className="font-sans text-[39px] leading-[1.2]">KYT-8924</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-sm uppercase tracking-widest text-[#020202]/60">Date</p>
                    <p className="font-sans text-[31px] leading-[1.3]">Oct 12 - 24, 2026</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="flex flex-col gap-10">
                  
                  {/* Category: Accommodation */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-[#020202] text-white p-4 rounded">
                      <span className="font-sans text-[20px] uppercase tracking-widest">Accommodation</span>
                      <span className="font-sans text-[20px]">$6,412.50</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-[#020202]/20">
                      <span className="font-sans text-[23px]">Aman Kyoto (5 Nights)</span>
                      <span className="font-sans text-[23px]">$4,250.00</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-[#020202]/20">
                      <span className="font-sans text-[23px]">Hoshinoya (3 Nights)</span>
                      <span className="font-sans text-[23px]">$2,162.50</span>
                    </div>
                  </div>

                  {/* Category: Flights */}
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="flex justify-between items-center bg-[#020202] text-white p-4 rounded">
                      <span className="font-sans text-[20px] uppercase tracking-widest">Flights & Transport</span>
                      <span className="font-sans text-[20px]">$4,275.00</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-[#020202]/20">
                      <span className="font-sans text-[23px]">JAL First Class (SFO - KIX)</span>
                      <span className="font-sans text-[23px]">$3,800.00</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-[#020202]/20">
                      <span className="font-sans text-[23px]">Private Rail Transfers</span>
                      <span className="font-sans text-[23px]">$475.00</span>
                    </div>
                  </div>

                  {/* Category: Dining */}
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="flex justify-between items-center bg-[#020202] text-white p-4 rounded">
                      <span className="font-sans text-[20px] uppercase tracking-widest">Dining Reservations</span>
                      <span className="font-sans text-[20px]">$2,137.50</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-[#020202]/20">
                      <span className="font-sans text-[23px]">Kikunoi Honten (Kaiseki)</span>
                      <span className="font-sans text-[23px]">$850.00</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-[#020202]/20">
                      <span className="font-sans text-[23px]">Daily Culinary Allowance</span>
                      <span className="font-sans text-[23px]">$1,287.50</span>
                    </div>
                  </div>

                  {/* Category: Experiences */}
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="flex justify-between items-center bg-[#020202] text-white p-4 rounded">
                      <span className="font-sans text-[20px] uppercase tracking-widest">Experiences</span>
                      <span className="font-sans text-[20px]">$1,425.00</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-[#020202]/20">
                      <span className="font-sans text-[23px]">Private Tea Ceremony</span>
                      <span className="font-sans text-[23px]">$450.00</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-[#020202]/20">
                      <span className="font-sans text-[23px]">Guided Temple Tour</span>
                      <span className="font-sans text-[23px]">$975.00</span>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-16 pt-10 border-t-2 border-[#020202] flex justify-between items-end">
                  <span className="font-sans text-[39px] leading-[1.2]">Total Due</span>
                  <span className="font-sans text-[53px] leading-[1.1]">$14,250.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-10">
                <Link href="/build" className="font-sans text-sm uppercase tracking-widest text-[#020202]/70 hover:text-[#020202] transition-colors">
                  ← Edit Itinerary Items
                </Link>

                <button 
                  onClick={handlePayment}
                  disabled={isPaid}
                  className="bg-[#2d9b4c] text-white rounded-[10.08px] px-16 py-6 font-sans text-[20px] hover:opacity-90 transition-opacity flex items-center gap-3 cursor-pointer disabled:opacity-75"
                >
                  {isPaid ? (
                    <>
                      <IconCheck className="w-6 h-6" />
                      <span>Payment Completed</span>
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
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
              Direct access for private charters, resort buyout, and custom arrangements.
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
