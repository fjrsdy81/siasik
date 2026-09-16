"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-client";
import { initials } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "arsiparis", "pimpinan", "pegawai"] },
  { href: "/arsip", label: "Data Arsip", icon: "🗂️", roles: ["admin", "arsiparis", "pimpinan", "pegawai"] },
  { href: "/tambah", label: "Tambah Arsip", icon: "➕", roles: ["admin", "arsiparis"] },
  { href: "/peminjaman", label: "Peminjaman", icon: "🔄", roles: ["admin", "arsiparis", "pimpinan", "pegawai"] },
  { href: "/kategori", label: "Kategori", icon: "🏷️", roles: ["admin", "arsiparis"] },
  { href: "/unit-kerja", label: "Unit Kerja", icon: "🏢", roles: ["admin", "arsiparis"] },
  { href: "/pengguna", label: "Pengguna", icon: "👥", roles: ["admin", "pimpinan"] },
  { href: "/laporan", label: "Laporan", icon: "📑", roles: ["admin", "arsiparis", "pimpinan"] },
  { href: "/audit", label: "Audit Log", icon: "🛡️", roles: ["admin", "arsiparis", "pimpinan"] },
  { href: "/bantuan", label: "Bantuan", icon: "❓", roles: ["admin", "arsiparis", "pimpinan", "pegawai"] },
];

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-700 via-cyan-600 to-teal-500 text-2xl text-white shadow-lg shadow-sky-900/30">
        ⚓
        <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-[11px] ring-2 ring-white">
          ✓
        </span>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-extrabold tracking-tight text-white">SIASIK</span>
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-sky-200">
            Arsip Digital • SDM KP
          </span>
        </span>
      )}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0a2540]">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/10 text-4xl animate-float">⚓</div>
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/20 border-t-white" />
          <p className="text-sm font-semibold tracking-wide text-sky-200">Memuat SIASIK...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const menus = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col bg-[#0a2540] lg:flex">
        <div className="ocean-grid flex items-center justify-between px-5 pb-5 pt-6">
          <Logo />
        </div>
        <div className="mx-5 rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-300">Pusstandik SDM KP</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-300">
            Kementerian Kelautan &amp; Perikanan RI
          </p>
        </div>
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {menus.map((m) => {
            const active = pathname === m.href || (m.href !== "/dashboard" && pathname.startsWith(m.href));
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-950/40"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-lg leading-none">{m.icon}</span>
                {m.label}
                {active && <span className="ml-auto h-2 w-2 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <div className="rounded-2xl bg-gradient-to-br from-teal-500/20 to-sky-500/20 p-4 ring-1 ring-white/10">
            <p className="text-xs font-bold text-white">💡 Tips Arsiparis</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
              Lakukan retensi berkala. Arsip inaktif &gt; 5 tahun dapat diusulkan musnah sesuai JRA.
            </p>
          </div>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/15 px-4 py-2.5 text-sm font-bold text-rose-200 ring-1 ring-rose-400/30 transition hover:bg-rose-500/30"
          >
            ⏻ Keluar
          </button>
        </div>
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-[#0a2540] p-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg bg-white/10 px-3 py-1.5 text-white">
                ✕
              </button>
            </div>
            <nav className="mt-5 flex-1 space-y-1 overflow-y-auto">
              {menus.map((m) => {
                const active = pathname === m.href || (m.href !== "/dashboard" && pathname.startsWith(m.href));
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                      active ? "bg-sky-500 text-white" : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span> {m.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={logout}
              className="mt-3 rounded-xl bg-rose-500/20 px-4 py-2.5 text-sm font-bold text-rose-200"
            >
              ⏻ Keluar
            </button>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-[268px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-lg lg:hidden"
            >
              ☰
            </button>
            <div className="hidden items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-sky-100 md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Sistem Online • Server Arsip Pusat
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/arsip"
                className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 sm:flex"
              >
                🔍 Cari Arsip
              </Link>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm hover:bg-slate-50"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sky-700 to-teal-500 text-sm font-extrabold text-white">
                    {initials(user.nama)}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block max-w-[140px] truncate text-[13px] font-bold text-slate-800">{user.nama}</span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-sky-600">
                      {user.role} • {user.nip}
                    </span>
                  </span>
                  <span className="text-slate-400">▾</span>
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-up">
                      <div className="bg-gradient-to-r from-sky-700 to-cyan-600 p-4 text-white">
                        <p className="truncate text-sm font-extrabold">{user.nama}</p>
                        <p className="text-xs text-sky-100">{user.email}</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-amber-200">
                          {user.role} {user.unitNama ? `• ${user.unitNama}` : ""}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/profil"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          👤 Profil Saya
                        </Link>
                        <Link
                          href="/bantuan"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          ❓ Bantuan &amp; SOP
                        </Link>
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          ⏻ Keluar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
        <footer className="border-t border-slate-200 bg-white/60 px-6 py-4 text-center text-xs text-slate-400">
          SIASIK v2.1 • Pusat Standardisasi &amp; Sertifikasi SDM Kelautan dan Perikanan • KKP RI © 2026 • Data
          tersimpan aman &amp; teraudit
        </footer>
      </div>
    </div>
  );
}
