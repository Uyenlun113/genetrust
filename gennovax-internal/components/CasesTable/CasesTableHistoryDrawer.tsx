"use client";

import { createPortal } from "react-dom";
import type { ChangeLog } from "@/lib/types";
import { formatChangeValue } from "./shared";

export default function CasesTableHistoryDrawer({
  open,
  patientName,
  changes,
  onClose,
}: {
  open: boolean;
  patientName: string;
  changes: ChangeLog[];
  onClose: () => void;
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] overflow-hidden">
      <div
        className="history-drawer-backdrop absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="history-drawer-panel absolute inset-y-0 right-0 flex w-full max-w-[640px] transform-gpu flex-col overflow-hidden border-l border-sky-100 bg-white shadow-[-24px_0_80px_-45px_rgba(15,23,42,0.55)] sm:w-[min(720px,calc(100vw-40px))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-sky-100 bg-sky-50/80 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Lịch sử thao tác dữ liệu
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Tên khách hàng:{" "}
              <span className="font-semibold text-slate-700">{patientName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5">
          {changes.length === 0 ? (
            <div className="py-6 text-center text-sm italic text-slate-500">
              Chưa có lịch sử lưu vết cho ca này.
            </div>
          ) : (
            <div className="space-y-4">
              {changes.map((log, idx) => (
                <div key={idx} className="relative flex gap-4">
                  {idx !== changes.length - 1 && (
                    <div className="absolute bottom-[-16px] left-4 top-8 w-[2px] bg-slate-100"></div>
                  )}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 ring-4 ring-white">
                    <span className="text-xs font-bold text-sky-700">
                      {log.name ? log.name.charAt(0).toUpperCase() : "?"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">
                          {log.name}
                        </p>
                      </div>
                      <span className="shrink-0 rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-sky-600 ring-1 ring-slate-200">
                        {log.action || "Thao tác"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      {new Date(log.changedAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    {Array.isArray(log.details) && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                        {log.details.length === 0 ? (
                          <div className="text-[11px] font-medium text-slate-500">
                            Không có thay đổi
                          </div>
                        ) : (
                          <div className="grid gap-2 lg:grid-cols-2">
                            {log.details.map((detail, detailIdx) => (
                              <div
                                key={`${detail.field}-${detailIdx}`}
                                className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-[11px] leading-5"
                              >
                                <div className="mb-1.5 truncate font-bold text-slate-700">
                                  {detail.label || detail.field}
                                </div>
                                <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-start gap-2">
                                  <div className="min-w-0 rounded-md bg-white px-2 py-1 text-slate-500 ring-1 ring-slate-100">
                                    <div className="line-clamp-2 break-words">
                                      {formatChangeValue(
                                        detail.oldValue,
                                        detail.field,
                                      )}
                                    </div>
                                  </div>
                                  <span className="pt-1 text-slate-300">→</span>
                                  <div className="min-w-0 rounded-md bg-sky-50 px-2 py-1 font-semibold text-sky-700 ring-1 ring-sky-100">
                                    <div className="line-clamp-2 break-words">
                                      {formatChangeValue(
                                        detail.newValue,
                                        detail.field,
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
