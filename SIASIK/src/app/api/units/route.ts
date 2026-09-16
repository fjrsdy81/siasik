import { NextResponse } from "next/server";
import { db } from "@/db";
import { units } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(units).orderBy(units.kode);
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "arsiparis"].includes(s.user.role))
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const body = await req.json();
  if (!body.kode || !body.nama) return NextResponse.json({ error: "Kode dan nama wajib diisi" }, { status: 400 });
  try {
    const inserted = await db
      .insert(units)
      .values({ kode: body.kode.trim(), nama: body.nama.trim(), deskripsi: body.deskripsi || null, kepalaUnit: body.kepalaUnit || null })
      .returning();
    await logAudit({
      userId: s.user.id,
      userNama: s.user.nama,
      aksi: "CREATE",
      entitas: "unit",
      entitasId: String(inserted[0].id),
      detail: `Tambah unit ${body.kode}`,
    });
    return NextResponse.json({ data: inserted[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kode unit sudah digunakan" }, { status: 400 });
  }
}
