import { useEffect, useState } from "react";
import { loginUser, registerUser } from "../lib/auth";

export default function AuthModal({ mode, onClose, onSwitch, onSuccess }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    setForm({ name: "", email: "", password: "", confirm: "" });
    setErrors({});
    setServerError("");
  }, [mode]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const validate = () => {
    const nextErrors = {};

    if (!isLogin && !form.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Invalid email address";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      nextErrors.password = "Minimum 6 characters";
    }

    if (!isLogin && form.password !== form.confirm) {
      nextErrors.confirm = "Passwords do not match";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setServerError("");

    try {
      const payload = isLogin
        ? {
            email: form.email.trim(),
            password: form.password,
          }
        : {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
          };

      const response = isLogin ? await loginUser(payload) : await registerUser(payload);
      onSuccess(response);
    } catch (error) {
      setServerError(error.message || "Unable to complete your request.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setForm((currentForm) => ({ ...currentForm, [field]: event.target.value }));

    if (errors[field]) {
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors[field];
        return nextErrors;
      });
    }

    if (serverError) {
      setServerError("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-lg border border-[#C9A14A]/30 bg-white"
        style={{ animation: "modalIn .25s cubic-bezier(.22,.61,.36,1) both" }}
      >
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent" />

        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-[#666666] transition-colors hover:text-[#0A0A0A] sm:right-4 sm:top-4"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" />
            <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 text-center sm:mb-8">
            <span
              className="text-4xl font-bold tracking-[0.3em] text-[#C9A14A] sm:text-4xl"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              ZOSE
            </span>
            <div className="mx-auto mt-2 h-px w-10 bg-gradient-to-r from-transparent via-[#C9A14A]/50 to-transparent sm:mt-3 sm:w-12" />
            <p className="mt-2 text-[12px] text-[#333333] sm:mt-3 sm:text-[13px]">
              {isLogin ? "Welcome back to Zose" : "Create your Zose account"}
            </p>
          </div>

          <div className="mb-5 flex overflow-hidden rounded-lg border border-[#C9A14A]/15 sm:mb-6">
            <button
              type="button"
              onClick={() => onSwitch("login")}
              className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-[0.14em] transition-all duration-200 sm:py-2.5 sm:text-[11px] ${
                isLogin ? "bg-[#C9A14A] text-[#0A0A0A]" : "text-[#666666] hover:text-[#0A0A0A]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onSwitch("register")}
              className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-[0.14em] transition-all duration-200 sm:py-2.5 sm:text-[11px] ${
                !isLogin ? "bg-[#C9A14A] text-[#0A0A0A]" : "text-[#666666] hover:text-[#0A0A0A]"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
            {serverError && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300 sm:text-[12px]">
                {serverError}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#333333] sm:mb-1.5 sm:text-[11px]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="Your full name"
                  className={`w-full rounded-md border bg-white px-3 py-2 text-[12px] text-[#0A0A0A] outline-none transition-colors duration-200 placeholder:text-[#777] sm:px-4 sm:py-3 sm:text-[13px] ${
                    errors.name
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-[#C9A14A]/15 focus:border-[#C9A14A]/50"
                  }`}
                />
                {errors.name && <p className="mt-1 text-[10px] text-red-400 sm:text-[11px]">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#333333] sm:mb-1.5 sm:text-[11px]">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                className={`w-full rounded-md border bg-white px-3 py-2 text-[12px] text-[#0A0A0A] outline-none transition-colors duration-200 placeholder:text-[#777] sm:px-4 sm:py-3 sm:text-[13px] ${
                  errors.email
                    ? "border-red-500/60 focus:border-red-500"
                    : "border-[#C9A14A]/15 focus:border-[#C9A14A]/50"
                }`}
              />
              {errors.email && <p className="mt-1 text-[10px] text-red-400 sm:text-[11px]">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#333333] sm:mb-1.5 sm:text-[11px]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder={isLogin ? "Your password" : "Min. 6 characters"}
                  className={`w-full rounded-md border bg-white px-3 py-2 pr-10 text-[12px] text-[#0A0A0A] outline-none transition-colors duration-200 placeholder:text-[#777] sm:px-4 sm:py-3 sm:text-[13px] ${
                    errors.password
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-[#C9A14A]/15 focus:border-[#C9A14A]/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333333] transition-colors hover:text-[#0A0A0A]"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-red-400">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#333333] sm:mb-1.5 sm:text-[11px]">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={handleChange("confirm")}
                  placeholder="Repeat your password"
                  className={`w-full rounded-md border bg-white px-3 py-2 text-[12px] text-[#0A0A0A] outline-none transition-colors duration-200 placeholder:text-[#777] sm:px-4 sm:py-3 sm:text-[13px] ${
                    errors.confirm
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-[#C9A14A]/15 focus:border-[#C9A14A]/50"
                  }`}
                />
                {errors.confirm && <p className="mt-1 text-[10px] text-red-400 sm:text-[11px]">{errors.confirm}</p>}
              </div>
            )}

            {isLogin && (
              <div className="text-right sm:mt-0">
                <button
                  type="button"
                  className="text-[10px] tracking-wide text-[#C9A14A] transition-colors hover:text-[#E8C97A] sm:text-[11px]"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#C9A14A] py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0A0A0A] transition-all duration-200 hover:bg-[#E8C97A] disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5 sm:text-[11px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10" />
                  </svg>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                (isLogin ? "Sign In to Zose" : "Create Account")
              )}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 sm:my-5">
            <div className="h-px flex-1 bg-[#C9A14A]/10" />
            <span className="text-[10px] uppercase tracking-widest text-[#333333] sm:text-[11px]">or</span>
            <div className="h-px flex-1 bg-[#C9A14A]/10" />
          </div>

          <p className="text-center text-[11px] text-[#333333] sm:text-[12px]">
            {isLogin ? "New to Zose? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => onSwitch(isLogin ? "register" : "login")}
              className="font-medium text-[#C9A14A] transition-colors hover:text-[#E8C97A]"
            >
              {isLogin ? "Create an account ->" : "Sign in ->"}
            </button>
          </p>

          <p className="mt-4 text-center text-[10px] tracking-wide text-[#333333]">
            Secure and trusted by UAE shoppers
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
