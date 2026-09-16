import { NextResponse } from "next/server";
import { desc, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "arsiparis", "pimpinan"].includes(s.user.role))
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Number(url.searchParams.get("limit") || "20"));
  const offset = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let where: any = undefined;
  if (q) {
    where = or(ilike(auditLogs.detail, `%${q}%`), ilike(auditLogs.userNama, `%${q}%`), ilike(auditLogs.aksi, `%${q}%`));
  }
  const totalRes = await db.select({ c: sql<number>`count(*)` }).from(auditLogs).where(where);
  const total = Number(totalRes[0]?.c || 0);
  const rows = await db.select().from(auditLogs).where(where).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
  return NextResponse.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}
