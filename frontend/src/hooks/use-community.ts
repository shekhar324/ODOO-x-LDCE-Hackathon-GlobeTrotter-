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
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

export function useCommunityPosts() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      // 1. Try querying community_posts with joined profiles
      const { data, error } = await supabase
        .from("community_posts")
        .select("*, profiles(full_name, avatar_url, username)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return (data as unknown as CommunityPost[]) || [];
      }

      console.warn("Joined query failed, trying unjoined fallback:", error?.message);

      // 2. Fallback: Query community_posts directly without foreign key join in case schema cache is reloading
      const { data: directPosts, error: directError } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (directError) {
        console.error("Community posts query error:", directError);
        return [];
      }

      if (!directPosts || directPosts.length === 0) {
        return [];
      }

      // 3. Try to fetch matching profiles separately to assemble full posts
      try {
        const authorIds = Array.from(new Set(directPosts.map((p) => p.author_id).filter(Boolean)));
        if (authorIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, username")
            .in("id", authorIds);

          const profileMap = new Map(profiles?.map((p) => [p.id, p]));
          return directPosts.map((post) => ({
            ...post,
            profiles: profileMap.get(post.author_id) || null,
          })) as CommunityPost[];
        }
      } catch (profileErr) {
        console.warn("Could not fetch associated profiles:", profileErr);
      }

      return (directPosts as unknown as CommunityPost[]) || [];
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

      // Clean empty string optional fields to prevent database type mismatch
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

      const { data, error } = await supabase
        .from("community_posts")
        .insert(cleanPayload)
        .select()
        .single();

      if (error) {
        console.error("Failed to insert community post:", error);
        throw new Error(error.message || "Failed to save community post.");
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
  const supabase = createClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}
