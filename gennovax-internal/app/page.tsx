"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CaseDrawer from "@/components/CaseDrawer/CaseDrawer";
import CaseFiltersSidebar from "@/components/AppLayout/Sidebar";
import CasesHeader from "@/components/AppLayout/CasesHeader";
import CasesHeaderMobile from "@/components/AppLayout/CasesHeaderMobile";
import CasesTable from "@/components/CasesTable/CasesTable";
import LoadingOverlay from "@/components/share/LoadingOverlay";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type {
  CaseDraft,
  CaseRecord,
  CaseServiceGroup,
  CasesColumnFilters,
  CasesFilterOptions,
  DoctorItem,
  OptionsMap,
  ServiceItem,
} from "@/lib/types";

const PAGE_SIZE = 100;
const PICKABLE_SERVICE_TYPES: Array<Exclude<CaseServiceGroup, "ALL">> = [
  "NIPT",
  "ADN",
  "Sàng Lọc UTCTC",
  "Sinh Hóa",
  "XN Khác",
];

const EMPTY_FILTERS: CasesColumnFilters = {
  processStatus: [],
  mailStatus: [],
  source: [],
  salesOwner: [],
  payment: [],
};

const EMPTY_FILTER_OPTIONS: CasesFilterOptions = {
  processStatuses: [],
  mailStatuses: [],
  sources: [],
  salesOwners: [],
  payments: ["paid", "unpaid"],
};

export default function CasesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [serviceType, setServiceType] = useState<CaseServiceGroup>("NIPT");
  const [options, setOptions] = useState<OptionsMap>({});
  const [rows, setRows] = useState<CaseRecord[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [serviceTypePickerOpen, setServiceTypePickerOpen] = useState(false);
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
  const [columnFilters, setColumnFilters] =
    useState<CasesColumnFilters>(EMPTY_FILTERS);
  const [filterOptions, setFilterOptions] =
    useState<CasesFilterOptions>(EMPTY_FILTER_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CaseDraft | null>(null);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const trimmedQuery = q.trim();
      const serviceTypeFilter = trimmedQuery ? "ALL" : serviceType;
      const [opt, list, doc] = await Promise.all([
        api.options(),
        api.cases({
          serviceType: serviceTypeFilter,
          q: trimmedQuery,
          from,
          to,
          page,
          limit: PAGE_SIZE,
          dateSort,
          processStatus: columnFilters.processStatus,
          mailStatus: columnFilters.mailStatus,
          source: columnFilters.source,
          salesOwner: columnFilters.salesOwner,
          payment: columnFilters.payment,
        }),
        api.doctors(""),
      ]);

      if (page > 1 && list.items.length === 0 && list.total > 0) {
        setPage(1);
        return;
      }

      setOptions(opt);
      setRows(list.items ?? []);
      setTotalRows(list.total ?? 0);
      setFilterOptions(list.filters ?? EMPTY_FILTER_OPTIONS);

      if (trimmedQuery && list.items?.length) {
        const matchedServiceType = list.items[0]?.serviceType;
        if (matchedServiceType && matchedServiceType !== serviceType) {
          setServiceType(matchedServiceType);
        }
      }

      setDoctors(doc.items ?? []);
      setServices(
        (doc.items ?? []).flatMap((doctor) =>
          (doctor.servicePrices || [])
            .filter((service) =>
              serviceType === "ALL" ? true : service.serviceType === serviceType,
            )
            .map((service) => ({
              _id: service.serviceId,
              serviceType: service.serviceType,
              serviceCode: service.serviceCode,
              name: service.name,
              turnaroundHours: service.turnaroundHours,
              isActive: service.isActive !== false,
            })),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [columnFilters, dateSort, from, page, q, serviceType, to]);

  useEffect(() => {
    if (user?.role === "sales") {
      router.replace("/admin/doctors");
      return;
    }
  }, [router, user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  if (user?.role === "sales") return null;

  const handleServiceTypeChange = (next: CaseServiceGroup) => {
    setPage(1);
    setServiceType(next);
  };

  const handleColumnFilterChange = (
    key: keyof CasesColumnFilters,
    values: string[],
  ) => {
    setPage(1);
    setColumnFilters((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  const handleClearColumnFilter = (key: keyof CasesColumnFilters) => {
    setPage(1);
    setColumnFilters((prev) => ({
      ...prev,
      [key]: [],
    }));
  };

  const handleClearAllColumnFilters = () => {
    setPage(1);
    setColumnFilters({
      processStatus: [],
      mailStatus: [],
      source: [],
      salesOwner: [],
      payment: [],
    });
  };

  const handleDateSortChange = (value: "newest" | "oldest") => {
    setPage(1);
    setDateSort(value);
  };

  const onApplyFilters = () => {
    if (page !== 1) {
      setPage(1);
      return;
    }
    void load();
  };

  const openDraftForServiceType = (
    nextServiceType: Exclude<CaseServiceGroup, "ALL">,
  ) => {
    const draft: CaseDraft = {
      isDraft: true,
      serviceType: nextServiceType,
      date: new Date().toISOString(),
      stt: 0,
      caseCode: "",
      patientName: "",
      patientPhone: "",
      lab: "",
      serviceId: null,
      serviceName: "",
      serviceCode: "",
      price: 0,
      detailNote: "",
      source: "",
      salesOwner: "",
      sampleCollector: "",
      doctorId: null,
      agentLevel: "",
      agentTierLabel: "",
      sentAt: null,
      paid: false,
      collectedAmount: 0,
      shippingFee: 0,
      dueDate: null,
      transferStatus: "",
      receiveStatus: "",
      processStatus: "",
      feedbackStatus: "",
      glReturned: false,
      gxReceived: false,
      softFileDone: false,
      hardFileDone: false,
      gxHardFileReceived: false,
      mailTrackingCode: "",
      mailStatus: "Chưa gửi thư",
      mailTrackingEnabled: false,
      mailTrackingStartedAt: null,
      mailLastCheckedAt: null,
      mailLatestTime: "",
      mailLatestStatus: "",
      mailLastCheckError: "",
      invoiceIssuedAt: "",
      invoiceName: "",
      invoiceTaxCode: "",
      invoiceAddress: "",
      receivedAt: null,
      createdBy: "",
      updatedBy: "",
    };

    setEditing(draft);
    setOpen(true);
  };

  const onAdd = () => {
    if (serviceType === "ALL") {
      setServiceTypePickerOpen(true);
      return;
    }

    openDraftForServiceType(serviceType);
  };

  const onEdit = (row: CaseRecord) => {
    setEditing({ ...row, isDraft: false });
    setOpen(true);
  };

  const onCloseDrawer = () => {
    setOpen(false);
    setEditing(null);
  };

  function validateCaseDraft(draft: CaseDraft) {
    const errors: string[] = [];
    if (!draft.caseCode) errors.push("Thiếu mã Code.");
    if (!draft.serviceType) errors.push("Thiếu loại dịch vụ (serviceType).");
    if (!draft.patientName?.trim()) errors.push("Thiếu họ và tên khách hàng.");
    if (!draft.source?.trim()) errors.push("Thiếu nguồn.");
    if (!draft.salesOwner?.trim()) errors.push("Thiếu NVKD phụ trách.");
    if (!draft.serviceCode?.trim()) errors.push("Chưa chọn dịch vụ (mã).");
    if (!draft.serviceName?.trim()) errors.push("Chưa có tên dịch vụ.");
    if (
      typeof draft.collectedAmount !== "number" ||
      Number.isNaN(draft.collectedAmount) ||
      draft.collectedAmount < 0
    ) {
      errors.push("Tiền thu không hợp lệ.");
    }
    if (!draft.transferStatus?.trim()) errors.push("Thiếu trạng thái chuyển lab.");
    if (!draft.receiveStatus?.trim()) errors.push("Thiếu trạng thái tiếp nhận.");
    if (!draft.processStatus?.trim()) errors.push("Thiếu trạng thái xử lý.");
    if (!draft.receivedAt) errors.push("Chưa chọn ngày nhận mẫu.");
    return errors;
  }

  const onSave = async (data: CaseDraft) => {
    const errors = validateCaseDraft(data);
    if (errors.length) {
      alert("Không thể lưu vì thiếu thông tin:\n\n- " + errors.join("\n- "));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        currentUserName: user?.name || "Unknown",
        currentUserEmail: user?.email || "Unknown",
      };

      if (data.isDraft) {
        await api.createCase(payload);
        if (page !== 1) setPage(1);
        else await load();
      } else if (data._id) {
        await api.updateCase(data._id, payload);
        await load();
      }

      setOpen(false);
      setEditing(null);
    } catch (error: unknown) {
      console.error("Lỗi khi lưu:", error);
      alert(error instanceof Error ? error.message : "Đã xảy ra lỗi khi lưu.");
    } finally {
      setLoading(false);
    }
  };

  const onQuickPaidChange = async (row: CaseRecord, paid: boolean) => {
    try {
      setLoading(true);
      const updated = await api.updateCase(row._id, {
        paid,
        currentUserName: user?.name || "Unknown",
        currentUserEmail: user?.email || "Unknown",
      });

      setRows((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    } catch (error: unknown) {
      console.error("Lỗi cập nhật thanh toán:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi cập nhật trạng thái thanh toán.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={loading} />

      <div className="h-full overflow-hidden bg-gradient-to-b from-neutral-50 via-neutral-50 to-neutral-100">
        <div className="flex h-full overflow-hidden">
          {sidebarOpen && (
            <div className="hidden h-full lg:flex">
              <CaseFiltersSidebar
                serviceType={serviceType}
                onServiceTypeChange={handleServiceTypeChange}
                filters={columnFilters}
                onClear={handleClearColumnFilter}
                onClearAll={handleClearAllColumnFilters}
              />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="relative z-[20] hidden shrink-0 lg:block">
              <CasesHeader
                serviceType={serviceType}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((current) => !current)}
                q={q}
                setQ={setQ}
                from={from}
                setFrom={setFrom}
                to={to}
                setTo={setTo}
                loading={loading}
                onAdd={onAdd}
                onApply={onApplyFilters}
              />
            </div>

            <div className="block shrink-0 lg:hidden">
              <CasesHeaderMobile
                serviceType={serviceType}
                setServiceType={handleServiceTypeChange}
                q={q}
                setQ={setQ}
                from={from}
                setFrom={setFrom}
                to={to}
                setTo={setTo}
                loading={loading}
                onAdd={onAdd}
                onApply={onApplyFilters}
              />
            </div>

            <div className="z-0 min-h-0 flex-1 overflow-hidden p-1">
              <CasesTable
                rows={rows}
                totalRows={totalRows}
                page={page}
                pageSize={PAGE_SIZE}
                loading={loading}
                dateSort={dateSort}
                onDateSortChange={handleDateSortChange}
                filterOptions={filterOptions}
                columnFilters={columnFilters}
                onColumnFilterChange={handleColumnFilterChange}
                onRowClick={onEdit}
                fetchCases={load}
                onPageChange={setPage}
                onQuickPaidChange={onQuickPaidChange}
              />
            </div>
          </div>
        </div>

        <CaseDrawer
          open={open}
          data={editing}
          options={options}
          services={services}
          doctors={doctors}
          onClose={onCloseDrawer}
          onSave={onSave}
        />

        {serviceTypePickerOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Đóng chọn loại dịch vụ"
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
              onClick={() => setServiceTypePickerOpen(false)}
            />

            <div className="relative w-full max-w-[420px] rounded-[28px] border border-sky-100 bg-white p-5 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)]">
              <div className="mb-4">
                <div className="text-lg font-bold text-slate-900">
                  Chọn nhóm dịch vụ để thêm ca
                </div>
                
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PICKABLE_SERVICE_TYPES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setServiceTypePickerOpen(false);
                      setServiceType(item);
                      openDraftForServiceType(item);
                    }}
                    className="min-h-[52px] rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-white hover:text-sky-700"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setServiceTypePickerOpen(false)}
                  className="rounded-xl border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-sky-50"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
