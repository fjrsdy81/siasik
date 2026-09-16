import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { loans, archives } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select({ loan: loans, nomorSurat: archives.nomorSurat, judul: archives.judul })
    .from(loans)
    .leftJoin(archives, eq(loans.archiveId, archives.id))
    .orderBy(desc(loans.createdAt));
  let filtered = rows;
  if (s.user.role === "pegawai") {
    filtered = rows.filter((r) => r.loan.peminjamId === s.user.id || r.loan.namaPeminjam === s.user.nama);
  }
  return NextResponse.json({
    data: filtered.map((r) => ({ ...r.loan, nomorSurat: r.nomorSurat, judul: r.judul })),
  });
}

export async function POST(req: Request) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.archiveId || !body.tanggalPinjam || !body.tanggalKembaliRencana)
    return NextResponse.json({ error: "Data peminjaman belum lengkap" }, { status: 400 });
  const inserted = await db
    .insert(loans)
    .values({
      archiveId: body.archiveId,
      peminjamId: s.user.id,
      namaPeminjam: body.namaPeminjam || s.user.nama,
      tanggalPinjam: body.tanggalPinjam,
      tanggalKembaliRencana: body.tanggalKembaliRencana,
      keperluan: body.keperluan || null,
      status: ["admin", "arsiparis"].includes(s.user.role) ? "Dipinjam" : "Menunggu",
      catatan: body.catatan || null,
      approvedBy: ["admin", "arsiparis"].includes(s.user.role) ? s.user.id : null,
    })
    .returning();
  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: "PINJAM",
    entitas: "peminjaman",
    entitasId: inserted[0].id,
    detail: `Pinjam arsip ${body.archiveId} oleh ${inserted[0].namaPeminjam}`,
  });
  return NextResponse.json({ data: inserted[0] }, { status: 201 });
}
