"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotPending, setForgotPending] = useState(false);

  const BG_URL =
    "https://res.cloudinary.com/da6f4dmql/image/upload/v1779952293/background-powerpoint-chu-de-y-te-dep_040637774_owmxcn.jpg";

  const onSubmit = async () => {
    setErr(null);
    setLoading(true);
    try {
      await login(email.trim(), password);

      const rawUser =
        typeof window !== "undefined"
          ? localStorage.getItem("genno_user")
          : null;
      const nextUser = rawUser ? JSON.parse(rawUser) : null;

      router.replace(nextUser?.role === "sales" ? "/admin/doctors" : "/");
    } catch (e: unknown) {
      setErr(
        e instanceof Error
          ? e.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email.trim());
    setForgotMessage(null);
    setForgotPending(false);
    setIsForgotOpen(true);
  };

  const closeForgotModal = () => {
    if (forgotLoading) return;
    setIsForgotOpen(false);
    setForgotMessage(null);
    setForgotPending(false);
  };

  const submitForgotPassword = async () => {
    const nextEmail = forgotEmail.trim();
    if (!nextEmail) {
      setForgotMessage("Vui lòng nhập email tài khoản.");
      setForgotPending(false);
      return;
    }

    setForgotLoading(true);
    setForgotMessage(null);
    try {
      const res = await api.forgotPasswordRequest({ email: nextEmail });
      setForgotPending(res.status === "pending");
      setForgotMessage(res.message);
    } catch (e: unknown) {
      setForgotPending(false);
      setForgotMessage(
        e instanceof Error ? e.message : "Không thể gửi yêu cầu lúc này.",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sky-700 px-4 py-8">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_URL})` }}
      />
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />

      <section className="relative z-10 w-full max-w-[560px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading && email.trim() && password) void onSubmit();
          }}
          className="rounded-[28px] border-2 border-white/35 bg-sky-500/70 px-8 py-10 text-white shadow-[0_24px_80px_-32px_rgba(8,47,73,0.85)] backdrop-blur-xl sm:px-10"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-white text-center" >
              TRANG QUẢN TRỊ GENNOVAX
            </h1>
          </div>

          {err && (
            <div className="mb-5 rounded-2xl border border-white/25 bg-white/20 px-4 py-3 text-sm font-semibold text-white shadow-sm">
              {err}
            </div>
          )}

          <div className="space-y-3">
            <label className="relative block">
              <User className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-600" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tên đăng nhập"
                autoComplete="username"
                className={cn(
                  "h-14 w-full rounded-full border border-white/20 bg-white/35 pl-14 pr-5 text-sm font-semibold text-white outline-none transition",
                  "placeholder:text-white/85 focus:border-white/70 focus:bg-white/45 focus:ring-4 focus:ring-white/15",
                )}
              />
            </label>

            <label className="relative block">
              <Lock className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-600" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                autoComplete="current-password"
                className={cn(
                  "h-14 w-full rounded-full border border-white/20 bg-white/35 pl-14 pr-14 text-sm font-semibold text-white outline-none transition",
                  "placeholder:text-white/85 focus:border-white/70 focus:bg-white/45 focus:ring-4 focus:ring-white/15",
                )}
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                className="absolute right-4 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-sky-600 transition hover:bg-sky-100 hover:text-sky-800"
                aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {show ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 text-xs font-semibold text-white/90">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-white/50 bg-white/20 text-sky-500 accent-sky-500"
              />
              Ghi nhớ đăng nhập
            </label>
            <button
              type="button"
              onClick={openForgotModal}
              className="transition hover:text-white hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>

          <div className="mt-9 flex justify-center">
            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="h-12 min-w-[220px] cursor-pointer rounded-full bg-white px-10 text-sm font-semibold text-slate-500 shadow-[0_16px_34px_-24px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </form>
      </section>

      {isForgotOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/20 bg-white px-6 py-6 text-slate-800 shadow-[0_40px_120px_-48px_rgba(15,23,42,0.75)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Yêu cầu cấp lại mật khẩu
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Nhập email tài khoản để gửi yêu cầu cho quản trị viên.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForgotModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Email tài khoản
              </div>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="VD: abc@gmail.com"
                autoComplete="email"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            {forgotMessage && (
              <div
                className={cn(
                  "mt-4 rounded-2xl px-4 py-3 text-sm font-medium",
                  forgotPending
                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                    : "border border-sky-200 bg-sky-50 text-sky-700",
                )}
              >
                {forgotMessage}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={submitForgotPassword}
                disabled={forgotLoading}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {forgotLoading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
              <button
                type="button"
                onClick={closeForgotModal}
                disabled={forgotLoading}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
