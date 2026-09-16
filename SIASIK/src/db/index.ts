import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// PENTING (fix build Vercel "DATABASE_URL is required"):
// Modul ini diimpor oleh semua route API, dan Next.js mengimpor modul-modul
// tersebut saat fase "Collecting page data" ketika `npm run build` berjalan.
// Jika kita throw di level modul saat DATABASE_URL belum diset (umum di
// environment build Vercel sebelum env dikonfigurasi), build langsung gagal.
// Solusi: jangan pernah throw saat import. Gunakan placeholder agar Pool tetap
// bisa dibuat; query yang dieksekusi saat runtime tanpa DATABASE_URL yang valid
// akan tetap gagal secara alami dengan pesan koneksi yang jelas.
const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

if (!process.env.DATABASE_URL) {
  console.warn(
    "[db] WARNING: DATABASE_URL belum diset — memakai placeholder agar build tetap jalan. " +
      "Set DATABASE_URL di environment (mis. Vercel Project Settings → Environment Variables) agar API berfungsi saat runtime."
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
