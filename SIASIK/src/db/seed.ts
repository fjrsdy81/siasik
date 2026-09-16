import { db } from "./index";
import { units, categories, users, archives, loans, auditLogs } from "./schema";
import { hashPassword } from "../lib/auth";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌊 Seeding SIASIK...");

  // Units
  const unitData = [
    { kode: "PIMP", nama: "Pimpinan Pusat", deskripsi: "Kepala Pusat & Sekretariat Pimpinan", kepalaUnit: "Dr. Ir. Bambang S., M.Si" },
    { kode: "BID-01", nama: "Bidang Standardisasi", deskripsi: "Penyusunan standar kompetensi SDM KP", kepalaUnit: "Ir. Ratna Dewi, M.M" },
    { kode: "BID-02", nama: "Bidang Sertifikasi", deskripsi: "Sertifikasi profesi kelautan & perikanan", kepalaUnit: "Drs. H. Agus Wijaya" },
    { kode: "BID-03", nama: "Bidang Data & Informasi", deskripsi: "Pengelolaan data, TI & kearsipan", kepalaUnit: "Siti Nurhaliza, S.Kom, M.T" },
    { kode: "TU", nama: "Bagian Tata Usaha", deskripsi: "Ketatausahaan, keuangan & kepegawaian", kepalaUnit: "Hendra Gunawan, S.E" },
    { kode: "KS", nama: "Kelompok Kerjasama", deskripsi: "MoU/PKS dengan mitra & politeknik KP", kepalaUnit: "Dr. Maya Kusuma" },
  ];
  for (const u of unitData) {
    const ex = await db.select().from(units).where(eq(units.kode, u.kode)).limit(1);
    if (!ex.length) await db.insert(units).values(u);
  }
  console.log("✅ Units");

  const catData = [
    { kode: "KP.01", nama: "Ketatausahaan", deskripsi: "Surat masuk/keluar, undangan, nota dinas, administrasi umum", retensiDefault: 5, warna: "#0284c7" },
    { kode: "KP.02", nama: "Standardisasi", deskripsi: "RSNI, SKKNI, pedoman & SOP standardisasi SDM KP", retensiDefault: 10, warna: "#0d9488" },
    { kode: "KP.03", nama: "Sertifikasi Kompetensi", deskripsi: "Sertifikat, lisensi, asesor & TUK", retensiDefault: 10, warna: "#d4a017" },
    { kode: "KP.04", nama: "Diklat & Pengembangan SDM", deskripsi: "Pelatihan, akreditasi lembaga diklat", retensiDefault: 5, warna: "#7c3aed" },
    { kode: "KP.05", nama: "Keuangan", deskripsi: "DIPA, SPJ, laporan keuangan", retensiDefault: 10, warna: "#059669" },
    { kode: "KP.06", nama: "Kepegawaian", deskripsi: "SK pegawai, KP, pensiun, disiplin", retensiDefault: 10, warna: "#f97316" },
    { kode: "KP.07", nama: "Kerjasama", deskripsi: "MoU, PKS dengan mitra dalam/luar negeri", retensiDefault: 5, warna: "#e11d48" },
    { kode: "KP.08", nama: "Hukum & Humas", deskripsi: "Peraturan, produk hukum, publikasi", retensiDefault: 5, warna: "#475569" },
  ];
  for (const c of catData) {
    const ex = await db.select().from(categories).where(eq(categories.kode, c.kode)).limit(1);
    if (!ex.length) await db.insert(categories).values(c);
  }
  console.log("✅ Categories");

  const allUnits = await db.select().from(units);
  const unitByKode = (k: string) => allUnits.find((u) => u.kode === k)?.id ?? null;

  const userData = [
    { nip: "197805122006041001", nama: "Bambang Sutrisno", email: "bambang@kkp.go.id", pass: "admin123", role: "admin" as const, jabatan: "Arsiparis Ahli Madya", unitKode: "BID-03" },
    { nip: "199001152015032002", nama: "Ratna Sari Dewi", email: "ratna@kkp.go.id", pass: "arsip123", role: "arsiparis" as const, jabatan: "Arsiparis Pelaksana", unitKode: "BID-03" },
    { nip: "197203101998031003", nama: "Dr. H. Moch. Yusuf", email: "yusuf@kkp.go.id", pass: "pimpin123", role: "pimpinan" as const, jabatan: "Kepala Pusat", unitKode: "PIMP" },
    { nip: "199507202020122004", nama: "Dian Puspita", email: "dian@kkp.go.id", pass: "pegawai123", role: "pegawai" as const, jabatan: "Analis SDM", unitKode: "BID-01" },
    { nip: "199203102019011005", nama: "Fajar Nugroho", email: "fajar@kkp.go.id", pass: "pegawai123", role: "pegawai" as const, jabatan: "Verifikator Sertifikasi", unitKode: "BID-02" },
  ];
  for (const u of userData) {
    const ex = await db.select().from(users).where(eq(users.nip, u.nip)).limit(1);
    if (!ex.length) {
      await db.insert(users).values({
        nip: u.nip,
        nama: u.nama,
        email: u.email,
        passwordHash: await hashPassword(u.pass),
        role: u.role,
        jabatan: u.jabatan,
        unitId: unitByKode(u.unitKode),
      });
    }
  }
  console.log("✅ Users");

  const allCats = await db.select().from(categories);
  const catByKode = (k: string) => allCats.find((c) => c.kode === k)?.id ?? null;
  const admin = (await db.select().from(users).where(eq(users.nip, "197805122006041001")).limit(1))[0];
  const arsiparis = (await db.select().from(users).where(eq(users.nip, "199001152015032002")).limit(1))[0];

  const existing = await db.select({ id: archives.id }).from(archives).limit(1);
  if (!existing.length) {
    const sample = [
      {
        nomorSurat: "KP.03/145/VI/2026", judul: "Sertifikat Kompetensi Penyelam Jenjang III — Batch 12", deskripsi: "Sertifikat kompetensi untuk 45 penyelam profesional bidang perikanan tangkap yang dinyatakan kompeten oleh LSP KP.", kategori: "KP.03", unit: "BID-02", tipe: "Sertifikat", sifat: "Biasa" as const, status: "Aktif" as const, tgl: "2026-06-12", pengirim: "LSP Kelautan & Perikanan", penerima: "45 Peserta Batch 12", halaman: 48, lemari: "L-02", rak: "R-05", box: "B-12", map: "M-03", tags: "sertifikasi, penyelam, kompetensi",
      },
      {
        nomorSurat: "KP.01/089/III/2026", judul: "Surat Edaran Digitalisasi Arsip Tahun 2026", deskripsi: "Edaran Kepala Pusat tentang percepatan digitalisasi seluruh arsip aktif ke SIASIK maksimal akhir triwulan III.", kategori: "KP.01", unit: "PIMP", tipe: "Surat Keluar", sifat: "Segera" as const, status: "Aktif" as const, tgl: "2026-03-04", pengirim: "Kepala Pusstandik", penerima: "Seluruh Bidang", halaman: 3, lemari: "L-01", rak: "R-01", box: "B-01", map: "M-01", tags: "digitalisasi, edaran",
      },
      {
        nomorSurat: "KP.07/210/VII/2026", judul: "MoU Pusstandik dengan Politeknik KP Sidoarjo", deskripsi: "Kesepakatan kerjasama pengembangan kurikulum dan TUK sertifikasi untuk taruna Politeknik KP Sidoarjo.", kategori: "KP.07", unit: "KS", tipe: "MoU / PKS", sifat: "Biasa" as const, status: "Vital" as const, tgl: "2026-07-20", pengirim: "Pusstandik SDM KP", penerima: "Politeknik KP Sidoarjo", halaman: 12, lemari: "L-04", rak: "R-02", box: "B-20", map: "M-07", tags: "mou, politeknik, kerjasama",
      },
      {
        nomorSurat: "KP.02/067/IV/2026", judul: "SKKNI Bidang Pengolahan Hasil Perikanan Revisi 2026", deskripsi: "Standar Kompetensi Kerja Nasional Indonesia bidang pengolahan hasil perikanan hasil konvensi nasional.", kategori: "KP.02", unit: "BID-01", tipe: "Surat Keputusan (SK)", sifat: "Sangat Segera" as const, status: "Vital" as const, tgl: "2026-04-18", pengirim: "Kementerian Ketenagakerjaan", penerima: "Pusstandik SDM KP", halaman: 86, lemari: "L-03", rak: "R-03", box: "B-08", map: "M-02", tags: "skkni, standar, pengolahan",
      },
      {
        nomorSurat: "KP.04/033/II/2026", judul: "Laporan Akreditasi Lembaga Diklat KP 2025", deskripsi: "Hasil akreditasi 12 lembaga diklat KP oleh tim asesor, 9 terakreditasi A dan 3 terakreditasi B.", kategori: "KP.04", unit: "BID-01", tipe: "Laporan", sifat: "Biasa" as const, status: "Inaktif" as const, tgl: "2026-02-10", pengirim: "Tim Asesor", penerima: "Kepala Pusat", halaman: 64, lemari: "L-02", rak: "R-04", box: "B-10", map: "M-05", tags: "akreditasi, diklat, laporan",
      },
      {
        nomorSurat: "KP.06/015/I/2026", judul: "SK Kenaikan Pangkat Periode April 2026", deskripsi: "SK kenaikan pangkat 18 pegawai Pusstandik periode April 2026.", kategori: "KP.06", unit: "TU", tipe: "Surat Keputusan (SK)", sifat: "Rahasia" as const, status: "Aktif" as const, tgl: "2026-01-28", pengirim: "Sekjen KKP", penerima: "18 Pegawai", halaman: 20, lemari: "L-05", rak: "R-01", box: "B-30", map: "M-10", tags: "kepegawaian, sk",
      },
      {
        nomorSurat: "KP.02/102/V/2026", judul: "SOP Verifikasi Berkas Sertifikasi v3.1", deskripsi: "Prosedur operasi standar verifikasi berkas permohonan sertifikasi kompetensi secara daring via SIASIK.", kategori: "KP.02", unit: "BID-02", tipe: "SOP", sifat: "Biasa" as const, status: "Aktif" as const, tgl: "2026-05-06", pengirim: "Bidang Sertifikasi", penerima: "Seluruh Verifikator", halaman: 15, lemari: "L-03", rak: "R-06", box: "B-09", map: "M-04", tags: "sop, verifikasi",
      },
      {
        nomorSurat: "KP.05/077/V/2026", judul: "DIPA Pusstandik TA 2026 Revisi 2", deskripsi: "Daftar Isian Pelaksanaan Anggaran revisi kedua Tahun Anggaran 2026.", kategori: "KP.05", unit: "TU", tipe: "Laporan", sifat: "Segera" as const, status: "Aktif" as const, tgl: "2026-05-22", pengirim: "Ditjen Anggaran Kemenkeu", penerima: "Pusstandik", halaman: 30, lemari: "L-05", rak: "R-03", box: "B-25", map: "M-08", tags: "dipa, keuangan",
      },
      {
        nomorSurat: "KP.01/198/VIII/2026", judul: "Undangan Rakor Standardisasi SDM KP Nasional", deskripsi: "Undangan rapat koordinasi nasional standardisasi SDM dengan 34 dinas KP provinsi.", kategori: "KP.01", unit: "PIMP", tipe: "Undangan", sifat: "Segera" as const, status: "Aktif" as const, tgl: "2026-08-14", pengirim: "Kepala Pusat", penerima: "34 Dinas KP Provinsi", halaman: 2, lemari: "L-01", rak: "R-02", box: "B-02", map: "M-02", tags: "rakor, undangan",
      },
      {
        nomorSurat: "KP.08/044/III/2025", judul: "Peraturan Kepala BRSDM No. 8/2025 tentang JRA", deskripsi: "Jadwal Retensi Arsip di lingkungan BRSDM KP sebagai acuan penyusutan arsip Pusstandik.", kategori: "KP.08", unit: "TU", tipe: "Peraturan", sifat: "Biasa" as const, status: "Vital" as const, tgl: "2025-03-15", pengirim: "Kepala BRSDM", penerima: "Seluruh Satker", halaman: 40, lemari: "L-04", rak: "R-01", box: "B-18", map: "M-01", tags: "jra, peraturan, retensi",
      },
      {
        nomorSurat: "KP.03/201/VIII/2026", judul: "Berita Acara Uji Kompetensi Nelayan Pantura", deskripsi: "Hasil uji kompetensi 120 nelayan pantura Jawa oleh asesor LSP, tingkat kelulusan 94%.", kategori: "KP.03", unit: "BID-02", tipe: "Berita Acara", sifat: "Biasa" as const, status: "Aktif" as const, tgl: "2026-08-30", pengirim: "TUK Pantura", penerima: "LSP KP", halaman: 10, lemari: "L-02", rak: "R-07", box: "B-14", map: "M-06", tags: "uji kompetensi, nelayan",
      },
      {
        nomorSurat: "KP.01/220/IX/2026", judul: "Nota Dinas Pengadaan Brankas Arsip Vital", deskripsi: "Pengajuan pengadaan 2 unit brankas tahan api untuk penyimpanan arsip vital sertifikasi.", kategori: "KP.01", unit: "TU", tipe: "Nota Dinas", sifat: "Segera" as const, status: "Aktif" as const, tgl: "2026-09-02", pengirim: "Arsiparis", penerima: "Kepala Pusat", halaman: 4, lemari: "L-01", rak: "R-03", box: "B-03", map: "M-09", tags: "pengadaan, brankas",
      },
    ];

    for (let i = 0; i < sample.length; i++) {
      const s = sample[i];
      const d = new Date(s.tgl);
      const cat = allCats.find((c) => c.kode === s.kategori);
      const ret = cat?.retensiDefault || 5;
      const retDate = new Date(d);
      retDate.setFullYear(retDate.getFullYear() + ret);
      await db.insert(archives).values({
        nomorSurat: s.nomorSurat,
        judul: s.judul,
        deskripsi: s.deskripsi,
        kategoriId: catByKode(s.kategori),
        unitId: unitByKode(s.unit),
        tipeDokumen: s.tipe,
        sifat: s.sifat,
        statusArsip: s.status,
        aksesLevel: s.sifat === "Rahasia" ? "Rahasia" : "Publik Internal",
        tanggalSurat: s.tgl,
        tanggalDiterima: s.tgl,
        tahun: d.getFullYear(),
        pengirim: s.pengirim,
        penerima: s.penerima,
        jumlahHalaman: s.halaman,
        lokasiLemari: s.lemari,
        lokasiRak: s.rak,
        lokasiBox: s.box,
        lokasiMap: s.map,
        retensiTahun: ret,
        tanggalRetensi: retDate.toISOString().slice(0, 10),
        tags: s.tags,
        views: 5 + i * 7,
        downloads: 2 + i * 3,
        createdBy: (i % 2 === 0 ? admin : arsiparis)?.id ?? null,
      });
    }
    console.log("✅ Archives");
  }

  const allArchives = await db.select().from(archives).limit(5);
  const existingLoans = await db.select({ id: loans.id }).from(loans).limit(1);
  if (!existingLoans.length && allArchives.length >= 2) {
    const pegawai = (await db.select().from(users).where(eq(users.nip, "199507202020122004")).limit(1))[0];
    await db.insert(loans).values([
      {
        archiveId: allArchives[0].id,
        peminjamId: pegawai?.id,
        namaPeminjam: "Dian Puspita",
        tanggalPinjam: "2026-09-05",
        tanggalKembaliRencana: "2026-09-12",
        keperluan: "Verifikasi data sertifikasi untuk laporan triwulan",
        status: "Dipinjam",
        approvedBy: arsiparis?.id,
      },
      {
        archiveId: allArchives[2].id,
        peminjamId: pegawai?.id,
        namaPeminjam: "Dian Puspita",
        tanggalPinjam: "2026-09-10",
        tanggalKembaliRencana: "2026-09-17",
        keperluan: "Penyusunan bahan kerjasama baru",
        status: "Menunggu",
      },
    ]);
    console.log("✅ Loans");
  }

  const existingAudit = await db.select({ id: auditLogs.id }).from(auditLogs).limit(1);
  if (!existingAudit.length) {
    await db.insert(auditLogs).values([
      { userId: admin?.id, userNama: admin?.nama, aksi: "LOGIN", entitas: "auth", detail: `Login berhasil (${admin?.nip})` },
      { userId: arsiparis?.id, userNama: arsiparis?.nama, aksi: "CREATE", entitas: "arsip", detail: "Tambah arsip KP.03/145/VI/2026 - Sertifikat Kompetensi" },
      { userId: admin?.id, userNama: admin?.nama, aksi: "EXPORT", entitas: "laporan", detail: "Ekspor laporan 12 arsip (format csv)" },
    ]);
    console.log("✅ Audit");
  }

  console.log("🎉 Seed selesai!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
