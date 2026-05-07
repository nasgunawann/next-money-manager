import { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "Kaslo - Catat Uang Keluar. Selesai.",
  description: "Bantu catat alur kas-lo dengan mudah, aman, dan tanpa iklan. Pantau kesehatan finansial kamu dalam satu genggaman.",
  openGraph: {
    title: "Kaslo - Manajemen Keuangan Pribadi yang Sederhana",
    description: "Berhenti menebak ke mana uangmu pergi. Lihat datanya dengan Kaslo.",
  },
};

export default function Home() {
  return <HomeContent />;
}
