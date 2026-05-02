"use server";

import { createClient } from "@/lib/supabase/server";
import { updateAccountsOrderSchema, UpdateAccountsOrderInput } from "@/lib/validations/accounts";

export async function updateAccountsOrderAction(input: UpdateAccountsOrderInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const parsedData = updateAccountsOrderSchema.parse(input);

  // Verifikasi kepemilikan sebelum update
  const accountIds = parsedData.map(a => a.id);
  const { data: accounts, error: checkError } = await supabase
    .from("accounts")
    .select("id, user_id")
    .in("id", accountIds);

  if (checkError) throw new Error("Gagal memverifikasi akun");

  // Pastikan semua akun milik user
  for (const acc of parsedData) {
    const dbAcc = accounts.find(a => a.id === acc.id);
    if (!dbAcc || dbAcc.user_id !== user.id) {
      throw new Error("Unauthorized: Anda mencoba mengubah urutan akun yang bukan milik Anda");
    }
  }

  const promises = parsedData.map((u) =>
    supabase
      .from("accounts")
      .update({ sort_order: u.sort_order })
      .eq("id", u.id)
  );

  const results = await Promise.all(promises);
  const errors = results.filter((r) => r.error).map((r) => r.error);

  if (errors.length > 0) {
    if (errors.some(e => e?.message?.includes("sort_order"))) {
      throw new Error("Kolom 'sort_order' belum ada di database. Silakan tambah kolom tersebut di Supabase.");
    }
    throw new Error("Gagal mengupdate urutan beberapa akun");
  }

  return { success: true };
}
