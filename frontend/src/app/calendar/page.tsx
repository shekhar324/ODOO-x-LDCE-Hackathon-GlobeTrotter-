"use client";

import React from "react";
import Link from "next/link";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { IconCalendarEvent, IconMapPin, IconCalendarTime } from "@tabler/icons-react";
import { useTrips } from "@/hooks/use-trips";

export default function CalendarPage() {
  const { data: trips, isLoading } = useTrips();

  // Sort trips by start date ascending
  const sortedTrips = trips ? [...trips].sort((a, b) => {
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  }) : [];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#e4e9dc] text-[#020202] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
        <NavigationPill />

        <main className="flex-1 max-w-[1000px] mx-auto w-full pt-40 pb-32 px-6 md:px-12">
          
          <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-[#0e0e0e] pb-10">
            <div>
              <EditorialHeading className="text-[53px] md:text-[80px] leading-none font-thin tracking-tight">Travel Calendar</EditorialHeading>
              <p className="font-sans text-[20px] text-[#020202]/70 mt-4 max-w-2xl">
                Your upcoming itineraries and scheduled adventures.
              </p>
            </div>
            <div className="flex items-center gap-2 font-sans text-sm tracking-widest uppercase border border-[#0e0e0e] px-6 py-2 rounded-full">
              <IconCalendarEvent className="w-5 h-5" />
              <span>Agenda View</span>
            </div>
          </header>

          <div className="flex flex-col relative border-l border-[#0e0e0e] pl-8 md:pl-12 ml-4">
            {isLoading ? (
              <div className="py-20 font-sans tracking-widest text-[#0e0e0e]/50 uppercase text-sm">
                Loading Schedule...
              </div>
            ) : sortedTrips.length > 0 ? (
              sortedTrips.map((trip: any) => {
                const startDate = trip.start_date ? new Date(trip.start_date) : null;
                const month = startDate ? startDate.toLocaleString("default", { month: "short" }) : "TBD";
                const day = startDate ? startDate.getDate() : "--";
                
                return (
                  <div key={trip.id} className="relative mb-16 last:mb-0 group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[50px] md:-left-[66px] top-0 w-[36px] h-[36px] rounded-full bg-[#0e0e0e] text-white flex items-center justify-center shrink-0 z-10 font-serif text-sm">
                      {month}
                    </div>

                    <div className="bg-white border border-[#0e0e0e] p-8 md:p-10 hover:shadow-xl transition-shadow relative z-0">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#0e0e0e]/10 pb-6 mb-6">
                        <div className="flex items-center gap-4 text-[#0e0e0e]/70 font-sans text-sm">
                          <span className="flex items-center gap-2">
                            <IconCalendarTime stroke={1.5} className="w-5 h-5" />
                            {trip.start_date ? startDate?.toLocaleDateString() : "Dates pending"}
                            {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
                          </span>
                        </div>
                        <span className="px-4 py-1 border border-[#0e0e0e] rounded-full font-sans text-xs uppercase tracking-widest">
                          {trip.status}
                        </span>
                      </div>

                      <EditorialHeading as="h3" className="text-4xl mb-4 group-hover:text-[#2d9b4c] transition-colors">
                        <Link href={`/itinerary/${trip.id}`}>
                          {trip.title}
                        </Link>
                      </EditorialHeading>

                      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
                        <p className="font-sans text-[#0e0e0e]/70 max-w-lg leading-relaxed">
                          {trip.description || "No description provided for this trip."}
                        </p>
                        
                        <Link 
                          href={`/build/${trip.id}`} 
                          className="font-sans text-sm font-bold border-b border-[#0e0e0e] pb-1 hover:text-[#2d9b4c] hover:border-[#2d9b4c] transition-colors"
                        >
                          Manage Schedule →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 font-sans text-[#0e0e0e]/70 text-lg">
                <p>No trips scheduled.</p>
                <Link href="/build" className="text-[#2d9b4c] underline mt-4 inline-block">Start planning</Link>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
