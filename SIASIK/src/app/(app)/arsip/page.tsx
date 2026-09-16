"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Empty, PageHeader, Spinner, SifatBadge, StatusBadge, Badge } from "@/components/ui";
import { formatBytes, formatDateID, TIPE_DOKUMEN, SIFAT_LIST, STATUS_ARSIP } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";

type Arsip = Record<string, unknown> & {
  id: string;
  nomorSurat: string;
  judul: string;
  tipeDokumen: string;
  sifat: string;
  statusArsip: string;
  tanggalSurat: string | null;
  kategoriNama: string | null;
  kategoriKode: string | null;
  kategoriWarna: string | null;
  unitNama: string | null;
  views: number;
  downloads: number;
  fileUrl: string | null;
};

export default function ArsipPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Arsip[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState("");
  const [unit, setUnit] = useState("");
  const [tipe, setTipe] = useState("");
  const [sifat, setSifat] = useState("");
  const [status, setStatus] = useState("");
  const [tahun, setTahun] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [kats, setKats] = useState<{ id: number; kode: string; nama: string }[]>([]);
  const [units, setUnits] = useState<{ id: number; kode: string; nama: string }[]>([]);
  const [tahunList, setTahunList] = useState<number[]>([]);
  const [deb, setDeb] = useState("");

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((j) => setKats(j.data || [])).catch(() => {});
    fetch("/api/units").then((r) => r.json()).then((j) => setUnits(j.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDeb(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({
      q: deb, kategori, unit, tipe, sifat, status, tahun, page: String(page), limit: "12",
    });
    const r = await fetch(`/api/archives?${p.toString()}`);
    const j = await r.json();
    setData(j.data || []);
    setTotal(j.pagination?.total || 0);
    setTotalPages(j.pagination?.totalPages || 1);
    setTahunList(j.tahunList || []);
    setLoading(false);
  }, [deb, kategori, unit, tipe, sifat, status, tahun, page]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setQ(""); setKategori(""); setUnit(""); setTipe(""); setSifat(""); setStatus(""); setTahun(""); setPage(1);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        icon="🗂️"
        title="Data Arsip Digital"
        desc={`Ditemukan ${total} dokumen • Cari berdasarkan nomor, judul, pengirim, atau kata kunci.`}
        action={
          (user?.role === "admin" || user?.role === "arsiparis") && (
            <Link href="/tambah" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-700 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110">
              ➕ Tambah Arsip
            </Link>
          )
        }
      />

      {/* Search */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex gap-2">
          <span className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Cari nomor surat, judul, pengirim, tag... (cth: sertifikat, MoU, 2026)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </span>
          <button onClick={reset} className="rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 hover:bg-slate-50">
            Reset
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          <select value={kategori} onChange={(e) => { setKategori(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-700 outline-none focus:border-sky-500">
            <option value="">Semua Kategori</option>
            {kats.map((k) => <option key={k.id} value={k.id}>{k.kode} — {k.nama}</option>)}
          </select>
          <select value={unit} onChange={(e) => { setUnit(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-700 outline-none focus:border-sky-500">
            <option value="">Semua Unit</option>
            {units.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
          </select>
          <select value={tipe} onChange={(e) => { setTipe(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-700 outline-none focus:border-sky-500">
            <option value="">Semua Tipe</option>
            {TIPE_DOKUMEN.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={sifat} onChange={(e) => { setSifat(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-700 outline-none focus:border-sky-500">
            <option value="">Semua Sifat</option>
            {SIFAT_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-700 outline-none focus:border-sky-500">
            <option value="">Semua Status</option>
            {STATUS_ARSIP.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={tahun} onChange={(e) => { setTahun(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-700 outline-none focus:border-sky-500">
            <option value="">Semua Tahun</option>
            {tahunList.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-200/70"><Spinner /></div>
      ) : data.length === 0 ? (
        <div className="mt-4"><Empty title="Arsip tidak ditemukan" desc="Coba ubah kata kunci atau reset filter. Jika Anda arsiparis, tambah arsip baru." action={<Link href="/tambah" className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white">➕ Tambah Arsip</Link>} /></div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((a) => (
              <Link key={a.id} href={`/arsip/${a.id}`} className="card-hover group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white" style={{ background: (a.kategoriWarna as string) || "#0284c7" }}>
                    {a.kategoriKode || "ARSIP"} • {a.tipeDokumen}
                  </span>
                  {a.fileUrl ? <span title="Ada file digital" className="text-base">📎</span> : <span title="Tanpa file" className="text-base opacity-40">📭</span>}
                </div>
                <h3 className="line-clamp-2 mt-3 text-[15px] font-extrabold leading-snug text-slate-900 group-hover:text-sky-700">
                  {a.judul}
                </h3>
                <p className="mt-1 font-mono text-xs font-semibold text-sky-700">{a.nomorSurat}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <SifatBadge value={a.sifat} />
                  <StatusBadge value={a.statusArsip} />
                  <Badge className="bg-slate-100 text-slate-600 ring-slate-200">📅 {formatDateID(a.tanggalSurat)}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400">
                  <span className="truncate">🏢 {a.unitNama || "-"} • {a.kategoriNama || "-"}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>👁️ {a.views} • ⬇️ {a.downloads} • {formatBytes(a.fileSize as number)}</span>
                  <span className="font-extrabold text-sky-600">Detail →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200/70">
            <p className="text-xs font-bold text-slate-500">Halaman {page} dari {totalPages} • {total} arsip</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50">← Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50">Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
