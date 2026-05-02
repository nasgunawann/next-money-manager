import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
} from "@/app/actions/transactions";

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
      return createTransactionAction(newTransaction);
    },
    onMutate: async (newTx) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousTx = queryClient.getQueryData<Transaction[]>(["transactions"]);

      // Optimistic update
      const optimisticTx: Transaction = {
        ...newTx,
        id: crypto.randomUUID(), // temporary ID
      };

      queryClient.setQueryData<Transaction[]>(["transactions"], (old) => {
        return old ? [optimisticTx, ...old] : [optimisticTx];
      });

      return { previousTx };
    },
    onError: (err, newTx, context) => {
      if (context?.previousTx) {
        queryClient.setQueryData(["transactions"], context.previousTx);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Transaction> & { id: string }) => {
      return updateTransactionAction(updates);
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousTx = queryClient.getQueryData<Transaction[]>(["transactions"]);

      // Optimistic update
      queryClient.setQueryData<Transaction[]>(["transactions"], (old) => {
        if (!old) return old;
        return old.map((tx) =>
          tx.id === updates.id ? { ...tx, ...updates } : tx
        );
      });

      return { previousTx };
    },
    onError: (err, updates, context) => {
      if (context?.previousTx) {
        queryClient.setQueryData(["transactions"], context.previousTx);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteTransactionAction(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousTx = queryClient.getQueryData<Transaction[]>(["transactions"]);

      // Optimistic update
      queryClient.setQueryData<Transaction[]>(["transactions"], (old) => {
        if (!old) return old;
        return old.filter((tx) => tx.id !== id);
      });

      return { previousTx };
    },
    onError: (err, id, context) => {
      if (context?.previousTx) {
        queryClient.setQueryData(["transactions"], context.previousTx);
      }
    },
    onSettled: () => {
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
