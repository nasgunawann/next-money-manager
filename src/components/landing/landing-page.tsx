"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconCheck,
  IconChartPie,
  IconShieldLock,
  IconDeviceMobile,
  IconBolt,
  IconChartBar,
  IconSun,
  IconMoon,
  IconLogin,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { UPDATE_VERSION } from "@/constants/updates";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.5 },
};

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-5xl border border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 rounded-full shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-dark.svg" alt="Logo" width={100} height={24} className="hidden dark:block" />
            <Image src="/logolight.svg" alt="Logo" width={100} height={24} className="dark:hidden" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Fitur</Link>
            <Link href="#keunggulan" className="hover:text-foreground transition-colors">Keunggulan</Link>
            <Link href="#testimoni" className="hover:text-foreground transition-colors">Testimoni</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full w-9 h-9">
              <IconSun className="h-5 w-5 dark:hidden" />
              <IconMoon className="h-5 w-5 hidden dark:block" />
            </Button>
            <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2">
              Masuk
            </Link>
            <Button asChild size="sm" className="rounded-full px-4 sm:px-6">
              <Link href="/signup">Daftar</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

const Hero = () => (
  <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
    {/* Background Decorations */}
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb,59,130,246),0.08),transparent_45%),radial-gradient(circle_at_center,rgba(var(--primary-rgb,59,130,246),0.05),transparent_70%)]"></div>
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(rgba(var(--primary-rgb,59,130,246),0.12)_1px,transparent_1px)] bg-size-32px_32px mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          {UPDATE_VERSION}
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground pb-2">
          Kendalikan Keuangan Kamu, <br className="md:hidden" />{" "}
          <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-blue-400 to-emerald-400">
            Raih Kebebasan Finansial.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Kaslo membantu kamu mencatat setiap pengeluaran, menyusun anggaran cerdas, dan memantau kesehatan finansial kamu dengan mudah dan aman.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="rounded-full w-full sm:w-auto px-8 h-12 text-base">
            <Link href="/signup">
              Mulai Sekarang, Gratis! <IconArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full w-full sm:w-auto px-8 h-12 text-base">
            <Link href="/login">
              Sudah Punya Akun? <IconLogin className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-16 md:mt-24 relative mx-auto max-w-5xl"
      >
        <div className="absolute -inset-20 bg-primary/20 blur-3xl rounded-full opacity-20 -z-10 animate-pulse"></div>
        <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card transform-[perspective(2000px)_rotateX(10deg)] mask-[linear-gradient(to_bottom,black_70%,transparent_100%)]">
          <Image
            src="/dashboard-dark.png"
            alt="App Interface Dark"
            width={1659}
            height={1395}
            className="hidden dark:block w-full h-auto object-cover"
            priority
          />
          <Image
            src="/dashboard-light.png"
            alt="App Interface Light"
            width={1659}
            height={1395}
            className="dark:hidden w-full h-auto object-cover"
            priority
          />
        </div>
      </motion.div>
    </div>
  </section>
);

const LogoCloud = () => (
  <section className="py-12 border-y border-border/50 bg-muted/20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <p className="text-center text-sm font-medium text-muted-foreground mb-8">
        DIPERCAYA OLEH RIBUAN PENGGUNA UNTUK MENGELOLA KEUANGAN MEREKA
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
        <div className="text-xl font-bold font-mono">FINANCE+</div>
        <div className="text-xl font-bold font-serif">MoneyGuard</div>
        <div className="text-xl font-bold">Wealthy</div>
        <div className="text-xl font-bold font-mono">CASHFLOW</div>
        <div className="text-xl font-bold">SaveSmart</div>
      </div>
    </div>
  </section>
);

const FeatureOne = () => (
  <section id="features" className="py-24 overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div {...fadeIn} className="max-w-xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Pencatatan instan,<br />tanpa ribet.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Catat pengeluaran dan pemasukan harian Kamu hanya dalam beberapa detik. Kategori pintar kami secara otomatis mengelompokkan transaksi Kamu untuk analisis yang lebih baik.
          </p>
          <ul className="space-y-4 mb-8">
            {['Kategori kustom tanpa batas', 'Pencatatan multi-mata uang', 'Pencatatan transaksi berulang'].map((item, i) => (
              <li key={i} className="flex items-center text-muted-foreground">
                <IconCheck className="h-5 w-5 mr-3 text-primary" />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="inline-flex items-center text-primary font-medium hover:underline">
            Pelajari lebih lanjut <IconArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div {...fadeIn} className="relative">
          <div className="relative aspect-square w-full rounded-3xl bg-linear-to-br from-primary/10 via-accent/5 to-background shadow-xl overflow-hidden flex items-center justify-center p-8">
            <div className="relative aspect-9/16 h-full rounded-2xl shadow-2xl overflow-hidden">
              <Image
                src="/device.png"
                alt="Mobile Interface Dark"
                width={1080}
                height={1080}
                className="hidden dark:block w-full h-full object-cover"
              />
              <Image
                src="/dashboard-mobile-light.png"
                alt="Mobile Interface Light"
                width={1080}
                height={1920}
                className="dark:hidden w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const FeatureGrid = () => (
  <section className="py-24 bg-muted/30 border-y border-border/50">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <IconBolt className="h-6 w-6 text-primary" />,
            title: "Super Cepat",
            desc: "Aplikasi dioptimalkan untuk performa maksimal, memuat data dalam hitungan milidetik."
          },
          {
            icon: <IconShieldLock className="h-6 w-6 text-primary" />,
            title: "Keamanan Bank",
            desc: "Data Kamu dienkripsi dan disimpan dengan stKamur keamanan tingkat tinggi."
          },
          {
            icon: <IconDeviceMobile className="h-6 w-6 text-primary" />,
            title: "Akses Offline",
            desc: "PWA memungkinkan Kamu mencatat transaksi bahkan saat tidak ada koneksi internet."
          }
        ].map((feature, i) => (
          <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="p-8 rounded-2xl bg-card border border-border">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FeatureTwo = () => (
  <section id="keunggulan" className="py-24 overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div {...fadeIn} className="order-2 lg:order-1 relative">
          <div className="aspect-square md:aspect-4/3 rounded-2xl bg-linear-to-bl from-primary/20 to-accent/20 border border-border overflow-hidden p-8 flex items-center justify-center">
            <div className="w-full max-w-md bg-card rounded-xl shadow-2xl border border-border p-6">
              <div className="flex items-end gap-2 h-40 mt-8">
                {[40, 70, 45, 90, 60, 100].map((h, i) => (
                  <div key={i} className="w-full bg-primary/20 rounded-t-sm relative group">
                    <div className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeIn} className="order-1 lg:order-2 max-w-xl lg:ml-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Analisis mendalam untuk keputusan lebih cerdas.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Ubah data mentah menjadi wawasan berharga. Laporan visual kami membantu Kamu memahami kebiasaan belanja dan menemukan area di mana Kamu bisa berhemat.
          </p>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <IconChartPie className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Grafik Interaktif</h4>
                <p className="text-sm text-muted-foreground mt-1">Visualisasi data pengeluaran Kamu dari bulan ke bulan.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <IconChartBar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Laporan Terperinci</h4>
                <p className="text-sm text-muted-foreground mt-1">Ekspor laporan ke PDF atau CSV untuk keperluan audit.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const FeatureCards = () => (
  <section className="py-24 bg-card border-y border-border/50">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Integrasi mulus dengan gaya hidup Kamu.</h2>
        <p className="text-lg text-muted-foreground">Dirancang untuk beradaptasi dengan cara Kamu mengelola uang, bukan sebaliknya.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { title: "Manajemen Anggaran", desc: "Setel batas pengeluaran bulanan untuk setiap kategori.", h: "h-64" },
          { title: "Target Finansial", desc: "Lacak tabungan Kamu untuk membeli mobil impian atau liburan.", h: "h-72" },
          { title: "Pengingat Tagihan", desc: "Jangan pernah melewatkan jatuh tempo pembayaran lagi.", h: "h-64" }
        ].map((card, i) => (
          <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className={`p-8 rounded-2xl bg-background border border-border flex flex-col ${card.h}`}>
            <h3 className="text-xl font-bold mb-2">{card.title}</h3>
            <p className="text-muted-foreground">{card.desc}</p>
            <div className="mt-auto pt-6 flex-1 w-full bg-muted/50 rounded-xl border border-border/50"></div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonial = () => (
  <section id="testimoni" className="py-32 overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
      <motion.div {...fadeIn}>
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4, 5].map(i => <svg key={i} className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>)}
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-12 leading-tight">
          &quot;Semenjak menggunakan Kaslo, saya bisa menabung 30% lebih banyak setiap bulannya. Antarmukanya sangat intuitif dan fiturnya tepat seperti yang saya butuhkan.&quot;
        </h2>
        <div className="flex items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full bg-muted border-2 border-primary overflow-hidden">
            <div className="w-full h-full bg-linear-to-tr from-blue-400 to-emerald-400"></div>
          </div>
          <div className="text-left">
            <div className="font-bold text-foreground">Budi Santoso</div>
            <div className="text-sm text-muted-foreground">Freelancer & Pengusaha</div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const CtaBlock = () => (
  <section className="py-24 mb-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
      <motion.div {...fadeIn} className="relative rounded-3xl bg-primary px-6 py-16 md:px-16 md:py-20 overflow-hidden text-center">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-2xl mx-auto text-primary-foreground">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Mulai kelola keuangan Kamu hari ini.</h2>
          <p className="text-lg md:text-xl opacity-90 mb-10">
            Bergabunglah dengan ribuan pengguna lainnya yang telah menemukan kebebasan finansial bersama Kaslo. Gratis selamanya untuk fitur dasar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="rounded-full w-full sm:w-auto px-8 h-14 text-base font-bold text-primary">
              <Link href="/signup">Buat Akun Gratis</Link>
            </Button>
            <p className="text-sm opacity-80 mt-4 sm:mt-0 sm:ml-4">Tidak perlu kartu kredit.</p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 md:py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Image src="/logo-dark.svg" alt="Logo" width={100} height={24} className="hidden dark:block" />
            <Image src="/logolight.svg" alt="Logo" width={100} height={24} className="dark:hidden" />
          </div>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">
            Aplikasi manajemen keuangan pribadi sumber terbuka untuk masa depan yang lebih baik.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">𝕏</div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">in</div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">GH</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Produk</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="#features" className="hover:text-foreground">Fitur Utama</Link></li>
            <li><Link href="#" className="hover:text-foreground">Harga</Link></li>
            <li><Link href="#keunggulan" className="hover:text-foreground">Keamanan</Link></li>
            <li><Link href="#" className="hover:text-foreground">PWA Install</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Sumber Daya</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-foreground">Pusat Bantuan</Link></li>
            <li><Link href="#" className="hover:text-foreground">Panduan</Link></li>
            <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
            <li><Link href="#" className="hover:text-foreground">Komunitas</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-foreground">Kebijakan Privasi</Link></li>
            <li><Link href="#" className="hover:text-foreground">Syarat Layanan</Link></li>
            <li><Link href="#" className="hover:text-foreground">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Kaslo - by Nanasgunung. All rights reserved.</p>
        <p>Built with Next.js & Tailwind CSS.</p>
      </div>
    </div>
  </footer>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <Hero />
        <LogoCloud />
        <FeatureOne />
        <FeatureGrid />
        <FeatureTwo />
        <FeatureCards />
        <Testimonial />
        <CtaBlock />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
