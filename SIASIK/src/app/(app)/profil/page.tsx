"use client";

import React, { useState } from "react";
import { Field, PageHeader, inputCls, btnPrimary } from "@/components/ui";
import { initials } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";

export default function ProfilPage() {
  const { user, refresh } = useAuth();
  const [f, setF] = useState({ nama: "", jabatan: "", password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [init, setInit] = useState(false);

  React.useEffect(() => {
    if (user && !init) {
      setF({ nama: user.nama, jabatan: user.jabatan || "", password: "" });
      setInit(true);
    }
  }, [user, init]);

  if (!user) return null;

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    const body: Record<string, string> = { nama: f.nama, jabatan: f.jabatan };
    if (f.password) body.password = f.password;
    const r = await fetch(`/api/users/${user.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error || "Gagal");
      return;
    }
    setMsg("✅ Profil berhasil diperbarui");
    setF({ ...f, password: "" });
    refresh();
  };

  return (
    <div className="animate-fade-up">
      <PageHeader icon="👤" title="Profil Saya" desc="Kelola identitas & keamanan akun NIP Anda." />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-br from-[#0a2540] to-sky-800 p-6 text-center text-white shadow-xl">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/15 text-2xl font-extrabold ring-1 ring-white/20">{initials(user.nama)}</span>
          <h2 className="mt-3 text-lg font-extrabold">{user.nama}</h2>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">{user.role}</p>
          <p className="mt-1 text-xs text-sky-200">{user.nip} • {user.email}</p>
          <p className="mt-1 text-xs text-sky-200">{user.jabatan || "-"} {user.unitNama ? `• ${user.unitNama}` : ""}</p>
          <div className="mt-4 rounded-2xl bg-white/10 p-3 text-left text-xs leading-relaxed text-sky-100 ring-1 ring-white/10">
            🔐 Jaga kerahasiaan kata sandi. Ganti berkala minimal 90 hari. Aktivitas akun Anda tercatat di audit log.
          </div>
        </div>
        <form onSubmit={simpan} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 md:col-span-2">
          <Field label="Nama Lengkap"><input value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} className={inputCls} /></Field>
          <Field label="Jabatan"><input value={f.jabatan} onChange={(e) => setF({ ...f, jabatan: e.target.value })} className={inputCls} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="NIP (terkunci)"><input value={user.nip} disabled className={`${inputCls} bg-slate-50 text-slate-400`} /></Field>
            <Field label="Email (terkunci)"><input value={user.email} disabled className={`${inputCls} bg-slate-50 text-slate-400`} /></Field>
          </div>
          <Field label="Kata Sandi Baru" hint="Kosongkan jika tidak ingin mengganti">
            <input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••••" className={inputCls} />
          </Field>
          {msg && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">{msg}</p>}
          {err && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600 ring-1 ring-rose-200">{err}</p>}
          <button type="submit" className={btnPrimary}>💾 Simpan Perubahan</button>
        </form>
      </div>
    </div>
  );
}
