import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, createSession, logAudit } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;
    if (!identifier || !password) {
      return NextResponse.json({ error: "NIP/Email dan kata sandi wajib diisi" }, { status: 400 });
    }
    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.nip, identifier), eq(users.email, identifier)))
      .limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 401 });
    }
    const u = rows[0];
    if (!u.isActive) {
      return NextResponse.json({ error: "Akun dinonaktifkan. Hubungi administrator." }, { status: 403 });
    }
    const ok = await verifyPassword(password, u.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Kata sandi salah" }, { status: 401 });
    }
    await createSession(u.id);
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, u.id));
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
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
