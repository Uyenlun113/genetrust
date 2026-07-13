"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CaseRecord } from "@/lib/types";

export function Pill({
  text,
  tone,
}: {
  text: string;
  tone: "blue" | "rose" | "emerald" | "amber" | "slate";
}) {
  const map: Record<typeof tone, string> = {
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${map[tone]} whitespace-nowrap`}
    >
      {text || "—"}
    </span>
  );
}

export function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function MailCell({ row }: { row: CaseRecord }) {
  const status = row.mailStatus || "Chưa gửi thư";
  const normalized = normalizeText(status);
  const tone =
    normalized.includes("nhan")
      ? "emerald"
      : normalized.includes("dang")
        ? "blue"
        : "slate";

  return (
    <div className="space-y-1 text-center">
      <Pill text={status} tone={tone} />
      {row.mailTrackingCode && (
        <div className="truncate text-[11px] font-semibold text-slate-400">
          {row.mailTrackingCode}
        </div>
      )}
    </div>
  );
}

export function Check({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-md ring-1 ${ok ? "bg-emerald-500 text-white ring-emerald-600" : "bg-white text-neutral-400 ring-slate-200"}`}
    >
      {ok ? "✓" : ""}
    </span>
  );
}

export function SttBadge({
  stt,
  dueDate,
  processStatus,
}: {
  stt: number;
  dueDate: string | null;
  processStatus: string | null;
}) {
  const [now] = useState(() => Date.now());
  let cls = "bg-slate-100 text-slate-700 ring-slate-200";

  if (processStatus === "Đã có KQ") {
    cls = "bg-white text-neutral-400 ring-black/10";
  } else if (dueDate) {
    const t = new Date(dueDate).getTime();
    const diff = t - now;

    if (Number.isFinite(t)) {
      if (diff < 0) cls = "bg-red-600 text-white ring-violet-700";
      else if (diff < 12 * 60 * 60 * 1000)
        cls = "bg-yellow-600 text-white ring-rose-700";
      else if (diff < 24 * 60 * 60 * 1000)
        cls = "bg-blue-500 text-white ring-amber-600";
      else cls = "bg-green-600 text-white ring-emerald-700";
    }
  }

  return (
    <span
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-lg px-1.5 text-[11px] font-extrabold ring-1 ${cls}`}
      title={
        dueDate
          ? `Hạn KQ: ${new Date(dueDate).toLocaleString()}`
          : "Chưa có hạn KQ"
      }
    >
      {stt}
    </span>
  );
}

export const thBase =
  "px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.08em] whitespace-nowrap border-r border-slate-200/80 align-middle text-slate-600";
export const tdBase =
  "px-2 py-3 text-left text-[13px] leading-5 border-r border-slate-200/80 align-middle text-slate-700";
export const wrap2 = "line-clamp-2 break-words whitespace-normal";

const moneyFields = new Set([
  "collectedAmount",
  "receivedAmount",
  "costPrice",
  "shippingFee",
]);
const dateFields = new Set(["receivedAt", "dueDate", "returnedAt"]);

export function formatChangeValue(value: unknown, field?: string) {
  if (value === undefined || value === null || value === "") return "Trống";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (field === "invoiceType")
    return value === "personal" ? "Cá nhân" : "Công ty";
  if (field && moneyFields.has(field) && typeof value === "number") {
    return value.toLocaleString("vi-VN") + "đ";
  }
  if (field && dateFields.has(field)) {
    const d = new Date(String(value));
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "Trống";
    return `${value.length} tệp`;
  }
  return String(value);
}

export function buildPagination(currentPage: number, totalPages: number) {
  if (totalPages <= 1) return [1];

  const blockSize = 3;
  const blockIndex = Math.floor((currentPage - 1) / blockSize);
  const start = blockIndex * blockSize + 1;
  const end = Math.min(start + blockSize - 1, totalPages);
  const items: Array<number | "prev-ellipsis" | "next-ellipsis"> = [];

  if (start > 1) items.push(1);
  if (start > 2) items.push("prev-ellipsis");

  for (let nextPage = start; nextPage <= end; nextPage += 1) {
    items.push(nextPage);
  }

  if (end < totalPages - 1) items.push("next-ellipsis");
  if (end < totalPages) items.push(totalPages);

  return items;
}

export function paymentFilterLabel(value: string) {
  return value === "paid"
    ? "Đã thanh toán"
    : value === "unpaid"
      ? "Chưa thanh toán"
      : value;
}

export function HeaderFilter({
  label,
  options,
  selected,
  open,
  onToggle,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  open: boolean;
  onToggle: () => void;
  onChange: (values: string[]) => void;
}) {
  const uniqueOptions = [...new Set(options.filter(Boolean))];

  const toggleValue = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className={`inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition ${
          selected.length > 0
            ? "bg-sky-100 text-sky-700"
            : "hover:bg-sky-100/70 hover:text-sky-700"
        }`}
      >
        <span>{label}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className="absolute left-1/2 top-full z-[80] mt-2 w-56 -translate-x-1/2 rounded-2xl border border-sky-100 bg-white p-3 text-left normal-case tracking-normal shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
              {label}
            </div>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] font-semibold text-sky-700 hover:text-sky-800"
              >
                Xóa
              </button>
            )}
          </div>

          <div className="max-h-64 space-y-1 overflow-auto pr-1">
            {uniqueOptions.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-[12px] font-medium text-slate-500">
                Chưa có dữ liệu
              </div>
            ) : (
              uniqueOptions.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-[12px] font-medium text-slate-700 transition hover:bg-sky-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggleValue(option)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>{paymentFilterLabel(option)}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DateSortFilter({
  value,
  open,
  onToggle,
  onChange,
}: {
  value: "newest" | "oldest";
  open: boolean;
  onToggle: () => void;
  onChange: (value: "newest" | "oldest") => void;
}) {
  const options: Array<{ label: string; value: "newest" | "oldest" }> = [
    { label: "Mới nhất", value: "newest" },
    { label: "Cũ nhất", value: "oldest" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-1 py-0.5 text-sky-700 transition hover:bg-sky-200/70"
      >
        <span>Ngày</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className="absolute left-1/2 top-full z-[80] mt-2 w-44 -translate-x-1/2 rounded-2xl border border-sky-100 bg-white p-3 text-left normal-case tracking-normal shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Sắp xếp ngày
          </div>
          <div className="space-y-1">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-[12px] font-medium text-slate-700 transition hover:bg-sky-50"
              >
                <input
                  type="radio"
                  name="date-sort"
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
