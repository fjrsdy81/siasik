import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Resolve URL dari berbagai nama env yang dipakai provider (Opsi A/B):
// Vercel Postgres -> POSTGRES_URL / POSTGRES_PRISMA_URL
// Neon -> NEON_DATABASE_URL / DATABASE_URL
// Supabase -> DATABASE_URL (dengan ?sslmode=require / pgbouncer)
// Lokal -> DATABASE_URL postgresql://postgres:postgres@127.0.0.1:5432/app_db
function resolveDatabaseUrl(): { url: string; source: string; isPlaceholder: boolean } {
  const candidates: Array<[string, string | undefined]> = [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["POSTGRES_URL", process.env.POSTGRES_URL],
    ["POSTGRES_PRISMA_URL", process.env.POSTGRES_PRISMA_URL],
    ["NEON_DATABASE_URL", process.env.NEON_DATABASE_URL],
    ["POSTGRES_URL_NON_POOLING", process.env.POSTGRES_URL_NON_POOLING],
    ["DATABASE_URL_UNPOOLED", process.env.DATABASE_URL_UNPOOLED],
  ];
  for (const [name, val] of candidates) {
    if (val && val.trim().length > 0) return { url: val.trim(), source: name, isPlaceholder: false };
  }
  return {
    url: "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
    source: "(placeholder-build)",
    isPlaceholder: true,
  };
}

const resolved = resolveDatabaseUrl();
export const dbSource = resolved.source;
export const isDbPlaceholder = resolved.isPlaceholder;

if (resolved.isPlaceholder) {
  console.warn(
    "[db] WARNING: Tidak ada DATABASE_URL/POSTGRES_URL/NEON_DATABASE_URL — memakai placeholder agar build tetap jalan. " +
      "Set salah satu env tersebut di Vercel (Project Settings → Environment Variables) agar API berfungsi saat runtime."
  );
}

// Managed Postgres (Neon/Supabase/Vercel/AWS) hampir selalu wajib SSL.
// `pg` tidak otomatis mengaktifkan SSL dari `?sslmode=require` di semua versi,
// sehingga tanpa ini login akan 500 dengan error self-signed / connection closed.
function needsSSL(url: string): boolean {
  const u = url.toLowerCase();
  if (u.includes("sslmode=require") || u.includes("sslmode=verify") || u.includes("ssl=true")) return true;
  if (
    u.includes("neon.tech") ||
    u.includes("supabase.co") ||
    u.includes("supabase.com") ||
    u.includes("amazonaws.com") ||
    u.includes("vercel") ||
    u.includes("pooler") ||
    u.includes("ondigitalocean.com") ||
    u.includes("aivencloud.com")
  )
    return true;
  try {
    const host = new URL(url).hostname;
    if (process.env.NODE_ENV === "production" && host !== "localhost" && host !== "127.0.0.1" && host !== "::1")
      return true;
  } catch {
    // abaikan, anggap tidak butuh SSL
  }
  return false;
}

const useSSL = needsSSL(resolved.url);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function makePool() {
  return new Pool({
    connectionString: resolved.url,
    // Serverless (Vercel) — batasi koneksi agar tidak menghabiskan pool + timeout cepat
    // sehingga error koneksi tampil jelas, bukan hang hingga function timeout.
    max: Number(process.env.PG_POOL_MAX || "5"),
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

export const pool = globalForDb.__arenaNextJsPostgresqlPool ?? makePool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
} else {
  // Di production/serverless tetap cache di globalThis untuk reuse antar invocasi hangat.
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

pool.on("error", (err) => {
  console.error("[db] pool error:", (err as Error)?.message || err);
});

export const db = drizzle(pool);

// Helper diagnostik untuk API (dipakai /api/health & /api/auth/login)
export function getDbDiagnostics() {
  let host = "-";
  try {
    host = new URL(resolved.url).hostname;
  } catch {
    // biarkan "-"
  }
  return {
    source: resolved.source,
    isPlaceholder: resolved.isPlaceholder,
    host,
    ssl: useSSL,
    hasUrl: !resolved.isPlaceholder,
  };
}
