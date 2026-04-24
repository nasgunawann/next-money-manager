export const LATEST_UPDATE_ID = "2026-04-24-pdf-report";
export const UPDATE_VERSION = "Beta v0.2.1";
export const UPDATE_TITLE = "Ada yang baru!";

export interface UpdateFeature {
  title: string;
  description: string;
}

export const UPDATE_FEATURES: UpdateFeature[] = [
  {
    title: "📢 Pesan Update",
    description: "Sekarang pengguna bisa tahu ada yang baru di setiap update melalui pesan ini, hanya muncul sekali saja.",
  },
  {
    title: "👀 Sembunyikan Saldo",
    description: "Ketuk ikon mata di samping saldo untuk menjaga privasi nominal uang Anda.",
  },
  {
    title: "📁 E-Statement PDF",
    description: "Ekspor laporan bulanan profesional dengan detail pemasukan, pengeluaran, dan selisih saldo. Akses di menu Laporan!",
  },
];

// List simpel untuk perbaikan kecil
export const MINOR_FIXES: string[] = [
  //"update kecil",
  "Terdapat bug kolom deskripsi saat input transaksi terkadang hilang, solusi masih dicari.",
];
