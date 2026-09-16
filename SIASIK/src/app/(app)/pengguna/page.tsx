"use client";

import React, { useEffect, useState } from "react";
import { Empty, Field, Modal, PageHeader, Spinner, Badge, inputCls, btnPrimary, btnSecondary } from "@/components/ui";
import { ROLE_LABEL, initials } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";

type U = {
  id: string; nip: string; nama: string; email: string; role: string; jabatan: string | null;
  unitId: number | null; unitNama: string | null; isActive: boolean; lastLogin: string | null;
};

export default function PenggunaPage() {
  const { user: me } = useAuth();
  const [data, setData] = useState<U[]>([]);
  const [units, setUnits] = useState<{ id: number; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState({ nip: "", nama: "", email: "", password: "", role: "pegawai", jabatan: "", unitId: "" });

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/users");
    const j = await r.json();
    if (r.ok) setData(j.data || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
    fetch("/api/units").then((r) => r.json()).then((j) => setUnits(j.data || []));
  }, []);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, unitId: f.unitId || null }) });
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error || "Gagal");
      return;
    }
    setOpen(false);
    load();
  };

  const toggle = async (u: U) => {
    await fetch(`/api/users/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !u.isActive }) });
    load();
  };
  const hapus = async (u: U) => {
    if (!confirm(`Hapus ${u.nama}?`)) return;
    await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    load();
  };

  const roleColor = (r: string) =>
    r === "admin" ? "bg-rose-100 text-rose-700 ring-rose-200" : r === "arsiparis" ? "bg-sky-100 text-sky-700 ring-sky-200" : r === "pimpinan" ? "bg-violet-100 text-violet-700 ring-violet-200" : "bg-emerald-100 text-emerald-700 ring-emerald-200";

  return (
    <div className="animate-fade-up">
      <PageHeader icon="👥" title="Manajemen Pengguna" desc="Kelola akun NIP, peran, dan status aktif. Hanya administrator yang dapat menambah pengguna." action={me?.role === "admin" ? <button onClick={() => { setF({ nip: "", nama: "", email: "", password: "", role: "pegawai", jabatan: "", unitId: "" }); setOpen(true); }} className="rounded-xl bg-gradient-to-r from-sky-700 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110">➕ Pengguna Baru</button> : undefined} />
      {loading ? <div className="rounded-2xl bg-white ring-1 ring-slate-200"><Spinner /></div> : data.length === 0 ? <Empty title="Tidak ada data / akses ditolak" /> : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3">Pengguna</th>
                <th className="px-5 py-3">NIP / Unit</th>
                <th className="px-5 py-3">Peran</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-700 to-teal-500 text-xs font-extrabold text-white">{initials(u.nama)}</span>
                      <span>
                        <span className="block font-extrabold text-slate-800">{u.nama} {me?.id === u.id && <span className="text-[10px] text-sky-600">(Anda)</span>}</span>
                        <span className="block text-xs text-slate-400">{u.email} • {u.jabatan || "-"}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-slate-600">{u.nip}<br /><span className="text-slate-400">{u.unitNama || "-"}</span></td>
                  <td className="px-5 py-3"><Badge className={roleColor(u.role)}>{ROLE_LABEL[u.role] || u.role}</Badge></td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${u.isActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />{u.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {me?.role === "admin" && (
                      <span className="inline-flex gap-1.5">
                        <button onClick={() => toggle(u)} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200">{u.isActive ? "🔒 Nonaktifkan" : "🔓 Aktifkan"}</button>
                        <button onClick={() => hapus(u)} className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100">🗑️</button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 grid gap-3 rounded-2xl bg-[#0a2540] p-5 text-white md:grid-cols-4">
        {[
          ["👑 Admin", "Kelola semua + user"],
          ["🗂️ Arsiparis", "Input & verifikasi arsip"],
          ["🎖️ Pimpinan", "Pantau & unduh laporan"],
          ["👤 Pegawai", "Cari, lihat & pinjam"],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
            <p className="text-sm font-extrabold">{t}</p>
            <p className="text-xs text-sky-200">{d}</p>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Pengguna">
        <form onSubmit={simpan} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="NIP" required><input required value={f.nip} onChange={(e) => setF({ ...f, nip: e.target.value })} className={inputCls} placeholder="18 digit NIP" /></Field>
            <Field label="Peran" required>
              <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={inputCls}>
                <option value="admin">Administrator</option>
                <option value="arsiparis">Arsiparis</option>
                <option value="pimpinan">Pimpinan</option>
                <option value="pegawai">Pegawai</option>
              </select>
            </Field>
          </div>
          <Field label="Nama Lengkap" required><input required value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" required><input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inputCls} placeholder="nama@kkp.go.id" /></Field>
            <Field label="Kata Sandi" required><input required type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={inputCls} placeholder="min. 6 karakter" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jabatan"><input value={f.jabatan} onChange={(e) => setF({ ...f, jabatan: e.target.value })} className={inputCls} /></Field>
            <Field label="Unit Kerja">
              <select value={f.unitId} onChange={(e) => setF({ ...f, unitId: e.target.value })} className={inputCls}>
                <option value="">—</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
              </select>
            </Field>
          </div>
          {err && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600">{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className={btnSecondary}>Batal</button>
            <button type="submit" className={`${btnPrimary} flex-1`}>Buat Akun</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
