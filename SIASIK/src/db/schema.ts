import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  date,
  boolean,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "arsiparis", "pimpinan", "pegawai"]);
export const sifatEnum = pgEnum("sifat_surat", ["Biasa", "Segera", "Sangat Segera", "Rahasia"]);
export const statusArsipEnum = pgEnum("status_arsip", [
  "Aktif",
  "Inaktif",
  "Vital",
  "Usul Musnah",
  "Musnah",
]);
export const aksesEnum = pgEnum("akses_level", ["Publik Internal", "Terbatas", "Rahasia"]);
export const statusPinjamEnum = pgEnum("status_pinjam", [
  "Menunggu",
  "Dipinjam",
  "Dikembalikan",
  "Terlambat",
  "Ditolak",
]);

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 20 }).notNull().unique(),
  nama: varchar("nama", { length: 200 }).notNull(),
  deskripsi: text("deskripsi"),
  kepalaUnit: varchar("kepala_unit", { length: 150 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 20 }).notNull().unique(),
  nama: varchar("nama", { length: 200 }).notNull(),
  deskripsi: text("deskripsi"),
  retensiDefault: integer("retensi_default").default(5).notNull(),
  warna: varchar("warna", { length: 20 }).default("#0ea5e9"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  nip: varchar("nip", { length: 30 }).notNull().unique(),
  nama: varchar("nama", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("pegawai").notNull(),
  jabatan: varchar("jabatan", { length: 150 }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "set null" }),
  fotoUrl: text("foto_url"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  token: varchar("token", { length: 128 }).primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const archives = pgTable("archives", {
  id: uuid("id").defaultRandom().primaryKey(),
  nomorSurat: varchar("nomor_surat", { length: 200 }).notNull(),
  judul: varchar("judul", { length: 300 }).notNull(),
  deskripsi: text("deskripsi"),
  kategoriId: integer("kategori_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "set null" }),
  tipeDokumen: varchar("tipe_dokumen", { length: 60 }).notNull().default("Surat Masuk"),
  sifat: sifatEnum("sifat").default("Biasa").notNull(),
  statusArsip: statusArsipEnum("status_arsip").default("Aktif").notNull(),
  aksesLevel: aksesEnum("akses_level").default("Publik Internal").notNull(),
  tanggalSurat: date("tanggal_surat"),
  tanggalDiterima: date("tanggal_diterima"),
  tahun: integer("tahun"),
  pengirim: varchar("pengirim", { length: 200 }),
  penerima: varchar("penerima", { length: 200 }),
  jumlahHalaman: integer("jumlah_halaman").default(1),
  lokasiLemari: varchar("lokasi_lemari", { length: 50 }),
  lokasiRak: varchar("lokasi_rak", { length: 50 }),
  lokasiBox: varchar("lokasi_box", { length: 50 }),
  lokasiMap: varchar("lokasi_map", { length: 50 }),
  fileUrl: text("file_url"),
  fileName: varchar("file_name", { length: 300 }),
  fileSize: integer("file_size"),
  fileType: varchar("file_type", { length: 100 }),
  retensiTahun: integer("retensi_tahun").default(5),
  tanggalRetensi: date("tanggal_retensi"),
  tags: text("tags"),
  views: integer("views").default(0).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loans = pgTable("loans", {
  id: uuid("id").defaultRandom().primaryKey(),
  archiveId: uuid("archive_id")
    .references(() => archives.id, { onDelete: "cascade" })
    .notNull(),
  peminjamId: uuid("peminjam_id").references(() => users.id, { onDelete: "set null" }),
  namaPeminjam: varchar("nama_peminjam", { length: 150 }).notNull(),
  tanggalPinjam: date("tanggal_pinjam").notNull(),
  tanggalKembaliRencana: date("tanggal_kembali_rencana").notNull(),
  tanggalKembaliAktual: date("tanggal_kembali_aktual"),
  keperluan: text("keperluan"),
  status: statusPinjamEnum("status").default("Menunggu").notNull(),
  catatan: text("catatan"),
  approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userNama: varchar("user_nama", { length: 150 }),
  aksi: varchar("aksi", { length: 50 }).notNull(),
  entitas: varchar("entitas", { length: 50 }).notNull(),
  entitasId: varchar("entitas_id", { length: 100 }),
  detail: text("detail"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Unit = typeof units.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type User = typeof users.$inferSelect;
export type Archive = typeof archives.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
