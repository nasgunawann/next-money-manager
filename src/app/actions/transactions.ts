"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createTransactionSchema,
  updateTransactionSchema,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/lib/validations/transactions";

// Helper to verify account ownership
async function verifyAccountOwnership(
  supabase: any,
  accountId: string,
  userId: string
) {
  const { data: account, error } = await supabase
    .from("accounts")
    .select("user_id, balance")
    .eq("id", accountId)
    .single();

  if (error || !account) {
    throw new Error("Akun tidak ditemukan");
  }

  if (account.user_id !== userId) {
    throw new Error("Unauthorized: Anda tidak berhak mengakses akun ini");
  }

  return account;
}

export async function createTransactionAction(input: CreateTransactionInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Validate Input
  const parsedData = createTransactionSchema.parse(input);

  // Verify Account Ownership
  await verifyAccountOwnership(supabase, parsedData.account_id, user.id);

  // 1. Insert Transaction
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({ ...parsedData, user_id: user.id })
    .select()
    .single();

  if (txError) throw txError;

  // 2. Update Account Balance
  let balanceChange = 0;
  if (parsedData.type === "income") {
    balanceChange = parsedData.amount;
  } else if (parsedData.type === "expense") {
    balanceChange = -parsedData.amount;
  }

  if (balanceChange !== 0) {
    const { error: balanceError } = await supabase.rpc("increment_balance", {
      account_id: parsedData.account_id,
      amount: balanceChange,
    });
    if (balanceError) throw balanceError;
  }

  return transaction;
}

export async function updateTransactionAction(input: UpdateTransactionInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Validate Input
  const parsedData = updateTransactionSchema.parse(input);
  const { id, ...updates } = parsedData;

  // 1. Get old transaction to verify ownership and revert balance
  const { data: oldTx, error: oldTxError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (oldTxError || !oldTx) {
    throw new Error("Transaction not found");
  }

  if (oldTx.user_id !== user.id) {
    throw new Error("Unauthorized: Anda tidak berhak mengubah transaksi ini");
  }

  // If changing accounts, verify the new account ownership
  if (updates.account_id && updates.account_id !== oldTx.account_id) {
    await verifyAccountOwnership(supabase, updates.account_id, user.id);
  }

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

  // 3. Check balance for expenses (after reverting old amount)
  if (
    updates.type === "expense" ||
    (oldTx.type === "expense" && !updates.type)
  ) {
    const newAmount = updates.amount ?? oldTx.amount;
    const accountId = updates.account_id ?? oldTx.account_id;

    const account = await verifyAccountOwnership(supabase, accountId, user.id);

    if (account.balance < newAmount) {
      // Revert the balance back since validation failed
      if (oldTx.type !== "transfer") {
        await supabase.rpc("increment_balance", {
          account_id: oldTx.account_id,
          amount: -revertAmount,
        });
      }
      throw new Error("Saldo tidak mencukupi untuk pengeluaran ini");
    }
  }

  // 4. Update Transaction
  const { data: updatedTx, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // 5. Apply new balance
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
}

export async function deleteTransactionAction(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // 1. Get transaction to verify ownership and revert balance
  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (txError || !tx) {
    throw new Error("Transaction not found");
  }

  if (tx.user_id !== user.id) {
    throw new Error("Unauthorized: Anda tidak berhak menghapus transaksi ini");
  }

  // 2. Revert balance based on transaction type
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
  } else if (tx.type === "transfer") {
    await supabase.rpc("increment_balance", {
      account_id: tx.account_id,
      amount: tx.amount,
    });

    if (tx.related_transaction_id) {
      const { data: relatedTx } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", tx.related_transaction_id)
        .single();

      if (relatedTx && relatedTx.user_id === user.id) {
        await supabase.rpc("increment_balance", {
          account_id: relatedTx.account_id,
          amount: -relatedTx.amount,
        });

        await supabase.from("transactions").delete().eq("id", relatedTx.id);
      }
    }
  }

  // 3. Delete the main transaction
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;

  return { success: true };
}
