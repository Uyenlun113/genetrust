"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import LoadingOverlay from "@/components/share/LoadingOverlay";

type OptionItem = {
  label: string;
  value: string;
  isActive?: boolean;
  order?: number;
};

type OptionDoc = {
  _id: string;
  key: string;
  name?: string;
  items: OptionItem[];
};

function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function keyTone(active: boolean) {
  return active
    ? "bg-sky-50 ring-1 ring-sky-200 shadow-sm"
    : "bg-white ring-1 ring-slate-200 hover:bg-sky-50/40";
}

function activePill(on: boolean) {
  return on
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-slate-100 text-slate-500 ring-slate-200";
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminOptionsPage() {
  const { user, isAdmin } = useAuth();

  const [docs, setDocs] = useState<OptionDoc[]>([]);
  const [activeKey, setActiveKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [newItem, setNewItem] = useState<OptionItem>({
    label: "",
    value: "",
    order: 0,
    isActive: true,
  });

  const active = useMemo(
    () => docs.find((d) => d.key === activeKey) || null,
    [docs, activeKey],
  );

  const sortedItems = useMemo(
    () =>
      (active?.items || [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [active],
  );

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await api.optionsAdminList();
      setDocs(res.items as OptionDoc[]);
      setActiveKey((prev) => prev || (res.items?.[0]?.key ?? ""));
    } catch (e: unknown) {
      setErr(errorMessage(e, "Load failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (active) setEditName(active.name || active.key);
  }, [active]);

  const addKey = async () => {
    setErr(null);
    try {
      if (!isAdmin) throw new Error("Chỉ admin được phép.");
      const key = newKey.trim();
      const name = newName.trim();
      if (!key || !name) throw new Error("Cần nhập cả key và tên hiển thị.");

      await api.optionsAdminCreateKey({ key, name });
      setNewKey("");
      setNewName("");
      await load();
      setActiveKey(key);
    } catch (e: unknown) {
      setErr(errorMessage(e, "Tạo danh mục thất bại"));
    }
  };

  const updateKeyName = async () => {
    setErr(null);
    try {
      if (!isAdmin) throw new Error("Chỉ admin được phép.");
      if (!activeKey) return;
      const name = editName.trim();
      if (!name) throw new Error("Tên không được để trống.");

      await api.optionsAdminUpdateKey(activeKey, name);
      await load();
    } catch (e: unknown) {
      setErr(errorMessage(e, "Cập nhật tên thất bại"));
    }
  };

  const addItem = async () => {
    setErr(null);
    try {
      if (!isAdmin) throw new Error("Chỉ admin được phép.");
      if (!activeKey) throw new Error("Chọn danh mục trước.");
      if (!newItem.label.trim() || !newItem.value.trim()) {
        throw new Error("Cần nhập nhãn và giá trị.");
      }

      await api.optionsAdminAddItem(activeKey, {
        label: newItem.label.trim(),
        value: newItem.value.trim(),
        order: Number(newItem.order || 0),
        isActive: newItem.isActive !== false,
      });

      setNewItem({ label: "", value: "", order: 0, isActive: true });
      await load();
    } catch (e: unknown) {
      setErr(errorMessage(e, "Thêm item thất bại"));
    }
  };

  const patchItem = async (value: string, patch: Partial<OptionItem>) => {
    setErr(null);
    try {
      if (!isAdmin) throw new Error("Chỉ admin được phép.");
      await api.optionsAdminPatchItem(activeKey, value, patch);
      await load();
    } catch (e: unknown) {
      setErr(errorMessage(e, "Update item failed"));
    }
  };

  const delItem = async (value: string) => {
    setErr(null);
    try {
      if (!isAdmin) throw new Error("Chỉ admin được phép.");
      await api.optionsAdminDeleteItem(activeKey, value);
      await load();
    } catch (e: unknown) {
      setErr(errorMessage(e, "Delete item failed"));
    }
  };

  const delKey = async () => {
    setErr(null);
    try {
      if (!isAdmin) throw new Error("Chỉ admin được phép.");
      if (!activeKey) return;
      const ok = window.confirm(
        `Bạn có chắc muốn xóa toàn bộ danh mục "${active?.name || activeKey}" không?`,
      );
      if (!ok) return;

      await api.optionsAdminDeleteKey(activeKey);
      setActiveKey("");
      await load();
    } catch (e: unknown) {
      setErr(errorMessage(e, "Delete key failed"));
    }
  };

  if (!user) return <div className="p-6">Bạn chưa đăng nhập.</div>;

  return (
    <div className="min-h-[calc(100vh-96px)] bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_36%,#ffffff_100%)]">
      {loading && <LoadingOverlay isLoading={loading} />}

      <div className="mx-auto max-w-[90%] space-y-6 p-4 sm:p-6">
        <section className="overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-[0_24px_80px_-48px_rgba(14,116,144,0.45)]">
          <div className="flex flex-col gap-5 bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#ffffff_50%)] p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-sky-700 sm:text-3xl">
                  Quản lý Options
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
                    isAdmin
                      ? "bg-sky-50 text-sky-700 ring-sky-200"
                      : "bg-slate-100 text-slate-600 ring-slate-200",
                  )}
                >
                  {isAdmin ? "Admin" : "Read-only"}
                </span>
              </div>
            </div>

            <button
              onClick={load}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              Tải lại
            </button>
          </div>

          {err && (
            <div className="border-t border-rose-100 bg-rose-50/80 px-5 py-3 text-sm font-medium text-rose-700 sm:px-6">
              {err}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Các danh mục
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {loading ? "Đang tải..." : `${docs.length} danh mục`}
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
                Meta
              </span>
            </div>

            <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">
                Tạo danh mục mới
              </div>
              <div className="flex flex-col gap-2">
                <input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Mã key (vd: labs, sources)"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
                <div className="flex gap-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Tên hiển thị"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    onClick={addKey}
                    disabled={!isAdmin}
                    className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Tạo"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {loading ? (
                <div className="text-sm text-slate-500">Đang tải...</div>
              ) : docs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  Chưa có dữ liệu
                </div>
              ) : (
                docs.map((doc) => {
                  const isActive = doc.key === activeKey;
                  return (
                    <button
                      key={doc.key}
                      onClick={() => {
                        setActiveKey(doc.key);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={cn(
                        "w-full rounded-[24px] px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70",
                        keyTone(isActive),
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-semibold text-slate-900">
                            {doc.name || doc.key}
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-slate-500">
                            Mã: {doc.key} • {doc.items?.length || 0} items
                          </div>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1",
                            isActive
                              ? "bg-sky-100 text-sky-700 ring-sky-200"
                              : "bg-slate-100 text-slate-600 ring-slate-200",
                          )}
                        >
                          {isActive ? "Đang mở" : "Mở"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={delKey}
                disabled={!activeKey || !isAdmin}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-rose-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Xóa toàn bộ danh mục này
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)] sm:p-6 lg:col-span-2">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Giá trị lựa chọn
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {active?.items?.length ?? 0} items, sắp xếp theo order tăng dần
                </div>
              </div>

              {activeKey && (
                <div className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 p-2 shadow-sm">
                  <span className="ml-2 text-[11px] font-semibold text-sky-700">
                    Đổi tên:
                  </span>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  />
                  <button
                    onClick={updateKeyName}
                    disabled={!isAdmin}
                    className="inline-flex h-9 items-center rounded-xl bg-sky-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>

            <div className="mt-2 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">
                  Thêm lựa chọn con
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <input
                    type="checkbox"
                    checked={newItem.isActive !== false}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 cursor-pointer accent-sky-600"
                  />
                  Cho phép hiển thị
                </label>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
                <input
                  value={newItem.label}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder="Tên: (vd: Cấp 1)"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
                <input
                  value={newItem.value}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, value: e.target.value }))
                  }
                  placeholder="Giá trị: (vd: cap1)"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-3 font-mono text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
                <input
                  value={String(newItem.order || 0)}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      order: Number(e.target.value || 0),
                    }))
                  }
                  placeholder="Thứ tự"
                  inputMode="numeric"
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
                <button
                  onClick={addItem}
                  disabled={!activeKey || !isAdmin}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  + Thêm
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <SkeletonList />
              ) : !activeKey ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Hãy chọn 1 danh mục ở cột bên trái để quản lý lựa chọn.
                </div>
              ) : sortedItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Danh mục này chưa có lựa chọn nào. Hãy thêm ở form trên.
                </div>
              ) : (
                sortedItems.map((item) => {
                  const on = item.isActive !== false;
                  return (
                    <div
                      key={item.value}
                      className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-100 hover:bg-sky-50/30"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="truncate text-base font-semibold text-slate-900">
                              {item.label}
                            </div>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                              {item.value}
                            </span>
                            
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa lựa chọn "${item.label}"?`)) {
                                void delItem(item.value);
                              }
                            }}
                            disabled={!isAdmin}
                            className="inline-flex h-9 cursor-pointer items-center rounded-xl bg-rose-500 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[24px] border border-slate-200 bg-white p-4"
        >
          <div className="h-4 w-2/3 rounded bg-slate-100" />
          <div className="mt-3 h-3 w-1/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
