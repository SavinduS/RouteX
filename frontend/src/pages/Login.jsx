import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Eye, EyeOff } from "lucide-react";
import api from "../services/api";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Login() {
  const navigate = useNavigate();

  const getRedirectPathByRole = (role) => {
    if (role === "admin") return "/admin";
    return "/";
  };

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;

    // keep email clean (optional but nice)
    if (name === "email") {
      setForm((p) => ({ ...p, email: value }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const goHome = () => navigate("/");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const { data } = await api.post("/auth/login", payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      window.dispatchEvent(new Event("storage"));

      navigate(getRedirectPathByRole(data?.user?.role));
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    try {
      setGoogleLoading(true);
      setError("");

      const { data } = await api.post("/auth/google", { credential: idToken });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));

      navigate(getRedirectPathByRole(data?.user?.role));
    } catch {
      setError("Google authentication failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputCls =
    "mt-1.5 w-full h-11 rounded-2xl border border-slate-200 bg-[#F1F8FF] px-4 text-sm outline-none " +
    "focus:ring-2 focus:ring-[#06B6D4] " +
    "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden";

  const iconBtnCls =
    "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-[#1D4ED8] hover:bg-slate-100 transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 px-4">
      {/* Register එක වගේ smaller card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-7">
        {/* Close */}
        <button
          type="button"
          onClick={goHome}
          className="absolute right-5 top-5 text-slate-500 hover:text-black"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <h1 className="text-3xl font-extrabold text-slate-900">Login</h1>
        <p className="text-slate-500 mt-1 text-sm">Welcome back.</p>

        {error && (
          <div className="mt-4 text-sm bg-red-50 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@email.com"
              autoComplete="email"
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`${inputCls} pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className={iconBtnCls}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Button (same size as Google) */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="mt-6 w-full h-12 rounded-2xl bg-[#06B6D4] text-white font-bold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* more space between Login & Google (like Register) */}
          <div className="mt-5">
            <GoogleSignInButton
              fullWidth
              heightClass="h-12"
              onSuccess={handleGoogleSuccess}
              onError={(msg) => setError(msg)}
              disabled={loading || googleLoading}
            />
          </div>

          {/* Bottom link */}
          <p className="text-center mt-4 text-sm text-slate-600">
            No account?{" "}
            <Link to="/register" className="text-[#1D4ED8] font-semibold">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}