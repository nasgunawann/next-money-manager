import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="text-muted-foreground max-w-md">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah
          dipindahkan.
        </p>
        <Button asChild>
          <Link href="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
