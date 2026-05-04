import { z } from "zod";

export const deleteCategorySchema = z.object({
  id: z.string().uuid("ID Kategori tidak valid"),
});

export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
