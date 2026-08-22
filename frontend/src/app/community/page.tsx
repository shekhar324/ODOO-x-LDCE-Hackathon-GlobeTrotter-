"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { IconUsers, IconMessageCircle, IconHeart, IconShare } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

function usePublicTrips() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["public_trips"],
    queryFn: async () => {
      // Fetch trips that are public, include owner profile
      const { data, error } = await supabase
        .from("trips")
        .select("*, profiles(first_name, last_name, avatar_url)")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
}

export default function CommunityPage() {
  const { data: publicTrips, isLoading } = usePublicTrips();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#e4e9dc] text-[#020202] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
        <NavigationPill />

        <main className="flex-1 max-w-[1200px] mx-auto w-full pt-40 pb-32 px-6 md:px-12">
          
          <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-[#0e0e0e] pb-10">
            <div>
              <EditorialHeading className="text-[53px] md:text-[80px] leading-none font-thin tracking-tight">GlobeTrotters</EditorialHeading>
              <p className="font-sans text-[20px] text-[#020202]/70 mt-4 max-w-2xl">
                Connect with travelers. Discover public itineraries. Share your journey.
              </p>
            </div>
            <div className="flex items-center gap-2 font-sans text-sm tracking-widest uppercase border border-[#0e0e0e] px-6 py-2 rounded-full">
              <IconUsers className="w-5 h-5" />
              <span>Community Feed</span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {isLoading ? (
              <div className="col-span-full py-20 text-center font-sans tracking-widest text-[#0e0e0e]/50 uppercase text-sm">
                Loading Community Feed...
              </div>
            ) : publicTrips && publicTrips.length > 0 ? (
              publicTrips.map((trip: any) => (
                <div key={trip.id} className="bg-[#efefe7] border border-[#0e0e0e] flex flex-col hover:bg-white transition-colors">
                  <div className="h-64 relative overflow-hidden border-b border-[#0e0e0e]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={trip.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuB-XusGtLDp62pNDiNNKIfj47j_juooJIdvYb4DHVlOn0IIR9ZCh3jPnD3raL1PtOlhjWHf5sqvFpC3C9iy7fjaAHqiR1LzSoaBEhgAHZFUksHoOPEApjBLdJ9sKmj4pdTHWizDaI--wHto8TrXm8MYf6wCvgTD_pfADcxfacqW62eK6HAYBP3Gu_V76Z3dDqF-Zx4R4OOF3Ti08WOkp8QyiFTTwfvdWxSJNd2uDouyuPfc2F6IFPZp"} 
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4 border-b border-[#0e0e0e]/10 pb-4">
                      <div className="w-10 h-10 rounded-full bg-[#0e0e0e] text-white flex items-center justify-center font-serif text-lg shrink-0">
                        {trip.profiles?.first_name?.[0] || "T"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">
                          {trip.profiles?.first_name} {trip.profiles?.last_name}
                        </span>
                        <span className="text-xs text-[#0e0e0e]/50">Curator</span>
                      </div>
                    </div>
                    
                    <EditorialHeading as="h3" className="text-[28px] mb-2 leading-[1.2]">
                      <Link href={`/itinerary/${trip.id}`} className="hover:opacity-70 transition-opacity">
                        {trip.title}
                      </Link>
                    </EditorialHeading>
                    
                    <p className="font-sans text-sm text-[#0e0e0e]/70 mb-6 line-clamp-3">
                      {trip.description || "Discover the journey and unique stops in this curated itinerary."}
                    </p>

                    <div className="mt-auto flex justify-between items-center pt-4">
                      <div className="flex gap-4">
                        <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                          <IconHeart stroke={1.5} className="w-5 h-5" />
                          <span className="text-sm">24</span>
                        </button>
                        <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                          <IconMessageCircle stroke={1.5} className="w-5 h-5" />
                          <span className="text-sm">8</span>
                        </button>
                      </div>
                      <button className="hover:opacity-70 transition-opacity">
                        <IconShare stroke={1.5} className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center font-sans">
                <p className="text-[#0e0e0e]/70">No public itineraries found yet.</p>
                <Link href="/build" className="text-[#2d9b4c] underline mt-4 inline-block">Be the first to share one!</Link>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
