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
      {/* 1. Pin/Select Icon (Fixed Left 0) */}
      <td
        className={`sticky left-0 z-20 cursor-cell border-r border-sky-100 px-3 py-3 text-center align-middle transition-colors duration-200 ${sttBgClass} shadow-[1px_0_0_rgba(186,230,253,0.9)]`}
        onClick={(e) => onTogglePin(e, row._id)}
        title="Click để ghim / bỏ ghim dòng này"
      >
        <span className="text-[12px]">{isPinned ? "📌" : "⚪"}</span>
      </td>

      {/* 2. STT (Fixed Left 56px) */}
      <td className={`sticky left-[56px] z-20 border-r border-sky-100 px-3 py-3 text-center align-middle transition-colors duration-200 ${sttBgClass} shadow-[1px_0_0_rgba(186,230,253,0.9)]`}>
        <SttBadge
          stt={row.stt || index + 1}
          dueDate={row.dueDate}
          processStatus={row.processStatus}
        />
      </td>

      {/* 3. Ngày (Fixed Left 126px) */}
      <td className={`sticky left-[126px] z-20 border-r border-sky-100 px-3 py-3 align-middle font-medium text-sky-800 transition-colors duration-200 ${sttBgClass} shadow-[1px_0_0_rgba(186,230,253,0.9)]`}>
        {row.receivedAt
          ? new Date(row.receivedAt).toLocaleDateString("vi-VN")
          : row.date
            ? new Date(row.date).toLocaleDateString("vi-VN")
            : "—"}
      </td>

      {/* 4. Mã ca (Fixed Left 236px) */}
      <td
        className={`sticky left-[236px] z-20 border-r border-sky-100 px-3 py-3 align-middle whitespace-nowrap font-bold tracking-[0.01em] text-slate-900 transition-colors duration-200 ${sttBgClass} shadow-[1px_0_0_rgba(186,230,253,0.9)]`}
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

      {/* 5. Họ và tên (Fixed Left 366px) */}
      <td className={`sticky left-[366px] z-20 border-r border-sky-100 px-3 py-3 align-middle transition-colors duration-200 ${sttBgClass} shadow-[1px_0_0_rgba(186,230,253,0.9)]`}>
        <div className={`${wrap2} font-semibold text-slate-900`}>
          {row.patientName || "—"}
        </div>
      </td>

      {/* 6. SĐT (Fixed Left 526px) */}
      <td className={`sticky left-[526px] z-20 border-r border-sky-100 px-3 py-3 align-middle transition-colors duration-200 ${sttBgClass} shadow-[1px_0_0_rgba(186,230,253,0.9)]`}>
        <div className="font-medium text-slate-700">
          {row.patientPhone || "—"}
        </div>
      </td>

      {/* 7. Lab (Fixed Left 646px) */}
      <td className={`sticky left-[646px] z-20 border-r border-sky-100 px-3 py-3 align-middle transition-colors duration-200 ${sttBgClass} shadow-[1px_0_0_rgba(186,230,253,0.9)]`}>
        <div className="font-medium text-slate-700">{row.lab || "—"}</div>
      </td>

      {/* 8. Dịch vụ (Fixed Left 746px - shadow phân cách) */}
      <td className={`sticky left-[746px] z-20 border-r border-sky-100 px-3 py-3 align-middle transition-colors duration-200 ${sttBgClass} shadow-[3px_0_8px_-2px_rgba(14,165,233,0.25)]`}>
        <Pill
          text={row.serviceType || "—"}
          tone={
            row.serviceType === "NIPT"
              ? "rose"
              : row.serviceType === "ADN"
                ? "blue"
                : normalizeText(row.serviceType || "").includes("sang")
                  ? "emerald"
                  : "amber"
          }
        />
      </td>

      {/* 9. Mã hàng */}
      <td className={tdBase}>
        <div className="font-semibold text-slate-800">
          {row.serviceCode || "—"}
        </div>
      </td>

      {/* 10. Chi nhánh */}
      <td className={tdBase}>
        <div className="text-slate-600">
          {row.agentTierLabel || row.agentLevel || "—"}
        </div>
      </td>

      {/* 11. Nguồn */}
      <td className={tdBase}>
        <div className={`${wrap2} text-slate-600`}>{row.source || "—"}</div>
      </td>

      {/* 12. NVKD phụ trách */}
      <td className={tdBase}>
        <div className={`${wrap2} font-medium text-teal-700`}>
          {row.salesOwner || "—"}
        </div>
      </td>

      {/* 13. Ngày gửi mẫu */}
      <td className={tdBase}>
        <div className="text-slate-700">
          {row.sentAt
            ? new Date(row.sentAt).toLocaleDateString("vi-VN")
            : "—"}
        </div>
      </td>

      {/* 14. ĐH hẹn trả */}
      <td className={tdBase}>
        <div className="font-medium text-amber-800">
          {row.dueDate
            ? new Date(row.dueDate).toLocaleDateString("vi-VN")
            : "—"}
        </div>
      </td>

      {/* 15. Ngày trả kết quả */}
      <td className={tdBase}>
        <div className="font-medium text-emerald-800">
          {row.returnedAt
            ? new Date(row.returnedAt).toLocaleDateString("vi-VN")
            : "—"}
        </div>
      </td>

      {/* 16. Phí xử lý mẫu */}
      <td className={`${tdBase} text-right font-medium tabular-nums text-slate-700`}>
        {row.shippingFee ? row.shippingFee.toLocaleString() : "0"}
      </td>

      {/* 17. Tiền thu */}
      <td className={`${tdBase} text-right font-bold tabular-nums text-sky-800`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-1">
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
          <span>{(row.collectedAmount ?? 0).toLocaleString()}</span>
        </div>
      </td>

      {/* 18. Giá gốc (tự động theo sản phẩm) */}
      {isAdminOrSuper && (
        <td className={`${tdBase} text-right font-semibold tabular-nums text-amber-800`}>
          {(row.costPrice ?? 0).toLocaleString()}
        </td>
      )}

      {/* 19. Lợi nhuận dự kiến (Tiền thu - Phí xử lý mẫu - Giá gốc) */}
      {isAdminOrSuper && (
        <td className={`${tdBase} text-right font-bold tabular-nums text-emerald-700`}>
          {(
            (row.collectedAmount || 0) -
            ((row.shippingFee || 0) + (row.costPrice || 0))
          ).toLocaleString()}
        </td>
      )}

      {/* 18. Mẫu chuyển lab */}
      <td className={tdBase}>
        <div className="text-slate-700">{row.transferStatus || "—"}</div>
      </td>

      {/* 19. Tiếp nhận mẫu */}
      <td className={tdBase}>
        <div className="text-slate-700">{row.receiveStatus || "—"}</div>
      </td>

      {/* 20. Xử lý mẫu */}
      <td className={tdBase}>
        <Pill text={row.processStatus || "—"} tone="slate" />
      </td>

      {/* 21. Phân tích */}
      <td className={tdBase}>
        <div className="text-slate-700">{row.feedbackStatus || "—"}</div>
      </td>

      {/* 22. Lưu trữ */}
      <td className={`${tdBase} text-center`}>
        <Pill
          text={row.softFileDone ? "Đã lưu" : "Chưa"}
          tone={row.softFileDone ? "emerald" : "slate"}
        />
      </td>

      {/* 23. GT nhận */}
      <td className={`${tdBase} text-center`}>
        <Pill
          text={row.gxHardFileReceived || row.gxReceived ? "Đã nhận" : "Chưa"}
          tone={row.gxHardFileReceived || row.gxReceived ? "emerald" : "slate"}
        />
      </td>

      {/* 24. Trả file mềm */}
      <td className={`${tdBase} text-center`}>
        <Pill
          text={row.softFileDone ? "Đã trả" : "Chưa"}
          tone={row.softFileDone ? "emerald" : "rose"}
        />
      </td>

      {/* 25. Trả file cứng */}
      <td className={`${tdBase} text-center`}>
        <Pill
          text={row.hardFileDone ? "Đã trả" : "Chưa"}
          tone={row.hardFileDone ? "emerald" : "rose"}
        />
      </td>

      {/* 26. Số CCCD / Hộ chiếu */}
      <td className={tdBase}>
        <div className="font-medium text-slate-800">
          {row.invoiceIdCard || "—"}
        </div>
      </td>

      {/* 27. Ngày cấp */}
      <td className={tdBase}>
        <div className="text-slate-700">{row.invoiceIssueDate || "—"}</div>
      </td>

      {/* 28. Nơi cấp */}
      <td className={tdBase}>
        <div className={`${wrap2} text-slate-700`}>
          {row.invoiceIssuePlace || "—"}
        </div>
      </td>

      {/* 29. Địa chỉ */}
      <td className={tdBase}>
        <div className={`${wrap2} text-slate-700`}>
          {row.invoiceAddress || "—"}
        </div>
      </td>

      {/* Accounting columns */}
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

      {/* Admin column */}
      {isAdminOrSuper && (
        <td className={`border-r-0 px-3 py-3 text-center align-middle sticky right-0 z-10 ${stickyRightBgClass} shadow-[-1px_0_0_rgba(186,230,253,0.9)]`}>
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
