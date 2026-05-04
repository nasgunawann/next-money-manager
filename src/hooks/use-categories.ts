import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { deleteCategoryAction } from "@/app/actions/categories";

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
      await deleteCategoryAction({ id: categoryId });
    },
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousCategories = queryClient.getQueryData<Category[]>(["categories"]);

      // Optimistic update
      queryClient.setQueryData<Category[]>(["categories"], (old) => {
        if (!old) return old;
        return old.filter((cat) => cat.id !== categoryId);
      });

      return { previousCategories };
    },
    onError: (err, categoryId, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    ...query,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
