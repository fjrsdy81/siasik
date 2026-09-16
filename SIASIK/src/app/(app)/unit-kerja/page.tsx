"use client";

import React, { useEffect, useState } from "react";
import { Empty, Field, Modal, PageHeader, Spinner, inputCls, btnPrimary, btnSecondary } from "@/components/ui";

type Unit = { id: number; kode: string; nama: string; deskripsi: string | null; kepalaUnit: string | null };

export default function UnitPage() {
  const [data, setData] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Unit | null>(null);
  const [f, setF] = useState({ kode: "", nama: "", deskripsi: "", kepalaUnit: "" });
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/units");
    const j = await r.json();
    setData(j.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const url = edit ? `/api/units/${edit.id}` : "/api/units";
    const r = await fetch(url, { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error || "Gagal");
      return;
    }
    setOpen(false);
    load();
  };

  return (
    <div className="animate-fade-up">
      <PageHeader icon="🏢" title="Unit Kerja" desc="Bidang & bagian di lingkungan Pusstandik SDM KP sebagai pemilik arsip." action={<button onClick={() => { setEdit(null); setF({ kode: "", nama: "", deskripsi: "", kepalaUnit: "" }); setOpen(true); }} className="rounded-xl bg-gradient-to-r from-sky-700 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110">➕ Unit Baru</button>} />
      {loading ? <div className="rounded-2xl bg-white ring-1 ring-slate-200"><Spinner /></div> : data.length === 0 ? <Empty title="Belum ada unit kerja" /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((u) => (
            <div key={u.id} className="card-hover flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-700 to-teal-500 text-2xl text-white shadow">🏢</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky-600">{u.kode}</p>
                <h3 className="text-[15px] font-extrabold text-slate-900">{u.nama}</h3>
                <p className="mt-0.5 text-[13px] text-slate-500">👔 {u.kepalaUnit || "—"} • {u.deskripsi || "Tidak ada deskripsi"}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => { setEdit(u); setF({ kode: u.kode, nama: u.nama, deskripsi: u.deskripsi || "", kepalaUnit: u.kepalaUnit || "" }); setOpen(true); }} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">✏️ Ubah</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={edit ? "Ubah Unit Kerja" : "Tambah Unit Kerja"}>
        <form onSubmit={simpan} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kode" required><input required value={f.kode} onChange={(e) => setF({ ...f, kode: e.target.value })} placeholder="BID-01" className={inputCls} /></Field>
            <Field label="Kepala Unit"><input value={f.kepalaUnit} onChange={(e) => setF({ ...f, kepalaUnit: e.target.value })} placeholder="Nama pejabat" className={inputCls} /></Field>
          </div>
          <Field label="Nama Unit" required><input required value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} placeholder="cth: Bidang Standardisasi" className={inputCls} /></Field>
          <Field label="Deskripsi"><textarea rows={2} value={f.deskripsi} onChange={(e) => setF({ ...f, deskripsi: e.target.value })} className={inputCls} /></Field>
          {err && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600">{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className={btnSecondary}>Batal</button>
            <button type="submit" className={`${btnPrimary} flex-1`}>💾 Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
