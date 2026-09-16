"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Empty, PageHeader, Spinner, Badge } from "@/components/ui";
import { formatDateTimeID } from "@/lib/utils";

type Log = { id: string; userNama: string | null; aksi: string; entitas: string; entitasId: string | null; detail: string | null; createdAt: string };

const aksiIcon: Record<string, string> = { LOGIN: "🔑", LOGOUT: "🚪", CREATE: "➕", UPDATE: "✏️", DELETE: "🗑️", VIEW: "👁️", DOWNLOAD: "⬇️", UPLOAD: "☁️", PINJAM: "🔄", KEMBALI: "📥", EXPORT: "📤" };

export default function AuditPage() {
  const [data, setData] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/audit?q=${encodeURIComponent(q)}&page=${page}&limit=20`);
    const j = await r.json();
    if (r.ok) {
      setData(j.data || []);
      setTotalPages(j.pagination?.totalPages || 1);
    }
    setLoading(false);
  }, [q, page]);

  useEffect(() => {
    const t = setTimeout(load, q ? 500 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  return (
    <div className="animate-fade-up">
      <PageHeader icon="🛡️" title="Audit Log & Keamanan" desc="Jejak digital setiap aktivitas — siapa, berbuat apa, kapan. Pilar akuntabilitas arsip." />
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <span className="relative block">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Cari nama pengguna, aksi, detail..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
        </span>
      </div>
      {loading ? <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-200"><Spinner /></div> : data.length === 0 ? <div className="mt-4"><Empty title="Tidak ada log" /></div> : (
        <>
          <div className="mt-4 space-y-2">
            {data.map((l) => (
              <div key={l.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg">{aksiIcon[l.aksi] || "📝"}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[13px]">
                    <b className="text-slate-800">{l.userNama || "Sistem"}</b>
                    <Badge className="bg-sky-100 text-sky-700 ring-sky-200">{l.aksi}</Badge>
                    <Badge className="bg-slate-100 text-slate-500 ring-slate-200">{l.entitas}{l.entitasId ? ` • ${l.entitasId.slice(0, 8)}` : ""}</Badge>
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-slate-500">{l.detail || "-"}</p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-slate-400">{formatDateTimeID(l.createdAt)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200/70">
            <p className="text-xs font-bold text-slate-500">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-40">← Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-40">Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
