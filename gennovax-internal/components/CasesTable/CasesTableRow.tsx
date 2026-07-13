"use client";

import { CheckCheck, Copy } from "lucide-react";
import type { CaseRecord } from "@/lib/types";
import {
  Check,
  MailCell,
  normalizeText,
  Pill,
  SttBadge,
  tdBase,
  wrap2,
} from "./shared";

export default function CasesTableRow({
  row,
  index,
  isPinned,
  isActive,
  isAccountingAdmin,
  isAdminOrSuper,
  copiedCaseId,
  onRowClick,
  onTogglePin,
  onCopyCaseCode,
  onQuickPaidChange,
  onOpenHistory,
  onDelete,
}: {
  row: CaseRecord;
  index: number;
  isPinned: boolean;
  isActive: boolean;
  isAccountingAdmin: boolean;
  isAdminOrSuper: boolean;
  copiedCaseId: string | null;
  onRowClick: (row: CaseRecord) => void;
  onTogglePin: (e: React.MouseEvent, id: string) => void;
  onCopyCaseCode: (
    e: React.MouseEvent,
    caseId: string,
    caseCode: string,
  ) => Promise<void>;
  onQuickPaidChange: (row: CaseRecord, paid: boolean) => Promise<void>;
  onOpenHistory: (row: CaseRecord) => void;
  onDelete: (
    e: React.MouseEvent,
    caseId: string,
    patientName: string,
  ) => Promise<void>;
}) {
  let rowBgClass = "odd:bg-white even:bg-sky-50/30 hover:bg-sky-50/80";
  if (isActive) {
    rowBgClass =
      "relative bg-sky-100/95 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.9)] hover:bg-sky-100/95";
  } else if (isPinned) {
    rowBgClass =
      "bg-sky-100/95 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.95)] hover:bg-sky-200/70";
  }

  let sttBgClass = "bg-white hover:bg-slate-50";
  if (isActive) {
    sttBgClass = "bg-sky-100/95 hover:bg-sky-100/95";
  } else if (isPinned) {
    sttBgClass = "bg-sky-100/95 hover:bg-sky-200/70";
  }

  let stickyRightBgClass = "bg-white hover:bg-slate-50";
  if (isActive) {
    stickyRightBgClass = "bg-sky-100/95 hover:bg-sky-100/95";
  } else if (isPinned) {
    stickyRightBgClass = "bg-sky-100/95 hover:bg-sky-200/70";
  }

  return (
    <tr
      onClick={() => onRowClick(row)}
      className={`cursor-pointer transition-all duration-200 ${rowBgClass}`}
    >
      <td
        className={`sticky left-0 z-0 cursor-cell border-r border-sky-100 px-3 py-3 align-middle transition-colors duration-200 ${sttBgClass}`}
        onClick={(e) => onTogglePin(e, row._id)}
        title="Click để ghim / bỏ ghim dòng này"
      >
        <div className="relative inline-block w-full text-center">
          <SttBadge
            stt={row.stt || index + 1}
            dueDate={row.dueDate}
            processStatus={row.processStatus}
          />
          {isPinned && (
            <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] text-white shadow-sm ring-2 ring-white">
              ðŸ“Œ
            </span>
          )}
        </div>
      </td>
      <td className={`${tdBase} font-medium text-sky-800`}>
        {row.receivedAt
          ? new Date(row.receivedAt).toLocaleDateString("vi-VN")
          : "—"}
      </td>
      <td className={tdBase}>
        <Pill text={row.processStatus || "—"} tone="slate" />
      </td>
      <td className={tdBase}>
        <MailCell row={row} />
      </td>
      <td
        className={`${tdBase} whitespace-nowrap font-bold tracking-[0.01em] text-slate-900`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate">{row.caseCode || "—"}</span>
          {row.caseCode && (
            <button
              type="button"
              onClick={(e) => void onCopyCaseCode(e, row._id, row.caseCode || "")}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-sky-100 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              title="Copy mã ca"
            >
              {copiedCaseId === row._id ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </td>
      {isAccountingAdmin && (
        <td className={`${tdBase} text-center`}>
          <div className="flex h-full items-center justify-center">
            <Pill
              text={row.invoiceIssuedAt ? "Đã xuất" : "Chưa xuất"}
              tone={row.invoiceIssuedAt ? "emerald" : "rose"}
            />
          </div>
        </td>
      )}
      {isAccountingAdmin && (
        <td className={`${tdBase} text-center`}>
          <div className="flex h-full items-center justify-center">
            <Pill
              text={(row.costPrice ?? 0) > 0 ? "Đã nhập" : "Chưa nhập"}
              tone={(row.costPrice ?? 0) > 0 ? "emerald" : "rose"}
            />
          </div>
        </td>
      )}
      <td className={tdBase}>
        <div className={`${wrap2} font-semibold text-slate-900`}>
          {row.patientName || "—"}
        </div>
      </td>
      <td className={tdBase}>
        <div className={`${wrap2} text-slate-600`}>{row.source || "—"}</div>
      </td>
      <td className={tdBase}>
        <div className={`${wrap2} font-medium text-teal-700`}>
          {row.salesOwner || "—"}
        </div>
      </td>
      <td className={tdBase}>
        <Pill
          text={row.serviceType}
          tone={
            row.serviceType === "NIPT"
              ? "rose"
              : row.serviceType === "ADN"
                ? "blue"
                : normalizeText(row.serviceType).includes("sang")
                  ? "emerald"
                  : "amber"
          }
        />
      </td>
      <td className={tdBase}>
        <div className={`${wrap2} font-semibold text-slate-800`}>
          {row.serviceName || "—"}
        </div>
        <div className="mt-1 break-words text-[11px] font-medium tracking-[0.03em] text-slate-400">
          {row.serviceCode || ""}
        </div>
      </td>
      <td className={tdBase} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="w-fit cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            void onQuickPaidChange(row, !row.paid);
          }}
          title={row.paid ? "Đã TT" : "Chưa TT"}
        >
          <Check ok={!!row.paid} />
        </button>
      </td>
      {isAccountingAdmin && (
        <td className="whitespace-nowrap border-r border-slate-200/80 px-3 py-3 text-center align-middle text-[11px] font-semibold tabular-nums text-emerald-700">
          {row.paymentMethod || "Không có"}
        </td>
      )}
      {isAccountingAdmin && (
        <td className="whitespace-nowrap border-r border-slate-200/80 px-3 py-3 text-center align-middle text-[12px] font-bold tabular-nums text-sky-800">
          {(row.receivedAmount ?? 0).toLocaleString()}
        </td>
      )}
      {isAccountingAdmin && (
        <td
          className={`sticky right-[220px] z-10 whitespace-nowrap border-l-2 border-r border-sky-400 px-3 py-3 text-center align-middle text-[12px] font-bold tabular-nums text-amber-800 shadow-[inset_2px_0_0_rgba(56,189,248,0.55),-1px_0_0_rgba(186,230,253,0.9)] ${stickyRightBgClass}`}
        >
          {(row.costPrice ?? 0).toLocaleString()}
        </td>
      )}

      <td
        className={`${isAccountingAdmin ? `sticky right-[110px] z-10 shadow-[-1px_0_0_rgba(186,230,253,0.9)] ${stickyRightBgClass}` : ""} whitespace-nowrap border-r border-slate-200/80 px-3 py-3 text-center align-middle text-[12px] font-bold tabular-nums text-slate-800`}
      >
        {(row.collectedAmount ?? 0).toLocaleString()}
      </td>

      {isAccountingAdmin && (
        <td
          className={`sticky right-0 z-10 whitespace-nowrap border-r border-slate-200/80 px-3 py-3 text-center align-middle text-[12px] font-bold tabular-nums text-rose-600 shadow-[-1px_0_0_rgba(186,230,253,0.9)] ${stickyRightBgClass}`}
        >
          {(
            (row.collectedAmount || 0) -
            ((row.costPrice || 0) + (row.shippingFee || 0))
          ).toLocaleString()}
        </td>
      )}
      {isAdminOrSuper && (
        <td className="border-r-0 px-3 py-3 text-center align-middle">
          <div className="flex justify-center gap-1.5">
            <button
              className="cursor-pointer whitespace-nowrap rounded-xl bg-sky-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-sky-500"
              onClick={(e) => {
                e.stopPropagation();
                onOpenHistory(row);
              }}
            >
              Lịch sử
            </button>
            <button
              className="cursor-pointer whitespace-nowrap rounded-xl bg-rose-500 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-rose-600"
              onClick={(e) => void onDelete(e, row._id, row.patientName || "")}
            >
              Xóa
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
