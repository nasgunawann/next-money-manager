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
    id: "130526-main-balance-grouping",
    version: "Beta v0.4.0",
    title: "Update: Dashboard & Aset Lebih Rapi!",
    date: "2026-05-13",
    features: [
      {
        title: "🎯 Seleksi Saldo Utama",
        description: "Kini Kamu bisa memilih akun mana saja yang ingin dihitung di Dashboard. Cocok untuk memisahkan dana aktif dan aset jangka panjang!",
      },
      {
        title: "📂 Pengelompokan Aset",
        description: "Halaman Akun kini lebih rapi dengan grouping otomatis per tipe (Bank, Tunai, E-wallet) lengkap dengan sub-totalnya.",
      },
      {
        title: "⚡ Instant Edit & Delete",
        description: "Berkat Optimistic UI, perubahan warna atau penghapusan akun kini terasa instan tanpa loading yang mengganggu.",
      },
      {
        title: "🎨 Visual Refresh",
        description: "Warna aksen yang konsisten di semua halaman dan ikon indikator baru untuk akun yang tersembunyi dari dashboard.",
      }
    ],
    minorFixes: [
      "Sinkronisasi data antar dialog (Edit & Detail) kini berjalan real-time.",
      "Optimasi perhitungan total aset di halaman akun.",
      "Peningkatan responsivitas grid akun pada perangkat mobile.",
    ],
  },
  {
    id: "050526-calc-performance",
    version: "Beta v0.3.3",
    title: "Patch: Input Makin Sat-set!",
    date: "2026-05-05",
    features: [
      {
        title: "⚡ Ultra-Responsive Calculator",
        description: "Input angka kini jauh lebih ringan! Kami membuang beban render berat agar kalkulator tetap smooth di HP spek menengah.",
      },
      {
        title: "📳 Refined Haptics",
        description: "Efek getar saat mengetik kini lebih responsif dan hemat energi.",
      }
    ],
    minorFixes: [
      "Optimisasi render pada komponen keypad.",
      "Penghapusan efek visual berat yang tidak perlu.",
      "Perbaikan bug duplikasi kode di internal kalkulator.",
    ],
  },
  {
    id: "040526-pwa-ux-hotfix",
    version: "Beta v0.3.2",
    title: "HOTFIX: Startup Lebih Mulus!",
    date: "2026-05-04",
    features: [
      {
        title: "🚀 Instant Startup",
        description: "Login jadi lebih cepat! Tidak ada lagi 'flash' halaman landing saat Anda membuka aplikasi dalam keadaan sudah login.",
      },
      {
        title: "🛠️ PWA UX Improvement",
        description: "Aplikasi kini mendeteksi status login Anda lebih awal untuk navigasi yang lebih mulus di mode PWA.",
      }
    ],
    minorFixes: [
      "Perbaikan flash halaman login saat memuat dashboard.",
      "Optimasi sistem guard sesi untuk pengalaman navigasi yang lebih stabil."
    ]
  },
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

