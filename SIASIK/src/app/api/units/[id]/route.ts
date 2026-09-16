import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { units } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "arsiparis"].includes(s.user.role))
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const updated = await db
    .update(units)
    .set({ kode: body.kode, nama: body.nama, deskripsi: body.deskripsi || null, kepalaUnit: body.kepalaUnit || null })
    .where(eq(units.id, Number(id)))
    .returning();
  await logAudit({ userId: s.user.id, userNama: s.user.nama, aksi: "UPDATE", entitas: "unit", entitasId: id, detail: `Ubah unit ${body.kode}` });
  return NextResponse.json({ data: updated[0] });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (s.user.role !== "admin") return NextResponse.json({ error: "Hanya admin" }, { status: 403 });
  const { id } = await params;
  await db.delete(units).where(eq(units.id, Number(id)));
  await logAudit({ userId: s.user.id, userNama: s.user.nama, aksi: "DELETE", entitas: "unit", entitasId: id, detail: `Hapus unit ${id}` });
  return NextResponse.json({ ok: true });
}
