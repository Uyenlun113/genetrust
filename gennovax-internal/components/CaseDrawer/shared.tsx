"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

type Tone = "slate" | "blue" | "rose" | "sky";

export function Select({
  value,
  onChange,
  items,
  placeholder,
  tone = "slate",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { label: string; value: string }[];
  placeholder?: string;
  tone?: Tone;
  disabled?: boolean;
}) {
  const toneCls: Record<Tone, string> = {
    slate: "border-slate-200 focus:border-sky-300 focus:ring-sky-100",
    blue: "border-sky-200 focus:border-sky-300 focus:ring-sky-100",
    rose: "border-rose-200 focus:border-rose-300 focus:ring-rose-100",
    sky: "border-sky-200 focus:border-sky-300 focus:ring-sky-100",
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "w-full rounded-2xl border bg-slate-50 px-3.5 py-2.5 text-[12px] shadow-sm outline-none transition",
        "focus:ring-4 focus:ring-offset-0",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-neutral-500",
        toneCls[tone],
      )}
    >
      <option value="">{placeholder ?? "Chọn..."}</option>
      {items.map((it) => (
        <option key={it.value} value={it.value}>
          {it.label}
        </option>
      ))}
    </select>
  );
}

export function SearchableSelect({
  value,
  onChange,
  items,
  placeholder,
  tone = "slate",
  disabled = false,
  emptyText = "Không tìm thấy dữ liệu",
  dropdownClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { label: string; value: string }[];
  placeholder?: string;
  tone?: Tone;
  disabled?: boolean;
  emptyText?: string;
  dropdownClassName?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const toneCls: Record<Tone, string> = {
    slate: "border-slate-200 focus:border-sky-300 focus:ring-sky-100",
    blue: "border-sky-200 focus:border-sky-300 focus:ring-sky-100",
    rose: "border-rose-200 focus:border-rose-300 focus:ring-rose-100",
    sky: "border-sky-200 focus:border-sky-300 focus:ring-sky-100",
  };

  const selectedLabel =
    items.find((item) => item.value === value)?.label || value || "";

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(selectedLabel);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, selectedLabel]);

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) =>
      `${item.label} ${item.value}`.toLowerCase().includes(keyword),
    );
  }, [items, query]);

  const commit = (nextValue: string) => {
    const nextLabel =
      items.find((item) => item.value === nextValue)?.label || nextValue;

    onChange(nextValue);
    setQuery(nextLabel);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        value={open ? query : selectedLabel}
        onFocus={() => {
          if (disabled) return;
          setQuery(selectedLabel);
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setQuery(selectedLabel);
            return;
          }

          if (e.key === "Enter" && filteredItems[0]) {
            e.preventDefault();
            commit(filteredItems[0].value);
          }
        }}
        disabled={disabled}
        placeholder={placeholder ?? "Chọn..."}
        className={cn(
          "w-full rounded-2xl border bg-slate-50 px-3.5 py-2.5 text-[12px] shadow-sm outline-none transition",
          "focus:ring-4 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-neutral-500",
          toneCls[tone],
        )}
      />

      {open && !disabled && (
        <div
          className={cn(
            "absolute left-0 right-0 z-[80] mt-1 max-h-64 overflow-auto rounded-2xl border border-sky-100 bg-white p-1 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)]",
            dropdownClassName,
          )}
        >
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <button
                key={item.value}
                type="button"
                className={cn(
                  "block w-full rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-neutral-700 hover:bg-sky-50 hover:text-sky-700",
                  item.value === value && "bg-sky-50 text-sky-700",
                )}
                onClick={() => commit(item.value)}
              >
                {item.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-[12px] font-semibold text-neutral-400">
              {emptyText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const isRequired = label.includes("*");

  return (
    <div className="min-w-0">
      <div className="mb-1.5 text-[11px] font-semibold tracking-[0.14em] text-slate-400">
        {isRequired ? <span className="text-red-600">{label}</span> : label}
      </div>
      {children}
    </div>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  tone = "slate",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tone?: Tone;
  disabled?: boolean;
}) {
  const toneCls: Record<Tone, string> = {
    slate: "border-slate-200 focus:border-sky-300 focus:ring-sky-100",
    blue: "border-sky-200 focus:border-sky-300 focus:ring-sky-100",
    rose: "border-rose-200 focus:border-rose-300 focus:ring-rose-100",
    sky: "border-sky-200 focus:border-sky-300 focus:ring-sky-100",
  };

  return (
    <input
      className={cn(
        "w-full rounded-2xl border bg-slate-50 px-3.5 py-2.5 text-[12px] shadow-sm outline-none transition",
        "focus:ring-4",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-neutral-500",
        toneCls[tone],
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  tone = "slate",
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tone?: Tone;
  rows?: number;
}) {
  const toneCls: Record<Tone, string> = {
    slate: "border-slate-200 focus:border-sky-300 focus:ring-sky-100",
    blue: "border-sky-200 focus:border-sky-300 focus:ring-sky-100",
    rose: "border-rose-200 focus:border-rose-300 focus:ring-rose-100",
    sky: "border-sky-200 focus:border-sky-300 focus:ring-sky-100",
  };

  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full rounded-2xl border bg-slate-50 px-3.5 py-2.5 text-[12px] shadow-sm outline-none transition",
        "focus:ring-4",
        toneCls[tone],
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export function fmtMoney(v: number) {
  return (v ?? 0).toLocaleString("vi-VN");
}

export function parseMoneyInput(value: string) {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

export function nowVNISOString() {
  return new Date().toISOString();
}

export function addHoursISO(iso: string, hours: number) {
  const d = new Date(iso);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export function isoDateFromISODateTime(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function isoDateTimeFromISODate(date: string) {
  if (!date) return null;
  return new Date(`${date}T00:00:00+07:00`).toISOString();
}
