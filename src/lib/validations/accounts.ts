import { z } from "zod";

export const updateAccountsOrderSchema = z.array(
  z.object({
    id: z.string().uuid("ID Akun tidak valid"),
    sort_order: z.number().int("Sort order harus berupa angka bulat"),
  })
);

export type UpdateAccountsOrderInput = z.infer<typeof updateAccountsOrderSchema>;
