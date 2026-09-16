import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { archives, categories, units } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
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
    .where(eq(archives.id, id))
    .limit(1);
  if (!rows.length) return NextResponse.json({ error: "Arsip tidak ditemukan" }, { status: 404 });
  const r = rows[0];
  // increment views
  await db.update(archives).set({ views: sql`${archives.views} + 1` }).where(eq(archives.id, id));
  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: "VIEW",
    entitas: "arsip",
    entitasId: id,
    detail: `Lihat arsip ${r.archive.nomorSurat}`,
  });
  return NextResponse.json({
    data: {
      ...r.archive,
      views: (r.archive.views || 0) + 1,
      kategoriNama: r.kategoriNama,
      kategoriKode: r.kategoriKode,
      kategoriWarna: r.kategoriWarna,
      unitNama: r.unitNama,
      unitKode: r.unitKode,
    },
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "arsiparis"].includes(s.user.role))
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  const fields = [
    "nomorSurat",
    "judul",
    "deskripsi",
    "tipeDokumen",
    "sifat",
    "statusArsip",
    "aksesLevel",
    "tanggalSurat",
    "tanggalDiterima",
    "tahun",
    "pengirim",
    "penerima",
    "jumlahHalaman",
    "lokasiLemari",
    "lokasiRak",
    "lokasiBox",
    "lokasiMap",
    "fileUrl",
    "fileName",
    "fileSize",
    "fileType",
    "retensiTahun",
    "tanggalRetensi",
    "tags",
  ];
  for (const f of fields) {
    if (body[f] !== undefined) patch[f] = body[f] === "" ? null : body[f];
  }
  if (body.kategoriId !== undefined) patch.kategoriId = body.kategoriId ? Number(body.kategoriId) : null;
  if (body.unitId !== undefined) patch.unitId = body.unitId ? Number(body.unitId) : null;
  if (body.tahun !== undefined) patch.tahun = body.tahun ? Number(body.tahun) : null;
  if (body.jumlahHalaman !== undefined) patch.jumlahHalaman = Number(body.jumlahHalaman) || 1;
  if (body.retensiTahun !== undefined) patch.retensiTahun = Number(body.retensiTahun) || 5;
  if (body.fileSize !== undefined) patch.fileSize = body.fileSize ? Number(body.fileSize) : null;
  patch.updatedAt = new Date();

  const updated = await db.update(archives).set(patch as never).where(eq(archives.id, id)).returning();
  if (!updated.length) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: "UPDATE",
    entitas: "arsip",
    entitasId: id,
    detail: `Ubah arsip ${updated[0].nomorSurat}`,
  });
  return NextResponse.json({ data: updated[0] });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "arsiparis"].includes(s.user.role))
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await params;
  const cur = await db.select().from(archives).where(eq(archives.id, id)).limit(1);
  await db.delete(archives).where(eq(archives.id, id));
  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: "DELETE",
    entitas: "arsip",
    entitasId: id,
    detail: `Hapus arsip ${cur[0]?.nomorSurat || id}`,
  });
  return NextResponse.json({ ok: true });
}
