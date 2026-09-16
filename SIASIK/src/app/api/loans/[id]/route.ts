import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { loans } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = body.status;
  if (body.tanggalKembaliAktual !== undefined) patch.tanggalKembaliAktual = body.tanggalKembaliAktual || null;
  if (body.catatan !== undefined) patch.catatan = body.catatan;
  if (body.status === "Dipinjam" && ["admin", "arsiparis"].includes(s.user.role)) patch.approvedBy = s.user.id;
  if (body.status === "Dikembalikan" && !patch.tanggalKembaliAktual)
    patch.tanggalKembaliAktual = new Date().toISOString().slice(0, 10);
  patch.updatedAt = new Date();
  // pegawai hanya boleh membatalkan miliknya? batasi: pegawai tidak boleh approve
  if (s.user.role === "pegawai" && ["Dipinjam", "Ditolak"].includes(body.status)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  const updated = await db.update(loans).set(patch as never).where(eq(loans.id, id)).returning();
  if (!updated.length) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: body.status === "Dikembalikan" ? "KEMBALI" : "UPDATE",
    entitas: "peminjaman",
    entitasId: id,
    detail: `Status peminjaman -> ${updated[0].status}`,
  });
  return NextResponse.json({ data: updated[0] });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "arsiparis"].includes(s.user.role))
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await params;
  await db.delete(loans).where(eq(loans.id, id));
  await logAudit({ userId: s.user.id, userNama: s.user.nama, aksi: "DELETE", entitas: "peminjaman", entitasId: id, detail: `Hapus peminjaman ${id}` });
  return NextResponse.json({ ok: true });
}
