import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { units } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ user: null }, { status: 401 });
  let unitNama: string | null = null;
  if (s.user.unitId) {
    const u = await db.select().from(units).where(eq(units.id, s.user.unitId)).limit(1);
    if (u.length) unitNama = u[0].nama;
  }
  return NextResponse.json({ user: { ...s.user, unitNama } });
}
