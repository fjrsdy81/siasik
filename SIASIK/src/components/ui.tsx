"use client";

import React from "react";
import { sifatColor, statusColor } from "@/lib/utils";

export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${className}`}>
      {children}
    </span>
  );
}

export function SifatBadge({ value }: { value: string }) {
  return <Badge className={sifatColor(value)}>{value}</Badge>;
}

export function StatusBadge({ value }: { value: string }) {
  return <Badge className={statusColor(value)}>{value}</Badge>;
}

export function Spinner({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-500">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-sky-200 border-t-sky-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function Empty({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-3xl shadow-sm">📦</div>
      <h3 className="mt-2 text-base font-bold text-slate-800">{title}</h3>
      {desc && <p className="max-w-md text-sm text-slate-500">{desc}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  desc,
  action,
  icon,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
  icon?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          {icon && (
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 text-xl text-white shadow-lg shadow-sky-600/25">
              {icon}
            </span>
          )}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        </div>
        {desc && <p className="mt-2 max-w-2xl text-sm text-slate-500">{desc}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative max-h-[90vh] w-full ${wide ? "max-w-3xl" : "max-w-lg"} overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-fade-up`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-700 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-600/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60";

export function StatCard({
  icon,
  label,
  value,
  sub,
  gradient,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
}) {
  return (
    <div className="card-hover relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-15`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p>}
        </div>
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl text-white shadow-lg`}>
          {icon}
        </span>
      </div>
    </div>
  );
}
