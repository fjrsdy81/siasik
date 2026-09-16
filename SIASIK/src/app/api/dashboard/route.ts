import { NextResponse } from "next/server";
import { desc, sql, eq } from "drizzle-orm";
import { db } from "@/db";
import { archives, categories, loans, users, auditLogs } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const totalArsip = await db.select({ c: sql<number>`count(*)` }).from(archives);
  const totalUser = await db.select({ c: sql<number>`count(*)` }).from(users);
  const totalKategori = await db.select({ c: sql<number>`count(*)` }).from(categories);
  const totalPinjamAktif = await db
    .select({ c: sql<number>`count(*)` })
    .from(loans)
    .where(eq(loans.status, "Dipinjam" as never));
  const totalViews = await db.select({ s: sql<number>`coalesce(sum(${archives.views}),0)` }).from(archives);
  const totalDownloads = await db.select({ s: sql<number>`coalesce(sum(${archives.downloads}),0)` }).from(archives);

  const perKategori = await db
    .select({ nama: categories.nama, kode: categories.kode, warna: categories.warna, jumlah: sql<number>`count(${archives.id})` })
    .from(categories)
    .leftJoin(archives, eq(archives.kategoriId, categories.id))
    .groupBy(categories.id, categories.nama, categories.kode, categories.warna);

  const perTipe = await db
    .select({ tipe: archives.tipeDokumen, jumlah: sql<number>`count(*)` })
    .from(archives)
    .groupBy(archives.tipeDokumen);

  const perTahun = await db
    .select({ tahun: archives.tahun, jumlah: sql<number>`count(*)` })
    .from(archives)
    .groupBy(archives.tahun)
    .orderBy(archives.tahun);

  const perStatus = await db
    .select({ status: archives.statusArsip, jumlah: sql<number>`count(*)` })
    .from(archives)
    .groupBy(archives.statusArsip);

  const terbaru = await db
    .select({ archive: archives, kategoriNama: categories.nama })
    .from(archives)
    .leftJoin(categories, eq(archives.kategoriId, categories.id))
    .orderBy(desc(archives.createdAt))
    .limit(6);

  const populer = await db
    .select()
    .from(archives)
    .orderBy(desc(archives.views))
    .limit(5);

  const aktivitas = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8);

  const jatuhTempo = await db
    .select({ loan: loans, judul: archives.judul, nomor: archives.nomorSurat })
    .from(loans)
    .leftJoin(archives, eq(loans.archiveId, archives.id))
    .where(eq(loans.status, "Dipinjam" as never))
    .orderBy(loans.tanggalKembaliRencana)
    .limit(5);

  return NextResponse.json({
    stats: {
      totalArsip: Number(totalArsip[0]?.c || 0),
      totalUser: Number(totalUser[0]?.c || 0),
      totalKategori: Number(totalKategori[0]?.c || 0),
      pinjamAktif: Number(totalPinjamAktif[0]?.c || 0),
      totalViews: Number(totalViews[0]?.s || 0),
      totalDownloads: Number(totalDownloads[0]?.s || 0),
    },
    perKategori,
    perTipe,
    perTahun: perTahun.filter((t) => t.tahun),
    perStatus,
    terbaru: terbaru.map((r) => ({ ...r.archive, kategoriNama: r.kategoriNama })),
    populer,
    aktivitas,
    jatuhTempo: jatuhTempo.map((r) => ({ ...r.loan, judul: r.judul, nomorSurat: r.nomor })),
  });
}
