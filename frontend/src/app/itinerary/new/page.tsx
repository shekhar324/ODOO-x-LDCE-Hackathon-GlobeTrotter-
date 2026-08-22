"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { IconArrowLeft, IconSparkles, IconCompass, IconCalendar, IconCoins, IconGlobe } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

const SAMPLE_COVERS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCwnD1-4L43ChzSWI6AfipFqVKjiRiupQn4oMd6FqwqVdAUWiYPFdn98FEw10AVWYX5_v2cF3lhahRxCgk9gAhdRvw3O4Pj9msn1ZPn65B1qfoUDndJRV-udl5cjF9rTD0hjOXuPde_8GeyRHt2E3tWP951Cr1GQ_9cIGgPTe8RWjS-JvTOLBGPaZvccIZHuDF0pQHYXF14chmntg9pdQLkjTAesyeh3jZhNfpC_fNvnjKpocks44h-",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD7VhEL_ibS-oIt6bj3KTRzWfnLpd7qkWydMAsaW41_zeYFambkBiVvLMkwpG9xr3WRJTinNl-uYqqrHiBBJHBcIBvr4eHXLbkNjZm7Lj2fDGSX5rNAkFIngsE59dAN2Z6Z787RS0CWohOXzY2TSgioMQxYezH6kFJBLjTWDuoVc-pNMCPvDC7kTiR8aafEn4FzS-x1vc78UGzmcAk6uGyymr8lZvZIcRMjcu9A6VD_usa4YKqTyiT3",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDaNr4mKX4dToTE2HZdZ_SNs9DJKycwZmTIkZBfSEyDEIcnEOuGmxJxEWbQyE9LkEyupbKT6LxKPlpR2xSinMRdPBdZEZiyfLNB3bVphepR4uK2hQvTpyJs3D3zUb16z10gTq3fpIA1XCHZUJL0TCtjAHW3_zcyZAeVJpH71HEdyQbcH9L2BW_Nr5S4wECy5ZsGLoBFA-fpwWrSQwqNVfl_9trmOlnrwCIYpbEL7YL8bEEs4KpgQrMW",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-XusGtLDp62pNDiNNKIfj47j_juooJIdvYb4DHVlOn0IIR9ZCh3jPnD3raL1PtOlhjWHf5sqvFpC3C9iy7fjaAHqiR1LzSoaBEhgAHZFUksHoOPEApjBLdJ9sKmj4pdTHWizDaI--wHto8TrXm8MYf6wCvgTD_pfADcxfacqW62eK6HAYBP3Gu_V76Z3dDqF-Zx4R4OOF3Ti08WOkp8QyiFTTwfvdWxSJNd2uDouyuPfc2F6IFPZp"
];

export default function NewTripPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    budget: "50000",
    currency: "INR",
    visibility: "private" as "private" | "friends" | "public",
    cover_image_url: SAMPLE_COVERS[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("You must be logged in to create an itinerary.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a title for your trip.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("trips")
        .insert({
          owner_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          currency: formData.currency,
          visibility: formData.visibility,
          cover_image_url: formData.cover_image_url,
          status: "planned",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Itinerary created successfully!");
      if (data?.id) {
        router.push(`/itinerary/${data.id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error("Failed to create itinerary", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0e0e0e] text-[#e2e2e2] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
        <NavigationPill />

        <main className="flex-1 max-w-[900px] mx-auto w-full pt-40 pb-32 px-6 md:px-12 z-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#becabb] hover:text-white transition-colors mb-8 group"
          >
            <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>

          <header className="mb-12">
            <EditorialHeading className="text-[52px] md:text-[76px] leading-none text-white font-thin tracking-tight">
              Create New Journey
            </EditorialHeading>
            <p className="font-sans text-lg text-[#becabb] mt-4">
              Curate your upcoming travel itinerary, schedule dates, and set your budget.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl space-y-8"
          >
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <IconCompass className="w-4 h-4 text-[#72dc85]" />
                Trip Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Autumn in Kyoto & Alpine Trails"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all text-lg font-serif"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Description & Vision
              </label>
              <textarea
                rows={3}
                placeholder="Outline key experiences, goals, or places you plan to visit..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all resize-none text-sm"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <IconCalendar className="w-4 h-4 text-[#72dc85]" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all text-sm [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <IconCalendar className="w-4 h-4 text-[#72dc85]" />
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all text-sm [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Budget & Currency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <IconCoins className="w-4 h-4 text-[#72dc85]" />
                  Estimated Budget
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="50000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-5 py-4 bg-[#1e1e1e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#72dc85] transition-all text-sm cursor-pointer"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <IconGlobe className="w-4 h-4 text-[#72dc85]" />
                Privacy & Visibility
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(["private", "friends", "public"] as const).map((vis) => (
                  <button
                    key={vis}
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: vis })}
                    className={`py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold border transition-all cursor-pointer ${
                      formData.visibility === vis
                        ? "bg-[#2d9b4c] text-white border-[#2d9b4c]"
                        : "bg-white/5 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {vis}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Image Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">
                Select Editorial Cover Image
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SAMPLE_COVERS.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, cover_image_url: imgUrl })}
                    className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      formData.cover_image_url === imgUrl
                        ? "border-[#72dc85] ring-2 ring-[#72dc85]/50 scale-[1.02]"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Cover option ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#2d9b4c] hover:bg-[#38a454] text-white font-medium text-base rounded-xl transition-all shadow-lg hover:shadow-[#2d9b4c]/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <IconSparkles className="w-5 h-5" />
              <span>{isSubmitting ? "Creating Journey..." : "Build Itinerary"}</span>
            </button>
          </form>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
