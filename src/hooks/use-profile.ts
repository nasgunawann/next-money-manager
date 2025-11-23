import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  currency: string;
  theme: string;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });
}
