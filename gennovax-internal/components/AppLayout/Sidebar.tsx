"use client";

import { Filter, X } from "lucide-react";
import type { CaseServiceGroup, CasesColumnFilters } from "@/lib/types";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const FILTER_LABELS: Record<keyof CasesColumnFilters, string> = {
  processStatus: "Trạng thái",
  mailStatus: "Đi thư",
  source: "Nguồn",
  salesOwner: "NVKD",
  payment: "Đã TT",
};

const SERVICE_GROUPS: Array<{ label: string; value: CaseServiceGroup }> = [
  { label: "NIPT", value: "NIPT" },
  { label: "ADN", value: "ADN" },
  { label: "SL UTCTC", value: "Sàng Lọc UTCTC" },
  { label: "Sinh Hóa", value: "Sinh Hóa" },
  { label: "XN Khác", value: "XN Khác" },
  { label: "Tất cả", value: "ALL" },
];

const SERVICE_ACTIVE_CLASS: Record<CaseServiceGroup, string> = {
  NIPT: "border-rose-300 bg-rose-600 text-white shadow-sm",
  ADN: "border-blue-300 bg-blue-600 text-white shadow-sm",
  "Sàng Lọc UTCTC": "border-emerald-300 bg-emerald-600 text-white shadow-sm",
  "Sinh Hóa": "border-orange-300 bg-orange-600 text-white shadow-sm",
  "XN Khác": "border-violet-300 bg-violet-600 text-white shadow-sm",
  ALL: "border-slate-300 bg-slate-700 text-white shadow-sm",
};

function paymentLabel(value: string) {
  if (value === "paid") return "Đã thanh toán";
  if (value === "unpaid") return "Chưa thanh toán";
  return value;
}

export default function CaseFiltersSidebar({
  serviceType,
  onServiceTypeChange,
  filters,
  onClear,
  onClearAll,
}: {
  serviceType: CaseServiceGroup;
  onServiceTypeChange: (value: CaseServiceGroup) => void;
  filters: CasesColumnFilters;
  onClear: (key: keyof CasesColumnFilters) => void;
  onClearAll: () => void;
}) {
  const entries = (Object.keys(filters) as Array<keyof CasesColumnFilters>).filter(
    (key) => filters[key].length > 0,
  );

  const totalSelections = entries.reduce(
    (count, key) => count + filters[key].length,
    0,
  );

  return (
    <aside className="sticky top-0 flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-sky-200 bg-[linear-gradient(180deg,#eef7ff_0%,#f7fbff_58%,#ffffff_100%)] text-slate-900">

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <section className="mb-3">
          <div className="mb-2">
            <span className="inline-flex h-7 items-center rounded-full border border-sky-200 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-sky-700 shadow-sm">
              Nhóm dịch vụ
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_GROUPS.map((item) => {
              const active = serviceType === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onServiceTypeChange(item.value)}
                  className={cn(
                    "min-h-[38px] cursor-pointer rounded-lg border px-2 py-1.5 text-center text-[11px] font-semibold transition",
                    active
                      ? SERVICE_ACTIVE_CLASS[item.value]
                      : "border-sky-100 bg-white/85 text-slate-700 hover:border-sky-200 hover:bg-white",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-sky-200 bg-white/70 px-3 py-3 text-[12px] leading-5 text-slate-500">
            Chưa chọn điều kiện nào
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((key) => (
              <section key={key} className="border-b border-sky-100 pb-2 last:border-b-0">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    {FILTER_LABELS[key]}
                  </div>
                  <button
                    type="button"
                    onClick={() => onClear(key)}
                    className="inline-flex h-6 items-center rounded-md border border-sky-100 bg-white px-2 text-[10px] font-semibold text-sky-700 transition hover:bg-sky-50"
                  >
                    Xóa
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {filters[key].map((value) => (
                    <span
                      key={`${key}-${value}`}
                      className="inline-flex items-center rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-200"
                    >
                      {key === "payment" ? paymentLabel(value) : value}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-sky-100 px-3 py-3">
        <button
          type="button"
          onClick={onClearAll}
          disabled={entries.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-sky-100 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Xóa tất cả
        </button>
      </div>
    </aside>
  );
}
