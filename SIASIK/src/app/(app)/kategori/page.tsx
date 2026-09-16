"use client";

import React, { useEffect, useState } from "react";
import { Empty, Field, Modal, PageHeader, Spinner, inputCls, btnPrimary, btnSecondary } from "@/components/ui";

type Kat = { id: number; kode: string; nama: string; deskripsi: string | null; retensiDefault: number; warna: string | null };

const PALETTE = ["#0284c7", "#0d9488", "#d4a017", "#7c3aed", "#f97316", "#e11d48", "#059669", "#475569"];

export default function KategoriPage() {
  const [data, setData] = useState<Kat[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Kat | null>(null);
  const [f, setF] = useState({ kode: "", nama: "", deskripsi: "", retensiDefault: "5", warna: "#0284c7" });
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/categories");
    const j = await r.json();
    setData(j.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const bukaTambah = () => {
    setEdit(null);
    setF({ kode: "", nama: "", deskripsi: "", retensiDefault: "5", warna: "#0284c7" });
    setErr("");
    setOpen(true);
  };
  const bukaEdit = (k: Kat) => {
    setEdit(k);
    setF({ kode: k.kode, nama: k.nama, deskripsi: k.deskripsi || "", retensiDefault: String(k.retensiDefault), warna: k.warna || "#0284c7" });
    setErr("");
    setOpen(true);
  };

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const url = edit ? `/api/categories/${edit.id}` : "/api/categories";
    const r = await fetch(url, { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error || "Gagal");
      return;
    }
    setOpen(false);
    load();
  };

  const hapus = async (id: number) => {
    if (!confirm("Hapus kategori ini? Arsip terkait menjadi tanpa kategori.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="animate-fade-up">
      <PageHeader icon="🏷️" title="Kategori & Klasifikasi" desc="Kode klasifikasi arsip (KP.xx) dengan masa retensi default sesuai JRA." action={<button onClick={bukaTambah} className="rounded-xl bg-gradient-to-r from-sky-700 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110">➕ Kategori Baru</button>} />
      {loading ? <div className="rounded-2xl bg-white ring-1 ring-slate-200"><Spinner /></div> : data.length === 0 ? <Empty title="Belum ada kategori" /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((k) => (
            <div key={k.id} className="card-hover rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="rounded-full px-3 py-1 text-xs font-extrabold text-white" style={{ background: k.warna || "#0284c7" }}>{k.kode}</span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">⏳ {k.retensiDefault} th</span>
              </div>
              <h3 className="mt-3 text-[15px] font-extrabold text-slate-900">{k.nama}</h3>
              <p className="mt-1 line-clamp-2 text-[13px] text-slate-500">{k.deskripsi || "Tidak ada deskripsi."}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => bukaEdit(k)} className="flex-1 rounded-xl border border-slate-200 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-50">✏️ Ubah</button>
                <button onClick={() => hapus(k.id)} className="flex-1 rounded-xl bg-rose-50 py-2 text-[13px] font-bold text-rose-600 ring-1 ring-rose-100 hover:bg-rose-100">🗑️ Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={edit ? "Ubah Kategori" : "Tambah Kategori"}>
        <form onSubmit={simpan} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kode" required><input required value={f.kode} onChange={(e) => setF({ ...f, kode: e.target.value })} placeholder="KP.01" className={inputCls} /></Field>
            <Field label="Retensi default (thn)"><input type="number" min={1} max={30} value={f.retensiDefault} onChange={(e) => setF({ ...f, retensiDefault: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Nama Kategori" required><input required value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} placeholder="cth: Sertifikasi Kompetensi" className={inputCls} /></Field>
          <Field label="Deskripsi"><textarea rows={2} value={f.deskripsi} onChange={(e) => setF({ ...f, deskripsi: e.target.value })} className={inputCls} /></Field>
          <Field label="Warna Label">
            <span className="flex gap-2">
              {PALETTE.map((c) => (
                <button key={c} type="button" onClick={() => setF({ ...f, warna: c })} className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${f.warna === c ? "ring-slate-900" : "ring-transparent"}`} style={{ background: c }} />
              ))}
            </span>
          </Field>
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
