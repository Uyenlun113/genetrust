"use client";

import type { CaseDraft, DoctorItem } from "@/lib/types";
import { Field, Input, SearchableSelect, Select, Textarea } from "./shared";

export default function CaseInfoSection({
  form,
  doctors,
  serviceItemsForSelect,
  isAccountingAdmin,
  isNewCase,
  sampleCount,
  collectedAmountManual,
  suggestedPrice,
  patchForm,
  setSampleCount,
  setCollectedAmountManual,
  handleSourceChange,
  handleServiceChange,
  fmtMoney,
  parseMoneyInput,
  opt,
}: {
  form: CaseDraft;
  doctors: DoctorItem[];
  serviceItemsForSelect: Array<{ label: string; value: string }>;
  isAccountingAdmin: boolean;
  isNewCase: boolean;
  sampleCount: number;
  collectedAmountManual: boolean;
  suggestedPrice: number;
  patchForm: (patch: Partial<CaseDraft>) => void;
  setSampleCount: React.Dispatch<React.SetStateAction<number>>;
  setCollectedAmountManual: React.Dispatch<React.SetStateAction<boolean>>;
  handleSourceChange: (sourceName: string) => void;
  handleServiceChange: (serviceCode: string) => void;
  fmtMoney: (value: number) => string;
  parseMoneyInput: (value: string) => number;
  opt: (key: string) => { label: string; value: string }[];
}) {
  return (
    <>
      <section className="rounded-[28px] bg-white p-4 ring-1 ring-sky-100 shadow-[0_18px_50px_-38px_rgba(14,116,144,0.32)] lg:col-span-2">
        <div className="mb-2 text-[12px] font-bold text-neutral-900">
          Thông tin ca
        </div>

        <div className="space-y-3">
          <Field label="* Mã ca">
            <Input
              value={form.caseCode}
              onChange={(v) => patchForm({ caseCode: v })}
              placeholder="Nhập mã ca"
              tone="blue"
            />
          </Field>

          <Field label="* Nguồn">
            <SearchableSelect
              value={form.source}
              onChange={handleSourceChange}
              items={[
                ...(form.source && !doctors.some((d) => d.fullName === form.source)
                  ? [{ label: `${form.source}`, value: form.source }]
                  : []),
                ...doctors.map((d) => ({
                  label: d.fullName,
                  value: d.fullName,
                })),
              ]}
              placeholder="Tìm hoặc chọn nguồn..."
              tone="sky"
              emptyText="Không tìm thấy nguồn phù hợp"
              dropdownClassName="max-h-80"
            />
          </Field>

          <Field label="* NVKD phụ trách">
            <Input
              value={form.salesOwner || ""}
              onChange={() => {}}
              placeholder="Tự động theo nguồn"
              tone="blue"
              disabled
            />
          </Field>

          <Field label="Lab">
            <Select
              value={form.lab}
              onChange={(v) => patchForm({ lab: v })}
              items={opt("labs")}
              tone="sky"
            />
          </Field>

          <Field label="Thu mẫu">
            <Select
              value={form.sampleCollector}
              onChange={(v) => patchForm({ sampleCollector: v })}
              items={opt("sampleCollectors")}
              tone="rose"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-4 ring-1 ring-sky-100 shadow-[0_18px_50px_-38px_rgba(14,116,144,0.32)] lg:col-span-3">
        <div className="mb-2 text-[12px] font-bold text-neutral-900">
          Khách hàng & Dịch vụ
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="* Họ và tên">
              <Input
                value={form.patientName}
                onChange={(v) => patchForm({ patientName: v })}
                placeholder="Nhập tên khách hàng"
                tone="rose"
              />
            </Field>

            <Field label="SĐT">
              <Input
                value={form.patientPhone || ""}
                onChange={(v) => patchForm({ patientPhone: v })}
                placeholder="Nhập SĐT"
                tone="rose"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="* Dịch vụ (mã)">
              <SearchableSelect
                value={form.serviceCode}
                onChange={handleServiceChange}
                items={serviceItemsForSelect}
                placeholder={
                  form.source
                    ? "Chọn dịch vụ theo nguồn..."
                    : "Chọn nguồn trước..."
                }
                tone="sky"
                disabled={!form.source}
                emptyText="Không tìm thấy dịch vụ phù hợp"
                dropdownClassName="right-auto max-h-80 w-full md:w-[calc(200%+0.75rem)]"
              />
            </Field>

            <Field label="Tên dịch vụ">
              <div className="rounded-2xl border border-sky-100 bg-sky-50/40 px-3.5 py-2.5 text-[12px] shadow-sm">
                <div className="font-semibold text-neutral-900">
                  {form.serviceName || "—"}
                </div>
              </div>
            </Field>
          </div>

          <Field label="* Tài chính">
            <div className="rounded-[28px] border border-sky-100 bg-[#e0f2fe]/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[13px] font-bold text-[#0369a1]">
                  Thông tin doanh thu
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#0369a1] shadow-sm ring-1 ring-sky-100">
                  {collectedAmountManual ? "chỉnh tay" : "tự động"}
                </span>
              </div>

              <div className="space-y-3">
                {/* Card 1: Tiền thu */}
                <div className="rounded-[20px] bg-white p-3.5 shadow-sm ring-1 ring-sky-100/80">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[12px] font-bold text-slate-700">
                      Tiền thu
                    </span>
                    <div className="flex items-center gap-2">
                      {isNewCase && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-slate-500">
                            SL mẫu:
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={sampleCount}
                            onChange={(e) => {
                              const val = Math.max(
                                1,
                                parseInt(e.target.value) || 1,
                              );
                              setSampleCount(val);
                              setCollectedAmountManual(false);
                            }}
                            className="w-12 rounded-lg border border-sky-200 bg-sky-50 px-2 py-0.5 text-center text-[11px] font-semibold outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        className="rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-1 text-[11px] font-bold text-sky-700 transition hover:bg-sky-100"
                        onClick={() => {
                          patchForm({
                            collectedAmount: suggestedPrice * sampleCount,
                          });
                          setCollectedAmountManual(false);
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <Input
                    value={fmtMoney(form.collectedAmount ?? 0)}
                    onChange={(v) => {
                      const n = parseMoneyInput(v);
                      patchForm({ collectedAmount: n });
                      setCollectedAmountManual(true);
                    }}
                    tone="sky"
                  />
                  <div className="mt-1.5 text-[13px] font-bold text-[#0284c7]">
                    {fmtMoney(form.collectedAmount ?? 0)}
                  </div>
                </div>

                {/* Card 2: Phí vận chuyển */}
                <div className="rounded-[20px] bg-[#f0f9ff] p-3.5 shadow-sm ring-1 ring-sky-100/80">
                  <div className="mb-2 text-[12px] font-bold text-slate-700">
                    Phí vận chuyển
                  </div>
                  <Input
                    value={fmtMoney((form as any).shippingFee ?? 0)}
                    onChange={(v) => {
                      const n = parseMoneyInput(v);
                      patchForm({ shippingFee: n } as any);
                    }}
                    placeholder="0"
                    tone="sky"
                  />
                  <div className="mt-1.5 text-[13px] font-bold text-[#0284c7]">
                    {fmtMoney((form as any).shippingFee ?? 0)}
                  </div>
                </div>

                {/* Card 3: Summary Giá gốc & Lợi nhuận */}
                <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
                  <div className="rounded-[18px] bg-amber-50/80 p-3 ring-1 ring-amber-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-800">
                        Giá gốc (tự động)
                      </span>
                    </div>
                    <div className="mt-1 text-[14px] font-bold text-amber-900">
                      {fmtMoney((form as any).costPrice ?? 0)} đ
                    </div>
                  </div>

                  <div className="rounded-[18px] bg-emerald-50/90 p-3 ring-1 ring-emerald-200/90">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800">
                        Lợi nhuận dự kiến
                      </span>
                    </div>
                    <div className="mt-1 text-[15px] font-black tabular-nums text-emerald-700">
                      {fmtMoney(
                        (form.collectedAmount || 0) -
                          ((form.shippingFee || 0) + (form.costPrice || 0)),
                      )}{" "}
                      đ
                    </div>
                  </div>
                </div>

                {isAccountingAdmin && (
                  <div className="rounded-[18px] bg-white p-3 ring-1 ring-sky-100 shadow-sm">
                    <div className="mb-1.5 text-[11px] font-semibold text-indigo-700">
                      Tiền đã nhận thực tế (Kế toán)
                    </div>
                    <Input
                      value={String((form as any).receivedAmount ?? 0)}
                      onChange={(v) => {
                        const n =
                          Number(String(v).replace(/[^\d]/g, "")) || 0;
                        patchForm({ receivedAmount: n } as any);
                      }}
                      placeholder="Nhập số tiền..."
                      tone="blue"
                    />
                    <div className="mt-1 text-[13px] font-bold text-sky-700">
                      {fmtMoney((form as any).receivedAmount ?? 0)} đ
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Field>

          <Field label="Thông tin chi tiết thêm">
            <Textarea
              value={form.detailNote}
              onChange={(v) => patchForm({ detailNote: v })}
              placeholder="Ghi chú..."
              rows={3}
              tone="slate"
            />
          </Field>
        </div>
      </section>
    </>
  );
}
