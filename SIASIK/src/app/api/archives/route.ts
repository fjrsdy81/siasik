import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { archives, categories, units } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const kategori = url.searchParams.get("kategori") || "";
  const unit = url.searchParams.get("unit") || "";
  const tipe = url.searchParams.get("tipe") || "";
  const sifat = url.searchParams.get("sifat") || "";
  const status = url.searchParams.get("status") || "";
  const tahun = url.searchParams.get("tahun") || "";
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || "12")));
  const offset = (page - 1) * limit;

  const conds = [];
  if (q) {
    conds.push(
      or(
        ilike(archives.judul, `%${q}%`),
        ilike(archives.nomorSurat, `%${q}%`),
        ilike(archives.deskripsi, `%${q}%`),
        ilike(archives.pengirim, `%${q}%`),
        ilike(archives.tags, `%${q}%`)
      )
    );
  }
  if (kategori) conds.push(eq(archives.kategoriId, Number(kategori)));
  if (unit) conds.push(eq(archives.unitId, Number(unit)));
  if (tipe) conds.push(eq(archives.tipeDokumen, tipe));
  if (sifat) conds.push(eq(archives.sifat, sifat as never));
  if (status) conds.push(eq(archives.statusArsip, status as never));
  if (tahun) conds.push(eq(archives.tahun, Number(tahun)));

  // Rahasia: hanya admin/arsiparis/pimpinan yang bisa lihat semua; pegawai tidak lihat Rahasia akses?
  // Kita tetap tampilkan tapi tandai; filter akses untuk pegawai:
  if (s.user.role === "pegawai") {
    conds.push(or(eq(archives.aksesLevel, "Publik Internal" as never), eq(archives.aksesLevel, "Terbatas" as never)));
  }

  const where = conds.length ? and(...conds) : undefined;

  const totalRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(archives)
    .where(where);
  const total = Number(totalRes[0]?.count || 0);

  const rows = await db
    .select({
      archive: archives,
      kategoriNama: categories.nama,
      kategoriKode: categories.kode,
      kategoriWarna: categories.warna,
      unitNama: units.nama,
      unitKode: units.kode,
    })
    .from(archives)
    .leftJoin(categories, eq(archives.kategoriId, categories.id))
    .leftJoin(units, eq(archives.unitId, units.id))
    .where(where)
    .orderBy(desc(archives.createdAt))
    .limit(limit)
    .offset(offset);

  const data = rows.map((r) => ({
    ...r.archive,
    kategoriNama: r.kategoriNama,
    kategoriKode: r.kategoriKode,
    kategoriWarna: r.kategoriWarna,
    unitNama: r.unitNama,
    unitKode: r.unitKode,
  }));

  // tahun list for filter
  const tahunRows = await db
    .select({ tahun: archives.tahun })
    .from(archives)
    .groupBy(archives.tahun)
    .orderBy(desc(archives.tahun));

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    tahunList: tahunRows.map((t) => t.tahun).filter(Boolean),
  });
}

export async function POST(req: Request) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "arsiparis"].includes(s.user.role))
    return NextResponse.json({ error: "Hanya admin/arsiparis yang dapat menambah arsip" }, { status: 403 });
  const body = await req.json();
  if (!body.nomorSurat || !body.judul)
    return NextResponse.json({ error: "Nomor surat dan judul wajib diisi" }, { status: 400 });

  const tanggalSurat = body.tanggalSurat || null;
  const tahunVal = body.tahun
    ? Number(body.tahun)
    : tanggalSurat
      ? new Date(tanggalSurat).getFullYear()
      : new Date().getFullYear();
  const retensi = Number(body.retensiTahun) || 5;
  let tanggalRetensi = body.tanggalRetensi || null;
  if (!tanggalRetensi && tanggalSurat) {
    const d = new Date(tanggalSurat);
    d.setFullYear(d.getFullYear() + retensi);
    tanggalRetensi = d.toISOString().slice(0, 10);
  }

  const inserted = await db
    .insert(archives)
    .values({
      nomorSurat: body.nomorSurat.trim(),
      judul: body.judul.trim(),
      deskripsi: body.deskripsi || null,
      kategoriId: body.kategoriId ? Number(body.kategoriId) : null,
      unitId: body.unitId ? Number(body.unitId) : null,
      tipeDokumen: body.tipeDokumen || "Surat Masuk",
      sifat: body.sifat || "Biasa",
      statusArsip: body.statusArsip || "Aktif",
      aksesLevel: body.aksesLevel || "Publik Internal",
      tanggalSurat,
      tanggalDiterima: body.tanggalDiterima || null,
      tahun: tahunVal,
      pengirim: body.pengirim || null,
      penerima: body.penerima || null,
      jumlahHalaman: Number(body.jumlahHalaman) || 1,
      lokasiLemari: body.lokasiLemari || null,
      lokasiRak: body.lokasiRak || null,
      lokasiBox: body.lokasiBox || null,
      lokasiMap: body.lokasiMap || null,
      fileUrl: body.fileUrl || null,
      fileName: body.fileName || null,
      fileSize: body.fileSize ? Number(body.fileSize) : null,
      fileType: body.fileType || null,
      retensiTahun: retensi,
      tanggalRetensi,
      tags: body.tags || null,
      createdBy: s.user.id,
    })
    .returning();

  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: "CREATE",
    entitas: "arsip",
    entitasId: inserted[0].id,
    detail: `Tambah arsip ${body.nomorSurat} - ${body.judul}`,
  });

  return NextResponse.json({ data: inserted[0] }, { status: 201 });
}
