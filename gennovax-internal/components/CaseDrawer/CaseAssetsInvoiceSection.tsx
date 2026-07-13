"use client";

import React from "react";
import SingleDatePicker from "@/components/share/DatePicker";
import type { CaseDraft } from "@/lib/types";
import {
  cn,
  Field,
  Input,
  isoDateFromISODateTime,
  isoDateTimeFromISODate,
  Textarea,
} from "./shared";

export default function CaseAssetsInvoiceSection({
  form,
  patchForm,
  imageUploadError,
  isUploadingImage,
  registrationUrl,
  receiptUrl,
  resultUrls,
  regInputRef,
  receiptInputRef,
  resInputRef,
  handleFileUpload,
  handleRemoveFile,
}: {
  form: CaseDraft;
  patchForm: (patch: Partial<CaseDraft>) => void;
  imageUploadError: string | null;
  isUploadingImage: boolean;
  registrationUrl?: string;
  receiptUrl?: string;
  resultUrls: string[];
  regInputRef: React.RefObject<HTMLInputElement | null>;
  receiptInputRef: React.RefObject<HTMLInputElement | null>;
  resInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "registrationImageUrl" | "receiptImageUrl" | "resultImageUrls",
    isMultiple?: boolean,
  ) => Promise<void>;
  handleRemoveFile: (
    field: "registrationImageUrl" | "receiptImageUrl" | "resultImageUrls",
    urlToRemove: string,
    idx?: number,
  ) => Promise<void>;
}) {
  return (
    <section className="rounded-[28px] bg-white p-4 ring-1 ring-sky-100 shadow-[0_18px_50px_-38px_rgba(14,116,144,0.32)] lg:col-span-3">
      <div className="mb-2 text-[12px] font-bold text-neutral-900">
        Hồ sơ ảnh & Hóa đơn
      </div>

      <div className="space-y-4">
        <div className="rounded-[24px] bg-sky-50/45 p-4 ring-1 ring-sky-100">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[12px] font-bold text-neutral-900">
              Thông tin xuất hóa đơn
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-white/90 p-1 ring-1 ring-sky-100">
              <button
                type="button"
                onClick={() => patchForm({ invoiceType: "company" } as any)}
                className={cn(
                  "rounded-md px-3 py-1 text-[11px] font-bold transition-all",
                  (form as any).invoiceType !== "personal"
                    ? "bg-sky-50 text-sky-700 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Công ty
              </button>
              <button
                type="button"
                onClick={() => patchForm({ invoiceType: "personal" } as any)}
                className={cn(
                  "rounded-md px-3 py-1 text-[11px] font-bold transition-all",
                  (form as any).invoiceType === "personal"
                    ? "bg-sky-50 text-sky-700 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Cá nhân
              </button>
            </div>
          </div>

          <Field label="Ngày xuất hóa đơn">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <SingleDatePicker
                value={isoDateFromISODateTime((form as any).invoiceIssuedAt)}
                onChange={(d) =>
                  patchForm({
                    invoiceIssuedAt: (isoDateTimeFromISODate(d) as any) || "",
                  })
                }
                placeholder="Chọn ngày xuất HĐ..."
                buttonClassName="w-full rounded-2xl border border-sky-200 bg-white px-3 py-2.5 text-left text-[12px] shadow-sm"
              />
              <button
                type="button"
                onClick={() => patchForm({ invoiceIssuedAt: "" } as any)}
                disabled={!(form as any).invoiceIssuedAt}
                className="rounded-2xl border border-rose-200 bg-white px-3 py-2.5 text-[12px] font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                Xóa ngày
              </button>
            </div>
          </Field>

          <div className="mt-3 space-y-3 rounded-xl bg-sky-100/95 p-3 ring-1 ring-sky-200">
            {(form as any).invoiceType === "personal" ? (
              <>
                <Field label="Họ tên người nhận">
                  <Input
                    value={(form as any).invoiceName ?? ""}
                    onChange={(v) => patchForm({ invoiceName: v } as any)}
                    placeholder="Nhập họ tên..."
                    tone="sky"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Số CCCD/CMND">
                    <Input
                      value={(form as any).invoiceIdCard ?? ""}
                      onChange={(v) => patchForm({ invoiceIdCard: v } as any)}
                      placeholder="Nhập số CCCD..."
                      tone="sky"
                    />
                  </Field>

                  <Field label="Ngày cấp">
                    <Input
                      value={(form as any).invoiceIssueDate ?? ""}
                      onChange={(v) =>
                        patchForm({ invoiceIssueDate: v } as any)
                      }
                      placeholder="DD/MM/YYYY"
                      tone="sky"
                    />
                  </Field>
                </div>

                <Field label="Nơi cấp">
                  <Input
                    value={(form as any).invoiceIssuePlace ?? ""}
                    onChange={(v) =>
                      patchForm({ invoiceIssuePlace: v } as any)
                    }
                    placeholder="Nhập nơi cấp CCCD..."
                    tone="sky"
                  />
                </Field>

                <Field label="Địa chỉ">
                  <Textarea
                    value={(form as any).invoiceAddress ?? ""}
                    onChange={(v) => patchForm({ invoiceAddress: v } as any)}
                    placeholder="Nhập địa chỉ..."
                    rows={2}
                    tone="sky"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Tên công ty / Đơn vị">
                  <Input
                    value={(form as any).invoiceName ?? ""}
                    onChange={(v) => patchForm({ invoiceName: v } as any)}
                    placeholder="Nhập tên đơn vị..."
                    tone="sky"
                  />
                </Field>

                <Field label="Mã số thuế">
                  <Input
                    value={(form as any).invoiceTaxCode ?? ""}
                    onChange={(v) => patchForm({ invoiceTaxCode: v } as any)}
                    placeholder="Nhập MST..."
                    tone="sky"
                  />
                </Field>

                <Field label="Địa chỉ">
                  <Textarea
                    value={(form as any).invoiceAddress ?? ""}
                    onChange={(v) => patchForm({ invoiceAddress: v } as any)}
                    placeholder="Nhập địa chỉ..."
                    rows={2}
                    tone="sky"
                  />
                </Field>
              </>
            )}
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-4 ring-1 ring-sky-100">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[12px] font-bold text-neutral-900">
              Tài liệu đính kèm
            </div>
          </div>

          {imageUploadError && (
            <div className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
              {imageUploadError}
            </div>
          )}

          <input
            ref={regInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => void handleFileUpload(e, "registrationImageUrl")}
          />
          <input
            ref={receiptInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => void handleFileUpload(e, "receiptImageUrl")}
          />
          <input
            ref={resInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => void handleFileUpload(e, "resultImageUrls", true)}
          />

          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-[11px] font-semibold text-neutral-500">
                1. Ảnh đơn đăng ký
              </div>
              {registrationUrl ? (
                <div className="flex items-center justify-between rounded-2xl bg-sky-50/50 p-2.5 ring-1 ring-sky-100">
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="max-w-[150px] truncate text-[11px] text-blue-600 hover:underline"
                  >
                    Xem file đính kèm
                  </a>
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() =>
                      void handleRemoveFile("registrationImageUrl", registrationUrl)
                    }
                    className="rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-200"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => regInputRef.current?.click()}
                  className="flex w-full justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50 py-3 text-[11px] font-bold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
                >
                  + Tải file lên
                </button>
              )}
            </div>

            <div>
              <div className="mb-1.5 text-[11px] font-semibold text-neutral-500">
                2. Ảnh CK / Tiền mặt
              </div>
              {receiptUrl ? (
                <div className="flex items-center justify-between rounded-2xl bg-sky-50/50 p-2.5 ring-1 ring-sky-100">
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="max-w-[150px] truncate text-[11px] text-blue-600 hover:underline"
                  >
                    Xem biên lai
                  </a>
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() =>
                      void handleRemoveFile("receiptImageUrl", receiptUrl)
                    }
                    className="rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-200"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => receiptInputRef.current?.click()}
                  className="flex w-full justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50 py-3 text-[11px] font-bold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
                >
                  + Tải hóa đơn
                </button>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-neutral-500">
                <span>3. File trả kết quả</span>
                <span>{resultUrls.length}/3</span>
              </div>

              <div className="space-y-2">
                {resultUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-2xl bg-sky-50/50 p-2.5 ring-1 ring-sky-100"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="max-w-[150px] truncate text-[11px] text-blue-600 hover:underline"
                    >
                      File KQ {idx + 1}
                    </a>
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() =>
                        void handleRemoveFile("resultImageUrls", url, idx)
                      }
                      className="rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-200"
                    >
                      Xóa
                    </button>
                  </div>
                ))}

                {resultUrls.length < 3 && (
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => resInputRef.current?.click()}
                    className="w-full rounded-xl border border-dashed bg-indigo-50 py-2.5 text-[11px] font-bold text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-100"
                  >
                    + Thêm File KQ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
