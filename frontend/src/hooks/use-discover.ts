import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useCities(searchQuery: string = "") {
  const supabase = createClient();

  return useQuery({
    queryKey: ["cities", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("cities")
        .select("*")
        .order("popularity_score", { ascending: false });

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      return data || [];
    },
  });
}
