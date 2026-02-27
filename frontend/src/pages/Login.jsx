import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    setError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
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

      const res = await api.post("/auth/login", payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user || {}));

      navigate("/"); // no admin now
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F1F5F9]">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-5 right-6 text-lg font-semibold text-[#0F172A] hover:text-[#1D4ED8] transition"
          aria-label="Close"
        >
          ✕
        </button>

        <h1 className="text-3xl font-extrabold text-[#0F172A]">Login</h1>
        <p className="text-sm text-slate-600 mt-1">Welcome back.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6" autoComplete="off">
          <input type="text" name="fakeuser" className="hidden" />
          <input type="password" name="fakepass" className="hidden" />

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="off"
                placeholder="name@email.com"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none bg-sky-50 focus:ring-2 focus:ring-[#06B6D4]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>

              <div className="relative mt-1">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none bg-sky-50 focus:ring-2 focus:ring-[#06B6D4]"
                />

                {/* icon button */}
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#1D4ED8] transition"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Forgot password under input */}
              <div className="mt-2 text-right">
                <a
                  href="mailto:support@routex.com?subject=Forgot%20Password%20Help"
                  className="text-sm font-semibold text-[#1D4ED8] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#06B6D4] text-white py-3 font-bold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-slate-600 text-center pt-2">
            No account?{" "}
            <Link to="/register" className="font-semibold text-[#1D4ED8] hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}