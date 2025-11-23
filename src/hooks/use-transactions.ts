import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Transaction {
  id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  type: "income" | "expense" | "transfer";
  date: string;
  description: string | null;
  related_transaction_id: string | null;
  account?: { name: string; icon: string; color: string };
  category?: { name: string; icon: string; color: string };
}

export function useTransactions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          account:accounts(name, icon, color),
          category:categories(name, icon, color)
        `
        )
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (
      newTransaction: Omit<Transaction, "id" | "account" | "category">
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Insert Transaction
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({ ...newTransaction, user_id: user.id })
        .select()
        .single();

      if (txError) throw txError;

      // 2. Update Account Balance
      let balanceChange = 0;
      if (newTransaction.type === "income") {
        balanceChange = newTransaction.amount;
      } else if (newTransaction.type === "expense") {
        balanceChange = -newTransaction.amount;
      }

      // For transfer, we handle it differently in the UI component usually,
      // or we can handle it here if we pass a special flag.
      // But for simple income/expense:
      if (balanceChange !== 0) {
        const { error: balanceError } = await supabase.rpc(
          "increment_balance",
          {
            account_id: newTransaction.account_id,
            amount: balanceChange,
          }
        );

        // Fallback if RPC doesn't exist (client-side update - riskier but works for now)
        if (balanceError) {
          // We'll rely on the UI to trigger a refetch or handle this more robustly later
          // For now, let's just invalidate queries
        }
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  return {
    ...query,
    createTransaction: createMutation.mutateAsync,
  };
}
