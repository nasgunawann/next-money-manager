import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  account_id: z.string().uuid("ID Akun tidak valid"),
  category_id: z.string().uuid("ID Kategori tidak valid").nullable().optional(),
  type: z.enum(["income", "expense", "transfer"]),
  date: z.string().datetime({ message: "Format tanggal tidak valid" }),
  description: z.string().max(255, "Deskripsi maksimal 255 karakter").nullable().optional(),
  related_transaction_id: z.string().uuid().nullable().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial().extend({
  id: z.string().uuid("ID Transaksi tidak valid"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
