"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  CaseDraft,
  DoctorItem,
  OptionsMap,
  ServiceItem,
} from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { api, caseApi } from "@/lib/api";
import CaseAssetsInvoiceSection from "./CaseAssetsInvoiceSection";
import CaseDrawerHeader from "./CaseDrawerHeader";
import CaseInfoSection from "./CaseInfoSection";
import CaseWorkflowSection from "./CaseWorkflowSection";
import {
  addHoursISO,
  cn,
  fmtMoney,
  parseMoneyInput,
} from "./shared";

type SourceServiceOption = {
  service: ServiceItem;
  price: number;
};

function normalizeCaseData(input: CaseDraft): CaseDraft {
  const cloned = { ...input } as CaseDraft & Record<string, any>;

  if (cloned.paid && !cloned.paymentMethod) {
    cloned.paymentMethod = "Chuyển khoản";
  }

  if (!cloned.invoiceType) {
    cloned.invoiceType = "company";
  }

  if (!cloned.invoiceIssuedAt) {
    cloned.invoiceIssuedAt = "";
  }

  if (!Array.isArray(cloned.resultImageUrls)) {
    cloned.resultImageUrls = [];
  }

  if (!cloned.mailStatus) {
    cloned.mailStatus = "Chưa gửi thư";
  }

  if (!cloned.mailLatestTime) cloned.mailLatestTime = "";
  if (!cloned.mailLatestStatus) cloned.mailLatestStatus = "";
  if (!cloned.mailLastCheckError) cloned.mailLastCheckError = "";

  return cloned;
}

export default function CaseDrawer({
  open,
  data,
  options,
  services,
  onClose,
  doctors,
  onSave,
}: {
  open: boolean;
  data: CaseDraft | null;
  options: OptionsMap;
  services: ServiceItem[];
  onClose: () => void;
  doctors: DoctorItem[];
  onSave: (data: CaseDraft) => Promise<void>;
}) {
  const { user } = useAuth();
  const isAccountingAdmin = user?.role === "accounting_admin";

  const [form, setForm] = useState<CaseDraft | null>(data);
  const [sampleCount, setSampleCount] = useState(1);
  const [collectedAmountManual, setCollectedAmountManual] = useState(false);
  const [mailActionLoading, setMailActionLoading] = useState(false);

  const regInputRef = useRef<HTMLInputElement | null>(null);
  const receiptInputRef = useRef<HTMLInputElement | null>(null);
  const resInputRef = useRef<HTMLInputElement | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const isNewCase = !data?._id;

  const opt = useMemo(() => (k: string) => options[k] ?? [], [options]);

  const patchForm = (patch: Partial<CaseDraft>) =>
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));

  useEffect(() => {
    if (!data) {
      setForm(null);
      setCollectedAmountManual(false);
      setSampleCount(1);
      return;
    }

    const normalized = normalizeCaseData(data);
    setForm(normalized);

    if (normalized._id) {
      setCollectedAmountManual(true);
    } else {
      setCollectedAmountManual(false);
    }

    setSampleCount(1);
  }, [data]);

  const selectedDoctor = useMemo(() => {
    if (!form) return null;

    if (form.doctorId) {
      return doctors.find((d) => d._id === form.doctorId) ?? null;
    }

    if (form.source) {
      return doctors.find((d) => d.fullName === form.source) ?? null;
    }

    return null;
  }, [form, doctors]);

  const availableServicesBySource = useMemo<SourceServiceOption[]>(() => {
    if (!selectedDoctor || !form?.serviceType) return [];

    return (selectedDoctor.servicePrices || [])
      .filter((item) => item.isActive !== false)
      .filter((item) => item.serviceType === form.serviceType)
      .map((item) => ({
        service: {
          _id: String(item.serviceId),
          serviceType: item.serviceType,
          serviceCode: item.serviceCode,
          name: item.name,
          turnaroundHours: item.turnaroundHours ?? 48,
          isActive: item.isActive !== false,
        },
        price: Number(item.netPrice || 0),
      }));
  }, [selectedDoctor, form?.serviceType]);

  const selectedService = useMemo(() => {
    if (!form) return null;

    if (form.serviceId) {
      const byId = availableServicesBySource.find(
        ({ service }) => String(service._id) === String(form.serviceId),
      );
      if (byId) return byId.service;
    }

    if (form.serviceCode) {
      const byCode = availableServicesBySource.find(
        ({ service }) => service.serviceCode === form.serviceCode,
      );
      if (byCode) return byCode.service;
    }

    if (form.serviceCode || form.serviceName) {
      return {
        _id: String(form.serviceId || form.serviceCode || "legacy-service"),
        serviceType: form.serviceType,
        serviceCode: form.serviceCode || "",
        name: form.serviceName || "",
        turnaroundHours: 48,
        isActive: true,
      };
    }

    return null;
  }, [form, availableServicesBySource]);

  const suggestedPrice = useMemo(() => {
    if (!form) return 0;

    const found = availableServicesBySource.find(
      ({ service }) =>
        String(service._id) === String(form.serviceId) ||
        service.serviceCode === form.serviceCode,
    );

    return Number(found?.price || 0);
  }, [availableServicesBySource, form]);

  const serviceItemsForSelect = useMemo(() => {
    const baseItems = availableServicesBySource.map(({ service }) => ({
      label: `${service.serviceCode} • ${service.name} `,
      value: service.serviceCode,
    }));

    if (
      form?.serviceCode &&
      !baseItems.some((item) => item.value === form.serviceCode)
    ) {
      baseItems.unshift({
        label: `${form.serviceCode} • ${form.serviceName || "Dữ liệu cũ"}`,
        value: form.serviceCode,
      });
    }

    return baseItems;
  }, [availableServicesBySource, form?.serviceCode, form?.serviceName]);

  const agent = {
    level:
      form?.agentLevel ||
      selectedDoctor?.fullName ||
      form?.source ||
      "Chưa chọn nguồn",
    label: form?.agentTierLabel || selectedDoctor?.agentTierLabel || "",
  };

  const handleSourceChange = (sourceName: string) => {
    const doctor = doctors.find((d) => d.fullName === sourceName) ?? null;

    patchForm({
      source: sourceName,
      doctorId: doctor?._id || null,
      salesOwner: doctor?.salesOwner || "",
      serviceCode: "",
      serviceName: "",
      serviceId: null,
      agentTierLabel: doctor?.agentTierLabel || "",
    });

    setCollectedAmountManual(false);
  };

  const handleServiceChange = (serviceCode: string) => {
    const found =
      availableServicesBySource.find(
        ({ service }) => service.serviceCode === serviceCode,
      ) ?? null;

    patchForm({
      serviceCode,
      serviceName: found?.service.name ?? "",
      serviceId: found?.service._id ?? null,
    });

    setCollectedAmountManual(false);
  };

  useEffect(() => {
    if (!form) return;
    if (!isNewCase) return;

    if (!selectedDoctor || !selectedService) {
      if (!collectedAmountManual && (form.collectedAmount ?? 0) !== 0) {
        patchForm({ collectedAmount: 0 });
      }
      return;
    }

    if (!collectedAmountManual) {
      const autoPrice = suggestedPrice * sampleCount;
      if ((form.collectedAmount ?? 0) !== autoPrice) {
        patchForm({ collectedAmount: autoPrice });
      }
    }
  }, [
    collectedAmountManual,
    form,
    isNewCase,
    sampleCount,
    selectedDoctor,
    selectedService,
    suggestedPrice,
  ]);

  useEffect(() => {
    if (!form?.receivedAt || !selectedService) return;

    const hours = selectedService.turnaroundHours ?? 48;
    const due = addHoursISO(form.receivedAt, hours);

    if (due !== form.dueDate) {
      patchForm({ dueDate: due });
    }
  }, [form?.dueDate, form?.receivedAt, selectedService]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "registrationImageUrl" | "receiptImageUrl" | "resultImageUrls",
    isMultiple = false,
  ) => {
    if (!form?.caseCode?.trim()) {
      alert(
        "Vui lòng nhập 'Mã ca' trước khi tải file để hệ thống tạo thư mục lưu trữ.",
      );
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files || []);
    if (!files.length || !form) return;

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      if (!isMultiple) {
        const res = await caseApi.uploadFile(files[0], form.caseCode);
        patchForm({ [field]: res.url } as any);
      } else {
        const current = Array.isArray((form as any).resultImageUrls)
          ? [...(form as any).resultImageUrls]
          : [];

        const remain = Math.max(0, 3 - current.length);
        if (remain <= 0) throw new Error("Chỉ được tải tối đa 3 file kết quả.");

        const picked = files.slice(0, remain);
        const uploadedUrls: string[] = [];

        for (const f of picked) {
          const res = await caseApi.uploadFile(f, form.caseCode);
          uploadedUrls.push(res.url);
        }

        patchForm({ resultImageUrls: [...current, ...uploadedUrls] } as any);
      }
    } catch (err: any) {
      setImageUploadError(
        err?.message || "Tải file lên thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveFile = async (
    field: "registrationImageUrl" | "receiptImageUrl" | "resultImageUrls",
    urlToRemove: string,
    idx?: number,
  ) => {
    try {
      if (caseApi.deleteFileMinio) {
        await caseApi.deleteFileMinio(urlToRemove);
      }
    } catch (e) {
      console.warn("Không thể xóa file vật lý trên MinIO", e);
    }

    if (field === "resultImageUrls" && typeof idx === "number") {
      const current = Array.isArray((form as any)?.resultImageUrls)
        ? [...((form as any).resultImageUrls as string[])]
        : [];
      current.splice(idx, 1);
      patchForm({ resultImageUrls: current } as any);
    } else {
      patchForm({ [field]: "" } as any);
    }
  };

  if (!open || !form) return null;

  const registrationUrl = (form as any).registrationImageUrl as
    | string
    | undefined;
  const receiptUrl = (form as any).receiptImageUrl as string | undefined;
  const resultUrls = Array.isArray((form as any).resultImageUrls)
    ? ((form as any).resultImageUrls as string[])
    : [];
  const mailTrackingCode = String(form.mailTrackingCode || "").trim();
  const mailTrackingLocked = !!form.mailTrackingEnabled;
  const hasNetpostData = !!(form.mailLatestTime || form.mailLatestStatus);

  const handleCheckMailTracking = () => {
    if (!mailTrackingCode) return;

    window.open(
      `https://netpost.vn/Home/tra_cuu_van_don?hawbNo=${encodeURIComponent(
        mailTrackingCode,
      )}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const runMailTrackingAction = async (
    action: "start" | "check" | "stop",
  ) => {
    if (!form._id) {
      alert("Vui lòng lưu ca trước khi bật theo dõi thư.");
      return;
    }

    if (action !== "stop" && !mailTrackingCode) {
      alert("Vui lòng nhập mã đi thư trước.");
      return;
    }

    setMailActionLoading(true);
    try {
      const updated =
        action === "start"
          ? await api.caseMailTrackingStart(form._id, mailTrackingCode)
          : action === "check"
            ? await api.caseMailTrackingCheck(form._id, mailTrackingCode)
            : await api.caseMailTrackingStop(form._id);

      setForm(normalizeCaseData(updated));
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Không thể cập nhật theo dõi thư.",
      );
    } finally {
      setMailActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "h-[80vh] w-[90vw] overflow-hidden rounded-[16px] border border-sky-100 bg-white shadow-[0_30px_120px_-48px_rgba(14,116,144,0.42)]",
            "lg:h-[90vh] lg:w-[85vw]",
          )}
        >
          <CaseDrawerHeader
            form={form}
            agentLevel={agent.label || agent.level}
            onClose={onClose}
            onSave={() => void onSave(form)}
          />

          <div className="h-[calc(90vh-56px)] overflow-auto bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_36%,#ffffff_100%)] p-4 text-black">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-11">
              <CaseInfoSection
                form={form}
                doctors={doctors}
                serviceItemsForSelect={serviceItemsForSelect}
                isAccountingAdmin={isAccountingAdmin}
                isNewCase={isNewCase}
                sampleCount={sampleCount}
                collectedAmountManual={collectedAmountManual}
                suggestedPrice={suggestedPrice}
                patchForm={patchForm}
                setSampleCount={setSampleCount}
                setCollectedAmountManual={setCollectedAmountManual}
                handleSourceChange={handleSourceChange}
                handleServiceChange={handleServiceChange}
                fmtMoney={fmtMoney}
                parseMoneyInput={parseMoneyInput}
                opt={opt}
              />

              <CaseWorkflowSection
                form={form}
                patchForm={patchForm}
                opt={opt}
                mailTrackingCode={mailTrackingCode}
                mailTrackingLocked={mailTrackingLocked}
                hasNetpostData={hasNetpostData}
                mailActionLoading={mailActionLoading}
                handleCheckMailTracking={handleCheckMailTracking}
                runMailTrackingAction={runMailTrackingAction}
              />

              <CaseAssetsInvoiceSection
                form={form}
                patchForm={patchForm}
                imageUploadError={imageUploadError}
                isUploadingImage={isUploadingImage}
                registrationUrl={registrationUrl}
                receiptUrl={receiptUrl}
                resultUrls={resultUrls}
                regInputRef={regInputRef}
                receiptInputRef={receiptInputRef}
                resInputRef={resInputRef}
                handleFileUpload={handleFileUpload}
                handleRemoveFile={handleRemoveFile}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
