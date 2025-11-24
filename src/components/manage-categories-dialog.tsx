"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/use-categories";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { useProfile } from "@/hooks/use-profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Plus,
  Trash2,
  Tag,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Utensils,
  Bus,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  GraduationCap,
  PiggyBank,
  Banknote,
  Wallet,
  Gift,
  Briefcase,
  Coffee,
  Smartphone,
  Wifi,
  Home,
  Car,
  Plane,
  MoreHorizontal,
} from "lucide-react";

// Icon mapping
const ICON_MAP: Record<string, any> = {
  utensils: Utensils,
  bus: Bus,
  "shopping-bag": ShoppingBag,
  film: Film,
  receipt: Receipt,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  "piggy-bank": PiggyBank,
  banknote: Banknote,
  wallet: Wallet,
  gift: Gift,
  "trending-up": TrendingUp,
  briefcase: Briefcase,
  coffee: Coffee,
  smartphone: Smartphone,
  wifi: Wifi,
  home: Home,
  car: Car,
  plane: Plane,
  "more-horizontal": MoreHorizontal,
};

export function ManageCategoriesDialog({
  children,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data: categories, deleteCategory, isDeleting } = useCategories();
  const { data: profile } = useProfile();

  const handleOpenChange = (val: boolean) => {
    setIsOpen(val);
    onOpenChange?.(val);
  };

  const handleDelete = async () => {
    if (!deleteCategoryId) return;
    try {
      await deleteCategory(deleteCategoryId);
      toast.success("Kategori berhasil dihapus");
      setDeleteCategoryId(null);
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus kategori");
    }
  };

  const userCategories = categories?.filter((cat) => cat.user_id === profile?.id) || [];
  const incomeCategories = userCategories.filter((cat) => cat.type === "income");
  const expenseCategories = userCategories.filter((cat) => cat.type === "expense");

  const Content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Kelola kategori buatan Anda. Kategori sistem tidak dapat dihapus.
        </p>
        <AddCategoryDialog>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </AddCategoryDialog>
      </div>

      <Tabs defaultValue="expense" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense">
            <TrendingDown className="h-4 w-4 mr-2" />
            Pengeluaran
          </TabsTrigger>
          <TabsTrigger value="income">
            <TrendingUp className="h-4 w-4 mr-2" />
            Pemasukan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="space-y-2 mt-4">
          {expenseCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {expenseCategories.map((category) => {
                const IconComponent = ICON_MAP[category.icon] || Tag;
                return (
                  <Card key={category.id} className="p-3">
                    <CardContent className="p-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">Kustom</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCategoryId(category.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada kategori pengeluaran buatan Anda</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="income" className="space-y-2 mt-4">
          {incomeCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {incomeCategories.map((category) => {
                const IconComponent = ICON_MAP[category.icon] || Tag;
                return (
                  <Card key={category.id} className="p-3">
                    <CardContent className="p-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">Kustom</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCategoryId(category.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada kategori pemasukan buatan Anda</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!deleteCategoryId}
        onOpenChange={(open) => !open && setDeleteCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
              Kategori yang sedang digunakan dalam transaksi tidak dapat dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Kategori</DialogTitle>
            <DialogDescription>
              Lihat dan hapus kategori buatan Anda
            </DialogDescription>
          </DialogHeader>
          {Content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open ?? isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Kelola Kategori</DrawerTitle>
          <DrawerDescription>
            Lihat dan hapus kategori buatan Anda
          </DrawerDescription>
        </DrawerHeader>
        <div className="pb-8 px-4">{Content}</div>
      </DrawerContent>
    </Drawer>
  );
}

