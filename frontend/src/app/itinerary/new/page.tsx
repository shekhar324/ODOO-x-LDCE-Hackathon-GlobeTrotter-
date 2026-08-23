"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import {
  IconArrowLeft,
  IconSparkles,
  IconCompass,
  IconCalendar,
  IconCoins,
  IconGlobe,
  IconMapPin,
  IconCheck,
  IconAlertTriangle,
  IconRefresh,
  IconEdit,
  IconBookmark,
  IconBuildingMonument,
  IconToolsKitchen2,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { useAuth } from "@/context/auth-context";
import { useCreateTrip } from "@/hooks/use-trips";
import {
  fetchAIItineraryPreview,
  persistGeneratedItinerary,
  type GeneratedAIItinerary,
} from "@/hooks/use-itinerary";
import { SUPPORTED_CURRENCIES, formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

const POPULAR_SUGGESTIONS = [
  { name: "Kyoto", country: "Japan" },
  { name: "Rome", country: "Italy" },
  { name: "Paris", country: "France" },
  { name: "Goa", country: "India" },
  { name: "Tokyo", country: "Japan" },
  { name: "Bali", country: "Indonesia" },
  { name: "Santorini", country: "Greece" },
  { name: "Swiss Alps", country: "Switzerland" },
];

const DEFAULT_COVER = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop";

export default function NewTripPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createTripMutation = useCreateTrip();

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    budget: "50000",
    currency: "INR",
    visibility: "private" as "private" | "friends" | "public",
    cover_image_url: DEFAULT_COVER,
  });

  const [travelStyle, setTravelStyle] = useState("Balanced");
  const [travelers, setTravelers] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Sightseeing",
    "Local Cuisine",
    "Culture & History",
  ]);
  const [customInstructions, setCustomInstructions] = useState("");

  // Flow states: "form" | "preview"
  const [viewMode, setViewMode] = useState<"form" | "preview">("form");
  const [previewData, setPreviewData] = useState<GeneratedAIItinerary | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSelectSuggestion = (suggestName: string) => {
    setFormData((f) => ({
      ...f,
      destination: suggestName,
      title: f.title || `${suggestName} Explorer & Heritage Trail`,
    }));
  };

  /**
   * Phase 1: Non-mutating AI Generation call.
   * Fetches preview from Gemini API without persisting data or creating calendar events.
   */
  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination.trim()) {
      toast.error("Please enter a primary destination.");
      return;
    }

    const primaryDest = formData.destination.trim();
    setIsGeneratingAI(true);
    setGenerationError(null);

    try {
      const preview = await fetchAIItineraryPreview({
        destination: primaryDest,
        startDate: formData.start_date,
        endDate: formData.end_date,
        budget: formData.budget ? parseFloat(formData.budget) : 50000,
        currency: formData.currency,
        interests: selectedInterests,
        travelStyle,
        travelers,
        customInstructions,
      });

      setPreviewData(preview);
      if (!formData.title.trim() && preview.title) {
        setFormData((f) => ({ ...f, title: preview.title || `${primaryDest} Journey` }));
      }
      setViewMode("preview");
      toast.success("AI Itinerary Preview Generated!", {
        description: "Review your bespoke plan below. Click 'Save & Add to Calendar' when confirmed.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate AI itinerary";
      console.error("AI Generation Error:", err);
      setGenerationError(msg);
      toast.error("AI Generation Failed", { description: msg });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  /**
   * Phase 2: Explicit User Confirmation.
   * Only called when user clicks "Save & Add to Calendar". Persists trip, stops, and syncs calendar.
   */
  const handleConfirmAndSave = async () => {
    if (!previewData) return;

    setIsSavingTrip(true);
    try {
      const primaryDest = formData.destination.trim() || "Global Journey";
      const tripTitle = formData.title.trim() || previewData.title || `${primaryDest} Journey`;

      // 1. Create Trip Record
      const trip = await createTripMutation.mutateAsync({
        title: tripTitle,
        description: formData.description.trim() || previewData.description || `Curated journey to ${primaryDest}`,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : previewData.budget || 50000,
        currency: formData.currency,
        visibility: formData.visibility,
        cover_image_url: formData.cover_image_url,
      });

      // 2. Persist stops, activities, and sync calendar events
      await persistGeneratedItinerary({
        tripId: trip.id,
        destination: primaryDest,
        startDate: formData.start_date,
        currency: formData.currency,
        aiData: previewData,
        userId: user?.id,
      });

      toast.success("Journey Saved & Synced!", {
        description: `Your itinerary for ${primaryDest} has been saved and synced with your calendar.`,
      });

      router.push(`/itinerary/${trip.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save itinerary";
      toast.error("Save Failed", { description: msg });
    } finally {
      setIsSavingTrip(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0e0e0e] text-[#e2e2e2] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
        <NavigationPill />

        <main className="flex-1 max-w-[960px] mx-auto w-full pt-36 pb-32 px-6 md:px-12 z-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#becabb] hover:text-white transition-colors mb-8 group"
          >
            <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>

          <header className="mb-10">
            <EditorialHeading className="text-[50px] md:text-[72px] leading-none text-white font-thin tracking-tight">
              {viewMode === "preview" ? "Review AI Itinerary" : "Create New Journey"}
            </EditorialHeading>
            <p className="font-sans text-base md:text-lg text-[#becabb] mt-3">
              {viewMode === "preview"
                ? "Inspect your bespoke AI itinerary below. Confirm to save to your trips and auto-sync with your Travel Calendar."
                : "Specify your destination, budget, and travel preferences to generate a bespoke Gemini AI itinerary."}
            </p>
          </header>

          {/* Error Banner when Gemini fails */}
          {generationError && viewMode === "form" && (
            <div className="mb-8 p-6 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-white text-base">Gemini AI Generation Error</h4>
                  <p className="text-xs text-red-300/90">{generationError}</p>
                  <p className="text-[11px] text-red-400/70 font-mono">
                    No data was created or saved. Please verify your connection or try again.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGenerationError(null)}
                className="px-4 py-2 bg-red-900/60 hover:bg-red-800 text-white rounded-xl text-xs font-medium border border-red-500/30 transition-colors shrink-0 cursor-pointer"
              >
                Dismiss & Retry
              </button>
            </div>
          )}

          {/* FORM VIEW */}
          {viewMode === "form" && (
            <form
              onSubmit={handleGenerateItinerary}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl space-y-8"
            >
              {/* Destination Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <IconMapPin className="w-4 h-4 text-[#72dc85]" />
                  Primary Destination (Type Any City or Region) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rome, Goa, Tokyo, Paris, Cape Town, Reykjavik..."
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all text-base"
                />
                {/* Recommendation Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-neutral-400 mr-1">Popular Suggestions:</span>
                  {POPULAR_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug.name}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug.name)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        formData.destination === sug.name
                          ? "bg-[#72dc85] text-black border-[#72dc85] font-semibold"
                          : "bg-white/5 border-white/15 text-neutral-300 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {sug.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <IconCompass className="w-4 h-4 text-[#72dc85]" />
                  Trip Title (Optional - Gemini can suggest one)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand Heritage Trail & Hidden Gems"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all text-lg font-serif"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Description & Vision (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline key experiences, dining spots, or personal goals..."
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
                    Start Date (Departure)
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all text-sm [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <IconCalendar className="w-4 h-4 text-[#72dc85]" />
                    End Date (Return)
                  </label>
                  <input
                    type="date"
                    required
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
                    Target Budget
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
                  <label className="text-sm font-medium text-white">Currency Code</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-5 py-4 bg-[#1e1e1e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#72dc85] transition-all text-sm cursor-pointer"
                  >
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Travel Style & Travelers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <IconCompass className="w-4 h-4 text-[#72dc85]" />
                    Travel Style & Pacing
                  </label>
                  <select
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    className="w-full px-5 py-4 bg-[#1e1e1e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#72dc85] transition-all text-sm cursor-pointer"
                  >
                    <option value="Balanced">Balanced (Mix of Sights & Relaxation)</option>
                    <option value="Relaxed">Relaxed (Leisurely Pace, Minimal Rush)</option>
                    <option value="Fast-Paced">Fast-Paced (High Energy, Maximize Spots)</option>
                    <option value="Luxury">Luxury (Fine Dining, Upscale Venues)</option>
                    <option value="Adventure">Adventure (Outdoor & Hiking Focus)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <IconGlobe className="w-4 h-4 text-[#72dc85]" />
                    Number of Travelers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={travelers}
                    onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all text-sm"
                  />
                </div>
              </div>

              {/* Interests Chips */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <IconSparkles className="w-4 h-4 text-[#72dc85]" />
                  Traveler Interests & Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Sightseeing",
                    "Local Cuisine",
                    "Culture & History",
                    "Nature & Outdoors",
                    "Nightlife & Music",
                    "Art & Architecture",
                    "Shopping & Markets",
                    "Relaxation & Wellness",
                  ].map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#2d9b4c] text-white border-[#2d9b4c] shadow-md"
                            : "bg-white/5 text-neutral-400 border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {isSelected ? `✓ ${interest}` : `+ ${interest}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-white">
                  Additional Notes for Gemini Concierge (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Dietary preferences, accessibility needs, early morning starts..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#72dc85] focus:ring-1 focus:ring-[#72dc85] transition-all text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGeneratingAI}
                className="w-full py-4 bg-[#2d9b4c] hover:bg-[#38a454] text-white font-medium text-base rounded-xl transition-all shadow-lg hover:shadow-[#2d9b4c]/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <IconSparkles className="w-5 h-5 animate-pulse text-amber-300" />
                <span>
                  {isGeneratingAI
                    ? "Gemini AI Crafting Bespoke Itinerary..."
                    : "Generate AI Itinerary Preview"}
                </span>
              </button>
            </form>
          )}

          {/* PREVIEW VIEW (Non-Mutated State) */}
          {viewMode === "preview" && previewData && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Preview Status Ribbon */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <IconSparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-white">Previewing Bespoke Gemini Itinerary</h3>
                    <p className="text-xs text-emerald-400">
                      Generated specifically for {formData.destination} in {formData.currency}. Nothing is saved yet.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode("form")}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <IconEdit className="w-4 h-4" />
                    <span>Edit Inputs</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAndSave}
                    disabled={isSavingTrip}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-[#2d9b4c] hover:bg-[#38a454] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#2d9b4c]/30 cursor-pointer disabled:opacity-60"
                  >
                    <IconCalendarEvent className="w-4 h-4" />
                    <span>{isSavingTrip ? "Saving & Syncing..." : "Save & Add to Calendar"}</span>
                  </button>
                </div>
              </div>

              {/* Overview Summary Box */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl space-y-6">
                <div className="border-b border-white/10 pb-6 space-y-2">
                  <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">
                    {previewData.stops.length}-Day Bespoke Journey
                  </span>
                  <h2 className="text-3xl md:text-4xl font-serif text-white">
                    {previewData.title || `${formData.destination} Exploration`}
                  </h2>
                  <p className="text-sm text-neutral-300 max-w-3xl">
                    {previewData.description || `Curated itinerary covering ${formData.destination}.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="text-neutral-400 uppercase tracking-wider block">Destination</span>
                    <span className="text-white font-semibold text-sm">{formData.destination}</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="text-neutral-400 uppercase tracking-wider block">Target Budget</span>
                    <span className="text-emerald-400 font-semibold text-sm font-mono">
                      {formatCurrency(previewData.budget || parseFloat(formData.budget), formData.currency)}
                    </span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="text-neutral-400 uppercase tracking-wider block">Travel Style</span>
                    <span className="text-white font-semibold text-sm">{travelStyle}</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="text-neutral-400 uppercase tracking-wider block">Travelers</span>
                    <span className="text-white font-semibold text-sm">{travelers} Traveler(s)</span>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Stops & Activities Timeline Preview */}
              <div className="space-y-6">
                <h3 className="text-xl font-serif text-white flex items-center gap-2">
                  <IconCompass className="w-5 h-5 text-emerald-400" />
                  Day-by-Day Schedule ({previewData.stops.length} Days)
                </h3>

                {previewData.stops.map((stop, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-xl"
                  >
                    <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                      <div>
                        <h4 className="text-xl md:text-2xl font-serif text-white">
                          {stop.title || `Day ${sIdx + 1}: ${formData.destination}`}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1">
                          {stop.notes || `Day ${sIdx + 1} exploration`}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-neutral-300">
                        {stop.city || formData.destination}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {stop.activities && stop.activities.length > 0 ? (
                        stop.activities.map((act, aIdx) => (
                          <div
                            key={aIdx}
                            className="p-5 bg-white/5 border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/20 transition-all"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                  {act.category || "Sightseeing"}
                                </span>
                                <h5 className="text-base font-semibold text-white">{act.title}</h5>
                              </div>
                              <p className="text-xs text-neutral-300 leading-relaxed">
                                {act.description}
                              </p>
                            </div>

                            <div className="shrink-0 text-right font-mono text-sm text-emerald-300 font-semibold border-t md:border-t-0 border-white/10 pt-2 md:pt-0 w-full md:w-auto">
                              {formatCurrency(act.cost || 0, formData.currency)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-neutral-500 italic">No specific activities listed for this day.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Bar Footer */}
              <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setViewMode("form")}
                  className="w-full md:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <IconEdit className="w-4 h-4" />
                  <span>Return & Tweak Parameters</span>
                </button>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={(e) => handleGenerateItinerary(e)}
                    disabled={isGeneratingAI}
                    className="flex-1 md:flex-none px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <IconRefresh className="w-4 h-4" />
                    <span>Regenerate Variation</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndSave}
                    disabled={isSavingTrip}
                    className="flex-1 md:flex-none px-8 py-3.5 bg-[#2d9b4c] hover:bg-[#38a454] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-[#2d9b4c]/30 cursor-pointer disabled:opacity-60"
                  >
                    <IconCalendarEvent className="w-5 h-5" />
                    <span>{isSavingTrip ? "Saving & Syncing..." : "Save & Add to Calendar"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Animated Gemini AI Loading Overlay */}
          {isGeneratingAI && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
              <div className="bg-[#18181b] border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                  <IconSparkles className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-white">Gemini AI Travel Concierge</h3>
                  <p className="text-sm text-emerald-400 font-mono">
                    Generating bespoke itinerary for {formData.destination || "your trip"}...
                  </p>
                </div>
                <div className="text-xs text-neutral-400 space-y-1">
                  <p>• Curating authentic local experiences for {formData.destination}</p>
                  <p>• Tailoring schedule to {travelStyle.toLowerCase()} pacing</p>
                  <p>• Calculating activity estimates in {formData.currency}</p>
                  <p>• Preparing non-mutated preview for your approval</p>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
