import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIASIK — Sistem Manajemen Arsip Digital | Pusstandik SDM KP",
  description:
    "Sistem Informasi Arsip Standarisasi & Sertifikasi (SIASIK) — Pusat Standardisasi dan Sertifikasi SDM Kelautan dan Perikanan, KKP.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-100 text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
