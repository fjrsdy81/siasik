"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge, Modal, SifatBadge, Spinner, StatusBadge, Field, inputCls, btnPrimary, btnSecondary } from "@/components/ui";
import { formatBytes, formatDateID, formatDateTimeID } from "@/lib/utils";
import { useAuth } from "@/lib/auth-client";

export default function ArsipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [a, setA] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinjamOpen, setPinjamOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const { user } = useAuth();
  const router = useRouter();
  const canManage = user && ["admin", "arsiparis"].includes(user.role);

  const [form, setForm] = useState({ tanggalPinjam: new Date().toISOString().slice(0, 10), tanggalKembaliRencana: "", keperluan: "" });

  useEffect(() => {
    fetch(`/api/archives/${id}`).then(async (r) => {
      const j = await r.json();
      if (r.ok) setA(j.data);
      setLoading(false);
    });
  }, [id]);

  const download = async () => {
    if (!a?.fileUrl) return;
    await fetch(`/api/archives/${id}/download`, { method: "POST" });
    const link = document.createElement("a");
    link.href = a.fileUrl as string;
    link.download = (a.fileName as string) || "arsip";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setA({ ...a, downloads: Number(a.downloads || 0) + 1 });
  };

  const ajukanPinjam = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archiveId: id, ...form, namaPeminjam: user?.nama }),
    });
    const j = await r.json();
    if (!r.ok) {
      setMsg(j.error || "Gagal mengajukan");
      return;
    }
    setPinjamOpen(false);
    setMsg("");
    alert(j.data?.status === "Menunggu" ? "✅ Pengajuan terkirim, menunggu persetujuan arsiparis." : "✅ Arsip berhasil dipinjam.");
    router.push("/peminjaman");
  };

  const hapus = async () => {
    const r = await fetch(`/api/archives/${id}`, { method: "DELETE" });
    if (r.ok) router.push("/arsip");
  };

  if (loading) return <Spinner label="Membuka arsip..." />;
  if (!a) return <div className="rounded-2xl bg-white p-10 text-center font-bold text-slate-500">Arsip tidak ditemukan. <Link href="/arsip" className="text-sky-600">← Kembali</Link></div>;

  const lokasi = [a.lokasiLemari, a.lokasiRak, a.lokasiBox, a.lokasiMap].filter(Boolean).join(" / ");

  return (
    <div className="animate-fade-up">
      <Link href="/arsip" className="text-sm font-bold text-sky-700 hover:underline">← Kembali ke Data Arsip</Link>
      <div className="mt-3 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 md:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full px-3 py-1 text-[11px] font-extrabold text-white" style={{ background: (a.kategoriWarna as string) || "#0284c7" }}>
                {a.kategoriKode as string} • {a.kategoriNama as string}
              </span>
              <SifatBadge value={a.sifat as string} />
              <StatusBadge value={a.statusArsip as string} />
              <Badge className="bg-slate-100 text-slate-600 ring-slate-200">🔒 {a.aksesLevel as string}</Badge>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">{a.judul as string}</h1>
            <p className="mt-1 font-mono text-sm font-bold text-sky-700">{a.nomorSurat as string}</p>
            {a.deskripsi ? <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{a.deskripsi as string}</p> : null}
            {a.tags ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {String(a.tags).split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                  <span key={t} className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 ring-1 ring-sky-100">#{t}</span>
                ))}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 sm:grid-cols-2">
              {[
                ["📑 Tipe Dokumen", a.tipeDokumen],
                ["🏢 Unit Kerja", a.unitNama || "-"],
                ["📅 Tanggal Surat", formatDateID(a.tanggalSurat as string)],
                ["📥 Tanggal Diterima", formatDateID(a.tanggalDiterima as string)],
                ["✉️ Pengirim", a.pengirim || "-"],
                ["📨 Penerima", a.penerima || "-"],
                ["📄 Jumlah Halaman", `${a.jumlahHalaman || 1} hlm`],
                ["📆 Tahun / Retensi", `${a.tahun || "-"} • ${a.retensiTahun} th s/d ${formatDateID(a.tanggalRetensi as string)}`],
                ["🗄️ Lokasi Fisik", lokasi || "-"],
                ["👁️ Statistik", `${a.views} dilihat • ${a.downloads} diunduh`],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{String(k)}</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">{String(v)}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] font-medium text-slate-400">
              Dibuat {formatDateTimeID(a.createdAt as string)} • Terakhir diubah {formatDateTimeID(a.updatedAt as string)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-[#0a2540] p-6 text-white shadow-xl">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-sky-300">📎 File Digital</h3>
            {a.fileUrl ? (
              <>
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl">📄</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{a.fileName as string}</span>
                    <span className="text-xs text-sky-200">{formatBytes(a.fileSize as number)} • {a.fileType as string}</span>
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a href={a.fileUrl as string} target="_blank" className="rounded-xl bg-white/15 py-2.5 text-center text-sm font-extrabold ring-1 ring-white/20 hover:bg-white/25">👁️ Pratinjau</a>
                  <button onClick={download} className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-2.5 text-sm font-extrabold hover:brightness-110">⬇️ Unduh</button>
                </div>
              </>
            ) : (
              <p className="mt-3 rounded-2xl bg-white/10 p-4 text-center text-sm text-slate-300">
                📭 Belum ada file digital.<br />Hanya tersedia arsip fisik di {lokasi || "gudang arsip"}.
              </p>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
            <h3 className="text-sm font-extrabold text-slate-800">⚡ Aksi Cepat</h3>
            <div className="mt-3 space-y-2">
              <button onClick={() => setPinjamOpen(true)} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-extrabold text-white shadow hover:brightness-110">
                🔄 Pinjam Arsip Fisik
              </button>
              {canManage && (
                <>
                  <Link href={`/tambah?edit=${id}`} className="block rounded-xl border border-slate-200 py-2.5 text-center text-sm font-extrabold text-slate-700 hover:bg-slate-50">
                    ✏️ Ubah Data Arsip
                  </Link>
                  <button onClick={() => setDelOpen(true)} className="w-full rounded-xl bg-rose-50 py-2.5 text-sm font-extrabold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100">
                    🗑️ Hapus Arsip
                  </button>
                </>
              )}
              <Link href="/peminjaman" className="block rounded-xl bg-slate-100 py-2.5 text-center text-sm font-extrabold text-slate-600 hover:bg-slate-200">
                📋 Riwayat Peminjaman
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal open={pinjamOpen} onClose={() => setPinjamOpen(false)} title="🔄 Ajukan Peminjaman Arsip">
        <form onSubmit={ajukanPinjam} className="space-y-4">
          <div className="rounded-xl bg-sky-50 p-3 text-[13px] font-semibold text-sky-800 ring-1 ring-sky-100">
            {a.nomorSurat as string} — {a.judul as string}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal Pinjam" required>
              <input type="date" required value={form.tanggalPinjam} onChange={(e) => setForm({ ...form, tanggalPinjam: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Rencana Kembali" required>
              <input type="date" required value={form.tanggalKembaliRencana} onChange={(e) => setForm({ ...form, tanggalKembaliRencana: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label="Keperluan" required>
            <textarea required rows={3} value={form.keperluan} onChange={(e) => setForm({ ...form, keperluan: e.target.value })} placeholder="cth: verifikasi akreditasi, penyusunan laporan..." className={inputCls} />
          </Field>
          {msg && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600">{msg}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setPinjamOpen(false)} className={btnSecondary}>Batal</button>
            <button type="submit" className={btnPrimary}>Kirim Pengajuan</button>
          </div>
        </form>
      </Modal>

      <Modal open={delOpen} onClose={() => setDelOpen(false)} title="Hapus Arsip?">
        <p className="text-sm text-slate-600">
          Arsip <b>{a.nomorSurat as string}</b> akan dihapus permanen beserta riwayat peminjamannya. Tindakan ini tercatat di audit log.
        </p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setDelOpen(false)} className={btnSecondary}>Batal</button>
          <button onClick={hapus} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white hover:bg-rose-700">Ya, Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
