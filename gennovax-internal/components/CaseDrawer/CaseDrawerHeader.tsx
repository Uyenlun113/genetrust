"use client";

import type { CaseDraft } from "@/lib/types";
import { fmtMoney } from "./shared";

export default function CaseDrawerHeader({
  form,
  agentLevel,
  onClose,
  onSave,
}: {
  form: CaseDraft;
  agentLevel: string;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="border-b border-sky-100 bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#ffffff_58%)] px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-blue-700">
            Ca: {form.serviceType}
          </div>
          <div className="mt-0.5 truncate text-[15px] font-bold tracking-tight text-neutral-900">
            {form.patientName || "Ca mới"}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-sky-50 px-2 py-0.5 font-bold text-sky-700 ring-1 ring-sky-200">
              {agentLevel || "Chưa xác định cấp"}
            </span>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 font-bold text-sky-700 ring-1 ring-sky-200">
              Giá: {fmtMoney(form.collectedAmount ?? 0)}
            </span>
            {form.dueDate && (
              <span className="rounded-full bg-sky-50 px-2.5 py-1 font-bold text-sky-700 ring-1 ring-sky-200">
                Hạn KQ:{" "}
                {new Date(form.dueDate).toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
              </span>
            )}
            <span className="hidden rounded-full px-2 py-0.5 font-bold text-sky-800 ring-1 ring-sky-200 lg:flex">
              Dấu * là trường bắt buộc
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            className="cursor-pointer rounded-xl px-3 py-2 text-[12px] font-bold text-black ring-1 ring-black/10 hover:bg-neutral-50"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            className="cursor-pointer rounded-xl bg-blue-600 px-3 py-2 text-[12px] font-bold text-white hover:opacity-95"
            onClick={onSave}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
