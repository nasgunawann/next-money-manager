export const LATEST_UPDATE_ID = "2026-05-01-calculator-update";
export const UPDATE_VERSION = "Beta v0.3.1";
export const UPDATE_TITLE = "Ada Update Baru!";

export interface UpdateFeature {
  title: string;
  description: string;
}

export const UPDATE_FEATURES: UpdateFeature[] = [
  {
    title: "🔃 Atur Urutan Akun",
    description: "Kini Kamu bisa mengatur urutan Sumber Dana dengan Drag & Drop di halaman Akun. Letakkan rekening utama Kamu di paling depan!",
  },
  {
    title: "🧮 Smart Calculator Keypad",
    description: "Tidak perlu lagi aplikasi luar! Kini form input nominal dilengkapi dengan kalkulator bawaan pintar untuk mobile (Drawer) maupun desktop (Popover) dengan fitur evaluasi parsial.",
  },
  {
    title: "⚡ Dukungan Keyboard Fisik",
    description: "Khusus pengguna desktop, Anda bisa mengetik langsung dari Numpad, menggunakan shortcut Ctrl+A untuk menyeleksi angka, serta menikmati haptic/visual feedback yang responsif.",
  },
];

export const MINOR_FIXES: string[] = [
  "Dashboard dan Laporan kini lebih cepat karena optimasi logika perhitungan data yang baru",
  "Perbaikan peringatan build pada dokumen PDF Laporan Bulanan.",
  "Penyempurnaan tata letak dialog transaksi untuk layar lebar agar tidak menutupi form."
];
