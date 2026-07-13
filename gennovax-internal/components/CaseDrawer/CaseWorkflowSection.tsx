"use client";

import SingleDatePicker from "@/components/share/DatePicker";
import type { CaseDraft } from "@/lib/types";
import {
  cn,
  Field,
  isoDateFromISODateTime,
  isoDateTimeFromISODate,
  nowVNISOString,
  Select,
} from "./shared";

export default function CaseWorkflowSection({
  form,
  patchForm,
  opt,
  mailTrackingCode,
  mailTrackingLocked,
  hasNetpostData,
  mailActionLoading,
  handleCheckMailTracking,
  runMailTrackingAction,
}: {
  form: CaseDraft;
  patchForm: (patch: Partial<CaseDraft>) => void;
  opt: (key: string) => { label: string; value: string }[];
  mailTrackingCode: string;
  mailTrackingLocked: boolean;
  hasNetpostData: boolean;
  mailActionLoading: boolean;
  handleCheckMailTracking: () => void;
  runMailTrackingAction: (action: "start" | "check" | "stop") => Promise<void>;
}) {
  return (
    <section className="rounded-[28px] bg-white p-4 ring-1 ring-sky-100 shadow-[0_18px_50px_-38px_rgba(14,116,144,0.32)] lg:col-span-3">
      <div className="mb-2 text-[12px] font-bold text-neutral-900">
        Luồng xử lý
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="* Mức chuyển lab">
            <Select
              value={form.transferStatus}
              onChange={(v) => patchForm({ transferStatus: v })}
              items={opt("transferStatus")}
              tone="sky"
            />
          </Field>

          <Field label="* Tiếp nhận mẫu">
            <Select
              value={form.receiveStatus}
              onChange={(v) => patchForm({ receiveStatus: v })}
              items={opt("receiveStatus")}
              tone="sky"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="* Xử lý mẫu">
            <Select
              value={form.processStatus}
              onChange={(v) => patchForm({ processStatus: v })}
              items={opt("processStatus")}
              tone="slate"
            />
          </Field>

          <Field label="Phản hồi">
            <Select
              value={form.feedbackStatus}
              onChange={(v) => patchForm({ feedbackStatus: v })}
              items={opt("feedbackStatus")}
              tone="rose"
            />
          </Field>
        </div>

        <Field label="* Ngày nhận">
          <div className="grid grid-cols-2 gap-2">
            <SingleDatePicker
              value={isoDateFromISODateTime((form as any).receivedAt)}
              onChange={(d) =>
                patchForm({
                  receivedAt: isoDateTimeFromISODate(d) as any,
                })
              }
              placeholder="Chọn ngày..."
              disabled={false}
              popoverWidth="lg"
              months={1}
              buttonClassName="w-full rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-left text-[12px] shadow-sm"
            />

            <button
              type="button"
              className={cn(
                "w-full rounded-2xl bg-sky-50 px-3 py-2.5 text-[12px] font-bold text-sky-700 ring-1 ring-sky-200 shadow-sm hover:bg-sky-100",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-100",
              )}
              onClick={() => {
                const ok = window.confirm(
                  "Xác nhận lấy thời điểm hiện tại làm 'Ngày nhận'?",
                );
                if (!ok) return;
                patchForm({ receivedAt: nowVNISOString() as any });
              }}
              title="Lấy thời điểm hiện tại"
            >
              Lấy thời điểm hiện tại
            </button>
          </div>
        </Field>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col justify-center rounded-[20px] bg-[linear-gradient(135deg,#f8fbff_0%,#e0f2fe_100%)] p-3 ring-1 ring-sky-100">
            <div className="text-[11px] font-semibold text-neutral-500">
              Ngày trả KQ (Dự kiến)
            </div>
            <div className="mt-1 text-[12px] font-bold text-blue-900">
              {(form as any).dueDate
                ? new Date((form as any).dueDate).toLocaleString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  })
                : "—"}
            </div>
          </div>

          <Field label="Ngày trả KQ (Thực tế)">
            <div className="grid grid-cols-1 gap-2">
              <SingleDatePicker
                value={isoDateFromISODateTime((form as any).returnedAt)}
                onChange={(d) =>
                  patchForm({
                    returnedAt: isoDateTimeFromISODate(d) as any,
                  })
                }
                placeholder="Chọn ngày..."
                disabled={false}
                popoverWidth="lg"
                months={1}
                buttonClassName="w-full rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-left text-[12px] shadow-sm"
              />
            </div>
          </Field>
        </div>

        <div className="mt-2 rounded-[24px] bg-white p-4 ring-1 ring-sky-100">
          <div className="mb-2 text-[12px] font-bold text-neutral-900">
            Trạng thái trả file & Thanh toán
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <label className="cursor-pointer rounded-2xl border border-sky-100 bg-sky-50/40 px-3 py-2.5 text-[12px] shadow-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!(form as any).paid}
                    onChange={(e) => {
                      const isPaid = e.target.checked;
                      patchForm({
                        paid: isPaid,
                        paymentMethod: isPaid
                          ? (form as any).paymentMethod || "Chuyển khoản"
                          : "Chuyển khoản",
                      } as any);
                    }}
                  />
                  <span
                    className={cn(
                      "font-bold",
                      (form as any).paid ? "text-sky-700" : "text-slate-700",
                    )}
                  >
                    Đã thanh toán
                  </span>
                </div>

                {(form as any).paid && (
                  <div className="mt-2">
                    <Select
                      value={(form as any).paymentMethod || "Chuyển khoản"}
                      onChange={(v) => patchForm({ paymentMethod: v } as any)}
                      items={[
                        {
                          label: "Chuyển khoản",
                          value: "Chuyển khoản",
                        },
                        { label: "Tiền mặt", value: "Tiền mặt" },
                      ]}
                      tone="blue"
                    />
                  </div>
                )}
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50/40 px-3 py-2.5 text-[12px] shadow-sm">
                <input
                  type="checkbox"
                  checked={!!form.gxHardFileReceived}
                  onChange={(e) =>
                    patchForm({
                      gxHardFileReceived: e.target.checked,
                    })
                  }
                />
                GX nhận file
              </label>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50/40 px-3 py-2.5 shadow-sm">
              <div className="mb-1.5 text-[14px] font-bold text-slate-700">
                ĐI THƯ
              </div>
              <div className="flex gap-2">
                <input
                  value={form.mailTrackingCode || ""}
                  onChange={(e) =>
                    patchForm({
                      mailTrackingCode: e.target.value,
                    })
                  }
                  disabled={mailTrackingLocked}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCheckMailTracking();
                    }
                  }}
                  placeholder="Nhập mã thư..."
                  className="min-w-0 flex-1 rounded-xl border border-sky-100 bg-white px-3 py-2 text-[12px] outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                />
                <button
                  type="button"
                  disabled={!mailTrackingCode}
                  onClick={handleCheckMailTracking}
                  className="rounded-xl bg-sky-600 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Check
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {mailTrackingLocked ? (
                  <>
                    <button
                      type="button"
                      disabled={mailActionLoading}
                      onClick={() => void runMailTrackingAction("check")}
                      className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-[12px] font-bold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {mailActionLoading ? "Đang quét..." : "Theo dõi"}
                    </button>
                    <button
                      type="button"
                      disabled={mailActionLoading}
                      onClick={() => void runMailTrackingAction("stop")}
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-[12px] font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      Hủy theo dõi
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={!mailTrackingCode || mailActionLoading}
                    onClick={() => void runMailTrackingAction("start")}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {mailActionLoading ? "Đang quét..." : "Theo dõi"}
                  </button>
                )}
              </div>
              <div className="mt-2">
                <Select
                  value={form.mailStatus || "Chưa gửi thư"}
                  onChange={(v) =>
                    patchForm({
                      mailStatus: v as CaseDraft["mailStatus"],
                    })
                  }
                  items={[
                    {
                      label: "Chưa gửi thư",
                      value: "Chưa gửi thư",
                    },
                    {
                      label: "Đang gửi thư",
                      value: "Đang gửi thư",
                    },
                    {
                      label: "Đã nhận thư",
                      value: "Đã nhận thư",
                    },
                  ]}
                  tone="blue"
                />
              </div>
              {(form.mailLastCheckedAt || form.mailLastCheckError) && (
                <div className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-[13px] leading-5 text-sky-700 ring-1 ring-sky-100">
                  {hasNetpostData ? (
                    <>
                      <div>
                        Thời gian:{" "}
                        <span className="font-semibold">
                          {form.mailLatestTime || "-"}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800">
                        {form.mailLatestStatus || "-"}
                      </div>
                    </>
                  ) : (
                    <div className="font-semibold text-slate-500">
                      Không có dữ liệu Netpost.
                    </div>
                  )}
                  {form.mailLastCheckError && (
                    <div className="font-semibold text-rose-600">
                      {form.mailLastCheckError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
