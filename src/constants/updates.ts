export interface UpdateFeature {
  title: string;
  description: string;
}

export interface UpdateInfo {
  id: string;
  version: string;
  title: string;
  date: string;
  features: UpdateFeature[];
  minorFixes?: string[];
}

export const UPDATES_HISTORY: UpdateInfo[] = [
  {
    id: "260424-reorder-calculator-update",
    version: "Beta v0.3.1",
    title: "Ada yang baru!",
    date: "2026-04-24",
    features: [
      {
        title: "🔃 Atur Urutan Akun",
        description: "Kini Kamu bisa mengatur urutan Sumber Dana dengan Drag & Drop di halaman Akun. Letakkan rekening utama Kamu di paling depan!",
      },
      {
        title: "✨ Menambah Animasi",
        description: "Saat mengatur urutan sumber dana, akan ada efek animasi dan getaran saat memindahkan kartu akun.",
      },
      {
        title: "🧮 Smart Calculator Keypad",
        description: "Tidak perlu lagi aplikasi luar! Kini form input nominal dilengkapi dengan kalkulator bawaan pintar untuk mobile (Drawer) maupun desktop (Popover) dengan fitur evaluasi parsial.",
      },
      {
        title: "⚡ Dukungan Keyboard Fisik",
        description: "Khusus pengguna desktop, Anda bisa mengetik langsung dari Numpad, menggunakan shortcut Ctrl+A untuk menyeleksi angka, serta menikmati haptic/visual feedback yang responsif.",
      },
    ],
    minorFixes: [
      "Dashboard dan Laporan kini lebih cepat karena optimasi logika perhitungan data yang baru",
      "Perbaikan peringatan build pada dokumen PDF Laporan Bulanan.",
      "Penyempurnaan tata letak dialog transaksi untuk layar lebar agar tidak menutupi form.",
      "Peningkatan keamanan melalui migrasi Server Actions dan implementasi Optimistic UI.",
    ]
  },
  {
    id: "260420-update-message",
    version: "Beta v0.2.1",
    title: "Ada yang baru!",
    date: "2026-04-20",
    features: [
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
    ],
    minorFixes: [
      "Perbaikan typo (kesalahan pengetikan) pada halaman Dashboard."
    ]
  },
];

// Helper constants for existing components to keep working
export const LATEST_UPDATE_ID = UPDATES_HISTORY[0].id;
export const UPDATE_VERSION = UPDATES_HISTORY[0].version;
export const UPDATE_TITLE = UPDATES_HISTORY[0].title;
export const UPDATE_FEATURES = UPDATES_HISTORY[0].features;
export const MINOR_FIXES = UPDATES_HISTORY[0].minorFixes || [];

