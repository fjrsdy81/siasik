import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, hashPassword, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "pimpinan"].includes(s.user.role) && s.user.role !== "arsiparis") {
    // pegawai hanya bisa lihat diri sendiri via /me
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  const rows = await db
    .select({ user: users, unitNama: units.nama, unitKode: units.kode })
    .from(users)
    .leftJoin(units, eq(users.unitId, units.id))
    .orderBy(users.createdAt);
  const data = rows.map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = r.user;
    return { ...safe, unitNama: r.unitNama, unitKode: r.unitKode };
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (s.user.role !== "admin") return NextResponse.json({ error: "Hanya admin" }, { status: 403 });
  const body = await req.json();
  const { nip, nama, email, password, role, jabatan, unitId } = body;
  if (!nip || !nama || !email || !password)
    return NextResponse.json({ error: "NIP, nama, email, password wajib diisi" }, { status: 400 });
  try {
    const passwordHash = await hashPassword(password);
    const inserted = await db
      .insert(users)
      .values({
        nip: nip.trim(),
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: role || "pegawai",
        jabatan: jabatan || null,
        unitId: unitId ? Number(unitId) : null,
      })
      .returning();
    await logAudit({
      userId: s.user.id,
      userNama: s.user.nama,
      aksi: "CREATE",
      entitas: "user",
      entitasId: inserted[0].id,
      detail: `Tambah pengguna ${nama} (${role})`,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _p, ...safe } = inserted[0];
    return NextResponse.json({ data: safe }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "NIP atau email sudah digunakan" }, { status: 400 });
  }
}
