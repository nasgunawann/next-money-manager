import { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "Kaslo - Catat Uang Keluar. Selesai.",
  description: "Kaslo adalah aplikasi manajemen keuangan pribadi yang membantu Anda mencatat transaksi harian, menyusun anggaran cerdas, dan memantau kesehatan finansial secara aman dan tanpa iklan.",
  openGraph: {
    title: "Kaslo - Atur Keuanganmu: Catat Uang Keluar, Selesai!",
    description: "Berhenti menebak ke mana uangmu pergi. Pantau setiap rupiah dengan laporan visual yang mudah dipahami. Coba Kaslo sekarang, gratis dan aman!",
    images: [
      {
        url: "https://kaslo.nanasgunung.com/dekstopmobile.png",
        width: 1200,
        height: 630,
        alt: "Kaslo Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaslo - Atur Keuanganmu: Catat Uang Keluar, Selesai!",
    description: "Catat transaksi dan kendalikan anggaran harianmu dengan mudah dalam satu genggaman. Tanpa iklan dan 100% aman.",
    images: ["https://kaslo.nanasgunung.com/dekstopmobile.png"],
  },
};

export default function Home() {
  return <HomeContent />;
}
