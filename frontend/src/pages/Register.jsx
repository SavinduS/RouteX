import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    role: "entrepreneur", // entrepreneur | driver
    vehicle_type: "",
    license_number: "",
    password: "",
    confirm_password: "",
  });

  const { loginWithRedirect, isAuthenticated, getIdTokenClaims, logout } = useAuth0();
  const [googleLoading, setGoogleLoading] = useState(false);

  const [loading, setLoading] = useState(false);
 

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const isDriver = form.role === "driver";

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;

    // If switching away from driver, clear driver-only fields
    if (name === "role" && value !== "driver") {
      setForm((p) => ({
        ...p,
        role: value,
        vehicle_type: "",
        license_number: "",
      }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  // Phone: only digits, max 10
  const handlePhoneChange = (e) => {
    setError("");
    const raw = e.target.value;

    // keep only digits
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 10);

    setForm((p) => ({ ...p, phone_number: digitsOnly }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required common fields
    if (
      !form.full_name ||
      !form.email ||
      !form.phone_number ||
      !form.password ||
      !form.confirm_password
    ) {
      setError("Please fill all fields.");
      return;
    }

    // phone must be exactly 10 digits
    if (form.phone_number.length !== 10) {
      setError("Phone number must be 10 digits.");
      return;
    }

    // password min 4 (your requirement)
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    // Driver-only validation
    if (isDriver) {
      if (!form.vehicle_type || !form.license_number) {
        setError("Please fill vehicle type and license number for driver.");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone_number: form.phone_number,
        role: form.role,
        password: form.password,
        ...(isDriver
          ? {
              vehicle_type: form.vehicle_type,
              license_number: form.license_number,
            }
          : {}),
      };

      await api.post("/auth/register", payload);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F1F5F9]">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-sm p-8 md:p-10">
        {/* Close (go Home) */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-5 right-6 text-lg font-semibold text-[#0F172A] hover:text-[#1D4ED8] transition"
          aria-label="Close"
        >
          ✕
        </button>

        <h1 className="text-3xl font-extrabold text-[#0F172A]">Register</h1>
        <p className="text-sm text-slate-600 mt-1">Create your account.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6" autoComplete="off">
          {/* Autofill trap */}
          <input type="text" name="fakeuser" className="hidden" />
          <input type="password" name="fakepass" className="hidden" />

          {/* 2 columns (stack on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none bg-sky-50 focus:ring-2 focus:ring-[#06B6D4]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@email.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none bg-sky-50 focus:ring-2 focus:ring-[#06B6D4]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handlePhoneChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="07XXXXXXXX"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none bg-sky-50 focus:ring-2 focus:ring-[#06B6D4]"
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none bg-white focus:ring-2 focus:ring-[#06B6D4]"
                >
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="driver">Driver</option>
                </select>
              </div>

              {/* Driver-only fields */}
              {isDriver && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Vehicle Type</label>
                    <select
                      name="vehicle_type"
                      value={form.vehicle_type}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none bg-white focus:ring-2 focus:ring-[#06B6D4]"
                    >
                      <option value="">Select vehicle type</option>
                      <option value="bike">Bike</option>
                      <option value="tuktuk">TukTuk</option>
                      <option value="van">Van</option>
                      <option value="truck">Truck</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">License Number</label>
                    <input
                      name="license_number"
                      value={form.license_number}
                      onChange={handleChange}
                      placeholder="License number"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none bg-sky-50 focus:ring-2 focus:ring-[#06B6D4]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* PASSWORD + CONFIRM (show/hide) */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-1">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Minimum 4 characters"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none bg-sky-50 focus:ring-2 focus:ring-[#06B6D4]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#1D4ED8] transition"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
              <div className="relative mt-1">
                <input
                  name="confirm_password"
                  type={showConfirmPw ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none bg-sky-50 focus:ring-2 focus:ring-[#06B6D4]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#1D4ED8] transition"
                  aria-label={showConfirmPw ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="mt-8 w-full rounded-xl bg-[#06B6D4] text-white py-3 font-bold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <button
            type="button"
            onClick={() => loginWithRedirect({ screen_hint: "signup" })}
            disabled={loading || googleLoading}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-800 hover:bg-slate-50 transition disabled:opacity-60"
          >
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <p className="text-sm text-slate-600 text-center pt-3">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#1D4ED8] hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}