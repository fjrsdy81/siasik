"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-client";

const DEMO = [
  { role: "Administrator", nip: "197805122006041001", pass: "admin123", icon: "👑", color: "from-rose-500 to-orange-500" },
  { role: "Arsiparis", nip: "199001152015032002", pass: "arsip123", icon: "🗂️", color: "from-sky-600 to-cyan-500" },
  { role: "Pimpinan", nip: "197203101998031003", pass: "pimpin123", icon: "🎖️", color: "from-violet-600 to-purple-500" },
  { role: "Pegawai", nip: "199507202020122004", pass: "pegawai123", icon: "👤", color: "from-teal-600 to-emerald-500" },
];

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  const submit = async (e: React.FormEvent, pre?: { nip: string; pass: string }) => {
    e?.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: pre?.nip || identifier.trim(),
          password: pre?.pass || password,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || "Gagal masuk");
        setLoading(false);
        return;
      }
      await refresh();
      router.push("/dashboard");
    } catch {
      setErr("Tidak dapat terhubung ke server");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left branding */}
      <div className="ocean-grid relative hidden flex-col justify-between overflow-hidden bg-[#0a2540] p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl" />
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-teal-400 text-3xl shadow-xl">
            ⚓
          </span>
          <span>
            <span className="block text-lg font-extrabold">SIASIK</span>
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-sky-300">
              Arsip Digital • SDM KP
            </span>
          </span>
        </Link>
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight">
            Selamat datang di pusat arsip digital kelautan 🌊
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-300">
            Kelola ribuan dokumen standardisasi &amp; sertifikasi SDM KP — dari SK, sertifikat, MoU hingga laporan
            akreditasi — dalam satu tempat yang aman dan teraudit.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            {["🔐 Akses berlapis 4 peran", "📁 Klasifikasi KP.xx", "⏳ Retensi JRA otomatis", "📊 Laporan sekali klik"].map(
              (t) => (
                <div key={t} className="rounded-2xl bg-white/[0.08] px-4 py-3 text-sm font-semibold ring-1 ring-white/10">
                  {t}
                </div>
              )
            )}
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Pusat Standardisasi & Sertifikasi SDM Kelautan dan Perikanan • KKP RI © 2026
        </p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-md animate-fade-up">
          <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-sky-900/10 ring-1 ring-slate-200">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-700 to-teal-500 text-2xl text-white">
                ⚓
              </span>
              <span>
                <span className="block font-extrabold text-slate-900">SIASIK</span>
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-sky-600">
                  Arsip Digital SDM KP
                </span>
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">Masuk ke Aplikasi</h2>
            <p className="mt-1 text-sm text-slate-500">Gunakan NIP atau email kantor Anda</p>

            {err && (
              <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
                ⚠️ {err}
              </div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold text-slate-700">NIP / Email</span>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="cth: 197805122006041001"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold text-slate-700">Kata Sandi</span>
                <span className="relative block">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                  >
                    {show ? "🙈" : "👁️"}
                  </button>
                </span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-sky-700 to-cyan-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-sky-600/30 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? "Memeriksa..." : "🔑 Masuk Sekarang"}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                — Akun demo sekali klik —
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {DEMO.map((d) => (
                  <button
                    key={d.role}
                    onClick={(e) => submit(e, { nip: d.nip, pass: d.pass })}
                    disabled={loading}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-sky-300 hover:bg-sky-50 disabled:opacity-60"
                  >
                    <span className={`inline-grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${d.color} text-lg text-white`}>
                      {d.icon}
                    </span>
                    <span className="mt-1.5 block text-[13px] font-extrabold text-slate-800">{d.role}</span>
                    <span className="block truncate text-[11px] font-medium text-slate-400">{d.nip}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Lupa sandi? Hubungi administrator arsip • ext. 2108 •{" "}
            <Link href="/" className="font-bold text-sky-600">
              ← Kembali ke beranda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
