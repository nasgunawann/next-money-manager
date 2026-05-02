import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { updateAccountsOrderAction } from "@/app/actions/accounts";

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
      await updateAccountsOrderAction(updates);
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["accounts"] });
      const previousAccounts = queryClient.getQueryData<Account[]>(["accounts"]);

      // Optimistic update
      queryClient.setQueryData<Account[]>(["accounts"], (old) => {
        if (!old) return old;
        return old.map(acc => {
          const update = updates.find(u => u.id === acc.id);
          return update ? { ...acc, sort_order: update.sort_order } : acc;
        }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      });

      return { previousAccounts };
    },
    onError: (err, updates, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts"], context.previousAccounts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
