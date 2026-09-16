import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser, hashPassword, logAudit } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const isSelf = s.user.id === id;
  if (s.user.role !== "admin" && !isSelf)
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if (body.nama) patch.nama = body.nama;
  if (body.jabatan !== undefined) patch.jabatan = body.jabatan || null;
  if (body.fotoUrl !== undefined) patch.fotoUrl = body.fotoUrl || null;
  if (s.user.role === "admin") {
    if (body.role) patch.role = body.role;
    if (body.unitId !== undefined) patch.unitId = body.unitId ? Number(body.unitId) : null;
    if (body.isActive !== undefined) patch.isActive = !!body.isActive;
    if (body.nip) patch.nip = body.nip;
    if (body.email) patch.email = body.email;
  }
  if (body.password) {
    patch.passwordHash = await hashPassword(body.password);
  }
  patch.updatedAt = new Date();
  const updated = await db.update(users).set(patch as never).where(eq(users.id, id)).returning();
  if (!updated.length) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: "UPDATE",
    entitas: "user",
    entitasId: id,
    detail: `Ubah pengguna ${updated[0].nama}`,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = updated[0];
  return NextResponse.json({ data: safe });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (s.user.role !== "admin") return NextResponse.json({ error: "Hanya admin" }, { status: 403 });
  const { id } = await params;
  if (s.user.id === id) return NextResponse.json({ error: "Tidak bisa hapus akun sendiri" }, { status: 400 });
  await db.delete(users).where(eq(users.id, id));
  await logAudit({ userId: s.user.id, userNama: s.user.nama, aksi: "DELETE", entitas: "user", entitasId: id, detail: `Hapus pengguna ${id}` });
  return NextResponse.json({ ok: true });
}
