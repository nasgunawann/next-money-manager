import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  user_id: string | null; // null for system defaults
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order("name");

      if (error) throw error;
      return data as Category[];
    },
  });
}
