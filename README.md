# Kaslo - Aplikasi Pencatat Finansial Pribadi

Kaslo adalah aplikasi manajemen keuangan pribadi berbasis **Next.js + Supabase** untuk mencatat pemasukan, pengeluaran, transfer antar akun, serta memantau ringkasan keuangan bulanan.

Proyek ini sudah mendukung pengalaman **PWA (Progressive Web App)** dengan service worker, fallback halaman offline, dan UI responsif untuk mobile maupun desktop.

## Ringkasan Sistem

Sistem dibangun dengan arsitektur client-centric:

- Frontend menggunakan Next.js App Router dan React 19.
- Data disimpan di Supabase (PostgreSQL + Auth + Storage).
- Manajemen state server menggunakan TanStack Query.
- Autentikasi memakai Supabase Auth (email/password dan Google OAuth).
- Data user diamankan dengan RLS (Row Level Security).

Alur utama:

1. User registrasi/login.
2. User onboarding untuk isi profil awal dan saldo awal.
3. User mengelola akun keuangan, kategori, dan transaksi.
4. Dashboard dan laporan membaca data transaksi untuk analisis bulanan.

## Fitur Sistem

### 1. Autentikasi dan Otorisasi

- Login, signup, logout.
- Dukungan Google OAuth (`/auth/callback`).
- Route protection via `middleware.ts` untuk halaman privat:
	- `/dashboard`
	- `/accounts`
	- `/transactions`
	- `/reports`
	- `/profile`
	- `/onboarding`
- RLS di tabel Supabase agar user hanya bisa mengakses datanya sendiri.

### 2. Onboarding Pengguna Baru

- Input nama lengkap dan preferensi mata uang.
- Membuat akun awal otomatis (`Dompet Tunai`).
- Membuat kategori default awal (income/expense) saat onboarding.

### 3. Manajemen Akun Keuangan

- Tambah, lihat detail, edit, dan hapus akun.
- Tipe akun: `cash`, `bank`, `ewallet`, `savings`.
- Tiap akun memiliki ikon, warna, dan saldo.
- Fitur pencarian dan filter akun berdasarkan tipe.

### 4. Manajemen Kategori

- Kategori pemasukan dan pengeluaran.
- Sistem menggabungkan kategori default + kategori custom user.
- Mekanisme deduplikasi kategori berdasarkan nama dan tipe.
- Validasi hapus kategori jika masih dipakai transaksi.

### 5. Manajemen Transaksi

- Tambah, ubah, hapus transaksi.
- Jenis transaksi:
	- `income`
	- `expense`
	- `transfer`
- Filter lanjutan transaksi:
	- Pencarian teks
	- Jenis transaksi
	- Bulan dan tahun
	- Multi-select kategori
	- Multi-select akun
	- Rentang jumlah nominal
- Pengelompokan transaksi per hari (Hari ini, Kemarin, dst).
- Auto update saldo akun menggunakan RPC `increment_balance`.

### 6. Dashboard dan Analitik

- Total saldo seluruh akun.
- Ringkasan pemasukan dan pengeluaran bulan berjalan.
- Daftar transaksi terbaru.
- Donut chart pengeluaran per kategori.
- Breakdown persentase pengeluaran kategori.

### 7. Laporan Bulanan

- Navigasi periode bulan/tahun.
- Visualisasi pengeluaran per kategori.
- Persentase kontribusi kategori terhadap total pengeluaran.

### 8. Profil dan Pengaturan

- Ubah nama, email, password.
- Upload avatar ke Supabase Storage (`avatars` bucket).
- Atur mata uang.
- Atur tema (`light`, `dark`, `system`) dan sinkron ke database.

### 9. PWA dan Offline Support

- Service Worker dengan Serwist (`src/sw.ts`).
- Runtime caching untuk halaman, API, Supabase request, dan image.
- Fallback ke halaman `/offline` saat tidak ada koneksi.
- Periodic update service worker.

## Stack Teknologi

- Framework: Next.js 15 (App Router)
- UI: React 19, Tailwind CSS 4, shadcn/ui, Radix UI
- Data Fetching: TanStack Query
- Backend as a Service: Supabase (Auth, Postgres, Storage)
- Form & Validation: React Hook Form + Zod
- Chart: Recharts
- PWA: Serwist
- Animasi: Framer Motion
- Bahasa: TypeScript

## Struktur Data Utama (Supabase)

Berdasarkan `supabase/schema.sql`, tabel utama:

- `profiles`
- `accounts`
- `categories`
- `transactions`
- `budgets`

Objek penting:

- `transactions.related_transaction_id` dipakai untuk pasangan transfer antar akun.
- RPC `increment_balance(account_id, amount)` dipakai untuk menjaga saldo akun tetap sinkron.
- Trigger `handle_new_user` membuat profil saat user baru dibuat di `auth.users`.

## Menjalankan Proyek Secara Lokal

### 1. Prasyarat

- Node.js 20+ direkomendasikan.
- npm (atau pnpm/yarn/bun).
- Akun dan project Supabase.

### 2. Install dependency

```bash
npm install
```

### 3. Setup environment variable

Copy `env.example` menjadi `.env.local`, lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Jika ingin menjalankan seeding script:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Setup database Supabase

Jalankan SQL berikut di Supabase SQL Editor (urut):

1. `supabase/schema.sql`
2. `supabase/rpc.sql`
3. `supabase/storage.sql`
4. `supabase/seed.sql` (opsional untuk kategori default)

Opsional utilitas:

- `supabase/cleanup-duplicates.sql` untuk membersihkan kategori duplikat.

### 5. Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Script yang Tersedia

- `npm run dev` - Menjalankan development server (Turbopack).
- `npm run build` - Build production.
- `npm run start` - Menjalankan hasil build.
- `npm run lint` - Menjalankan ESLint.
- `npm run seed` - Menjalankan script data dummy (`scripts/seed.ts`).

## Struktur Folder Penting

- `src/app` - Routing dan halaman utama.
- `src/components` - Komponen UI dan fitur.
- `src/hooks` - Data hooks (profile/accounts/categories/transactions).
- `src/lib` - Client utilitas (Supabase client, formatter, helper).
- `supabase` - SQL schema, RPC, storage policy, seed.
- `scripts` - Script seeding data pengujian.
- `public` - Asset statis, manifest, service worker output.

## Deployment

Panduan deployment Vercel ada di `VERCEL_SETUP.md`.

Minimum environment variable di production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Untuk OAuth, pastikan URL callback sudah didaftarkan di Supabase:

- `https://your-domain.com/auth/callback`

## Catatan

- Service worker aktif di mode production (`NODE_ENV=production`).
- Pada mode development, PWA/service worker dinonaktifkan agar proses debug lebih stabil.
