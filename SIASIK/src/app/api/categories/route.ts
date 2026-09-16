import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(categories).orderBy(categories.kode);
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "arsiparis"].includes(s.user.role))
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const body = await req.json();
  const { kode, nama, deskripsi, retensiDefault, warna } = body;
  if (!kode || !nama) return NextResponse.json({ error: "Kode dan nama wajib diisi" }, { status: 400 });
  try {
    const inserted = await db
      .insert(categories)
      .values({
        kode: kode.trim(),
        nama: nama.trim(),
        deskripsi: deskripsi || null,
        retensiDefault: Number(retensiDefault) || 5,
        warna: warna || "#0ea5e9",
      })
      .returning();
    await logAudit({
      userId: s.user.id,
      userNama: s.user.nama,
      aksi: "CREATE",
      entitas: "kategori",
      entitasId: String(inserted[0].id),
      detail: `Tambah kategori ${kode} - ${nama}`,
    });
    return NextResponse.json({ data: inserted[0] }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("duplicate") || msg.includes("unique"))
      return NextResponse.json({ error: "Kode kategori sudah digunakan" }, { status: 400 });
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}
