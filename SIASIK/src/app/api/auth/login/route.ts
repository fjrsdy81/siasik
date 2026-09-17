import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db, getDbDiagnostics } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, createSession, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function classifyDbError(e: unknown): { code: string; message: string; hint: string } {
  const msg = e instanceof Error ? e.message : String(e);
  const code = (e as { code?: string })?.code || "";
  const m = msg.toLowerCase();

  // Tabel belum dibuat (DB fresh Opsi B, belum push/seed) — berlaku untuk users/sessions/audit_logs
  if (
    code === "42P01" ||
    m.includes("does not exist") ||
    m.includes("relation")
  ) {
    if (m.includes("users") || m.includes("sessions") || m.includes("audit") || code === "42P01") {
      return {
        code: "DB_NOT_INIT",
        message: "Database belum diinisialisasi (tabel belum lengkap).",
        hint: "Database baru terdeteksi. Jalankan POST /api/setup sekali untuk membuat tabel + akun demo, lalu login kembali.",
      };
    }
  }
  if (m.includes("password authentication failed") || m.includes("sasl") || code === "28P01") {
    return {
      code: "DB_AUTH",
      message: "Kredensial database salah (user/password DATABASE_URL ditolak).",
      hint: "Periksa kembali DATABASE_URL/POSTGRES_URL di Vercel → Settings → Environment Variables, lalu Redeploy.",
    };
  }
  if (
    m.includes("enotfound") ||
    m.includes("econnrefused") ||
    m.includes("connect") ||
    m.includes("timeout") ||
    m.includes("self-signed") ||
    m.includes("certificate") ||
    m.includes("connection closed") ||
    m.includes("too many clients") ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT"
  ) {
    return {
      code: "DB_CONN",
      message: "Tidak dapat terhubung ke database.",
      hint: "Pastikan DATABASE_URL benar, database aktif (tidak paused — khusus Neon/Supabase free tier), dan izinkan koneksi SSL. Cek GET /api/health untuk detail.",
    };
  }
  return {
    code: "SERVER_ERROR",
    message: "Terjadi kesalahan server saat login.",
    hint: "Coba lagi. Jika berlanjut, cek GET /api/health dan log function Vercel.",
  };
}

export async function POST(req: Request) {
  let identifier = "";
  try {
    let body: { identifier?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body request tidak valid (harus JSON).", code: "BAD_JSON" }, { status: 400 });
    }
    identifier = (body.identifier || "").trim();
    const password = body.password || "";
    if (!identifier || !password) {
      return NextResponse.json({ error: "NIP/Email dan kata sandi wajib diisi", code: "VALIDATION" }, { status: 400 });
    }
    // Normalisasi: email selalu lowercase (seed tersimpan lowercase)
    const normalized = identifier.includes("@") ? identifier.toLowerCase() : identifier;

    // Cek cepat: env DB belum diset sama sekali
    const diag = getDbDiagnostics();
    if (diag.isPlaceholder) {
      console.error("[login] DATABASE_URL belum diset. Diagnostics:", diag);
      return NextResponse.json(
        {
          error: "Konfigurasi database belum lengkap di server (DATABASE_URL belum diset).",
          code: "DB_NO_URL",
          hint: "Set DATABASE_URL (atau POSTGRES_URL untuk Vercel Postgres) di Vercel → Settings → Environment Variables → Redeploy. Detail: GET /api/health",
        },
        { status: 500 }
      );
    }

    let rows;
    try {
      rows = await db
        .select()
        .from(users)
        .where(or(eq(users.nip, normalized), eq(users.email, normalized)))
        .limit(1);
    } catch (e) {
      const c = classifyDbError(e);
      console.error("[login] query users gagal:", e, "diag:", getDbDiagnostics());
      return NextResponse.json({ error: c.message, code: c.code, hint: c.hint }, { status: 500 });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "Akun tidak ditemukan. Periksa NIP/email, atau database production belum di-seed.",
          code: "NOT_FOUND",
          hint: "Jika ini database baru (Opsi B), jalankan POST /api/setup untuk membuat akun demo.",
        },
        { status: 401 }
      );
    }
    const u = rows[0];
    if (!u.isActive) {
      return NextResponse.json({ error: "Akun dinonaktifkan. Hubungi administrator.", code: "INACTIVE" }, { status: 403 });
    }
    if (!u.passwordHash) {
      console.error("[login] passwordHash kosong untuk user", u.id);
      return NextResponse.json({ error: "Data kredensial akun rusak. Hubungi administrator.", code: "NO_HASH" }, { status: 500 });
    }

    let ok = false;
    try {
      ok = await verifyPassword(password, u.passwordHash);
    } catch (e) {
      console.error("[login] verifyPassword gagal:", e);
      return NextResponse.json({ error: "Gagal memverifikasi kata sandi.", code: "BCRYPT" }, { status: 500 });
    }
    if (!ok) {
      return NextResponse.json({ error: "Kata sandi salah", code: "WRONG_PASSWORD" }, { status: 401 });
    }

    try {
      await createSession(u.id);
    } catch (e) {
      const c = classifyDbError(e);
      console.error("[login] createSession gagal:", e);
      return NextResponse.json(
        { error: c.code === "SERVER_ERROR" ? "Gagal membuat sesi login." : c.message, code: c.code, hint: c.hint },
        { status: 500 }
      );
    }

    // Non-blocking: jangan gagalkan login hanya karena update lastLogin/audit gagal
    try {
      await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, u.id));
    } catch (e) {
      console.warn("[login] update lastLogin gagal (diabaikan):", (e as Error)?.message);
    }
    await logAudit({
      userId: u.id,
      userNama: u.nama,
      aksi: "LOGIN",
      entitas: "auth",
      detail: `Login berhasil (${u.nip})`,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = u;
    return NextResponse.json({ user: safe, message: "Login berhasil" });
  } catch (e) {
    const c = classifyDbError(e);
    console.error("[login] unexpected:", e, "identifier:", identifier);
    return NextResponse.json({ error: c.message, code: c.code, hint: c.hint }, { status: 500 });
  }
}
