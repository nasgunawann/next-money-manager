"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  IconCalendar,
  IconDashboard,
  IconFileText,
  IconLogin2,
  IconSparkles,
} from "@tabler/icons-react";

const LandingPage = () => {
  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden border-b border-accent"
    >
      <div className="max-w-7xl w-full flex flex-col lg:flex-row mx-auto items-center justify-between gap-y-14 gap-x-10 px-6 py-12 lg:py-0">
        {/* Kiri: teks */}
        <div className="max-w-xl text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <IconDashboard size={32} />
            <IconFileText size={32} />
            <IconCalendar size={32} />
            <IconSparkles size={32} />
          </div>

          <h1 className="mt-4 max-w-[20ch] text-3xl xs:text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.2] tracking-tight">
            Ini adalah Landing Page Kaslo - by Nanasgunung
          </h1>

          <p className="mt-6 max-w-[60ch] mx-auto lg:mx-0 text-base xs:text-lg text-muted-foreground">
            Kaslo adalah aplikasi manajemen keuangan pribadi sumber terbuka yang
            dirancang untuk membantu Anda mengelola anggaran dan melacak
            pengeluaran dengan mudah.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/register" passHref>
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-full text-base"
              >
                <span>
                  Mulai Rencanakan Sekarang!
                  <ArrowUpRight className="h-5 w-5 inline-block ml-2" />
                </span>
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full text-base"
              >
                <span>
                  Punya Akun?
                  <IconLogin2 className="h-5 w-5 inline-block ml-2" />
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Kanan: gambar */}
        <div className="relative w-full max-w-4xl aspect-4/3 rounded-xl overflow-hidden">
          <Image
            src="/mockup.png"
            fill
            alt="Dashboard preview"
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
