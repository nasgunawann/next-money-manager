import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Account {
  id: string;
  name: string;
  type: "cash" | "bank" | "ewallet" | "savings";
  balance: number;
  color: string;
  icon: string;
  sort_order?: number;
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      // Coba ambil dengan urutan sort_order
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("sort_order", { ascending: true });

      // Jika error karena kolom tidak ada (PGRST204 atau semacamnya), 
      // fallback ke urutan nama
      if (error) {
        console.warn("Falling back to name ordering because:", error.message);
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("accounts")
          .select("*")
          .order("name");
          
        if (fallbackError) throw fallbackError;
        return fallbackData as Account[];
      }
      
      return data as Account[];
    },
  });
}

export function useUpdateAccountsOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const promises = updates.map((u) =>
        supabase
          .from("accounts")
          .update({ sort_order: u.sort_order })
          .eq("id", u.id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error).map((r) => r.error);

      if (errors.length > 0) {
        // Jika gagal karena kolom tidak ada, beri tahu user lebih spesifik
        if (errors.some(e => e?.message?.includes("sort_order"))) {
          throw new Error("Kolom 'sort_order' belum ada di database. Silakan tambah kolom tersebut di Supabase.");
        }
        throw new Error("Gagal mengupdate urutan beberapa akun");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
