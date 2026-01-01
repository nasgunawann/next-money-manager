"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SignupForm } from "@/components/auth/signup-form";
import { LoginForm } from "@/components/auth/login-form";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function PWAOnboarding() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Left Section */}
      <div
        className="relative flex flex-col justify-between p-8 md:p-12 bg-background dark:bg-background bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb,59,130,246),0.15),transparent_35%),radial-gradient(circle_at_center,rgba(var(--primary-rgb,59,130,246),0.15),transparent_80%),radial-gradient(rgba(var(--primary-rgb,59,130,246),0.14)_1px,transparent_1px)] overflow-hidden border-b md:border-b-0 md:border-r border-border max-h-screen"
        style={{
          backgroundSize: "auto, auto, 22px 22px",
          backgroundPosition: "center, center, 0 0",
        }}
      >
        {/* Top Content */}
        <div className="space-y-3 md:space-y-6 relative z-10">
          {/* Logo */}
          <motion.div
            className="flex items-center justify-center md:justify-start gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/logo-dark.svg"
              alt="Kaslo Logo"
              width={100}
              height={30}
              className="hidden dark:block md:w-[150px] md:h-10"
            />
            <Image
              src="/logolight.svg"
              alt="Kaslo Logo"
              width={100}
              height={30}
              className="dark:hidden md:w-[150px] md:h-10"
            />
          </motion.div>

          <motion.div
            className="text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-foreground">
              Kelola Keuangan Anda
              <br />
              Lebih Mudah.
            </h1>
            <p className="hidden md:block text-sm md:text-md text-muted-foreground mt-2 md:mt-4">
              Pantau pengeluaran, kelola anggaran, dan capai tujuan finansial
              Anda.
            </p>
          </motion.div>
        </div>

        {/* Mockup - pushed to bottom naturally */}
        <motion.div
          className="mt-auto -mb-8 sm:-mb-16 md:-mb-32 flex justify-center pointer-events-none"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="relative h-[280px] sm:h-[280px] md:h-[400px] lg:h-[500px] xl:h-[550px] overflow-hidden">
            <Image
              src="/mockup.png"
              alt="App Mockup"
              width={1659}
              height={1395}
              className="object-cover object-top"
              quality={100}
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-card md:bg-background">
        {/* Desktop: buttons inline */}
        <div className="hidden md:block w-full max-w-md space-y-3 md:space-y-8 text-center">
          <div className="space-y-1 md:space-y-2">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              Mulai Mencatat Sekarang!
            </h2>
            <p className="text-md md:text-base text-muted-foreground">
              Daftar atau masuk untuk melanjutkan
            </p>
          </div>

          <div className="space-y-2 md:space-y-4">
            <Link href="/signup" className="block w-full">
              <Button
                size="lg"
                className="w-full h-10 md:h-14 text-sm md:text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                Daftar Akun Baru
              </Button>
            </Link>

            <Link href="/login" className="block w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-10 md:h-14 text-sm md:text-base font-semibold bg-background hover:bg-accent/10 transition-all hover:scale-[1.02]"
              >
                Masuk ke Akun
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground pt-0 md:pt-4">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link
              href="/terms"
              className="text-primary hover:underline underline-offset-4"
            >
              Syarat & Ketentuan
            </Link>{" "}
            dan{" "}
            <Link
              href="/privacy"
              className="text-primary hover:underline underline-offset-4"
            >
              Kebijakan Privasi
            </Link>
          </p>
        </div>

        {/* Mobile: two drawers, one per action */}
        <div className="w-full max-w-md space-y-3 text-center md:hidden">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Mulai Mencatat Sekarang!
            </h2>
            <p className="text-sm text-muted-foreground">
              Daftar atau masuk untuk melanjutkan
            </p>
          </div>

          <div className="space-y-3">
            <Drawer>
              <DrawerTrigger asChild>
                <Button className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20">
                  Daftar Akun Baru
                </Button>
              </DrawerTrigger>
              <DrawerContent className="pb-6 max-h-[80vh] overflow-y-auto">
                <DrawerHeader>
                  <DrawerTitle className="text-xl font-bold">
                    Daftar Akun Baru
                  </DrawerTitle>
                  <p className="text-sm text-muted-foreground">
                    Isi formulir untuk membuat akun
                  </p>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  <SignupForm embedded />
                </div>
              </DrawerContent>
            </Drawer>

            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 text-sm font-semibold bg-background hover:bg-accent/10"
                >
                  Masuk ke Akun
                </Button>
              </DrawerTrigger>
              <DrawerContent className="pb-6 max-h-[80vh] overflow-y-auto">
                <DrawerHeader>
                  <DrawerTitle className="text-xl font-bold">
                    Masuk ke Akun
                  </DrawerTitle>
                  <p className="text-sm text-muted-foreground">
                    Gunakan email dan kata sandi Anda
                  </p>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  <LoginForm embedded />
                </div>
              </DrawerContent>
            </Drawer>

            <p className="text-xs text-muted-foreground pt-1">
              Dengan mendaftar, Anda menyetujui
              <Link
                href="/terms"
                className="text-primary hover:underline underline-offset-4 ml-1"
              >
                Syarat & Ketentuan
              </Link>{" "}
              dan
              <Link
                href="/privacy"
                className="text-primary hover:underline underline-offset-4 ml-1"
              >
                Kebijakan Privasi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
