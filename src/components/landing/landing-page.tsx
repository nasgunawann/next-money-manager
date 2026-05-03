"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  IconArrowRight,
  IconCheck,
  IconChartPie,
  IconChartBar,
  IconSun,
  IconMoon,
  IconLogin,
  IconWallet,
  IconBuildingBank,
  IconCoins,
  IconCreditCard,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { UPDATE_VERSION } from "@/constants/updates";
import { ExpenseDonutChart } from "@/components/data-display/expense-donut-chart";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.5 },
};

const WordFadeUp = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay },
    },
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
        bounce: 0.4,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={`inline-block ${className}`}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className="inline-block mr-[0.25em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const sections = ["features", "keunggulan", "cta"];
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { href: "#features", label: "Fitur", id: "features" },
    { href: "#keunggulan", label: "Keunggulan", id: "keunggulan" },
    { href: "#cta", label: "Mulai Sekarang", id: "cta" },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-5xl border border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 rounded-full shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-dark.svg" alt="Logo" width={100} height={24} className="hidden dark:block" />
            <Image src="/logolight.svg" alt="Logo" width={100} height={24} className="dark:hidden" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`transition-colors hover:text-foreground ${activeSection === link.id ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full w-9 h-9">
              <IconSun className="h-5 w-5 dark:hidden" />
              <IconMoon className="h-5 w-5 hidden dark:block" />
            </Button>
            <Button asChild size="sm" className="rounded-full px-6">
              <Link href="/login">Buka Aplikasi</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

const LiveAccountMockup = () => (
  <div className="w-full max-w-2xl grid grid-cols-2 md:grid-cols-3 gap-3 p-2">
    {[
      { name: "Bank BCA", type: "Bank", balance: "Rp 12.500.000", color: "#003b99", icon: <IconBuildingBank className="w-4 h-4" /> },
      { name: "GoPay", type: "E-Wallet", balance: "Rp 1.250.000", color: "#00aad4", icon: <IconWallet className="w-4 h-4" /> },
      { name: "Uang Tunai", type: "Tunai", balance: "Rp 450.000", color: "#10b981", icon: <IconCoins className="w-4 h-4" /> },
      { name: "Tabungan", type: "Savings", balance: "Rp 50.000.000", color: "#f59e0b", icon: <IconCreditCard className="w-4 h-4" /> },
      { name: "Kantong Jago", type: "Bank", balance: "Rp 5.000.000", color: "#ff4f00", icon: <IconBuildingBank className="w-4 h-4" /> },
      { name: "OVO", type: "E-Wallet", balance: "Rp 200.000", color: "#4c2a86", icon: <IconWallet className="w-4 h-4" /> },
    ].map((acc, i) => (
      <div
        key={i}
        className={`p-3 rounded-xl bg-background/50 border border-border/50 shadow-sm flex flex-col gap-2 transition-all hover:translate-y-[-2px] hover:shadow-md ${i > 3 ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: acc.color }}>
            {acc.icon}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[11px] truncate">{acc.name}</p>
            <p className="text-[8px] uppercase font-black text-muted-foreground">{acc.type}</p>
          </div>
        </div>
        <p className="text-sm font-black tabular-nums">{acc.balance}</p>
      </div>
    ))}
  </div>
);

const LiveReportMockup = () => {
  const dummyData = [
    { name: "Belanja", value: 2500000, color: "#f87171", icon: "shopping-bag" },
    { name: "Transport", value: 1200000, color: "#60a5fa", icon: "bus" },
    { name: "Hiburan", value: 800000, color: "#34d399", icon: "film" },
    { name: "Makanan", value: 1500000, color: "#fbbf24", icon: "utensils" },
  ];

  return (
    <div className="w-full max-w-lg h-full flex items-center justify-center relative">
      {/* Floating Detail Tags */}
      <motion.div
        animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-1/4 -left-4 md:-left-8 z-20 bg-card/90 backdrop-blur-md p-3 rounded-2xl border border-border shadow-2xl flex items-center gap-3"
      >
        <div className="w-2 h-2 rounded-full bg-[#f87171]" />
        <div className="text-[10px] md:text-xs">
          <p className="font-bold leading-none mb-0.5 text-foreground">Belanja</p>
          <p className="text-muted-foreground font-bold leading-none">Rp 1.750.000</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-1/4 -right-4 md:-right-8 z-20 bg-card/90 backdrop-blur-md p-3 rounded-2xl border border-border shadow-2xl flex items-center gap-3"
      >
        <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
        <div className="text-[10px] md:text-xs">
          <p className="font-bold leading-none mb-0.5 text-foreground">Makan</p>
          <p className="text-muted-foreground font-bold leading-none">Rp 750.000</p>
        </div>
      </motion.div>

      <div className="w-full scale-110 md:scale-125 transition-transform relative z-10">
        <ExpenseDonutChart
          data={dummyData}
          totalExpense={6000000}
          currency="IDR"
          amountVisible={true}
        />
      </div>
    </div>
  );
};

const Hero = () => (
  <section className="relative pt-24 pb-16 md:pt-32 md:pb-16 overflow-hidden">
    {/* Background Decorations */}
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb,59,130,246),0.08),transparent_45%),radial-gradient(circle_at_center,rgba(var(--primary-rgb,59,130,246),0.05),transparent_70%)]"></div>
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(rgba(var(--primary-rgb,59,130,246),0.12)_1px,transparent_1px)] bg-size-32px_32px mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground pt-12">
          <WordFadeUp text="Saatnya Kamu Sadar," />
          <br />{" "}
          <span className="text-primary">
            <WordFadeUp text="Uangmu ke Mana Saja." delay={0.5} />
          </span>
        </h1>
        <motion.p
          {...fadeIn}
          transition={{ delay: 0.8 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Kaslo membantu kamu mencatat setiap pengeluaran, menyusun anggaran cerdas, dan memantau kesehatan finansial kamu dengan mudah dan aman.
        </motion.p>

        <motion.div
          {...fadeIn}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
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
        </motion.div>
      </div>

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

const FeatureOne = () => (
  <section id="features" className="py-24 overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div {...fadeIn} className="max-w-xl">
          <h2 className="text-3xl md:text-6xl font-bold tracking-tight mb-6">
            <WordFadeUp text="Catat uang keluar." />
            <br />
            <WordFadeUp text="Selesai." delay={0.4} />
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Tidak ada form bertele-tele. Masukkan nominal, pilih kategori, dan simpan. Sinkronisasi real-time ke semua perangkat Anda tanpa lag.
          </p>
          <ul className="space-y-4 mb-8">
            {['Kategori kustom tanpa batas', 'Mendukung multi-akun (Bank, E-Wallet, Tunai)', 'Antarmuka super responsif'].map((item, i) => (
              <li key={i} className="flex items-center text-muted-foreground">
                <IconCheck className="h-5 w-5 mr-3 text-primary" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="rounded-full w-full sm:w-auto px-8 h-12 text-base">
            <Link href="/signup">
              Catat Keuanganmu! <IconArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        <motion.div {...fadeIn} className="relative">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden flex items-center justify-center p-4 md:p-8">
            <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
              <Image
                src="/device.png"
                alt="Mobile Interface Preview"
                width={1080}
                height={1080}
                className="w-full h-full object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const NumberTicker = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Intl.NumberFormat("id-ID").format(Number(latest.toFixed(0)))}${suffix}`;
      }
    });
  }, [springValue, prefix, suffix]);

  return <span ref={ref} className="text-4xl md:text-6xl font-bold text-primary tracking-tighter" />;
};

const StatsSection = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="container mx-auto px-4 relative z-10">
      <motion.div {...fadeIn} className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-center">Bantu Catat Alur Kas-lo.</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Pengguna sudah merasakan kegunaannya. Saatnya giliran kamu!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="flex flex-col gap-2 text-center bg-muted/50 shadow-inner backdrop-blur-sm border border-border/50 rounded-full p-8">
          <NumberTicker value={2000} suffix="+" />
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Transaksi Dicatat</p>
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="flex flex-col gap-2 text-center bg-muted/50 shadow-inner backdrop-blur-sm border border-border/50 rounded-full p-8">
          <NumberTicker value={25} prefix="Rp " suffix="M+" />
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Jumlah Dana Terkelola</p>
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="flex flex-col gap-2 text-center bg-muted/50 shadow-inner backdrop-blur-sm border border-border/50 rounded-full p-8">
          <NumberTicker value={100} suffix="+" />
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Rekening Dipantau</p>
        </motion.div>
      </div>
    </div>
  </section>
);

const FeatureTwo = () => (
  <section className="py-24 overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div {...fadeIn} className="order-2 lg:order-1 relative">
          <div className="aspect-square rounded-3xl overflow-visible flex items-center justify-center p-4 md:p-8">
            <LiveReportMockup />
          </div>
        </motion.div>

        <motion.div {...fadeIn} className="order-1 lg:order-2 max-w-xl lg:ml-auto">
          <h2 className="text-3xl md:text-6xl font-bold tracking-tight mb-6">
            <WordFadeUp text="Berhenti menebak." />
            <br />
            <WordFadeUp text="Lihat datanya." delay={0.4} />
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Kaslo otomatis memecah pengeluaranmu ke dalam visual yang mudah dipahami. Ketahui pasti ke mana uangmu pergi bulan ini.
          </p>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <IconChartPie className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Distribusi Kategori</h4>
                <p className="text-sm text-muted-foreground mt-1">Grafik donat interaktif untuk melihat porsi pengeluaran terbesar.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <IconChartBar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Export PDF Instan</h4>
                <p className="text-sm text-muted-foreground mt-1">Unduh laporan bulanan yang rapi untuk evaluasi pribadi.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const FeatureCards = () => (
  <section id="keunggulan" className="py-24 bg-card border-y border-border/50">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <motion.div {...fadeIn} className="text-center max-w-5xl mx-auto mb-16">
        <h2 className="text-3xl md:text-6xl font-bold tracking-tight mb-4">
          <WordFadeUp text="Sederhana, Cukup untuk Kita." />
        </h2>
        <p className="text-lg text-muted-foreground">Dilengkapi hanya dengan fitur-fitur yang kamu pedulikan.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "Banyak Rekening? Tidak Masalah",
            desc: "Kelola saldo Bank, E-Wallet, dan Uang Tunai dalam satu tempat tanpa pusing.",
            component: <LiveAccountMockup />
          },
          {
            title: "Akses di Mana Saja",
            desc: "Buka di laptop saat kerja, atau di HP saat di jalan. Semua tersinkronisasi otomatis.",
            img: "/dekstopmobile.png",
            imgW: 1440,
            imgH: 1080,
            fit: "cover",
            pos: "object-center"
          },
          {
            title: "Instan, Tanpa App Store",
            desc: "Pasang di HP kamu dalam hitungan detik. Hemat memori, secepat kilat, dan bekerja sempurna meski offline.",
            img: "/app.png",
            imgW: 1080,
            imgH: 1080,
            fit: "cover",
            pos: "object-top"
          },
          {
            title: "Privasi Tanpa Kompromi",
            desc: "Data keuanganmu milikmu sepenuhnya. Tanpa pelacak tersembunyi.",
            img: "/security.png",
            imgW: 1080,
            imgH: 1080,
            fit: "cover",
            pos: "object-top"
          }
        ].map((card, i) => (
          <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="p-6 md:p-8 rounded-2xl bg-linear-to-br from-primary/15 to-background flex flex-col transition-all overflow-hidden group">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2 tracking-tight">{card.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
            </div>

            <div className="mt-8 relative aspect-square w-full rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center">
              {card.component ? (
                card.component
              ) : card.img ? (
                <Image
                  src={card.img}
                  alt={card.title}
                  width={card.imgW || 1000}
                  height={card.imgH || 1000}
                  className={`w-full h-full ${card.fit === 'contain' ? 'object-contain' : 'object-cover'} ${card.pos || 'object-center'}`}
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary/10 via-accent/5 to-background" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Testimonial = () => (
  <section id="testimoni" className="py-32 overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
      <motion.div {...fadeIn}>
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4, 5].map(i => <svg key={i} className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>)}
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-12 leading-tight">
          <WordFadeUp text="&quot;Saya awalnya mau tracking keuangan saya pakai spreadsheet, tapi ternyata ribet. Semenjak pakai aplikasi ini jadi lebih mudah untuk cek pengeluaran dan pemasukan saya. &quot;" />
        </h2>
        <div className="flex items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full bg-muted border-2 border-primary overflow-hidden">
            <img className="w-full h-full object-cover" src="https://i.pravatar.cc/150?img=54" alt="avatar" />
          </div>
          <div className="text-left">
            <div className="font-bold text-foreground">Richie</div>
            <div className="text-sm text-muted-foreground">Pengguna</div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const CtaBlock = () => (
  <section id="cta" className="py-24 mb-12 overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
      <motion.div
        {...fadeIn}
        className="relative rounded-[2.5rem] bg-linear-to-br from-primary via-primary/90 to-blue-600 px-8 py-12 md:px-16 md:py-20 overflow-hidden shadow-2xl"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              <WordFadeUp text="Siap Pegang Kendali Penuh Uangmu?" />
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-lg leading-relaxed">
              Bergabunglah dengan para pengguna yang telah menemukan cara termudah mencatat pengeluaran. Gratis, aman, dan tanpa iklan.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button asChild size="lg" variant="default" className="bg-white text-black rounded-full w-full sm:w-auto px-10 h-14 text-base font-bold shadow-lg hover:shadow-xl transition-all">
                <Link href="/signup">Buat Akun Gratis Sekarang</Link>
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-6 flex items-center gap-2">
              <IconCheck className="h-4 w-4" /> Langsung pakai.
            </p>
            <p className="text-sm text-white/70 mt-3 flex items-center gap-2">
              <IconCheck className="h-4 w-4" /> Aman dan terpercaya.
            </p>
            <p className="text-sm text-white/70 mt-3 flex items-center gap-2">
              <IconCheck className="h-4 w-4" /> Tanpa iklan.
            </p>
            <p className="text-sm text-white/70 mt-3 flex items-center gap-2">
              <IconCheck className="h-4 w-4" /> Gratis.
            </p>
          </div>

          <div className="relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative mx-auto w-full aspect-square flex items-center justify-center overflow-visible"
            >
              <Image
                src="/device.png"
                alt="Kaslo Preview"
                width={1080}
                height={1080}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>
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
        <p>&copy; {new Date().getFullYear()} Kaslo - by <Link href="https://nanasgunung.com" className="hover:text-foreground underline">Nanasgunung</Link>. All rights reserved.</p>
        {UPDATE_VERSION}
      </div>
    </div>
  </footer>
);

const LandingPage = () => {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
        <Navbar />
        <main className="flex-1 overflow-hidden">
          <Hero />
          <FeatureOne />
          <StatsSection />
          <FeatureTwo />
          <FeatureCards />
          {/* <Testimonial /> TODO  */}
          <CtaBlock />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
};

export default LandingPage;
