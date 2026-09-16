"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Empty, PageHeader, Spinner, Badge } from "@/components/ui";
import { formatDateID } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";

type L = {
  id: string; archiveId: string; nomorSurat: string | null; judul: string | null;
  namaPeminjam: string; tanggalPinjam: string; tanggalKembaliRencana: string;
  tanggalKembaliAktual: string | null; keperluan: string | null; status: string; catatan: string | null;
};

const color = (s: string) =>
  s === "Dipinjam" ? "bg-sky-100 text-sky-700 ring-sky-200"
  : s === "Menunggu" ? "bg-amber-100 text-amber-800 ring-amber-200"
  : s === "Dikembalikan" ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
  : s === "Ditolak" ? "bg-rose-100 text-rose-700 ring-rose-200"
  : "bg-orange-100 text-orange-800 ring-orange-200";

export default function PeminjamanPage() {
  const [data, setData] = useState<L[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const { user } = useAuth();
  const canApprove = user && ["admin", "arsiparis"].includes(user.role);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/loans");
    const j = await r.json();
    setData(j.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const act = async (id: string, status: string) => {
    const catatan = status === "Ditolak" ? prompt("Alasan penolakan:") || "" : "";
    await fetch(`/api/loans/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, catatan }) });
    load();
  };

  const filtered = filter ? data.filter((d) => d.status === filter) : data;
  const counts = (s: string) => data.filter((d) => d.status === s).length;

  return (
    <div className="animate-fade-up">
      <PageHeader icon="🔄" title="Peminjaman Arsip" desc="Alur pinjam-kembali arsip fisik yang tercatat & dapat dipertanggungjawabkan." action={<Link href="/arsip" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">🗂️ Cari arsip untuk dipinjam</Link>} />
      <div className="flex flex-wrap gap-2">
        {["", "Menunggu", "Dipinjam", "Dikembalikan", "Ditolak"].map((s) => (
          <button key={s || "all"} onClick={() => setFilter(s)} className={`rounded-full px-4 py-2 text-[13px] font-bold ring-1 transition ${filter === s ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>
            {s || "Semua"} {s ? `(${counts(s)})` : `(${data.length})`}
          </button>
        ))}
      </div>
      {loading ? <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-200"><Spinner /></div> : filtered.length === 0 ? <div className="mt-4"><Empty title="Belum ada peminjaman" desc="Pilih arsip pada halaman Data Arsip lalu klik Pinjam Arsip Fisik." /></div> : (
        <div className="mt-4 grid gap-3">
          {filtered.map((l) => {
            const telat = l.status === "Dipinjam" && new Date(l.tanggalKembaliRencana) < new Date(new Date().toISOString().slice(0, 10));
            return (
              <div key={l.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/arsip/${l.archiveId}`} className="font-extrabold text-slate-900 hover:text-sky-700">
                      {l.judul || l.archiveId}
                    </Link>
                    <p className="font-mono text-xs font-bold text-sky-700">{l.nomorSurat || "-"}</p>
                    <p className="mt-1 text-[13px] text-slate-500">👤 {l.namaPeminjam} • 📌 {l.keperluan || "-"} {l.catatan && <span className="text-amber-700">• 📝 {l.catatan}</span>}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      📅 {formatDateID(l.tanggalPinjam)} → {formatDateID(l.tanggalKembaliRencana)}
                      {l.tanggalKembaliAktual && <> • ✅ kembali {formatDateID(l.tanggalKembaliAktual)}</>}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={color(telat ? "Terlambat" : l.status)}>{telat ? "Terlambat" : l.status}</Badge>
                    {telat && <span className="text-[11px] font-bold text-rose-600">⚠️ Melewati jatuh tempo!</span>}
                    {canApprove && (
                      <span className="flex gap-1.5">
                        {l.status === "Menunggu" && (
                          <>
                            <button onClick={() => act(l.id, "Dipinjam")} className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-700">✔ Setujui</button>
                            <button onClick={() => act(l.id, "Ditolak")} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100">✖ Tolak</button>
                          </>
                        )}
                        {l.status === "Dipinjam" && (
                          <button onClick={() => act(l.id, "Dikembalikan")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">📥 Kembalikan</button>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
