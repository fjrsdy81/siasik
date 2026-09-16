import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { archives, categories, units } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const s = await getSessionUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "json";
  const rows = await db
    .select({
      archive: archives,
      kategoriNama: categories.nama,
      kategoriKode: categories.kode,
      unitNama: units.nama,
    })
    .from(archives)
    .leftJoin(categories, eq(archives.kategoriId, categories.id))
    .leftJoin(units, eq(archives.unitId, units.id));

  await logAudit({
    userId: s.user.id,
    userNama: s.user.nama,
    aksi: "EXPORT",
    entitas: "laporan",
    detail: `Ekspor laporan ${rows.length} arsip (format ${format})`,
  });

  if (format === "csv") {
    const header = [
      "No",
      "Nomor Surat",
      "Judul",
      "Tipe",
      "Kategori",
      "Unit Kerja",
      "Tanggal Surat",
      "Tahun",
      "Sifat",
      "Status",
      "Pengirim",
      "Lokasi",
      "Views",
      "Downloads",
    ];
    const lines = rows.map((r, i) => {
      const a = r.archive;
      const lokasi = [a.lokasiLemari, a.lokasiRak, a.lokasiBox].filter(Boolean).join("/");
      const esc = (v: unknown) => `"${String(v ?? "-").replace(/"/g, '""')}"`;
      return [
        i + 1,
        esc(a.nomorSurat),
        esc(a.judul),
        esc(a.tipeDokumen),
        esc(r.kategoriNama ? `${r.kategoriKode} - ${r.kategoriNama}` : "-"),
        esc(r.unitNama || "-"),
        esc(a.tanggalSurat || "-"),
        esc(a.tahun || "-"),
        esc(a.sifat),
        esc(a.statusArsip),
        esc(a.pengirim || "-"),
        esc(lokasi || "-"),
        a.views || 0,
        a.downloads || 0,
      ].join(",");
    });
    const csv = "\uFEFF" + [header.join(","), ...lines].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-arsip-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    data: rows.map((r) => ({ ...r.archive, kategoriNama: r.kategoriNama, kategoriKode: r.kategoriKode, unitNama: r.unitNama })),
  });
}
