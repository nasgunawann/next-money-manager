"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { AppLayout } from "@/components/app-layout";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
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
  IconUser,
  IconMail,
  IconLoader2,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconLock,
  IconCheck,
  IconX,
  IconPencil,
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const {
    data: profile,
    isLoading: profileLoading,
    updateProfile,
  } = useProfile();

  // Name state
  const [fullName, setFullName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  // Email state
  const [email, setEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Currency state
  const [currency, setCurrency] = useState("IDR");
  const [isChangingCurrency, setIsChangingCurrency] = useState(false);

  // Theme state
  const [isChangingTheme, setIsChangingTheme] = useState(false);

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Initialize form values when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
      setCurrency(profile.currency || "IDR");
    }
  }, [profile]);

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    setIsSavingName(true);
    try {
      await updateProfile({ full_name: fullName });
      toast.success("Nama berhasil diperbarui");
      setIsEditingName(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui nama"
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Email tidak valid");
      return;
    }

    setIsSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;

      // Update profile email as well
      await updateProfile({ email });
      toast.success(
        "Email berhasil diperbarui. Silakan cek email Anda untuk konfirmasi."
      );
      setIsEditingEmail(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui email"
      );
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password baru harus minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }

    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      toast.success("Password berhasil diubah");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengubah password"
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleChangeCurrency = async (newCurrency: string) => {
    setIsChangingCurrency(true);
    try {
      await updateProfile({ currency: newCurrency });
      setCurrency(newCurrency);
      toast.success("Mata uang berhasil diubah");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengubah mata uang"
      );
    } finally {
      setIsChangingCurrency(false);
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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengubah tema"
      );
      // Revert theme change on error
      setTheme(previousTheme);
    } finally {
      setIsChangingTheme(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        try {
          // Extract the file path from the URL
          // Supabase storage URLs format: https://[project].supabase.co/storage/v1/object/public/avatars/[userId]/[filename]
          const urlParts = profile.avatar_url.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const folderPath = `${user.id}/${fileName}`;
          await supabase.storage.from("avatars").remove([folderPath]);
        } catch (error) {
          // Ignore deletion errors - old file might not exist
          console.warn("Could not delete old avatar:", error);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile
      await updateProfile({ avatar_url: publicUrl });
      toast.success("Foto profil berhasil diubah");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengupload foto profil"
      );
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
        {/* Profile Information Card - Enhanced */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b">
              {/* Avatar Section */}
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
                  {isUploadingAvatar ? (
                    <IconLoader2 className="h-12 w-12 text-primary animate-spin" />
                  ) : profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || "Profile"}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <IconUser className="h-12 w-12 text-primary" />
                  )}
                </div>
                {/* Pencil Edit Badge */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Ubah foto profil"
                >
                  {isUploadingAvatar ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconPencil className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Details */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {profile?.full_name || "Tidak ada nama"}
                </h2>
                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                  <IconMail className="h-4 w-4" />
                  {profile?.email || "Tidak ada email"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Kelola Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              {isEditingName ? (
                <div className="flex gap-2">
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama Anda"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSaveName}
                    disabled={isSavingName}
                  >
                    {isSavingName ? (
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <IconCheck className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setIsEditingName(false);
                      setFullName(profile?.full_name || "");
                    }}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-foreground font-medium">
                    {profile?.full_name || "Tidak ada nama"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingName(true);
                      setFullName(profile?.full_name || "");
                    }}
                  >
                    Ubah
                  </Button>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="email">Email</Label>
              {isEditingEmail ? (
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSaveEmail}
                    disabled={isSavingEmail}
                  >
                    {isSavingEmail ? (
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <IconCheck className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEmail(profile?.email || "");
                    }}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    {profile?.email || "Tidak ada email"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingEmail(true);
                      setEmail(profile?.email || "");
                    }}
                  >
                    Ubah
                  </Button>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="password">Password</Label>
              {isChangingPassword ? (
                <div className="space-y-3">
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password baru (min. 6 karakter)"
                    className="w-full"
                  />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password baru"
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={isSavingPassword}
                      className="flex-1"
                    >
                      {isSavingPassword ? (
                        <>
                          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <IconCheck className="mr-2 h-4 w-4" />
                          Simpan
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <IconLock className="h-4 w-4 text-muted-foreground" />
                    ••••••••
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Ubah
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Mata Uang</Label>
                <Select
                  value={currency || profile?.currency || "IDR"}
                  onValueChange={handleChangeCurrency}
                  disabled={isChangingCurrency}
                >
                  <SelectTrigger id="currency" className="w-full">
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
                  value={theme || profile?.theme || "system"}
                  onValueChange={handleThemeChange}
                  disabled={isChangingTheme}
                >
                  <SelectTrigger id="theme" className="w-full">
                    <SelectValue placeholder="Pilih tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <IconSun className="h-4 w-4 mr-2" />
                      Terang
                    </SelectItem>
                    <SelectItem value="dark">
                      <IconMoon className="h-4 w-4 mr-2" />
                      Gelap
                    </SelectItem>
                    <SelectItem value="system">
                      <IconDeviceDesktop className="h-4 w-4 mr-2" />
                      Sistem
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
