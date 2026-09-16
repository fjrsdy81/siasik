"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Field, PageHeader, inputCls, btnPrimary, btnSecondary } from "@/components/ui";
import { TIPE_DOKUMEN, SIFAT_LIST, STATUS_ARSIP, AKSES_LIST } from "@/lib/utils";

function FormInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const editId = sp.get("edit");
  const [kats, setKats] = useState<{ id: number; kode: string; nama: string; retensiDefault: number }[]>([]);
  const [units, setUnits] = useState<{ id: number; kode: string; nama: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [f, setF] = useState({
    nomorSurat: "", judul: "", deskripsi: "", kategoriId: "", unitId: "",
    tipeDokumen: "Surat Masuk", sifat: "Biasa", statusArsip: "Aktif", aksesLevel: "Publik Internal",
    tanggalSurat: new Date().toISOString().slice(0, 10), tanggalDiterima: new Date().toISOString().slice(0, 10),
    tahun: String(new Date().getFullYear()), pengirim: "", penerima: "", jumlahHalaman: "1",
    lokasiLemari: "", lokasiRak: "", lokasiBox: "", lokasiMap: "",
    fileUrl: "", fileName: "", fileSize: "", fileType: "",
    retensiTahun: "5", tanggalRetensi: "", tags: "",
  });

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((j) => setKats(j.data || []));
    fetch("/api/units").then((r) => r.json()).then((j) => setUnits(j.data || []));
  }, []);

  useEffect(() => {
    if (editId) {
      fetch(`/api/archives/${editId}`).then((r) => r.json()).then((j) => {
        const d = j.data;
        if (!d) return;
        setF({
          nomorSurat: d.nomorSurat || "", judul: d.judul || "", deskripsi: d.deskripsi || "",
          kategoriId: d.kategoriId ? String(d.kategoriId) : "", unitId: d.unitId ? String(d.unitId) : "",
          tipeDokumen: d.tipeDokumen || "Surat Masuk", sifat: d.sifat || "Biasa",
          statusArsip: d.statusArsip || "Aktif", aksesLevel: d.aksesLevel || "Publik Internal",
          tanggalSurat: d.tanggalSurat || "", tanggalDiterima: d.tanggalDiterima || "",
          tahun: d.tahun ? String(d.tahun) : "", pengirim: d.pengirim || "", penerima: d.penerima || "",
          jumlahHalaman: String(d.jumlahHalaman || 1),
          lokasiLemari: d.lokasiLemari || "", lokasiRak: d.lokasiRak || "", lokasiBox: d.lokasiBox || "", lokasiMap: d.lokasiMap || "",
          fileUrl: d.fileUrl || "", fileName: d.fileName || "", fileSize: d.fileSize ? String(d.fileSize) : "", fileType: d.fileType || "",
          retensiTahun: String(d.retensiTahun || 5), tanggalRetensi: d.tanggalRetensi || "", tags: d.tags || "",
        });
      });
    }
  }, [editId]);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const onKategori = (id: string) => {
    setF((p) => {
      const kat = kats.find((k) => String(k.id) === id);
      return { ...p, kategoriId: id, retensiTahun: kat ? String(kat.retensiDefault) : p.retensiTahun };
    });
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.error || "Gagal upload");
      } else {
        setF((p) => ({ ...p, fileUrl: j.fileUrl, fileName: j.fileName, fileSize: String(j.fileSize), fileType: j.fileType }));
        setOk(`✅ File "${j.fileName}" berhasil diunggah`);
        setTimeout(() => setOk(""), 4000);
      }
    } catch {
      setErr("Gagal mengunggah");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const payload = {
        ...f,
        kategoriId: f.kategoriId || null,
        unitId: f.unitId || null,
        tahun: f.tahun ? Number(f.tahun) : null,
        jumlahHalaman: Number(f.jumlahHalaman) || 1,
        retensiTahun: Number(f.retensiTahun) || 5,
        fileSize: f.fileSize ? Number(f.fileSize) : null,
        tanggalSurat: f.tanggalSurat || null,
        tanggalDiterima: f.tanggalDiterima || null,
        tanggalRetensi: f.tanggalRetensi || null,
      };
      const url = editId ? `/api/archives/${editId}` : "/api/archives";
      const r = await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.error || "Gagal menyimpan");
        setSaving(false);
        return;
      }
      router.push(`/arsip/${j.data.id}`);
    } catch {
      setErr("Terjadi kesalahan");
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        icon={editId ? "✏️" : "➕"}
        title={editId ? "Ubah Arsip" : "Tambah Arsip Baru"}
        desc="Lengkapi metadata sesuai kaidah kearsipan. Kolom bertanda * wajib diisi."
      />
      <form onSubmit={submit} className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 xl:col-span-2">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-sky-700">📝 Identitas Dokumen</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nomor Surat / Dokumen" required>
              <input required value={f.nomorSurat} onChange={(e) => set("nomorSurat", e.target.value)} placeholder="cth: KP.01/145/2026" className={inputCls} />
            </Field>
            <Field label="Tipe Dokumen" required>
              <select value={f.tipeDokumen} onChange={(e) => set("tipeDokumen", e.target.value)} className={inputCls}>
                {TIPE_DOKUMEN.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Judul / Hal Dokumen" required>
            <input required value={f.judul} onChange={(e) => set("judul", e.target.value)} placeholder="cth: Sertifikat Kompetensi Penyelam Jenjang III" className={inputCls} />
          </Field>
          <Field label="Deskripsi / Isi Ringkas">
            <textarea rows={3} value={f.deskripsi} onChange={(e) => set("deskripsi", e.target.value)} placeholder="Ringkasan isi dokumen..." className={inputCls} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori Klasifikasi" required>
              <select value={f.kategoriId} onChange={(e) => onKategori(e.target.value)} className={inputCls}>
                <option value="">— Pilih kategori —</option>
                {kats.map((k) => <option key={k.id} value={k.id}>{k.kode} — {k.nama}</option>)}
              </select>
            </Field>
            <Field label="Unit Kerja / Bidang" required>
              <select value={f.unitId} onChange={(e) => set("unitId", e.target.value)} className={inputCls}>
                <option value="">— Pilih unit —</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.kode} — {u.nama}</option>)}
              </select>
            </Field>
            <Field label="Tanggal Surat" required>
              <input type="date" required value={f.tanggalSurat} onChange={(e) => set("tanggalSurat", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Tanggal Diterima / Ditetapkan">
              <input type="date" value={f.tanggalDiterima} onChange={(e) => set("tanggalDiterima", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Pengirim / Penerbit">
              <input value={f.pengirim} onChange={(e) => set("pengirim", e.target.value)} placeholder="cth: Kepala Pusstandik" className={inputCls} />
            </Field>
            <Field label="Penerima / Tujuan">
              <input value={f.penerima} onChange={(e) => set("penerima", e.target.value)} placeholder="cth: Politeknik KP Sidoarjo" className={inputCls} />
            </Field>
            <Field label="Sifat Surat">
              <select value={f.sifat} onChange={(e) => set("sifat", e.target.value)} className={inputCls}>
                {SIFAT_LIST.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status Arsip">
              <select value={f.statusArsip} onChange={(e) => set("statusArsip", e.target.value)} className={inputCls}>
                {STATUS_ARSIP.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Akses">
              <select value={f.aksesLevel} onChange={(e) => set("aksesLevel", e.target.value)} className={inputCls}>
                {AKSES_LIST.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Jumlah Halaman">
              <input type="number" min={1} value={f.jumlahHalaman} onChange={(e) => set("jumlahHalaman", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Tag / Kata Kunci" hint="Pisahkan dengan koma, cth: sertifikasi, penyelam, 2026">
            <input value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="sertifikasi, ..." className={inputCls} />
          </Field>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-[#0a2540] p-6 text-white shadow-xl">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-sky-300">📎 File Digital</h3>
            <label className="mt-3 block cursor-pointer rounded-2xl border-2 border-dashed border-white/25 bg-white/5 p-6 text-center transition hover:border-cyan-300 hover:bg-white/10">
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt" onChange={onFile} />
              {uploading ? <p className="text-sm font-bold">⏳ Mengunggah...</p> : f.fileUrl ? <p className="text-sm font-bold">📄 {f.fileName}<br /><span className="text-xs font-medium text-sky-200">Klik untuk ganti file</span></p> : <p className="text-sm font-bold">☁️ Klik untuk unggah<br /><span className="text-xs font-medium text-sky-200">PDF / Gambar / Word / Excel • maks 15 MB</span></p>}
            </label>
            {f.fileUrl && <a href={f.fileUrl} target="_blank" className="mt-2 block rounded-xl bg-white/10 py-2 text-center text-xs font-bold ring-1 ring-white/15 hover:bg-white/20">👁️ Pratinjau file terunggah</a>}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-sky-700">🗄️ Lokasi Fisik</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Lemari"><input value={f.lokasiLemari} onChange={(e) => set("lokasiLemari", e.target.value)} placeholder="L-02" className={inputCls} /></Field>
              <Field label="Rak"><input value={f.lokasiRak} onChange={(e) => set("lokasiRak", e.target.value)} placeholder="R-05" className={inputCls} /></Field>
              <Field label="Box"><input value={f.lokasiBox} onChange={(e) => set("lokasiBox", e.target.value)} placeholder="B-12" className={inputCls} /></Field>
              <Field label="Map"><input value={f.lokasiMap} onChange={(e) => set("lokasiMap", e.target.value)} placeholder="M-03" className={inputCls} /></Field>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-sky-700">⏳ Retensi (JRA)</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Retensi (thn)"><input type="number" min={1} max={30} value={f.retensiTahun} onChange={(e) => set("retensiTahun", e.target.value)} className={inputCls} /></Field>
              <Field label="Tgl Retensi"><input type="date" value={f.tanggalRetensi} onChange={(e) => set("tanggalRetensi", e.target.value)} className={inputCls} /></Field>
            </div>
            <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
              💡 Retensi mengikuti JRA KKP. Kosongkan tanggal retensi untuk hitung otomatis dari tanggal surat.
            </p>
          </div>

          {err && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">⚠️ {err}</p>}
          {ok && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">{ok}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => router.back()} className={btnSecondary}>Batal</button>
            <button onClick={submit} disabled={saving || uploading} className={`${btnPrimary} flex-1`}>
              {saving ? "Menyimpan..." : editId ? "💾 Simpan Perubahan" : "✅ Simpan Arsip"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function TambahPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-sm font-bold text-slate-400">Memuat form...</p>}>
      <FormInner />
    </Suspense>
  );
}
