"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconWifiOff, IconRefresh } from "@tabler/icons-react";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <IconWifiOff className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Anda Sedang Offline
            </h1>
            <p className="text-muted-foreground">
              Periksa koneksi internet Anda dan coba lagi. Beberapa fitur mungkin
              masih tersedia menggunakan data yang tersimpan.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} className="w-full">
              <IconRefresh className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Kembali
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            Tip: Beberapa halaman yang sudah pernah Anda kunjungi mungkin masih
            dapat diakses tanpa internet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

