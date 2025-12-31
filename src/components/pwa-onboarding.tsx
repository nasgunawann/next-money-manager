import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconWallet } from "@tabler/icons-react";

export function PWAOnboarding() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-2xl">
              K
            </span>
          </div>
          <span className="text-foreground text-3xl font-semibold">Kaslo.</span>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <IconWallet className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Selamat Datang di Kaslo
          </h1>
          <p className="text-base text-muted-foreground">
            Kelola keuangan Anda dengan mudah dan efisien
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-4">
          <Link href="/signup" className="block">
            <Button size="lg" className="w-full text-base h-14">
              Mulai Sekarang
            </Button>
          </Link>

          <Link href="/login" className="block">
            <Button
              size="lg"
              variant="outline"
              className="w-full text-base h-14"
            >
              Sudah Punya Akun
            </Button>
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-xs text-muted-foreground pt-4">
          Dengan melanjutkan, Anda menyetujui{" "}
          <Link href="/terms" className="text-primary">
            Syarat & Ketentuan
          </Link>
        </p>
      </div>
    </div>
  );
}
