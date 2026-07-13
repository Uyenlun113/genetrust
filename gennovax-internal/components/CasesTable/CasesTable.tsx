"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CaseRecord,
  CasesColumnFilters,
  CasesFilterOptions,
  ChangeLog,
} from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import CasesTableHistoryDrawer from "./CasesTableHistoryDrawer";
import CasesTablePrint from "./CasesTablePrint";
import CasesTableRow from "./CasesTableRow";
import {
  buildPagination,
  DateSortFilter,
  HeaderFilter,
  thBase,
} from "./shared";

export default function CasesTable({
  rows,
  totalRows,
  page,
  pageSize,
  loading,
  dateSort,
  onDateSortChange,
  filterOptions,
  columnFilters,
  onColumnFilterChange,
  onRowClick,
  onPageChange,
  fetchCases,
  onQuickPaidChange,
}: {
  rows: CaseRecord[];
  totalRows: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  dateSort: "newest" | "oldest";
  onDateSortChange: (value: "newest" | "oldest") => void;
  filterOptions: CasesFilterOptions;
  columnFilters: CasesColumnFilters;
  onColumnFilterChange: (
    key: keyof CasesColumnFilters,
    values: string[],
  ) => void;
  onRowClick: (r: CaseRecord) => void;
  onPageChange: (page: number) => void;
  fetchCases?: () => void;
  onQuickPaidChange: (row: CaseRecord, paid: boolean) => Promise<void>;
}) {
  const { user } = useAuth();
  type TablePopoverKey = keyof CasesColumnFilters | "dateSort";

  const isAccountingAdmin = user?.role === "accounting_admin";
  const isAdminOrSuper = user?.role === "admin" || user?.role === "super_admin";
  const colCount = 12 + (isAccountingAdmin ? 6 : 0) + (isAdminOrSuper ? 1 : 0);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedCaseInfo, setSelectedCaseInfo] = useState<{
    patientName: string;
    changes: ChangeLog[];
  }>({ patientName: "", changes: [] });
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [copiedCaseId, setCopiedCaseId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pendingScrollPageRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const filterRef = useRef<HTMLTableSectionElement>(null);
  const [printData] = useState<CaseRecord | null>(null);
  const [openFilterKey, setOpenFilterKey] = useState<TablePopoverKey | null>(
    null,
  );
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const paginationItems = useMemo(
    () => buildPagination(page, totalPages),
    [page, totalPages],
  );

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDelete = async (
    e: React.MouseEvent,
    caseId: string,
    patientName: string,
  ) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ca của khách hàng "${patientName || "Không tên"}" không? Hành động này không thể hoàn tác.`,
      )
    ) {
      return;
    }

    try {
      await api.deleteCase(caseId);
      if (fetchCases) fetchCases();
      else window.location.reload();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Đã xảy ra lỗi khi xóa ca. Vui lòng thử lại!");
    }
  };

  const handleCopyCaseCode = async (
    e: React.MouseEvent,
    caseId: string,
    caseCode: string,
  ) => {
    e.stopPropagation();
    if (!caseCode) return;

    try {
      await navigator.clipboard.writeText(caseCode);
      setCopiedCaseId(caseId);
      window.setTimeout(() => {
        setCopiedCaseId((current) => (current === caseId ? null : current));
      }, 1200);
    } catch (error) {
      console.error("Copy case code failed:", error);
    }
  };

  const handleOpenHistory = (row: CaseRecord) => {
    const sortedChanges = row.changes
      ? [...row.changes].sort(
          (a, b) =>
            new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
        )
      : [];

    setSelectedCaseInfo({
      patientName: row.patientName || "Không tên",
      changes: sortedChanges,
    });
    setHistoryModalOpen(true);
  };

  useEffect(() => {
    if (!openFilterKey) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) {
        setOpenFilterKey(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [openFilterKey]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    pendingScrollPageRef.current = page;
  }, [page]);

  useEffect(() => {
    if (loading || pendingScrollPageRef.current !== page) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const frameId = window.requestAnimationFrame(() => {
      container.scrollTo({
        top: 0,
        left: container.scrollLeft,
        behavior: "smooth",
      });
      pendingScrollPageRef.current = null;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [loading, page, rows]);

  return (
    <>
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[12px] border border-sky-100 bg-white shadow-[0_24px_80px_-48px_rgba(14,165,233,0.38)]">
        <div
          ref={scrollContainerRef}
          className="min-h-0 flex-1 overflow-auto overscroll-contain bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_36%,#ffffff_100%)] [scrollbar-color:#bae6fd_#f0f9ff] [&::-webkit-scrollbar]:h-[1px] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-sky-50/90 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sky-200 [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-sky-50 [&::-webkit-scrollbar-thumb]:hover:bg-sky-300"
        >
          <table
            className={`w-full table-fixed text-slate-900 ${isAccountingAdmin ? "min-w-[1250px]" : "min-w-[1120px]"}`}
          >
            <colgroup>
              <col className="w-[56px]" />
              <col className="w-[80px]" />
              <col className="w-[112px]" />
              <col className="w-[120px]" />
              <col className="w-[150px]" />
              {isAccountingAdmin && <col className="w-[90px]" />}
              {isAccountingAdmin && <col className="w-[90px]" />}
              <col className="w-[140px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
              <col className="w-[120px]" />
              <col className="w-[160px]" />
              <col className="w-[82px]" />
              {isAccountingAdmin && <col className="w-[100px]" />}
              {isAccountingAdmin && <col className="w-[100px]" />}
              {isAccountingAdmin && <col className="w-[100px]" />}
              <col className="w-[110px]" />
              {isAccountingAdmin && <col className="w-[110px]" />}
              {isAdminOrSuper && <col className="w-[112px]" />}
            </colgroup>

            <thead ref={filterRef} className="sticky top-0 z-50">
              <tr className="border-b border-sky-100 bg-[linear-gradient(180deg,rgba(240,249,255,0.98),rgba(248,250,252,0.96))] text-slate-600 backdrop-blur">
                <th
                  className={`${thBase} sticky left-0 z-50 bg-sky-50/95 shadow-[1px_0_0_rgba(186,230,253,0.9)]`}
                >
                  STT
                </th>
                <th className={`${thBase} bg-sky-50/95`}>
                  <DateSortFilter
                    value={dateSort}
                    open={openFilterKey === "dateSort"}
                    onToggle={() =>
                      setOpenFilterKey((current) =>
                        current === "dateSort" ? null : "dateSort",
                      )
                    }
                    onChange={(value) => {
                      onDateSortChange(value);
                      setOpenFilterKey(null);
                    }}
                  />
                </th>
                <th className={`${thBase} bg-white/80`}>
                  <HeaderFilter
                    label="Trạng thái"
                    options={filterOptions.processStatuses}
                    selected={columnFilters.processStatus}
                    open={openFilterKey === "processStatus"}
                    onToggle={() =>
                      setOpenFilterKey((current) =>
                        current === "processStatus" ? null : "processStatus",
                      )
                    }
                    onChange={(values) =>
                      onColumnFilterChange("processStatus", values)
                    }
                  />
                </th>
                <th className={`${thBase} bg-sky-50/95`}>
                  <HeaderFilter
                    label="Đi thư"
                    options={filterOptions.mailStatuses}
                    selected={columnFilters.mailStatus}
                    open={openFilterKey === "mailStatus"}
                    onToggle={() =>
                      setOpenFilterKey((current) =>
                        current === "mailStatus" ? null : "mailStatus",
                      )
                    }
                    onChange={(values) =>
                      onColumnFilterChange("mailStatus", values)
                    }
                  />
                </th>
                <th className={`${thBase} bg-sky-50/95`}>Mã ca</th>
                {isAccountingAdmin && (
                  <th className={`${thBase} bg-white/80 text-center`}>
                    Xuất HĐ
                  </th>
                )}
                {isAccountingAdmin && (
                  <th className={`${thBase} bg-sky-50/95 text-center`}>
                    Nhập Cost
                  </th>
                )}
                <th className={`${thBase} bg-white/80`}>Họ và tên</th>
                <th className={`${thBase} bg-sky-50/95`}>
                  <HeaderFilter
                    label="Nguồn"
                    options={filterOptions.sources}
                    selected={columnFilters.source}
                    open={openFilterKey === "source"}
                    onToggle={() =>
                      setOpenFilterKey((current) =>
                        current === "source" ? null : "source",
                      )
                    }
                    onChange={(values) => onColumnFilterChange("source", values)}
                  />
                </th>
                <th className={`${thBase} bg-white/80`}>
                  <HeaderFilter
                    label="NVKD"
                    options={filterOptions.salesOwners}
                    selected={columnFilters.salesOwner}
                    open={openFilterKey === "salesOwner"}
                    onToggle={() =>
                      setOpenFilterKey((current) =>
                        current === "salesOwner" ? null : "salesOwner",
                      )
                    }
                    onChange={(values) =>
                      onColumnFilterChange("salesOwner", values)
                    }
                  />
                </th>
                <th className={`${thBase} bg-sky-50/95`}>Dịch vụ</th>
                <th className={`${thBase} bg-white/80`}>Tên dịch vụ</th>
                <th className={`${thBase} bg-sky-50/95`}>
                  <HeaderFilter
                    label="Đã TT"
                    options={filterOptions.payments}
                    selected={columnFilters.payment}
                    open={openFilterKey === "payment"}
                    onToggle={() =>
                      setOpenFilterKey((current) =>
                        current === "payment" ? null : "payment",
                      )
                    }
                    onChange={(values) => onColumnFilterChange("payment", values)}
                  />
                </th>
                {isAccountingAdmin && (
                  <th className={`${thBase} bg-white/80`}>Kiểu TT</th>
                )}
                {isAccountingAdmin && (
                  <th className={`${thBase} bg-sky-50/95`}>Đã nhận TT</th>
                )}
                {isAccountingAdmin && (
                  <th
                    className={`${thBase} sticky right-[220px] z-40 border-l-2 border-sky-400 bg-white/95 shadow-[inset_2px_0_0_rgba(56,189,248,0.55),-1px_0_0_rgba(186,230,253,0.9)]`}
                  >
                    Giá cost
                  </th>
                )}
                <th
                  className={`${thBase} ${isAccountingAdmin ? "sticky right-[110px] z-40 bg-sky-50/95 shadow-[-1px_0_0_rgba(186,230,253,0.9)]" : "bg-sky-50/95"}`}
                >
                  Tiền thu
                </th>
                {isAccountingAdmin && (
                  <th
                    className={`${thBase} sticky right-0 z-40 bg-white/95 shadow-[-1px_0_0_rgba(186,230,253,0.9)]`}
                  >
                    Lợi nhuận
                  </th>
                )}
                {isAdminOrSuper && (
                  <th className={`${thBase} border-r-0 bg-sky-50/95`}>
                    Hành động
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/70">
              {loading && rows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center align-middle text-neutral-500"
                    colSpan={colCount}
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center align-middle text-neutral-500"
                    colSpan={colCount}
                  >
                    Chưa có dữ liệu.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <CasesTableRow
                    key={r._id}
                    row={r}
                    index={idx}
                    isPinned={pinnedIds.includes(r._id)}
                    isActive={activeRowId === r._id}
                    isAccountingAdmin={isAccountingAdmin}
                    isAdminOrSuper={isAdminOrSuper}
                    copiedCaseId={copiedCaseId}
                    onRowClick={(row) => {
                      setActiveRowId(row._id);
                      onRowClick(row);
                    }}
                    onTogglePin={togglePin}
                    onCopyCaseCode={handleCopyCaseCode}
                    onQuickPaidChange={onQuickPaidChange}
                    onOpenHistory={handleOpenHistory}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-sky-100 bg-sky-50/50 px-4 py-1 text-[11px] text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-center lg:min-w-[140px] lg:text-left">
            Tổng: <b className="text-slate-900">{totalRows}</b>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1">
            {totalRows > 0 &&
              paginationItems.map((item, index) => {
                if (item === "prev-ellipsis") {
                  return (
                    <button
                      key={`prev-${index}`}
                      type="button"
                      onClick={() => onPageChange(Math.max(page - 3, 1))}
                      className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-sky-100 bg-white px-2 text-[11px] font-semibold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    >
                      ...
                    </button>
                  );
                }

                if (item === "next-ellipsis") {
                  return (
                    <button
                      key={`next-${index}`}
                      type="button"
                      onClick={() => onPageChange(Math.min(page + 3, totalPages))}
                      className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-sky-100 bg-white px-2 text-[11px] font-semibold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    >
                      ...
                    </button>
                  );
                }

                const isActivePage = item === page;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onPageChange(item)}
                    className={`inline-flex h-7 min-w-7 cursor-pointer items-center justify-center rounded-md border px-2 text-[11px] font-semibold transition ${
                      isActivePage
                        ? "border-sky-300 bg-sky-500 text-white shadow-sm"
                        : "border-sky-100 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
          </div>

          <div className="hidden flex-wrap items-center justify-end gap-x-3 gap-y-1 font-medium text-neutral-500 lg:flex">
            <div
              className="flex items-center gap-1"
              title="Còn hơn 24 giờ nữa mới đến hạn"
            >
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              &gt;24h
            </div>
            <div className="flex items-center gap-1" title="Chỉ còn dưới 24 giờ">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              &lt;24h
            </div>
            <div
              className="flex items-center gap-1"
              title="Gấp: chỉ còn dưới 12 giờ"
            >
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              &lt;12h
            </div>
            <div className="flex items-center gap-1" title="Đã trễ hạn trả kết quả">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Quá hạn
            </div>
            <div className="flex items-center gap-1" title="Trạng thái đã có kết quả">
              <span className="h-2 w-2 rounded-full bg-white ring-1 ring-black/20"></span>
              Đã có KQ
            </div>
          </div>
        </div>
      </div>

      <CasesTablePrint printRef={printRef} printData={printData} />

      <CasesTableHistoryDrawer
        open={historyModalOpen}
        patientName={selectedCaseInfo.patientName}
        changes={selectedCaseInfo.changes}
        onClose={() => setHistoryModalOpen(false)}
      />
    </>
  );
}
