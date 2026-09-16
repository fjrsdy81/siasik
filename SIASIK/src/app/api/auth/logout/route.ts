import { NextResponse } from "next/server";
import { destroySession, getSessionUser, logAudit } from "@/lib/auth";

export async function POST() {
  const s = await getSessionUser();
  if (s) {
    await logAudit({
      userId: s.user.id,
      userNama: s.user.nama,
      aksi: "LOGOUT",
      entitas: "auth",
      detail: "Logout",
    });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
