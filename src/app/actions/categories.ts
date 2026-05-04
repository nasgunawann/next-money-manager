"use server";

import { createClient } from "@/lib/supabase/server";
import { deleteCategorySchema } from "@/lib/validations/categories";

export async function deleteCategoryAction(input: { id: string }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const parsedData = deleteCategorySchema.parse(input);
  const categoryId = parsedData.id;

  // Check if category is user-made
  const { data: category, error: checkError } = await supabase
    .from("categories")
    .select("user_id")
    .eq("id", categoryId)
    .single();

  if (checkError || !category) throw new Error("Kategori tidak ditemukan");

  if (category.user_id !== user.id) {
    throw new Error("Hanya kategori buatan Anda yang dapat dihapus");
  }

  // Check if category is used in transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("id")
    .eq("category_id", categoryId)
    .limit(1);

  if (transactions && transactions.length > 0) {
    throw new Error("Kategori sedang digunakan dalam transaksi. Tidak dapat dihapus.");
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) throw error;

  return { success: true };
}
