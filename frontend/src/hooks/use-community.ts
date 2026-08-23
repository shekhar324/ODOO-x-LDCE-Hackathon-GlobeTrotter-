import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";

export interface CommunityPost {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  destination: string | null;
  story: string | null;
  how_it_went: string | null;
  recommendations: string | null;
  dos: string | null;
  donts: string | null;
  tips: string | null;
  cover_image_url: string | null;
  trip_id: string | null;
  created_at: string;
  updated_at: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "mock-seed-1",
    author_id: "mock-author-1",
    title: "Magic in the Bamboo Groves of Arashiyama",
    destination: "Kyoto, Japan",
    story: "Walking through the soaring bamboo stalk tunnels of Arashiyama at dawn, with gentle morning light filtering through the green canopy. It felt like stepping into an ancient Japanese folklore tale.",
    how_it_went: "Beyond expectation! We arrived at 6:30 AM before any tour buses and had the entire bamboo grove to ourselves for nearly an hour of serene quiet.",
    recommendations: "Stop by % ARABICA Kyoto Arashiyama right on the Katsura River for an iced matcha latte after your morning stroll.",
    dos: "Arrive before 7:00 AM for peaceful photos. Rent an electric bicycle from Kyoto Station to explore the surrounding Sagano area.",
    donts: "Don't visit after 10:00 AM unless you enjoy massive crowds. Avoid touching or carving into bamboo stalks.",
    tips: "The ICOCA IC transport card works seamlessly on all Kyoto city buses and the historic Randen tram lines.",
    cover_image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
    trip_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_at: null,
    profiles: {
      full_name: "Elena Rostova",
      username: "elena_explores",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
    },
  },
  {
    id: "mock-seed-2",
    author_id: "mock-author-2",
    title: "Cliffside Evenings & Aegean Winds in Oia",
    destination: "Santorini, Greece",
    story: "Watching the golden sun melt into the Aegean Sea from the blue-domed terraces of Oia. The interplay of white marble, deep blue sea, and crimson sky is unforgettable.",
    how_it_went: "Pure magic. We booked a catamaran sunset cruise that took us past the Red Beach, White Beach, and Volcanic Hot Springs.",
    recommendations: "Dine at Sunset Ammoudi Taverna for fresh grill octopus right by the water level.",
    dos: "Wear sturdy sneakers on cobblestone steps. Reserve sunset dining at least 2-3 weeks in advance.",
    donts: "Don't flush paper down traditional island plumbing. Don't climb onto private church rooftops.",
    tips: "Catch the local KTEL bus from Fira to Oia for €1.80 instead of paying €40 for private taxis.",
    cover_image_url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop",
    trip_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updated_at: null,
    profiles: {
      full_name: "Marcus Vance",
      username: "marcus_voyager",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    },
  },
  {
    id: "mock-seed-3",
    author_id: "mock-author-3",
    title: "Chasing Waterfalls & Secret Surf Breaks in Uluwatu",
    destination: "Bali, Indonesia",
    story: "Surfing the reef breaks of Suluban Beach and exploring lush jungle waterfalls near Ubud. Bali's spiritual energy and warm local culture make every day feel revitalizing.",
    how_it_went: "10 days of tropical bliss. Renting a scooter gave us total freedom to find secluded beaches away from tourist hubs.",
    recommendations: "Watch the dramatic Kecak Fire Dance at Uluwatu Temple right at sunset atop the ocean cliff.",
    dos: "Respect temple dress codes (wear a sarong). Hydrate constantly with fresh king coconuts.",
    donts: "Never drink tap water — stick strictly to bottled water. Don't step on Canang Sari flower offerings on footpaths.",
    tips: "Download Grab or Gojek apps for affordable, instant ride-hailing and food delivery across southern Bali.",
    cover_image_url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop",
    trip_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    updated_at: null,
    profiles: {
      full_name: "Sophia Chen",
      username: "sophia_wanderlust",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    },
  },
  {
    id: "mock-seed-4",
    author_id: "mock-author-4",
    title: "Coastal Dreams Along the Amalfi Cliffside Highway",
    destination: "Amalfi Coast, Italy",
    story: "Driving the winding coastal roads from Sorrento to Positano, surrounded by lemon groves, pastel houses clinging to dramatic cliffs, and sparkling Tyrrhenian waters.",
    how_it_went: "Exhilarating! The Path of the Gods hike offered panoramic views that rivaled any postcard.",
    recommendations: "Sip ice-cold Limoncello in Ravello and take a wooden boat tour to Capri's Blue Grotto.",
    dos: "Take the SITA bus or ferry if you aren't comfortable driving narrow cliffside roads.",
    donts: "Don't pack heavy luggage if staying in Positano — expect 300+ stairs to reach most hotels.",
    tips: "Travel in May or September to enjoy mild 24°C weather without peak summer traffic.",
    cover_image_url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop",
    trip_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updated_at: null,
    profiles: {
      full_name: "Arjun Patel",
      username: "arjun_adventures",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    },
  },
  {
    id: "mock-seed-5",
    author_id: "mock-author-5",
    title: "Midnight Neon & Hidden Izakayas in Shinjuku",
    destination: "Tokyo, Japan",
    story: "Diving into Omoide Yokocho (Memory Lane) for charcoal-grilled yakitori and exploring the neon-drenched alleys of Kabukicho after midnight.",
    how_it_went: "An unforgettable culinary and sensory adventure. Tokyo feels like stepping into 2050.",
    recommendations: "Order Tonkotsu ramen at Ichiran and visit teamLab Planets for immersive digital art.",
    dos: "Carry cash (yen) as many small ramen shops and street stalls use cash-only ticket vending machines.",
    donts: "Don't eat or drink while walking down the street — step to the side near a vending machine.",
    tips: "Pocket Wi-Fi or an eSIM from Airalo is essential for navigating Tokyo Metro train connections.",
    cover_image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop",
    trip_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updated_at: null,
    profiles: {
      full_name: "Lucas Miller",
      username: "lucas_travels",
      avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop",
    },
  },
  {
    id: "mock-seed-6",
    author_id: "mock-author-6",
    title: "Alpine Trails & Matterhorn Reflections in Zermatt",
    destination: "Swiss Alps, Switzerland",
    story: "Hiking along the 5 Lakes Walk in Zermatt, catching pristine reflections of the iconic Matterhorn in Lake Stellisee under crisp mountain air.",
    how_it_went: "Breathtaking clarity and fresh mountain energy. The Gornergrat cogwheel railway ride was worth every franc.",
    recommendations: "Enjoy traditional Swiss cheese fondue at Saycheese! in Zermatt village.",
    dos: "Invest in a Swiss Travel Pass for unlimited train, bus, and mountain cable car rides.",
    donts: "Don't underestimate mountain weather — bring layers and waterproof gear even in mid-summer.",
    tips: "Hike early in the morning when alpine lakes are mirror-still for the best reflections.",
    cover_image_url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop",
    trip_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
    updated_at: null,
    profiles: {
      full_name: "Freja Lindqvist",
      username: "nordic_explorer",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    },
  },
];

export function useCommunityPosts() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      let dbPosts: CommunityPost[] = [];

      try {
        // Primary joined query
        const { data, error } = await supabase
          .from("community_posts")
          .select("*, profiles!author_id(full_name, avatar_url, username)")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          dbPosts = data as unknown as CommunityPost[];
        } else {
          // Fallback direct query
          const { data: directPosts } = await supabase
            .from("community_posts")
            .select("*")
            .order("created_at", { ascending: false });

          if (directPosts && directPosts.length > 0) {
            const postsList = directPosts as unknown as CommunityPost[];
            const authorIds = Array.from(new Set(postsList.map((p) => p.author_id).filter(Boolean)));

            if (authorIds.length > 0) {
              const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, avatar_url, username")
                .in("id", authorIds);

              const profileMap = new Map((profiles as unknown as { id: string; full_name: string | null; avatar_url: string | null; username: string | null }[])?.map((p) => [p.id, p]));
              dbPosts = postsList.map((post) => ({
                ...post,
                profiles: profileMap.get(post.author_id) || null,
              })) as CommunityPost[];
            } else {
              dbPosts = postsList;
            }
          }
        }
      } catch (err) {
        console.warn("Community posts fetch warning:", err);
      }

      // Filter out empty/dummy test posts with title length < 3
      const validDbPosts = dbPosts.filter((p) => p.title && p.title.trim().length >= 3);

      // Merge real database posts with seed posts so the feed is rich & full
      const combined = [...validDbPosts];
      for (const mockPost of MOCK_COMMUNITY_POSTS) {
        if (!combined.some((p) => p.title.toLowerCase() === mockPost.title.toLowerCase())) {
          combined.push(mockPost);
        }
      }

      return combined;
    },
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (newPost: {
      title: string;
      destination?: string;
      story?: string;
      how_it_went?: string;
      recommendations?: string;
      dos?: string;
      donts?: string;
      tips?: string;
      cover_image_url?: string;
      trip_id?: string;
    }) => {
      if (!user?.id) throw new Error("Must be logged in to create a post");

      // Auto-upsert profile row to satisfy author_id foreign key constraint
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("profiles") as any).upsert(
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Explorer",
            username: user.user_metadata?.username || user.email?.split("@")[0] || "explorer",
            avatar_url: user.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (profileErr) {
        console.warn("Profile auto-upsert warning:", profileErr);
      }

      // Build clean payload — omit empty optional fields
      const cleanPayload: Record<string, unknown> = {
        author_id: user.id,
        title: newPost.title,
      };

      if (newPost.destination?.trim()) cleanPayload.destination = newPost.destination.trim();
      if (newPost.story?.trim()) cleanPayload.story = newPost.story.trim();
      if (newPost.how_it_went?.trim()) cleanPayload.how_it_went = newPost.how_it_went.trim();
      if (newPost.recommendations?.trim()) cleanPayload.recommendations = newPost.recommendations.trim();
      if (newPost.dos?.trim()) cleanPayload.dos = newPost.dos.trim();
      if (newPost.donts?.trim()) cleanPayload.donts = newPost.donts.trim();
      if (newPost.tips?.trim()) cleanPayload.tips = newPost.tips.trim();
      if (newPost.cover_image_url?.trim()) cleanPayload.cover_image_url = newPost.cover_image_url.trim();
      if (newPost.trip_id?.trim()) cleanPayload.trip_id = newPost.trip_id.trim();

      // Primary insert attempt with all columns
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let { data, error } = await (supabase.from("community_posts") as any)
        .insert(cleanPayload)
        .select()
        .single();

      // Graceful fallback for unmigrated database schemas missing new columns
      if (error && (error.message?.includes("column") || error.message?.includes("schema cache"))) {
        console.warn("Retrying community post insert with legacy column fallback due to missing schema columns:", error.message);
        
        const legacyPayload: Record<string, unknown> = {
          author_id: user.id,
          title: newPost.title,
          description: [newPost.destination, newPost.story].filter(Boolean).join(" - ") || null,
        };
        if (newPost.cover_image_url?.trim()) legacyPayload.cover_image_url = newPost.cover_image_url.trim();
        if (newPost.trip_id?.trim()) legacyPayload.trip_id = newPost.trip_id.trim();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const retryResult = await (supabase.from("community_posts") as any)
          .insert(legacyPayload)
          .select()
          .single();

        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.error("Failed to insert community post:", error);
        let userMessage = error.message || "Failed to save community post.";
        if (error.message?.includes("column") || error.message?.includes("schema cache") || error.message?.includes("trip_id")) {
          userMessage = "Database schema needs updating. Please run `supabase-migration.sql` in your Supabase SQL Editor.";
        } else if (error.message?.includes("foreign key")) {
          userMessage = "Author profile missing. Please run `supabase-migration.sql` in your Supabase SQL Editor.";
        }
        throw new Error(userMessage);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}

export function useUpdateCommunityPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      destination?: string;
      story?: string;
      how_it_went?: string;
      recommendations?: string;
      dos?: string;
      donts?: string;
      tips?: string;
      cover_image_url?: string;
    }) => {
      if (!user?.id) throw new Error("Must be logged in to edit a post");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let { data, error } = await (supabase.from("community_posts") as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("author_id", user.id)
        .select()
        .single();

      // Graceful fallback for unmigrated database schemas
      if (error && (error.message?.includes("column") || error.message?.includes("schema cache"))) {
        console.warn("Retrying community post update with legacy column fallback:", error.message);
        
        const legacyUpdates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.title) legacyUpdates.title = updates.title;
        if (updates.story || updates.destination) {
          legacyUpdates.description = [updates.destination, updates.story].filter(Boolean).join(" - ");
        }
        if (updates.cover_image_url) legacyUpdates.cover_image_url = updates.cover_image_url;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const retryResult = await (supabase.from("community_posts") as any)
          .update(legacyUpdates)
          .eq("id", id)
          .eq("author_id", user.id)
          .select()
          .single();

        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.error("Failed to update community post:", error);
        throw new Error(
          error.message.includes("column") || error.message.includes("schema cache")
            ? "Database schema needs updating. Please run `supabase-migration.sql` in your Supabase SQL Editor."
            : error.message || "Failed to update post."
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}

export function useDeleteCommunityPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) throw new Error("Must be logged in to delete a post");

      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("author_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}

/**
 * Upload an image file to Supabase Storage (community-covers bucket).
 * Automatically attempts bucket creation if missing, with graceful URL fallback.
 */
export async function uploadCommunityImage(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${userId}/${Date.now()}.${ext}`;

  // First upload attempt
  let { data, error } = await supabase.storage
    .from("community-covers")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  // Attempt bucket creation fallback if bucket not found
  if (error && (error.message?.toLowerCase().includes("not found") || error.message?.toLowerCase().includes("bucket"))) {
    try {
      console.warn("Attempting automatic creation of missing 'community-covers' storage bucket...");
      await supabase.storage.createBucket("community-covers", { public: true });
      
      const retryUpload = await supabase.storage
        .from("community-covers")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      data = retryUpload.data;
      error = retryUpload.error;
    } catch (createErr) {
      console.warn("Bucket auto-creation failed (requires SQL migration):", createErr);
    }
  }

  if (error) {
    console.error("Storage upload error:", error);
    return {
      url: null,
      error: error.message?.toLowerCase().includes("not found")
        ? "Storage bucket 'community-covers' does not exist on your Supabase project. Run `supabase-migration.sql` in your Supabase SQL Editor."
        : error.message || "Failed to upload image.",
    };
  }

  if (!data?.path) {
    return { url: null, error: "Upload failed to return file path." };
  }

  const { data: publicData } = supabase.storage
    .from("community-covers")
    .getPublicUrl(data.path);

  return { url: publicData.publicUrl, error: null };
}
