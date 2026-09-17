import { sql } from "drizzle-orm";
import { db, getDbDiagnostics } from "@/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const diag = getDbDiagnostics();
  const result: Record<string, unknown> = {
    ok: false,
    time: new Date().toISOString(),
    db: diag,
    checks: {} as Record<string, unknown>,
  };
  const checks = result.checks as Record<string, unknown>;

  if (diag.isPlaceholder) {
    checks.env = { ok: false, message: "DATABASE_URL/POSTGRES_URL belum diset" };
    return Response.json(result, { status: 500 });
  }
  checks.env = { ok: true, source: diag.source, host: diag.host, ssl: diag.ssl };

  try {
    await db.execute(sql`select 1 as one`);
    checks.connect = { ok: true };
  } catch (e) {
    checks.connect = { ok: false, error: (e as Error)?.message || String(e) };
    return Response.json(result, { status: 500 });
  }

  try {
    const r = await db.execute(sql`select count(*)::int as c from users`);
    const count = Number((r.rows?.[0] as { c?: number })?.c ?? 0);
    checks.usersTable = { ok: true, count };
    result.ok = true;
    return Response.json(result);
  } catch (e) {
    const msg = (e as Error)?.message || String(e);
    checks.usersTable = {
      ok: false,
      error: msg,
      hint: msg.includes("does not exist")
        ? "Tabel belum dibuat. Jalankan POST /api/setup untuk inisialisasi database baru."
        : undefined,
    };
    return Response.json(result, { status: 500 });
  }
}
