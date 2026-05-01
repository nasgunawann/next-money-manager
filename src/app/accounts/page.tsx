"use client";

import { useState, useMemo, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useAccounts, Account, useUpdateAccountsOrder } from "@/hooks/use-accounts";
import { formatCurrency, formatAccountType } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  IconPlus, 
  IconSearch, 
  IconGripVertical, 
  IconArrowsSort, 
  IconCheck, 
  IconX 
} from "@tabler/icons-react";
import { getAccountIconComponent } from "@/constants/account-icons";
import { AppLayout } from "@/components/layout/app-layout";
import { AddAccountDialog } from "@/components/dialogs/add-account-dialog";
import { AccountDetailDialog } from "@/components/dialogs/account-detail-dialog";
import { AccountsPageSkeleton } from "@/components/shared/skeleton-loaders";
import {
  EmptyState,
  EmptyAccountsIcon,
  EmptySearchIcon,
} from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion} from "framer-motion";

// DnD Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Komponen Item yang bisa di-drag
function SortableAccountItem({ account, currency, isReordering }: { account: Account, currency?: string, isReordering: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: account.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  const Icon = getAccountIconComponent(account.icon, account.type);

  // Varian animasi getar (wiggle) ala iOS
  const wiggleVariants = {
    wiggle: {
      rotate: [0, -0.5, 0.5, -0.5, 0],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    },
    idle: { rotate: 0 }
  };

  return (
    <div ref={setNodeRef} style={style} className={`${isDragging ? "opacity-50" : ""}`}>
      <motion.div
        variants={wiggleVariants}
        animate={isReordering && !isDragging ? "wiggle" : "idle"}
      >
        <Card className={`border-none shadow-sm backdrop-blur-sm transition-colors ${isDragging ? "bg-primary/10 ring-2 ring-primary/50" : "bg-card/50"}`}>
          <CardContent className="p-3 flex items-center gap-3">
            <div 
              {...attributes} 
              {...listeners} 
              className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded-md transition-colors"
              style={{ touchAction: "none" }}
            >
              <IconGripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: account.color || "#94a3b8" }}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {account.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatAccountType(account.type)}
              </p>
            </div>

            <p className="font-bold text-sm text-foreground">
              {formatCurrency(account.balance, currency)}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AccountsPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const updateOrderMutation = useUpdateAccountsOrder();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [localAccounts, setLocalAccounts] = useState<Account[]>([]);

  // Initialize local accounts when data loads
  useEffect(() => {
    if (accounts) {
      setLocalAccounts(accounts);
    }
  }, [accounts]);

  const totalBalance =
    accounts?.reduce((acc, account) => acc + account.balance, 0) || 0;

  // Filter accounts (hanya jalan jika tidak dalam mode reorder)
  const filteredAccounts = useMemo(() => {
    const list = isReordering ? localAccounts : accounts;
    return list?.filter((account) => {
      const matchesSearch = account.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || account.type === filterType;
      return matchesSearch && matchesType;
    }) || [];
  }, [accounts, localAccounts, searchQuery, filterType, isReordering]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = () => {
    // Memberikan getaran fisik ringan saat kartu mulai diangkat (hanya di HP)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalAccounts((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      
      // Getaran halus saat kartu berpindah posisi
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  };

  const handleSaveOrder = async () => {
    const updates = localAccounts.map((acc, index) => ({
      id: acc.id,
      sort_order: index,
    }));

    toast.promise(updateOrderMutation.mutateAsync(updates), {
      loading: "Menyimpan urutan...",
      success: "Urutan berhasil disimpan!",
      error: "Gagal menyimpan urutan",
    });
    setIsReordering(false);
  };

  if (profileLoading || accountsLoading) {
    return (
      <AppLayout>
        <AccountsPageSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          {!isReordering && accounts && accounts.length > 1 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                if (accounts) setLocalAccounts([...accounts]);
                setIsReordering(true);
                setSearchQuery("");
                setFilterType("all");
              }}
            >
              <IconArrowsSort className="h-4 w-4" />
              Atur Urutan
            </Button>
          )}
        </div>

        {/* Total Balance Card */}
        <Card className="bg-linear-to-br from-[#4663f1] to-[#1f37a7] text-white border-none shadow-lg">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">Total Aset</p>
              <p className="text-3xl font-bold">
                {formatCurrency(totalBalance, profile?.currency)}
              </p>
            </div>
            {!isReordering && (
              <AddAccountDialog>
                <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 shadow-md">
                  <IconPlus className="h-6 w-6" />
                </Button>
              </AddAccountDialog>
            )}
          </CardContent>
        </Card>

        {/* Reorder Actions */}
        {isReordering && (
          <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-dashed border-primary/30">
            <div className="flex-1">
              <p className="text-sm font-bold text-primary">Mode Pengaturan Urutan</p>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">Tahan dan geser ikon garis untuk memindahkan</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsReordering(false)} className="gap-1">
                <IconX className="h-4 w-4" /> Batal
              </Button>
              <Button size="sm" onClick={handleSaveOrder} className="gap-1 bg-primary text-primary-foreground shadow-md">
                <IconCheck className="h-4 w-4" /> Simpan
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filter (Hide when reordering) */}
        {!isReordering && (
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari sumber dana..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-background"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px] h-11 bg-background">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="ewallet">E-Wallet</SelectItem>
                <SelectItem value="savings">Tabungan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Accounts Content */}
        {isReordering ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localAccounts.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {localAccounts.map((account) => (
                  <SortableAccountItem 
                    key={account.id} 
                    account={account} 
                    currency={profile?.currency} 
                    isReordering={isReordering}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredAccounts.map((account) => {
              const Icon = getAccountIconComponent(account.icon, account.type);
              return (
                <Card
                  key={account.id}
                  className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer bg-card/60"
                  onClick={() => setSelectedAccount(account)}
                >
                  <CardContent className="p-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{
                            backgroundColor: account.color || "#94a3b8",
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[13px] text-foreground truncate">
                            {account.name}
                          </p>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">
                            {formatAccountType(account.type)}
                          </p>
                        </div>
                      </div>

                      <p className="text-base font-black text-foreground tabular-nums">
                        {formatCurrency(account.balance, profile?.currency)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={
              searchQuery || filterType !== "all" ? (
                <EmptySearchIcon />
              ) : (
                <EmptyAccountsIcon />
              )
            }
            title={
              searchQuery || filterType !== "all"
                ? "Tidak Ada Hasil"
                : "Belum Ada Sumber Dana"
            }
            description={
              searchQuery || filterType !== "all"
                ? "Coba ubah pencarian atau filter untuk menemukan sumber dana"
                : "Tambahkan dompet, rekening bank, atau e-wallet untuk mulai mencatat keuangan"
            }
            variant={
              searchQuery || filterType !== "all" ? "filtered" : "default"
            }
          />
        )}
      </div>

      <AccountDetailDialog
        account={selectedAccount}
        open={!!selectedAccount}
        onOpenChange={(open) => !open && setSelectedAccount(null)}
      />
    </AppLayout>
  );
}
