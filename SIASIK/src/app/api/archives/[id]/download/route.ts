import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { archives } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.update(archives).set({ downloads: sql`${archives.downloads} + 1` }).where(eq(archives.id, id));
  const cur = await db.select().from(archives).where(eq(archives.id, id)).limit(1);
  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: "DOWNLOAD",
    entitas: "arsip",
    entitasId: id,
    detail: `Unduh arsip ${cur[0]?.nomorSurat || id}`,
  });
  return NextResponse.json({ ok: true, fileUrl: cur[0]?.fileUrl || null });
}
