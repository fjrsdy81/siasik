export function formatDateID(d?: string | Date | null) {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTimeID(d?: string | Date | null) {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatBytes(bytes?: number | null) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function timeAgo(d?: string | Date | null) {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDateID(date);
}

export const TIPE_DOKUMEN = [
  "Surat Masuk",
  "Surat Keluar",
  "Surat Keputusan (SK)",
  "Sertifikat",
  "Laporan",
  "SOP",
  "MoU / PKS",
  "Undangan",
  "Nota Dinas",
  "Peraturan",
  "Berita Acara",
  "Proposal",
  "Lainnya",
];

export const SIFAT_LIST = ["Biasa", "Segera", "Sangat Segera", "Rahasia"];
export const STATUS_ARSIP = ["Aktif", "Inaktif", "Vital", "Usul Musnah", "Musnah"];
export const AKSES_LIST = ["Publik Internal", "Terbatas", "Rahasia"];

export const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  arsiparis: "Arsiparis",
  pimpinan: "Pimpinan",
  pegawai: "Pegawai",
};

export function statusColor(s: string) {
  switch (s) {
    case "Aktif":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "Inaktif":
      return "bg-slate-200 text-slate-700 ring-slate-300";
    case "Vital":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    case "Usul Musnah":
      return "bg-orange-100 text-orange-800 ring-orange-200";
    case "Musnah":
      return "bg-rose-100 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

export function sifatColor(s: string) {
  switch (s) {
    case "Biasa":
      return "bg-sky-100 text-sky-700 ring-sky-200";
    case "Segera":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    case "Sangat Segera":
      return "bg-orange-100 text-orange-800 ring-orange-200";
    case "Rahasia":
      return "bg-rose-100 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function initials(nama: string) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
