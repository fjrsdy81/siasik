"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui";

const FAQ = [
  { q: "Bagaimana cara menambah arsip baru?", a: "Masuk sebagai Admin/Arsiparis → menu Tambah Arsip → isi nomor, judul, kategori, unit, tanggal → unggah file PDF (maks 15 MB) → isi lokasi fisik lemari/rak/box → Simpan. Sistem otomatis menghitung tanggal retensi sesuai JRA." },
  { q: "Siapa yang bisa melihat arsip berlabel Rahasia?", a: "Arsip dengan akses Rahasia hanya tampil penuh untuk Admin, Arsiparis, dan Pimpinan. Pegawai hanya melihat arsip Publik Internal & Terbatas." },
  { q: "Bagaimana alur peminjaman arsip fisik?", a: "Pegawai mengajukan dari halaman detail arsip → status Menunggu → Arsiparis menyetujui (Dipinjam) atau menolak → saat dikembalikan Arsiparis menekan Kembalikan. Keterlambatan otomatis ditandai Terlambat." },
  { q: "Apa itu retensi & usul musnah?", a: "Retensi adalah masa simpan wajib (mis. 5 tahun). Arsip melewati retensi berstatus Inaktif dan dapat diusulkan musnah sesuai Jadwal Retensi Arsip (JRA) KKP setelah penilaian tim." },
  { q: "Format file apa yang didukung?", a: "PDF, JPG/PNG, DOC/DOCX, XLS/XLSX, TXT hingga 15 MB per file. Untuk video/Audio besar, simpan di penyimpanan eksternal dan cantumkan tautan di deskripsi." },
  { q: "Bagaimana mengekspor laporan untuk pimpinan?", a: "Buka menu Laporan → saring tipe/status → Unduh CSV (terbuka di Excel) atau Cetak dengan kop resmi Pusstandik." },
];

const SOP = [
  { t: "Penerimaan & Registrasi", d: "Setiap surat/dokumen diregistrasi maksimal 1×24 jam dengan nomor agenda & klasifikasi KP.xx yang benar.", i: "📥" },
  { t: "Digitalisasi", d: "Pindai minimal 200 dpi format PDF/A, beri nama file NomorSurat_Judul_Tahun.pdf sebelum diunggah.", i: "🖨️" },
  { t: "Penyimpanan Fisik", d: "Simpan di lemari/rak/box sesuai lokasi yang dicatat di sistem. Arsip vital di brankas tahan api.", i: "🗄️" },
  { t: "Akses & Pinjam", d: "Arsip rahasia wajib izin tertulis Kepala Pusat. Peminjaman maksimal 7 hari kerja.", i: "🔐" },
  { t: "Retensi & Penyusutan", d: "Setiap awal tahun, arsiparis menilai arsip inaktif untuk usul musnah/pindah ke depo sentral.", i: "⏳" },
];

export default function BantuanPage() {
  const [open, setOpen] = useState(0);
  return (
    <div className="animate-fade-up">
      <PageHeader icon="❓" title="Bantuan, SOP & Panduan" desc="Pedoman kearsipan Pusstandik SDM KP — dari registrasi hingga penyusutan arsip." />
      <div className="rounded-3xl bg-gradient-to-r from-sky-700 via-cyan-600 to-teal-500 p-6 text-white shadow-xl md:p-8">
        <h2 className="text-xl font-extrabold">⚓ Tata Naskah & Kearsipan KKP</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-sky-50">
          Mengacu pada Permen KP tentang Tata Naskah Dinas, Klasifikasi Arsip, dan Jadwal Retensi Arsip (JRA).
          Klasifikasi utama Pusstandik: <b>KP.01 Ketatausahaan, KP.02 Standardisasi, KP.03 Sertifikasi, KP.04 Diklat & SDM, KP.05 Keuangan, KP.06 Kepegawaian, KP.07 Kerjasama, KP.08 Hukum & Humas.</b>
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20">📞 Helpdesk ext. 2108</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20">✉️ arsip.pusstandik@kkp.go.id</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20">🕐 Senin–Jumat 08.00–16.00 WIB</span>
        </div>
      </div>

      <h3 className="mt-6 text-base font-extrabold text-slate-800">📋 Standar Operasional Prosedur (5 Tahap)</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {SOP.map((s, i) => (
          <div key={s.t} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-2xl">{s.i}</span>
            <p className="mt-2 text-[11px] font-extrabold uppercase tracking-widest text-sky-600">Tahap {i + 1}</p>
            <p className="text-sm font-extrabold text-slate-800">{s.t}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{s.d}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-6 text-base font-extrabold text-slate-800">💬 Pertanyaan Umum (FAQ)</h3>
      <div className="mt-3 space-y-2">
        {FAQ.map((f, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-extrabold text-slate-800 hover:bg-slate-50">
              {f.q}<span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-700 transition ${open === i ? "rotate-45" : ""}`}>＋</span>
            </button>
            {open === i && <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-500">{f.a}</p>}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-amber-50 p-5 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200">
        <b>🐟 Catatan Teknis & Infrastruktur:</b> Aplikasi ini setara fungsi Google Apps Script (Frontend + Backend terpadu) namun dibangun modern: database PostgreSQL relasional, API Next.js terproteksi sesi, upload 15 MB, audit log imutabel, backup harian otomatis, dan siap ekspor CSV. Untuk migrasi dari Spreadsheet/Drive lama, hubungi arsiparis untuk impor massal.
      </div>
    </div>
  );
}
