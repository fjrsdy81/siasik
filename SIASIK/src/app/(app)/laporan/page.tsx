"use client";

import React, { useEffect, useState } from "react";
import { PageHeader, Spinner, Badge } from "@/components/ui";
import { formatDateID } from "@/lib/utils";

type Row = Record<string, string | number | null> & { id: string; nomorSurat: string; judul: string; tipeDokumen: string; kategoriNama: string | null; kategoriKode: string | null; unitNama: string | null; tanggalSurat: string | null; tahun: number | null; sifat: string; statusArsip: string; views: number; downloads: number; pengirim: string | null };

export default function LaporanPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipe, setTipe] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/reports").then((r) => r.json()).then((j) => { setRows(j.data || []); setLoading(false); });
  }, []);

  const filtered = rows.filter((r) => (!tipe || r.tipeDokumen === tipe) && (!status || r.statusArsip === status));
  const tipes = [...new Set(rows.map((r) => r.tipeDokumen))];

  const cetak = () => window.print();

  return (
    <div className="animate-fade-up">
      <PageHeader icon="📑" title="Laporan & Rekapitulasi" desc="Rekap seluruh arsip untuk pimpinan. Saring, cetak, atau unduh sebagai CSV (kompatibel Excel)." action={<><button onClick={cetak} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">🖨️ Cetak</button><a href="/api/reports?format=csv" className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110">📥 Unduh CSV</a></>} />
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 print:hidden">
        <select value={tipe} onChange={(e) => setTipe(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
          <option value="">Semua Tipe</option>
          {tipes.map((t) => <option key={t as string} value={t as string}>{t as string}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
          <option value="">Semua Status</option>
          {["Aktif", "Inaktif", "Vital", "Usul Musnah", "Musnah"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <span className="ml-auto text-xs font-bold text-slate-500">Menampilkan {filtered.length} dari {rows.length} arsip</span>
      </div>

      {/* Kop laporan */}
      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <div className="border-b-4 border-double border-sky-700 p-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Kementerian Kelautan dan Perikanan RI</p>
          <p className="text-lg font-extrabold text-slate-900">PUSAT STANDARDISASI DAN SERTIFIKASI SDM KELAUTAN DAN PERIKANAN</p>
          <p className="text-xs text-slate-500">Jl. Medan Merdeka Timur No. 16, Jakarta Pusat 10110 • Telp. (021) 3519070</p>
          <p className="mx-auto mt-3 inline-block rounded-full bg-slate-900 px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-white">Laporan Rekapitulasi Arsip • {formatDateID(new Date())}</p>
        </div>
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[13px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Nomor / Judul</th>
                  <th className="px-4 py-3">Klasifikasi</th>
                  <th className="px-4 py-3">Tgl / Thn</th>
                  <th className="px-4 py-3">Sifat / Status</th>
                  <th className="px-4 py-3">Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-bold text-sky-700">{r.nomorSurat}</p>
                      <p className="font-bold text-slate-800">{r.judul}</p>
                      <p className="text-[11px] text-slate-400">{r.tipeDokumen} • {r.unitNama || "-"} • 👁️ {r.views} • ⬇️ {r.downloads}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-600">{r.kategoriKode ? `${r.kategoriKode} — ${r.kategoriNama}` : "-"}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-600">{formatDateID(r.tanggalSurat as string)}<br />{String(r.tahun || "-")}</td>
                    <td className="px-4 py-3"><Badge className="bg-slate-100 text-slate-600 ring-slate-200">{r.sifat} / {r.statusArsip}</Badge></td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500">{r.pengirim || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between p-6 text-[13px] text-slate-600">
          <span>Jakarta, {formatDateID(new Date())}<br /><br /><br /><b>( ........................................ )</b><br />Arsiparis Ahli Madya • NIP. 197805122006041001</span>
          <span className="text-right text-xs text-slate-400">Dicetak dari SIASIK • Dokumen sah teraudit sistem<br />Total: {filtered.length} arsip</span>
        </div>
      </div>
      <style>{`@media print { header, footer, aside { display: none !important; } main { padding: 0 !important; max-width: none !important; } .print\\:hidden { display: none !important; } body { background: white; } }`}</style>
    </div>
  );
}
