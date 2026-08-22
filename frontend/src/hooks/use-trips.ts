import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";

export function useTrips() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ["trips", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id,
  });
}
