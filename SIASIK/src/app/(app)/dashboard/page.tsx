"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { PageHeader, Spinner, StatCard, StatusBadge } from "@/components/ui";
import { formatDateID, timeAgo } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";

type Dash = {
  stats: { totalArsip: number; totalUser: number; totalKategori: number; pinjamAktif: number; totalViews: number; totalDownloads: number };
  perKategori: { nama: string; kode: string; warna: string; jumlah: number }[];
  perTipe: { tipe: string; jumlah: number }[];
  perTahun: { tahun: number; jumlah: number }[];
  perStatus: { status: string; jumlah: number }[];
  terbaru: Record<string, unknown>[];
  populer: Record<string, unknown>[];
  aktivitas: Record<string, unknown>[];
  jatuhTempo: Record<string, unknown>[];
};

const COLORS = ["#0284c7", "#0d9488", "#d4a017", "#7c3aed", "#f97316", "#e11d48", "#059669", "#475569"];

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return <Spinner label="Memuat dashboard arsip..." />;

  const katChart = data.perKategori.map((k) => ({ name: k.kode, jumlah: Number(k.jumlah), full: k.nama }));
  const tipeChart = data.perTipe.map((t) => ({ name: t.tipe, value: Number(t.jumlah) }));
  const tahunChart = data.perTahun.map((t) => ({ tahun: String(t.tahun), jumlah: Number(t.jumlah) }));

  return (
    <div className="animate-fade-up">
      <PageHeader
        icon="📊"
        title={`Halo, ${user?.nama?.split(" ")[0] || "Sobat Arsip"}! 👋`}
        desc="Ringkasan kondisi arsip Pusat Standardisasi & Sertifikasi SDM Kelautan dan Perikanan hari ini."
        action={
          <>
            <Link href="/tambah" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-700 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-600/25 hover:brightness-110">
              ➕ Arsip Baru
            </Link>
            <Link href="/laporan" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
              📑 Laporan
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="🗂️" label="Total Arsip" value={data.stats.totalArsip} sub={`${data.stats.totalViews} kali dilihat`} gradient="from-sky-600 to-cyan-500" />
        <StatCard icon="👥" label="Pengguna" value={data.stats.totalUser} sub={`${data.stats.totalKategori} kategori aktif`} gradient="from-violet-600 to-purple-500" />
        <StatCard icon="🔄" label="Dipinjam" value={data.stats.pinjamAktif} sub="Perlu monitoring kembali" gradient="from-amber-500 to-orange-500" />
        <StatCard icon="⬇️" label="Unduhan" value={data.stats.totalDownloads} sub="Distribusi dokumen" gradient="from-teal-600 to-emerald-500" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 xl:col-span-2">
          <h3 className="text-sm font-extrabold text-slate-800">📦 Arsip per Kategori Klasifikasi</h3>
          <p className="text-xs text-slate-400">Distribusi dokumen berdasarkan kode klasifikasi KP</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={katChart} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} tick={{ fill: "#64748b", fontWeight: 700 }} />
                <YAxis fontSize={11} tick={{ fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  labelFormatter={(l, payload) => (payload?.[0]?.payload?.full ? `${l} — ${payload[0].payload.full}` : l)}
                />
                <Bar dataKey="jumlah" radius={[8, 8, 0, 0]} fill="#0284c7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.perKategori.map((k) => (
              <span key={k.kode} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: k.warna || "#0ea5e9" }} />
                {k.kode} • {Number(k.jumlah)}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <h3 className="text-sm font-extrabold text-slate-800">📑 Komposisi Tipe Dokumen</h3>
          <p className="text-xs text-slate-400">Proporsi jenis dokumen</p>
          <div className="mt-2 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tipeChart} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>
                  {tipeChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 xl:col-span-2">
          <h3 className="text-sm font-extrabold text-slate-800">📈 Tren Arsip per Tahun</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tahunChart} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tahun" fontSize={11} tick={{ fill: "#64748b", fontWeight: 700 }} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="jumlah" stroke="#0d9488" strokeWidth={3} dot={{ r: 5, fill: "#0d9488" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.perStatus.map((s) => (
              <span key={s.status} className="text-xs font-bold text-slate-600">
                <StatusBadge value={s.status} /> × {Number(s.jumlah)}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#0a2540] p-5 text-white shadow-sm">
          <h3 className="text-sm font-extrabold">⏰ Jatuh Tempo Pengembalian</h3>
          <p className="text-xs text-sky-200">Peminjaman aktif yang perlu diingatkan</p>
          <div className="mt-3 space-y-2">
            {(data.jatuhTempo as { id: string; namaPeminjam: string; judul: string; tanggalKembaliRencana: string }[]).length === 0 && (
              <p className="rounded-xl bg-white/10 p-4 text-center text-xs text-slate-300">
                🎉 Tidak ada peminjaman aktif. Semua arsip aman di rak!
              </p>
            )}
            {(data.jatuhTempo as { id: string; namaPeminjam: string; judul: string; tanggalKembaliRencana: string }[]).map((j) => (
              <div key={j.id} className="rounded-xl bg-white/[0.08] p-3 ring-1 ring-white/10">
                <p className="truncate text-[13px] font-bold">{j.judul || "-"}</p>
                <p className="text-[11px] text-sky-200">
                  {j.namaPeminjam} • kembali {formatDateID(j.tanggalKembaliRencana)}
                </p>
              </div>
            ))}
          </div>
          <Link href="/peminjaman" className="mt-3 block rounded-xl bg-white/10 py-2 text-center text-xs font-extrabold ring-1 ring-white/15 hover:bg-white/20">
            Kelola Peminjaman →
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800">🆕 Arsip Terbaru</h3>
            <Link href="/arsip" className="text-xs font-extrabold text-sky-600 hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {(data.terbaru as { id: string; nomorSurat: string; judul: string; tipeDokumen: string; kategoriNama: string; createdAt: string; statusArsip: string }[]).map((a) => (
              <Link key={a.id} href={`/arsip/${a.id}`} className="flex items-center gap-3 py-2.5 transition hover:bg-slate-50">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-lg">📄</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-slate-800">{a.judul}</span>
                  <span className="block truncate text-[11px] font-medium text-slate-400">
                    {a.nomorSurat} • {a.tipeDokumen} • {a.kategoriNama || "-"}
                  </span>
                </span>
                <StatusBadge value={a.statusArsip} />
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <h3 className="text-sm font-extrabold text-slate-800">🕵️ Aktivitas Terakhir</h3>
          <div className="mt-3 space-y-2.5">
            {(data.aktivitas as { id: string; aksi: string; userNama: string; detail: string; createdAt: string }[]).map((l) => (
              <div key={l.id} className="flex gap-2.5 text-xs">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm">
                  {l.aksi === "LOGIN" ? "🔑" : l.aksi === "CREATE" ? "➕" : l.aksi === "DOWNLOAD" ? "⬇️" : l.aksi === "DELETE" ? "🗑️" : "📝"}
                </span>
                <span>
                  <span className="font-bold text-slate-700">{l.userNama}</span>{" "}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-500">{l.aksi}</span>
                  <span className="block truncate text-slate-500">{l.detail}</span>
                  <span className="text-[10px] text-slate-400">{timeAgo(l.createdAt)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        <h3 className="text-sm font-extrabold text-slate-800">🔥 Paling Sering Diakses</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {(data.populer as { id: string; judul: string; views: number; downloads: number }[]).map((p, i) => (
            <Link key={p.id} href={`/arsip/${p.id}`} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 transition hover:bg-sky-50">
              <p className="text-lg font-extrabold text-sky-600">#{i + 1}</p>
              <p className="line-clamp-2 mt-1 text-[12px] font-bold text-slate-700">{p.judul}</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">👁️ {p.views} • ⬇️ {p.downloads}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
