"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { ConciergeModal } from "@/components/editorial/concierge-modal";
import { IconStarFilled, IconArrowRight, IconArrowLeft, IconPlus, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useTrips } from "@/hooks/use-trips";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const { data: trips } = useTrips();
  const supabase = createClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    city: "",
    country: "",
  });

  // Sync form when profile data loads or modal opens
  useEffect(() => {
    if (profile && isEditModalOpen) {
      setEditForm({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        city: profile.city || "",
        country: profile.country || "",
      });
    }
  }, [profile, isEditModalOpen]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isEditModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isEditModalOpen]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("profiles") as any)
        .update({
          full_name: editForm.full_name.trim() || null,
          username: editForm.username.trim() || null,
          bio: editForm.bio.trim() || null,
          city: editForm.city.trim() || null,
          country: editForm.country.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
      await refreshProfile();
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Failed to update profile", { description: message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
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
              <div className="w-48 h-48 rounded-full border border-[#020202] overflow-hidden p-1 flex items-center justify-center bg-[#020202] text-white">
                {profile?.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    className="w-full h-full object-cover rounded-full"
                    alt={profile?.full_name || "User"}
                    src={profile.avatar_url}
                  />
                ) : (
                  <span className="font-serif text-6xl">
                    {(profile?.first_name?.[0] || profile?.full_name?.[0] || "T").toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="col-span-1 md:col-span-8 flex flex-col gap-4">
              <EditorialHeading className="text-[53px] leading-[1.1] text-[#020202]">
                {profile?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Traveler"}
              </EditorialHeading>

              {profile?.bio && <p className="font-sans text-lg text-[#3e4a3e]">{profile.bio}</p>}

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-4">
                  <span className="font-sans text-[14px] text-[#3e4a3e] w-32 uppercase tracking-widest">Email</span>
                  <span className="font-sans text-[23px] text-[#020202]">{user?.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-sans text-[14px] text-[#3e4a3e] w-32 uppercase tracking-widest">Status</span>
                  <span className="font-sans text-[23px] text-[#020202] flex items-center gap-2">
                    <IconStarFilled className="w-5 h-5 text-[#38a454]" />
                    Verified Voyager
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-sans text-[14px] text-[#3e4a3e] w-32 uppercase tracking-widest">Member Since</span>
                  <span className="font-sans text-[23px] text-[#020202]">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                      : "Recently"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-10">
                <button
                  onClick={() => setIsEditModalOpen(true)}
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

          {/* Active Itineraries */}
          <section className="flex flex-col gap-10">
            <div className="flex justify-between items-end border-b border-[#020202] pb-4">
              <h2 className="font-sans text-[43px] leading-[1.1] text-[#020202]">Active Itineraries</h2>
              <Link className="font-sans text-[20px] text-[#020202] flex items-center gap-2 hover:opacity-60 transition-opacity" href="/dashboard">
                View Dashboard <IconArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trips
                ?.filter((t) => t.status !== "completed")
                .slice(0, 2)
                .map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/itinerary/${trip.id}`}
                    className="bg-[#efefe7] border border-[#020202] p-10 flex flex-col justify-between min-h-[300px] group cursor-pointer hover:bg-[#393939] hover:text-white transition-colors rounded-[15.04px]"
                  >
                    <div>
                      <span
                        className={`font-sans text-[12px] uppercase tracking-widest border rounded-full px-4 py-1 mb-6 inline-block ${
                          trip.status === "draft"
                            ? "border-[#889486] text-[#889486] group-hover:border-white group-hover:text-white"
                            : "border-current"
                        }`}
                      >
                        {trip.status}
                      </span>
                      <EditorialHeading as="h3" className="text-[39px] mt-4 mb-2 group-hover:text-white transition-colors">
                        {trip.title}
                      </EditorialHeading>
                      <p className="font-sans text-[16px] opacity-80">
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : "Dates TBD"}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-16">
                      <span className="font-sans text-[16px]">Manage</span>
                      <IconArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                ))}

              {/* Action Card */}
              <Link
                href="/itinerary/new"
                className="bg-transparent border border-[#020202] p-10 flex flex-col justify-center items-center min-h-[300px] group cursor-pointer hover:bg-[#353535] hover:text-white hover:border-[#353535] transition-colors text-center border-dashed rounded-[15.04px]"
              >
                <IconPlus className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" stroke={1.5} />
                <h3 className="font-sans text-[39px] leading-[1.2]">New Trip</h3>
                <p className="font-sans text-[16px] opacity-70 mt-2">Start a blank canvas</p>
              </Link>
            </div>
          </section>

          {/* Travel Archive with functional scroll arrows */}
          <section className="flex flex-col gap-10 bg-[#131313] text-white -mx-6 lg:-mx-[calc((100vw-1200px)/2)] px-6 lg:px-[calc((100vw-1200px)/2)] py-16">
            <div className="flex justify-between items-end border-b border-[#353535] pb-4 max-w-[1200px] mx-auto w-full">
              <h2 className="font-sans text-[43px] leading-[1.1] text-white">Travel Archive</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => handleScroll("left")}
                  className="w-12 h-12 rounded-full border border-[#353535] flex items-center justify-center hover:bg-[#353535] transition-colors cursor-pointer"
                  title="Scroll Left"
                >
                  <IconArrowLeft className="w-6 h-6 text-white" stroke={1.5} />
                </button>
                <button
                  onClick={() => handleScroll("right")}
                  className="w-12 h-12 rounded-full border border-[#353535] flex items-center justify-center hover:bg-[#353535] transition-colors cursor-pointer"
                  title="Scroll Right"
                >
                  <IconArrowRight className="w-6 h-6 text-white" stroke={1.5} />
                </button>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-6 pb-6 pt-4 no-scrollbar snap-x max-w-[1200px] mx-auto w-full scroll-smooth"
            >
              {trips
                ?.filter((t) => t.status === "completed")
                .map((trip) => (
                  <Link key={trip.id} href={`/itinerary/${trip.id}`} className="snap-start shrink-0 w-[300px] group cursor-pointer">
                    <div className="h-[400px] w-full bg-[#353535] relative overflow-hidden rounded-[15.04px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt={trip.title}
                        src={
                          trip.cover_image_url ||
                          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000"
                        }
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] to-transparent opacity-80"></div>
                      <div className="absolute bottom-0 left-0 p-6">
                        <span className="font-sans text-[12px] uppercase tracking-widest text-[#becabb] mb-2 block">
                          {trip.start_date ? new Date(trip.start_date).getFullYear() : "Past Trip"}
                        </span>
                        <h3 className="font-sans text-[39px] leading-[1.2] text-white">{trip.title}</h3>
                      </div>
                    </div>
                  </Link>
                ))}

              {/* Archive Card CTA */}
              <Link href="/dashboard" className="snap-start shrink-0 w-[300px] group cursor-pointer">
                <div className="h-[400px] w-full bg-[#353535] relative overflow-hidden flex items-center justify-center border border-[#353535] rounded-[15.04px]">
                  <span className="font-sans text-[20px] text-[#becabb] flex items-center gap-2 hover:text-white transition-colors">
                    View All Activity <IconArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </Link>
            </div>
          </section>
        </main>

        <div className="mt-32">
          <Footer onContactClick={() => setIsContactModalOpen(true)} />
        </div>

        {/* --- Edit Profile Modal --- */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="backdrop-blur-2xl bg-[#141414] border border-white/15 text-white max-w-md w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-6" data-lenis-prevent>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-light text-white">Edit Profile</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Bio & Persona</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell fellow travelers about your style..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-300 block mb-1.5 font-mono">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Country</label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-400 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-[#38a454] hover:bg-[#2d9b4c] text-white font-medium py-3.5 rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-4"
                >
                  {isUpdating ? "Updating Profile..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        )}

        <ConciergeModal isOpen={isContactModalOpen} onOpenChange={setIsContactModalOpen} />
      </div>
    </AuthGuard>
  );
}
