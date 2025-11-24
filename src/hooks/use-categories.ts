import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  user_id: string | null; // null for system defaults
}

export function useCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order("name");

      if (error) throw error;

      // Deduplicate categories by name, preferring user categories over system ones
      const categoryMap = new Map<string, Category>();

      // First, add system categories (user_id is null)
      data?.forEach((cat) => {
        if (cat.user_id === null) {
          const key = `${cat.name.toLowerCase()}-${cat.type}`;
          if (!categoryMap.has(key)) {
            categoryMap.set(key, cat);
          }
        }
      });

      // Then, add user categories (this will override system categories with same name)
      data?.forEach((cat) => {
        if (cat.user_id === user.id) {
          const key = `${cat.name.toLowerCase()}-${cat.type}`;
          categoryMap.set(key, cat);
        }
      });

      // Convert map back to array and sort by name
      return Array.from(categoryMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if category is user-made
      const { data: category } = await supabase
        .from("categories")
        .select("user_id")
        .eq("id", categoryId)
        .single();

      if (!category || category.user_id !== user.id) {
        throw new Error("Hanya kategori buatan Anda yang dapat dihapus");
      }

      // Check if category is used in transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("id")
        .eq("category_id", categoryId)
        .limit(1);

      if (transactions && transactions.length > 0) {
        throw new Error(
          "Kategori sedang digunakan dalam transaksi. Tidak dapat dihapus."
        );
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    ...query,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
