import type {
  CaseRecord,
  CasesListResponse,
  OptionsMap,
  ServiceType,
  DoctorItem,
  CatalogServiceItem,
  DoctorCatalogServiceRow,
  DoctorRevenueAnalyticsResponse,
  CaseServiceGroup,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";
const LS_TOKEN = "genno_token";
const LS_USER = "genno_user";

export type Role =
  | "admin"
  | "staff"
  | "super_admin"
  | "accounting_admin"
  | "sales";

export type LoginResponse = {
  token: string;
  user: { id: string; name: string; email: string; role: Role };
};

export type PasswordResetRequestState = {
  status: "idle" | "pending" | "completed";
  requestedAt?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: {
    id?: string | null;
    name?: string | null;
    role?: string | null;
  } | null;
};

type CasesAnalyticsResponse = {
  kpis: {
    totalCases: number;
    paidCases: number;
    totalRevenue: number;
    totalCost: number;
    totalNetRevenue: number;
    paidRate: number;
  };
  monthlyTrend: Array<{
    ym: string;
    revenue: number;
    cost: number;
    netRevenue: number;
    cases: number;
  }>;
  bySource: Array<{
    source: string;
    revenue: number;
    cost: number;
    netRevenue: number;
    cases: number;
  }>;
  byService: Array<{
    serviceName: string;
    serviceCode: string;
    revenue: number;
    cost: number;
    netRevenue: number;
    cases: number;
  }>;
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_TOKEN) || "";
}

function clearAuthAndRedirect() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_USER);

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let errorMessage = text || `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      if (json?.message) errorMessage = json.message;
    } catch {}

    if (res.status === 401) {
      clearAuthAndRedirect();
      if (!text || text.trim() === "Unauthorized") {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
      }
    }

    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}

async function parseMessageResponse<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }

    const err = await res.json().catch(() => ({} as { message?: string }));
    throw new Error(err.message || fallbackMessage);
  }

  return res.json() as Promise<T>;
}

function buildQuery(params: Record<string, unknown>) {
  return new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) acc[key] = value.join(",");
          return acc;
        }

        if (value !== undefined && value !== "") {
          acc[key] = String(value);
        }

        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();
}

async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

const authApi = {
  login: (payload: { email: string; password: string }) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseJsonResponse<LoginResponse>(r)),

  forgotPasswordRequest: (payload: { email: string }) =>
    fetch(`${API_BASE}/auth/forgot-password-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) =>
      parseJsonResponse<{
        status: "created" | "pending";
        requestedAt?: string | null;
        message: string;
      }>(r),
    ),

  me: (token: string) =>
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => parseJsonResponse<LoginResponse["user"]>(r)),

  updateProfile: (payload: {
    name?: string;
    oldPassword?: string;
    newPassword?: string;
  }) =>
    authFetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseMessageResponse(r, "Lỗi cập nhật")),
};

const metaApi = {
  options: () =>
    authFetch(`${API_BASE}/meta/options`).then((r) =>
      parseJsonResponse<OptionsMap>(r),
    ),
};

const casesApi = {
  list: (params: {
    serviceType: CaseServiceGroup | "";
    q?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
    dateSort?: "newest" | "oldest";
    processStatus?: string[];
    mailStatus?: string[];
    source?: string[];
    salesOwner?: string[];
    payment?: string[];
  }) => {
    const qs = buildQuery(params);
    return authFetch(`${API_BASE}/cases?${qs}`).then((r) =>
      parseJsonResponse<CasesListResponse>(r),
    );
  },

  create: (payload: any) =>
    authFetch(`${API_BASE}/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseJsonResponse<CaseRecord>(r)),

  update: (id: string, patch: any) =>
    authFetch(`${API_BASE}/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then((r) => parseJsonResponse<CaseRecord>(r)),

  remove: (id: string) =>
    authFetch(`${API_BASE}/cases/${id}`, {
      method: "DELETE",
    }).then((r) => parseJsonResponse<{ ok: boolean }>(r)),

  startMailTracking: (id: string, mailTrackingCode: string) =>
    authFetch(`${API_BASE}/cases/${id}/mail-tracking/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mailTrackingCode }),
    }).then((r) => parseJsonResponse<CaseRecord>(r)),

  checkMailTracking: (id: string, mailTrackingCode?: string) =>
    authFetch(`${API_BASE}/cases/${id}/mail-tracking/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mailTrackingCode }),
    }).then((r) => parseJsonResponse<CaseRecord>(r)),

  stopMailTracking: (id: string) =>
    authFetch(`${API_BASE}/cases/${id}/mail-tracking/stop`, {
      method: "POST",
    }).then((r) => parseJsonResponse<CaseRecord>(r)),

  analytics: (params: {
    serviceType?: string;
    month?: string;
  }) => {
    const qs = buildQuery(params);
    return authFetch(`${API_BASE}/cases/analytics?${qs}`).then((r) =>
      parseJsonResponse<CasesAnalyticsResponse>(r),
    );
  },

  uploadFile: async (file: File, caseCode: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caseCode", caseCode);

    const token = getToken();
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) throw new Error("Upload thất bại");
    return res.json();
  },

  deleteFileMinio: (fileUrl: string) =>
    authFetch(`${API_BASE}/upload/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    }).then((r) => r.json()),
};

const usersApi = {
  list: () =>
    authFetch(`${API_BASE}/users`).then((r) =>
      parseJsonResponse<{ items: any[] }>(r),
    ),

  create: (payload: any) =>
    authFetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseMessageResponse(r, "Lỗi tạo User")),

  update: (id: string, patch: any) =>
    authFetch(`${API_BASE}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then((r) => parseJsonResponse<any>(r)),

  remove: (id: string) =>
    authFetch(`${API_BASE}/users/${id}`, { method: "DELETE" }).then((r) =>
      parseJsonResponse<{ ok: true }>(r),
    ),

  resolvePasswordReset: (id: string, payload: { newPassword: string }) =>
    authFetch(`${API_BASE}/users/${id}/password-reset/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) =>
      parseJsonResponse<{
        item: any;
        message: string;
      }>(r),
    ),
};

const doctorsApi = {
  list: (search = "", all = false) =>
    authFetch(
      `${API_BASE}/doctors?search=${encodeURIComponent(search)}${all ? "&all=1" : ""}`,
    ).then((r) => parseJsonResponse<{ items: DoctorItem[] }>(r)),

  create: (payload: any) =>
    authFetch(`${API_BASE}/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseJsonResponse<any>(r)),

  get: (id: string) =>
    authFetch(`${API_BASE}/doctors/${id}`).then((r) =>
      parseJsonResponse<any>(r),
    ),

  update: (id: string, patch: any) =>
    authFetch(`${API_BASE}/doctors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then((r) => parseJsonResponse<any>(r)),

  remove: (id: string) =>
    authFetch(`${API_BASE}/doctors/${id}`, { method: "DELETE" }).then((r) =>
      parseJsonResponse<{ ok: true }>(r),
    ),

  services: (id: string) =>
    authFetch(`${API_BASE}/doctors/${id}/services`).then((r) =>
      parseJsonResponse<{ items: DoctorCatalogServiceRow[] }>(r),
    ),

  revenueAnalytics: (params: {
    month?: string;
    serviceType?: ServiceType | "";
    salesOwner?: string;
    limit?: number;
  }) => {
    const qs = buildQuery(params);
    return authFetch(`${API_BASE}/doctors/analytics/revenue?${qs}`).then((r) =>
      parseJsonResponse<DoctorRevenueAnalyticsResponse>(r),
    );
  },

  serviceUpsert: (
    doctorId: string,
    serviceId: string,
    payload: { listPrice: number; netPrice: number },
  ) =>
    authFetch(`${API_BASE}/doctors/${doctorId}/services/${serviceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseJsonResponse<any>(r)),

  serviceDelete: (doctorId: string, serviceId: string) =>
    authFetch(`${API_BASE}/doctors/${doctorId}/services/${serviceId}`, {
      method: "DELETE",
    }).then((r) => parseJsonResponse<{ ok: true }>(r)),
};

const servicesApi = {
  list: (search = "", all = false) =>
    authFetch(
      `${API_BASE}/services?search=${encodeURIComponent(search)}${all ? "&all=1" : ""}`,
    ).then((r) => parseJsonResponse<{ items: CatalogServiceItem[] }>(r)),

  create: (payload: any) =>
    authFetch(`${API_BASE}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseJsonResponse<CatalogServiceItem>(r)),

  update: (id: string, patch: any) =>
    authFetch(`${API_BASE}/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then((r) => parseJsonResponse<CatalogServiceItem>(r)),

  remove: (id: string) =>
    authFetch(`${API_BASE}/services/${id}`, { method: "DELETE" }).then((r) =>
      parseJsonResponse<{ ok: true }>(r),
    ),
};

const optionsAdminApi = {
  list: () =>
    authFetch(`${API_BASE}/meta/options-admin`).then((r) =>
      parseJsonResponse<{ items: any[] }>(r),
    ),

  getKey: (key: string) =>
    authFetch(`${API_BASE}/meta/options-admin/${encodeURIComponent(key)}`).then(
      (r) => parseJsonResponse<any>(r),
    ),

  addItem: (key: string, payload: any) =>
    authFetch(`${API_BASE}/meta/options-admin/${encodeURIComponent(key)}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseJsonResponse<any>(r)),

  patchItem: (key: string, value: string, patch: any) =>
    authFetch(
      `${API_BASE}/meta/options-admin/${encodeURIComponent(key)}/items/${encodeURIComponent(value)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      },
    ).then((r) => parseJsonResponse<any>(r)),

  createKey: (payload: { key: string; name: string }) =>
    authFetch(`${API_BASE}/meta/options-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseJsonResponse<any>(r)),

  updateKey: (key: string, name: string) =>
    authFetch(`${API_BASE}/meta/options-admin/${encodeURIComponent(key)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then((r) => parseJsonResponse<any>(r)),

  deleteItem: (key: string, value: string) =>
    authFetch(
      `${API_BASE}/meta/options-admin/${encodeURIComponent(key)}/items/${encodeURIComponent(value)}`,
      { method: "DELETE" },
    ).then((r) => parseJsonResponse<any>(r)),

  deleteKey: (key: string) =>
    authFetch(`${API_BASE}/meta/options-admin/${encodeURIComponent(key)}`, {
      method: "DELETE",
    }).then((r) => parseJsonResponse<{ ok: true }>(r)),
};

export const driveApi = {
  list: (path: string, search = "") =>
    authFetch(
      `${API_BASE}/drive/list?path=${encodeURIComponent(path)}&search=${encodeURIComponent(search)}`,
    ).then((r) => r.json()),

  createFolder: (currentPath: string, folderName: string) =>
    authFetch(`${API_BASE}/drive/create-folder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPath, folderName }),
    }).then((r) => r.json()),

  upload: async (file: File, currentPath: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("currentPath", currentPath);

    const token = getToken();
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${API_BASE}/drive/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    return res.json();
  },

  delete: (path: string, type: "file" | "folder") =>
    authFetch(`${API_BASE}/drive/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, type }),
    }).then((r) => r.json()),
};

export const api = {
  aiChat: (question: string) =>
    authFetch(`${API_BASE}/ai/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    }).then((r) =>
      parseJsonResponse<{ success: boolean; question: string; answer: string }>(
        r,
      ),
    ),

  options: metaApi.options,

  doctors: doctorsApi.list,
  doctorCreate: doctorsApi.create,
  doctorGet: doctorsApi.get,
  doctorUpdate: doctorsApi.update,
  doctorDelete: doctorsApi.remove,
  doctorServices: doctorsApi.services,
  doctorRevenueAnalytics: doctorsApi.revenueAnalytics,
  doctorServiceUpsert: doctorsApi.serviceUpsert,
  doctorServiceDelete: doctorsApi.serviceDelete,

  cases: casesApi.list,
  createCase: casesApi.create,
  updateCase: casesApi.update,
  deleteCase: casesApi.remove,
  caseMailTrackingStart: casesApi.startMailTracking,
  caseMailTrackingCheck: casesApi.checkMailTracking,
  caseMailTrackingStop: casesApi.stopMailTracking,

  login: authApi.login,
  forgotPasswordRequest: authApi.forgotPasswordRequest,
  me: authApi.me,
  updateProfile: authApi.updateProfile,

  usersList: usersApi.list,
  userCreate: usersApi.create,
  userUpdate: usersApi.update,
  userDelete: usersApi.remove,
  userResolvePasswordReset: usersApi.resolvePasswordReset,

  services: servicesApi.list,
  serviceCreate: servicesApi.create,
  serviceUpdate: servicesApi.update,
  serviceDelete: servicesApi.remove,

  optionsAdminList: optionsAdminApi.list,
  optionsAdminGetKey: optionsAdminApi.getKey,
  optionsAdminAddItem: optionsAdminApi.addItem,
  optionsAdminPatchItem: optionsAdminApi.patchItem,
  optionsAdminCreateKey: optionsAdminApi.createKey,
  optionsAdminUpdateKey: optionsAdminApi.updateKey,
  optionsAdminDeleteItem: optionsAdminApi.deleteItem,
  optionsAdminDeleteKey: optionsAdminApi.deleteKey,
};

export const caseApi = {
  uploadFile: casesApi.uploadFile,
  deleteFileMinio: casesApi.deleteFileMinio,
  analytics: casesApi.analytics,
};
