export const LATEST_UPDATE_ID = "2024-04-24-pdf-report";
export const UPDATE_VERSION = "Beta v0.2.1";
export const UPDATE_TITLE = "Ada yang baru!";

export interface UpdateFeature {
  title: string;
  description: string;
}

export const UPDATE_FEATURES: UpdateFeature[] = [
  {
    title: "E-Statement PDF",
    description: "Ekspor laporan bulanan profesional dengan detail debit, kredit, dan saldo berjalan (running balance).",
  },
  {
    title: "Analisis Kategori",
    description: "Lihat ringkasan pengeluaran berdasarkan kategori langsung di dalam laporan PDF.",
  },
];

// List simpel untuk perbaikan kecil
export const MINOR_FIXES: string[] = [
  "Pindah tombol unduh ke halaman Laporan agar lebih rapi.",
  "Penghitungan saldo awal otomatis yang lebih akurat.",
  "Optimasi performa rendering PDF di browser.",
];
