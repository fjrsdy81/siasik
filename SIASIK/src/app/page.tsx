import Link from "next/link";

const FEATURES = [
  { icon: "🔐", title: "Keamanan & Otorisasi", desc: "Login NIP, 4 level peran (Admin, Arsiparis, Pimpinan, Pegawai), sesi aman, dan audit log setiap aktivitas." },
  { icon: "🗂️", title: "Manajemen Arsip", desc: "Kelola surat masuk/keluar, SK, sertifikat, MoU, SOP — lengkap dengan upload PDF, lokasi fisik lemari/rak/box." },
  { icon: "🔍", title: "Pencarian & Filter", desc: "Pencarian full-text nomor, judul, pengirim, tag + filter kategori, unit, tipe, sifat, status, dan tahun." },
  { icon: "📊", title: "Dashboard & Laporan", desc: "Statistik real-time, grafik per kategori/tipe/tahun, arsip populer, jatuh tempo pinjam, ekspor CSV." },
  { icon: "🏷️", title: "Kategori & Master Data", desc: "Klasifikasi kode arsip (KP.xx), unit kerja pusstandik, retensi JRA otomatis per kategori." },
  { icon: "🔄", title: "Peminjaman Digital", desc: "Alur pinjam-kembali terdokumentasi dengan persetujuan arsiparis dan pengingat jatuh tempo." },
];

const STEPS = [
  { n: "01", t: "Login dengan NIP", d: "Masuk menggunakan NIP & kata sandi sesuai peran Anda." },
  { n: "02", t: "Kelola & Unggah Arsip", d: "Arsiparis menginput metadata + mengunggah file PDF/dokumen." },
  { n: "03", t: "Cari dalam Detik", d: "Pegawai & pimpinan menemukan dokumen via pencarian cerdas." },
  { n: "04", t: "Pinjam & Laporkan", d: "Ajukan peminjaman digital, pantau retensi, ekspor laporan." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a2540] text-white">
      {/* Topbar */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-teal-400 text-3xl shadow-xl">
            ⚓
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight">SIASIK</span>
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-sky-300">
              Pusstandik SDM Kelautan & Perikanan
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-sky-100 ring-1 ring-white/15 md:block">
            🇮🇩 Kementerian Kelautan & Perikanan RI
          </span>
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-sky-950/40 transition hover:brightness-110"
          >
            Masuk →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="ocean-grid relative mx-auto max-w-7xl overflow-hidden px-5 pb-16 pt-10 md:pt-16">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 ring-1 ring-amber-300/30">
              🌊 Sistem Manajemen Arsip Digital
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-[3.4rem]">
              Arsip Kantor Lebih{" "}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                Rapi, Aman &
              </span>{" "}
              Terorganisir
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-300">
              SIASIK menggantikan tumpukan map fisik &amp; file tersebar di Google Drive dengan satu pusat arsip
              digital untuk Pusat Standardisasi dan Sertifikasi SDM Kelautan dan Perikanan — lengkap dengan
              klasifikasi, retensi, dan jejak audit.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-7 py-3.5 text-sm font-extrabold text-white shadow-2xl shadow-sky-900/50 transition hover:brightness-110"
              >
                🚀 Buka Aplikasi Sekarang
              </Link>
              <a
                href="#fitur"
                className="rounded-2xl bg-white/10 px-7 py-3.5 text-sm font-extrabold text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                Jelajahi Fitur
              </a>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[
                ["5000+", "Arsip Digital"],
                ["100%", "Teraudit"],
                ["4", "Level Akses"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-white/[0.07] p-3 text-center ring-1 ring-white/10">
                  <p className="text-xl font-extrabold text-cyan-200">{v}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">{l}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Mock app preview */}
          <div className="relative">
            <div className="animate-float rounded-3xl border border-white/15 bg-white/[0.08] p-4 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 rounded-lg bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200">
                  siasik.kkp.go.id/dashboard
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 p-3">
                {[
                  ["🗂️", "1.284", "Total Arsip"],
                  ["👥", "48", "Pengguna"],
                  ["🔄", "12", "Dipinjam"],
                ].map(([i, v, l]) => (
                  <div key={l} className="rounded-2xl bg-white p-3 text-slate-800">
                    <p className="text-xl">{i}</p>
                    <p className="text-lg font-extrabold">{v}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{l}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 px-3 pb-3">
                {[
                  ["SK Kepala Pusat No. 12/2026", "Sertifikat • Aktif", "✅"],
                  ["MoU Politeknik KP Sidoarjo", "MoU • Vital", "⭐"],
                  ["Laporan Akreditasi 2025", "Laporan • Inaktif", "📑"],
                ].map(([j, m, e]) => (
                  <div key={j} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-slate-800">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-lg">{e}</span>
                    <span>
                      <span className="block text-[13px] font-bold">{j}</span>
                      <span className="block text-[11px] font-semibold text-slate-400">{m}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-amber-400 p-4 text-slate-900 shadow-2xl md:block">
              <p className="text-xs font-bold uppercase">JRA Otomatis</p>
              <p className="text-sm font-extrabold">Retensi 5 th • Aman</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="bg-slate-50 py-16 text-slate-900">
        <div className="mx-auto max-w-7xl px-5">
          <p className="text-center text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">
            7 Pilar Sistem • Terinspirasi Kebutuhan GAS
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-extrabold tracking-tight md:text-4xl">
            Satu aplikasi untuk seluruh siklus hidup arsip
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 text-2xl text-white shadow-lg">
                  {f.icon}
                </span>
                <h3 className="mt-4 text-base font-extrabold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
          {/* steps */}
          <div className="mt-12 rounded-3xl bg-[#0a2540] p-8 text-white md:p-10">
            <h3 className="text-center text-2xl font-extrabold">Alur kerja dalam 4 langkah</h3>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/10">
                  <p className="text-3xl font-extrabold text-cyan-300">{s.n}</p>
                  <p className="mt-2 text-sm font-extrabold">{s.t}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-300">{s.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-block rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-3.5 text-sm font-extrabold text-slate-900 shadow-xl transition hover:brightness-110"
              >
                Masuk dengan Akun NIP Anda →
              </Link>
              <p className="mt-3 text-xs text-slate-400">
                Demo — NIP: 197805122006041001 • Sandi: admin123 (Administrator)
              </p>
            </div>
          </div>
          <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 md:flex-row">
            <p>SIASIK • Pusat Standardisasi & Sertifikasi SDM KP • Kementerian Kelautan dan Perikanan</p>
            <p>Jl. Medan Merdeka Timur No. 16, Jakarta Pusat • Aman • Rapi • Terorganisir</p>
          </footer>
        </div>
      </section>
    </div>
  );
}
