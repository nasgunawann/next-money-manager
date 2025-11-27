import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryObserverOptions,
} from "@tanstack/react-query";
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

type TransactionsQueryOptions = QueryObserverOptions<
  Transaction[],
  Error,
  Transaction[],
  Transaction[],
  ["transactions"]
>;

export function useTransactions(options?: TransactionsQueryOptions) {
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
    ...options,
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

      if (balanceChange !== 0) {
        const { error: balanceError } = await supabase.rpc(
          "increment_balance",
          {
            account_id: newTransaction.account_id,
            amount: balanceChange,
          }
        );
        if (balanceError) throw balanceError;
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Transaction> & { id: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Get old transaction to revert balance
      const { data: oldTx } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

      if (!oldTx) throw new Error("Transaction not found");

      // 2. Revert old balance
      let revertAmount = 0;
      if (oldTx.type === "income") revertAmount = -oldTx.amount;
      if (oldTx.type === "expense") revertAmount = oldTx.amount;

      if (oldTx.type !== "transfer") {
        await supabase.rpc("increment_balance", {
          account_id: oldTx.account_id,
          amount: revertAmount,
        });
      }

      // 3. Update Transaction
      const { data: updatedTx, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // 4. Apply new balance
      if (updatedTx.type !== "transfer") {
        let newAmount = 0;
        if (updatedTx.type === "income") newAmount = updatedTx.amount;
        if (updatedTx.type === "expense") newAmount = -updatedTx.amount;

        await supabase.rpc("increment_balance", {
          account_id: updatedTx.account_id,
          amount: newAmount,
        });
      }

      return updatedTx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // 1. Get transaction to revert balance
      const { data: tx } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

      if (!tx) throw new Error("Transaction not found");

      // 2. Revert balance
      if (tx.type === "income") {
        await supabase.rpc("increment_balance", {
          account_id: tx.account_id,
          amount: -tx.amount,
        });
      } else if (tx.type === "expense") {
        await supabase.rpc("increment_balance", {
          account_id: tx.account_id,
          amount: tx.amount,
        });
      }

      // 3. Delete
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  return {
    ...query,
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
  };
}
