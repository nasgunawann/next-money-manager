"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AppLayout } from "@/components/app-layout";
import { useProfile } from "@/hooks/use-profile";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Wallet,
  LogOut,
  Edit,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: profile, isLoading: profileLoading, updateProfile, isUpdating } = useProfile();
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [isChangingTheme, setIsChangingTheme] = useState(false);

  // Calculate statistics
  const totalBalance = accounts?.reduce((acc, account) => acc + account.balance, 0) || 0;
  const totalAccounts = accounts?.length || 0;
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyIncome =
    transactions
      ?.filter((t) => {
        const txDate = new Date(t.date);
        return (
          t.type === "income" &&
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        )
      })
      .reduce((acc, t) => acc + t.amount, 0) || 0;

  const monthlyExpense =
    transactions
      ?.filter((t) => {
        const txDate = new Date(t.date);
        return (
          t.type === "expense" &&
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        )
      })
      .reduce((acc, t) => acc + t.amount, 0) || 0;

  const totalTransactions = transactions?.length || 0;

  const handleEditClick = () => {
    if (profile) {
      setFullName(profile.full_name || "");
      setCurrency(profile.currency || "IDR");
      setIsEditOpen(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        full_name: fullName,
        currency: currency,
        theme: theme || "system",
      });
      toast.success("Profil berhasil diperbarui");
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui profil");
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setIsChangingTheme(true);
    // Optimistically update theme immediately
    const previousTheme = theme || profile?.theme || "system";
    setTheme(newTheme);
    
    try {
      await updateProfile({
        theme: newTheme,
      });
      toast.success("Tema berhasil diubah");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengubah tema");
      // Revert theme change on error
      setTheme(previousTheme);
    } finally {
      setIsChangingTheme(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    toast.success("Berhasil keluar");
  };

  if (profileLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>
            <p className="text-muted-foreground">
              Kelola informasi profil dan pengaturan akun Anda.
            </p>
          </div>
          <Button onClick={handleEditClick} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profil
          </Button>
        </div>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-foreground">
                  {profile?.full_name || "Tidak ada nama"}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {profile?.email || "Tidak ada email"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label className="text-muted-foreground text-sm">Mata Uang</Label>
                <p className="font-medium text-foreground mt-1">
                  {profile?.currency === "IDR" ? "Rupiah (IDR)" : "Dollar (USD)"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-2 block">Tema</Label>
                <Select
                  value={theme || profile?.theme || "system"}
                  onValueChange={handleThemeChange}
                  disabled={isChangingTheme}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <Sun className="h-4 w-4 mr-2" />
                      Terang
                    </SelectItem>
                    <SelectItem value="dark">
                      <Moon className="h-4 w-4 mr-2" />
                      Gelap
                    </SelectItem>
                    <SelectItem value="system">
                      <Monitor className="h-4 w-4 mr-2" />
                      Sistem
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Saldo</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(totalBalance, profile?.currency)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Akun</p>
                  <p className="text-2xl font-bold text-foreground">{totalAccounts}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pemasukan Bulan Ini</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(monthlyIncome, profile?.currency)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pengeluaran Bulan Ini</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(monthlyExpense, profile?.currency)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Akun</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts && accounts.length > 0 ? (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: account.color || "#94a3b8" }}
                      >
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{account.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(account.balance, profile?.currency)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Belum ada akun yang dibuat
              </p>
            )}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card>
          <CardContent className="p-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </CardContent>
        </Card>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profil</DialogTitle>
              <DialogDescription>
                Perbarui informasi profil Anda di sini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  placeholder="Nama Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Mata Uang</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata uang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">Rupiah (IDR)</SelectItem>
                    <SelectItem value="USD">Dollar (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select
                  value={theme || "system"}
                  onValueChange={(value) => {
                    setTheme(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <Sun className="h-4 w-4 mr-2" />
                      Terang
                    </SelectItem>
                    <SelectItem value="dark">
                      <Moon className="h-4 w-4 mr-2" />
                      Gelap
                    </SelectItem>
                    <SelectItem value="system">
                      <Monitor className="h-4 w-4 mr-2" />
                      Sistem
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

