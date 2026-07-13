"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import SingleDatePicker from "@/components/share/DatePicker";
import { api } from "@/lib/api";
import type { CaseRecord, CaseServiceGroup } from "@/lib/types";

const serviceMeta: Record<
  CaseServiceGroup,
  { title: string; pill: string; accent: string }
> = {
  ADN: {
    title: "ADN",
    pill: "bg-blue-600 text-white",
    accent: "text-blue-700",
  },
  ALL: {
    title: "Tất cả",
    pill: "bg-slate-700 text-white",
    accent: "text-slate-700",
  },
  NIPT: {
    title: "NIPT",
    pill: "bg-rose-600 text-white",
    accent: "text-rose-700",
  },
  "Sàng Lọc UTCTC": {
    title: "Sàng Lọc UTCTC",
    pill: "bg-emerald-600 text-white",
    accent: "text-emerald-700",
  },
  "Sinh Hóa": {
    title: "Sinh Hóa",
    pill: "bg-orange-600 text-white",
    accent: "text-orange-700",
  },
  "XN Khác": {
    title: "XN Khác",
    pill: "bg-violet-600 text-white",
    accent: "text-violet-700",
  },
};

function formatLocalMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function CasesHeader(props: {
  serviceType: CaseServiceGroup;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  q: string;
  setQ: (v: string) => void;
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  loading?: boolean;
  onAdd: () => void;
  onApply: () => void;
}) {
  const meta = serviceMeta[props.serviceType];
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMode, setExportMode] = useState<"month" | "range">("month");
  const [exportMonth, setExportMonth] = useState(formatLocalMonth(new Date()));
  const [exportFrom, setExportFrom] = useState(props.from);
  const [exportTo, setExportTo] = useState(props.to);
  const [isExporting, setIsExporting] = useState(false);
  const exportPageSize = 10000;

  const handleExport = async () => {
    let fetchFrom: string | undefined;
    let fetchTo: string | undefined;

    if (exportMode === "month") {
      if (!exportMonth) return;
      const [year, month] = exportMonth.split("-");
      const lastDay = new Date(Number(year), Number(month), 0).getDate();
      fetchFrom = `${year}-${month}-01`;
      fetchTo = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    } else {
      if (!exportFrom || !exportTo) {
        alert("Vui lòng chọn đầy đủ từ ngày và đến ngày để xuất Excel!");
        return;
      }

      if (exportFrom > exportTo) {
        alert("Từ ngày không được lớn hơn đến ngày!");
        return;
      }

      fetchFrom = exportFrom;
      fetchTo = exportTo;
    }

    setIsExporting(true);
    try {

      const data: CaseRecord[] = [];
      let page = 1;
      let total = 0;

      do {
        const res = await api.cases({
          serviceType: "ALL",
          from: fetchFrom,
          to: fetchTo,
          page,
          limit: exportPageSize,
        });

        data.push(...res.items);
        total = res.total || 0;
        page += 1;
      } while (data.length < total);

      if (!data || data.length === 0) {
        alert("Không có dữ liệu nào trong khoảng thời gian này để xuất!");
        return;
      }

      const excelData = data.map((item, index) => ({
        STT: item.stt || index + 1,
        "Ngày nhận mẫu": item.receivedAt
          ? new Date(item.receivedAt).toLocaleString("vi-VN")
          : "",
        "Mã ca": item.caseCode || "",
        "Tên khách hàng": item.patientName || "",
        SĐT: item.patientPhone || "",
        "Loại hóa đơn":
          item.invoiceType === "personal"
            ? "Cá nhân"
            : item.invoiceType === "company"
              ? "Công ty"
              : "",
        "Ngày xuất": item.invoiceIssuedAt || "",
        MST: item.invoiceTaxCode || "",
        "Tên công ty/khách hàng": item.invoiceName || "",
        "Số CCCD/CMND": item.invoiceIdCard || "",
        "Ngày cấp": item.invoiceIssueDate || "",
        "Nơi cấp": item.invoiceIssuePlace || "",
        "Địa chỉ": item.invoiceAddress || "",
        "Nhóm dịch vụ": item.serviceType || "",
        "Tên dịch vụ": item.serviceName || "",
        "Mã dịch vụ": item.serviceCode || "",
        "Phòng Lab": item.lab || "",
        "Nguồn khách": item.source || "",
        "NVKD phụ trách": item.salesOwner || "",
        "Người thu mẫu": item.sampleCollector || "",
        "Trạng thái": item.processStatus || "",
        "Giá thu (VNĐ)": item.collectedAmount || 0,
        "Giá vốn/Cost (VNĐ)": item.costPrice || 0,
        "Phí vận chuyển (VNĐ)": item.shippingFee || 0,
        "Lợi nhuận (VNĐ)":
          (item.collectedAmount || 0) -
          (item.costPrice || 0) -
          (item.shippingFee || 0),
        "Đã thanh toán": item.paid ? "Đã thanh toán" : "Chưa thanh toán",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachCa");
      const exportLabel =
        exportMode === "month" ? exportMonth : `${fetchFrom}_${fetchTo}`;
      const fileName = `TongHop_TatCaDichVu_${exportLabel}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại!");
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  return (
    <>
    <div className="sticky top-0 z-10 border-b border-sky-100/80 bg-white/80 shadow-[0_10px_32px_-24px_rgba(14,165,233,0.75)] backdrop-blur">
      <div className="px-4 py-3">
        <div className="grid grid-cols-1 items-center gap-2 xl:grid-cols-[auto_minmax(280px,1fr)_auto]">
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={props.onToggleSidebar}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-700 shadow-[0_8px_20px_-14px_rgba(14,165,233,0.75)] transition hover:border-sky-300 hover:bg-sky-50"
              title={props.sidebarOpen ? "Ẩn sidebar bộ lọc" : "Hiện sidebar bộ lọc"}
            >
              <svg
                className={`h-4 w-4 transition-transform ${props.sidebarOpen ? "" : "rotate-180"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span
              className={`inline-flex h-9 items-center rounded-xl px-3 text-[11px] font-bold uppercase tracking-wider shadow-[0_8px_20px_-14px_rgba(14,165,233,0.75)] ${meta.pill}`}
            >
              {meta.title}
            </span>

            <div className="flex h-9 items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-100/80 p-1">
              <SingleDatePicker
                value={props.from}
                onChange={props.setFrom}
                placeholder="Từ ngày"
                disabled={!!props.loading}
                popoverWidth="lg"
                months={1}
                popoverClassName="left-0 right-auto"
                buttonClassName="h-7 w-[88px] cursor-pointer border-none bg-white text-[11px] shadow-[0_6px_16px_-12px_rgba(14,165,233,0.8)]"
              />
              <span className="px-0.5 text-[9px] font-bold text-neutral-400">
                →
              </span>
              <SingleDatePicker
                value={props.to}
                onChange={props.setTo}
                placeholder="Đến ngày"
                disabled={!!props.loading}
                popoverWidth="lg"
                months={1}
                popoverClassName="left-0 right-auto"
                buttonClassName="h-7 w-[88px] cursor-pointer border-none bg-white text-[11px] shadow-[0_6px_16px_-12px_rgba(14,165,233,0.8)]"
              />
              <button
                onClick={props.onApply}
                disabled={props.loading}
                className="ml-0.5 h-7 cursor-pointer rounded-lg bg-sky-600 px-3 text-[11px] font-semibold text-white shadow-[0_8px_18px_-12px_rgba(14,165,233,0.85)] transition-colors hover:bg-sky-500 disabled:opacity-50"
              >
                {props.loading ? "..." : "Lọc"}
              </button>
            </div>

          </div>

          <div className="flex min-w-[240px] justify-start xl:justify-center">
            <div className="group relative w-full max-w-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-3.5 w-3.5 text-neutral-400 transition-colors group-focus-within:text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                value={props.q}
                onChange={(event) => props.setQ(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (!props.loading) props.onApply();
                  }
                }}
                placeholder="Tìm mã ca, tên, nguồn..."
                className="h-9 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-9 pr-3 text-[12px] text-neutral-800 shadow-[0_6px_18px_-12px_rgba(14,165,233,0.75)] outline-none transition-all placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_8px_24px_-14px_rgba(14,165,233,0.9)]"
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 lg:flex-nowrap xl:justify-end">

            <div className="flex items-center gap-1.5">
              <button
                onClick={props.onAdd}
                className="flex h-9 cursor-pointer items-center gap-1 rounded-xl bg-sky-600 px-3 text-[11px] font-semibold text-white shadow-[0_10px_24px_-16px_rgba(14,165,233,0.9)] transition-opacity hover:bg-sky-500 hover:opacity-90"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Thêm ca
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setExportFrom(props.from);
                    setExportTo(props.to);
                    setShowExportModal(true);
                  }}
                  disabled={isExporting}
                  className="flex h-9 cursor-pointer items-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-3 text-[11px] font-semibold text-sky-700 shadow-[0_10px_24px_-18px_rgba(14,165,233,0.75)] transition-colors hover:bg-sky-100 disabled:opacity-60"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {isExporting ? "Đang xử lý..." : "Xuất Excel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {showExportModal &&
      typeof document !== "undefined" &&
      createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-4 shadow-2xl shadow-sky-900/15">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Xuất Excel
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Chọn khoảng dữ liệu cần xuất
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              disabled={isExporting}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 transition hover:bg-sky-100 disabled:opacity-60"
              aria-label="Đóng"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-sky-100 bg-sky-50 p-1">
            <button
              type="button"
              onClick={() => setExportMode("month")}
              className={`h-9 rounded-lg text-xs font-semibold transition ${
                exportMode === "month"
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-500 hover:text-sky-700"
              }`}
            >
              Theo tháng
            </button>
            <button
              type="button"
              onClick={() => setExportMode("range")}
              className={`h-9 rounded-lg text-xs font-semibold transition ${
                exportMode === "range"
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-500 hover:text-sky-700"
              }`}
            >
              Theo khoảng ngày
            </button>
          </div>

          {exportMode === "month" ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Chọn tháng
              </label>
              <input
                type="month"
                value={exportMonth}
                onChange={(event) => setExportMonth(event.target.value)}
                className="h-10 w-full rounded-xl border border-sky-100 bg-sky-50/60 px-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Từ ngày
                </label>
                <SingleDatePicker
                  value={exportFrom}
                  onChange={setExportFrom}
                  placeholder="Từ ngày"
                  disabled={isExporting}
                  popoverWidth="lg"
                  months={1}
                  popoverClassName="left-auto right-[calc(100%+0.5rem)] top-1/2 mt-0 -translate-y-1/2"
                  buttonClassName="h-10 w-full cursor-pointer justify-between rounded-xl border-sky-100 bg-sky-50/60 px-3 text-sm shadow-none hover:bg-sky-50 focus:ring-sky-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Đến ngày
                </label>
                <SingleDatePicker
                  value={exportTo}
                  onChange={setExportTo}
                  placeholder="Đến ngày"
                  disabled={isExporting}
                  popoverWidth="lg"
                  months={1}
                  popoverClassName="left-auto right-[calc(100%+0.5rem)] top-1/2 mt-0 -translate-y-1/2"
                  buttonClassName="h-10 w-full cursor-pointer justify-between rounded-xl border-sky-100 bg-sky-50/60 px-3 text-sm shadow-none hover:bg-sky-50 focus:ring-sky-200"
                />
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              disabled={isExporting}
              className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={
                isExporting ||
                (exportMode === "month" ? !exportMonth : !exportFrom || !exportTo)
              }
              className="h-9 rounded-xl bg-sky-600 px-4 text-xs font-semibold text-white shadow-[0_10px_24px_-16px_rgba(14,165,233,0.9)] transition hover:bg-sky-500 disabled:opacity-60"
            >
              {isExporting ? "Đang xử lý..." : "Xuất Excel"}
            </button>
          </div>
        </div>
      </div>
    , document.body)}
    </>
  );
}
