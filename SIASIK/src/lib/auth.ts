import bcrypt from "bcryptjs";
import { randomBytes, createHmac } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, auditLogs } from "@/db/schema";

const COOKIE_NAME = "siasik_session";
const SECRET = process.env.SESSION_SECRET || "siasik-kkp-secret-2026-marine-standard";

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function generateToken() {
  return randomBytes(48).toString("hex");
}

export function signToken(token: string) {
  return createHmac("sha256", SECRET).update(token).digest("hex").slice(0, 16);
}

export async function createSession(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token)).catch(() => {});
  }
  cookieStore.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);
  if (rows.length === 0) return null;
  const { session, user } = rows[0];
  if (new Date(session.expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.token, token)).catch(() => {});
    return null;
  }
  if (!user.isActive) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return { session, user: safe };
}

export async function requireRole(allowed: string[]) {
  const s = await getSessionUser();
  if (!s) return null;
  if (!allowed.includes(s.user.role)) return null;
  return s;
}

export async function logAudit(opts: {
  userId?: string | null;
  userNama?: string | null;
  aksi: string;
  entitas: string;
  entitasId?: string | null;
  detail?: string | null;
  ipAddress?: string | null;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: opts.userId ?? null,
      userNama: opts.userNama ?? null,
      aksi: opts.aksi,
      entitas: opts.entitas,
      entitasId: opts.entitasId ?? null,
      detail: opts.detail ?? null,
      ipAddress: opts.ipAddress ?? null,
    });
  } catch {
    // ignore
  }
}

export const COOKIE = COOKIE_NAME;
