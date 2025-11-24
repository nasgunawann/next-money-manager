"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [initialBalance, setInitialBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not found");

      // 1. Update Profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        currency: currency,
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // 2. Create Initial Account (Cash)
      const { error: accountError } = await supabase.from("accounts").insert({
        user_id: user.id,
        name: "Dompet Tunai",
        type: "cash",
        balance: parseFloat(initialBalance) || 0,
        color: "#10b981", // Emerald 500
        icon: "wallet",
      });

      if (accountError) throw accountError;

      // 3. Create Default Categories (Optional, can be done via SQL trigger or here)
      // For now, we'll skip creating categories here and rely on the user or a separate seed function.
      // Or better, let's create a few basic ones.
      const defaultCategories = [
        {
          user_id: user.id,
          name: "Makan & Minum",
          type: "expense",
          icon: "utensils",
          color: "#f87171",
        },
        {
          user_id: user.id,
          name: "Transportasi",
          type: "expense",
          icon: "bus",
          color: "#60a5fa",
        },
        {
          user_id: user.id,
          name: "Gaji",
          type: "income",
          icon: "briefcase",
          color: "#34d399",
        },
      ];

      const { error: categoriesError } = await supabase
        .from("categories")
        .insert(defaultCategories);

      if (categoriesError) throw categoriesError;

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyiapkan profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Selamat Datang!
          </CardTitle>
          <CardDescription className="text-center">
            Mari atur profil Anda untuk memulai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOnboarding} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Nama Lengkap
              </label>
              <Input
                id="fullName"
                placeholder="Nama Anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium">
                Mata Uang
              </label>
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
              <label htmlFor="balance" className="text-sm font-medium">
                Saldo Awal (Dompet Tunai)
              </label>
              <Input
                id="balance"
                type="number"
                placeholder="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                min="0"
              />
              <p className="text-xs text-gray-500">
                Anda bisa menambah akun lain nanti.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Mulai Sekarang
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
