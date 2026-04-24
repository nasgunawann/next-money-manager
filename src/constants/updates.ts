export const LATEST_UPDATE_ID = "2026-04-24-reorder-update";
export const UPDATE_VERSION = "Beta v0.3.0";
export const UPDATE_TITLE = "Update: Atur Posisi Sesuka Hati!";

export interface UpdateFeature {
  title: string;
  description: string;
}

export const UPDATE_FEATURES: UpdateFeature[] = [
  {
    title: "🔃 Atur Urutan Akun",
    description: "Kini Kamu bisa mengatur urutan Sumber Dana dengan Drag & Drop di halaman Akun. Letakkan rekening utama Kamu di paling atas!",
  },
  {
    title: "✨ Menambah Animasi",
    description: "Saat mengatur urutan sumber dana, akan ada efek animasi dan getaran saat memindahkan kartu akun.",
  },

];

export const MINOR_FIXES: string[] = [
  " Dashboard dan Laporan kini lebih cepat karena optimasi logika perhitungan data yang baru."
];
