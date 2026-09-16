import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
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
    .update(categories)
    .set({
      kode: body.kode,
      nama: body.nama,
      deskripsi: body.deskripsi || null,
      retensiDefault: Number(body.retensiDefault) || 5,
      warna: body.warna || "#0ea5e9",
    })
    .where(eq(categories.id, Number(id)))
    .returning();
  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: "UPDATE",
    entitas: "kategori",
    entitasId: id,
    detail: `Ubah kategori ${body.kode}`,
  });
  return NextResponse.json({ data: updated[0] });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "arsiparis"].includes(s.user.role))
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await params;
  await db.delete(categories).where(eq(categories.id, Number(id)));
  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: "DELETE",
    entitas: "kategori",
    entitasId: id,
    detail: `Hapus kategori id ${id}`,
  });
  return NextResponse.json({ ok: true });
}
