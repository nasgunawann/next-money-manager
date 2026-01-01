"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import Image from "next/image";

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/?$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

const signupSchema = z
  .object({
    email: z.string().email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .regex(/[0-9]/, "Kata sandi harus mengandung angka")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Kata sandi harus mengandung simbol"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi harus diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm({ embedded = false }: { embedded?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const passwordStrength = {
    hasMinLength: password?.length >= 8,
    hasNumber: /[0-9]/.test(password || ""),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password || ""),
  };

  const getPasswordStrengthColor = () => {
    const checks = Object.values(passwordStrength).filter(Boolean).length;
    if (checks === 0) return "";
    if (checks === 1) return "text-red-500";
    if (checks === 2) return "text-yellow-500";
    return "text-green-500";
  };

  const getPasswordStrengthText = () => {
    const checks = Object.values(passwordStrength).filter(Boolean).length;
    if (checks === 0) return "";
    if (checks === 1) return "Lemah";
    if (checks === 2) return "Sedang";
    return "Kuat";
  };

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${getSiteUrl()}/auth/callback`,
        },
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Pendaftaran berhasil! Periksa email Anda.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan saat mendaftar"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getSiteUrl()}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mendaftar dengan Google"
      );
    }
  };

  const SuccessContent = (
    <div className="space-y-3 text-center">
      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <IconCheck className="h-6 w-6 text-primary" />
      </div>
      <p className="text-lg font-semibold text-primary">
        Pendaftaran Berhasil!
      </p>
      <p className="text-sm text-muted-foreground">
        Silakan periksa email Anda untuk memverifikasi akun.
      </p>
      <Button
        variant="outline"
        onClick={() => router.push("/")}
        className="w-full"
      >
        Kembali ke Halaman Masuk
      </Button>
    </div>
  );

  const FormBody = (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-left text-sm font-medium"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-left text-sm font-medium"
          >
            Kata Sandi
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={errors.password ? "border-red-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          </div>
          {password && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Kekuatan kata sandi:</span>
                <span className={`font-medium ${getPasswordStrengthColor()}`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {passwordStrength.hasMinLength ? (
                    <IconCheck className="h-3 w-3 text-green-500" />
                  ) : (
                    <IconX className="h-3 w-3 text-gray-400" />
                  )}
                  <span
                    className={
                      passwordStrength.hasMinLength
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    Minimal 8 karakter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordStrength.hasNumber ? (
                    <IconCheck className="h-3 w-3 text-green-500" />
                  ) : (
                    <IconX className="h-3 w-3 text-gray-400" />
                  )}
                  <span
                    className={
                      passwordStrength.hasNumber
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    Mengandung angka
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordStrength.hasSymbol ? (
                    <IconCheck className="h-3 w-3 text-green-500" />
                  ) : (
                    <IconX className="h-3 w-3 text-gray-400" />
                  )}
                  <span
                    className={
                      passwordStrength.hasSymbol
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    Mengandung simbol
                  </span>
                </div>
              </div>
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-left text-sm font-medium"
          >
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className={
                errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full transition-all duration-200"
          disabled={loading}
        >
          {loading ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Daftar Sekarang
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Atau daftar dengan
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full hover:bg-gray-50 transition-colors duration-200"
        onClick={handleGoogleSignup}
      >
        <svg
          className="mr-2 h-5 w-5"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          ></path>
        </svg>
        Lanjut dengan Google
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Dengan mendaftar, Anda menyetujui
        <Link href="/terms" className="text-primary hover:underline ml-1">
          Syarat & Ketentuan
        </Link>{" "}
        dan
        <Link href="/privacy" className="text-primary hover:underline ml-1">
          Kebijakan Privasi
        </Link>
      </p>
    </>
  );

  if (success) {
    if (embedded) {
      return (
        <div className="space-y-3">
          {SuccessContent}
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(false);
              router.push("/");
            }}
            className="w-full"
          >
            Pergi ke Masuk
          </Button>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-4">
        <Card className="w-full max-w-md shadow-none border-none md:shadow-lg md:border">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <IconCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center text-primary">
              Pendaftaran Berhasil!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Silakan periksa email Anda untuk memverifikasi akun.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              Kembali ke Halaman Masuk
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (embedded) {
    return <div className="space-y-4">{FormBody}</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-4">
      <Card className="w-full max-w-md shadow-none border-none md:shadow-lg md:border">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image
              src="/logolight.svg"
              alt="Kaslo"
              width={2000}
              height={40}
              className="dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.svg"
              alt="Kaslo"
              width={200}
              height={40}
              className="hidden dark:block"
              priority
            />
          </div>
          <CardDescription className="text-center text-base">
            Buat akun baru untuk mulai mengelola keuangan Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>{FormBody}</CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
