import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Account {
  id: string;
  name: string;
  type: "cash" | "bank" | "ewallet" | "savings";
  balance: number;
  color: string;
  icon: string;
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Account[];
    },
  });
}
