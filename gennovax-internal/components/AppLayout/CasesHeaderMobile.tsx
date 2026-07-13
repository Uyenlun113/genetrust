"use client";

import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { api } from "@/lib/api";
import type { CaseRecord, CaseServiceGroup } from "@/lib/types";

const serviceOptions: Array<{ label: string; value: CaseServiceGroup }> = [
  { label: "NIPT", value: "NIPT" },
  { label: "ADN", value: "ADN" },
  { label: "SL UTCTC", value: "Sàng Lọc UTCTC" },
  { label: "Sinh Hóa", value: "Sinh Hóa" },
  { label: "XN Khác", value: "XN Khác" },
  { label: "Tất cả", value: "ALL" },
];

function formatLocalMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

interface MobileHeaderProps {
  serviceType: CaseServiceGroup;
  setServiceType: (v: CaseServiceGroup) => void;
  q: string;
  setQ: (v: string) => void;
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  loading?: boolean;
  onAdd: () => void;
  onApply: () => void;
}

export default function CasesHeaderMobile(props: MobileHeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportMonth, setExportMonth] = useState(formatLocalMonth(new Date()));
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const exportPageSize = 10000;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (type: "all" | "month") => {
    setIsExporting(true);
    try {
      let fetchFrom = undefined;
      let fetchTo = undefined;

      if (type === "month" && exportMonth) {
        const [year, month] = exportMonth.split("-");
        const lastDay = new Date(
          Number(year),
          Number(month),
          0,
        ).getDate();
        fetchFrom = `${year}-${month}-01`;
        fetchTo = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
      }

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

      const excelData = data.map((item, index: number) => ({
        STT: item.stt || index + 1,
        "Ngày tạo": item.date
          ? new Date(item.date).toLocaleDateString("vi-VN")
          : "",
        "Mã ca": item.caseCode || "",
        "Tên bệnh nhân": item.patientName || "",
        SĐT: item.patientPhone || "",
        "Loại hóa đơn":
          item.invoiceType === "personal"
            ? "Cá nhân"
            : item.invoiceType === "company"
              ? "Công ty"
              : "",
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
      const fileName = `TongHop_TatCaDichVu_${type === "month" ? exportMonth : "TatCa"}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại!");
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  return (
    <div className="sticky top-0 z-40 border-b bg-white/95 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight text-neutral-900">
              Danh sách ca
            </h1>
            <div className="mt-0.5 text-[11px] font-medium text-neutral-500">
              Nhóm dịch vụ: {props.serviceType === "ALL" ? "Tất cả" : props.serviceType}
            </div>
          </div>
          <div className="relative flex items-center gap-2" ref={menuRef}>
            <button
              onClick={() => setShowExportMenu((current) => !current)}
              disabled={isExporting}
              className="rounded-xl border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 disabled:opacity-60"
            >
              {isExporting ? "..." : "Xuất"}
            </button>
            <button
              onClick={props.onAdd}
              className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:opacity-95 active:scale-95"
            >
              + Thêm
            </button>

            {showExportMenu && !isExporting && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/10">
                <button
                  onClick={() => handleExport("all")}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Xuất toàn bộ dữ liệu
                </button>
                <div className="my-2 border-t border-black/5" />
                <div className="px-3">
                  <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
                    Xuất theo tháng:
                  </label>
                  <input
                    type="month"
                    value={exportMonth}
                    onChange={(event) => setExportMonth(event.target.value)}
                    className="mb-2 w-full rounded-xl border border-black/10 bg-neutral-50 px-3 py-1.5 text-sm outline-none"
                  />
                  <button
                    onClick={() => handleExport("month")}
                    disabled={!exportMonth}
                    className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Tải tháng này
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {serviceOptions.map((option) => {
            const active = props.serviceType === option.value;
            return (
              <button
                key={option.value}
                onClick={() => props.setServiceType(option.value)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-all active:scale-95 ${
                  active
                    ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md"
                    : "border-black/10 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
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
          placeholder="Tìm mã ca, tên KH, nguồn..."
          className="w-full rounded-xl border border-black/10 bg-neutral-50 px-3 py-2 text-[13px] text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-indigo-300"
        />
      </div>
    </div>
  );
}
