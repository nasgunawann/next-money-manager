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
  IconPlus,
  IconTrash,
  IconTag,
  IconLoader2,
  IconTrendingUp,
  IconTrendingDown,
  IconToolsKitchen2,
  IconBus,
  IconShoppingBag,
  IconMovie,
  IconReceipt2,
  IconHeartbeat,
  IconSchool,
  IconPigMoney,
  IconCash,
  IconWallet,
  IconGift,
  IconBriefcase,
  IconCoffee,
  IconDeviceMobile,
  IconWifi,
  IconHome,
  IconCar,
  IconPlane,
  IconDots,
} from "@tabler/icons-react";
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
// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: IconToolsKitchen2,
  bus: IconBus,
  "shopping-bag": IconShoppingBag,
  film: IconMovie,
  receipt: IconReceipt2,
  "heart-pulse": IconHeartbeat,
  "graduation-cap": IconSchool,
  "piggy-bank": IconPigMoney,
  banknote: IconCash,
  wallet: IconWallet,
  gift: IconGift,
  "trending-up": IconTrendingUp,
  briefcase: IconBriefcase,
  coffee: IconCoffee,
  smartphone: IconDeviceMobile,
  wifi: IconWifi,
  home: IconHome,
  car: IconCar,
  plane: IconPlane,
  "more-horizontal": IconDots,
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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus kategori"
      );
    }
  };

  const userCategories =
    categories?.filter((cat) => cat.user_id === profile?.id) || [];
  const incomeCategories = userCategories.filter(
    (cat) => cat.type === "income"
  );
  const expenseCategories = userCategories.filter(
    (cat) => cat.type === "expense"
  );

  const Content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Kelola kategori buatan Anda. Kategori sistem tidak dapat dihapus.
        </p>
        <AddCategoryDialog>
          <Button size="sm">
            <IconPlus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </AddCategoryDialog>
      </div>

      <Tabs defaultValue="expense" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense">
            <IconTrendingDown className="h-4 w-4 mr-2" />
            Pengeluaran
          </TabsTrigger>
          <TabsTrigger value="income">
            <IconTrendingUp className="h-4 w-4 mr-2" />
            Pemasukan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="space-y-2 mt-4">
          {expenseCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {expenseCategories.map((category) => {
                const IconComponent = ICON_MAP[category.icon] || IconTag;
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
                          <p className="text-xs text-muted-foreground">
                            Kustom
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCategoryId(category.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <IconTag className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada kategori pengeluaran buatan Anda</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="income" className="space-y-2 mt-4">
          {incomeCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {incomeCategories.map((category) => {
                const IconComponent = ICON_MAP[category.icon] || IconTag;
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
                          <p className="text-xs text-muted-foreground">
                            Kustom
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCategoryId(category.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <IconTag className="h-12 w-12 mx-auto mb-2 opacity-50" />
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
              Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak
              dapat dibatalkan. Kategori yang sedang digunakan dalam transaksi
              tidak dapat dihapus.
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
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
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
