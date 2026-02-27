import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";
import api from "../services/api";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    role: "entrepreneur",
    vehicle_type: "",
    license_number: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const isDriver = form.role === "driver";

  const handleChange = (e) => {
  const { name, value } = e.target;

  // PHONE NUMBER (only digits, max 10)
  if (name === "phone_number") {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setForm((p) => ({ ...p, phone_number: digitsOnly }));
    return;
  }

  // FULL NAME (letters + spaces only)
  if (name === "full_name") {
    const cleanName = value.replace(/[^a-zA-Z\s]/g, "");
    setForm((p) => ({ ...p, full_name: cleanName }));
    return;
  }

  // LICENSE NUMBER (letters + numbers only)
  if (name === "license_number") {
    const cleanLicense = value.replace(/[^a-zA-Z0-9]/g, "");
    setForm((p) => ({ ...p, license_number: cleanLicense }));
    return;
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.full_name.trim()) {
  return setError("Full name is required");
}

if (!form.email.trim()) {
  return setError("Email is required");
}

if (form.phone_number.length !== 10) {
  return setError("Phone number must be exactly 10 digits");
}

if (isDriver && !form.license_number.trim()) {
  return setError("License number is required for drivers");
}

if (form.password.length < 6) {
  return setError("Password must be at least 6 characters");
}

    if (form.password !== form.confirm_password) {
      return setError("Passwords do not match");
    }

    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    try {
      setError("");
      const { data } = await api.post("/auth/google", { credential: idToken });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch {
      setError("Google authentication failed");
    }
  };

  // Smaller inputs + hide browser built-in password reveal icon (Edge/IE)
  const inputCls =
    "mt-1.5 w-full h-11 rounded-2xl border border-slate-200 bg-[#F1F8FF] px-4 text-sm outline-none " +
    "focus:ring-2 focus:ring-[#06B6D4] " +
    "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden";
  const selectCls =
    "mt-1.5 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#06B6D4]";

  const iconBtnCls =
    "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-[#1D4ED8] hover:bg-slate-100 transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 px-4">
      {/* smaller card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl px-8 py-7">
        {/* Close */}
        <button
          onClick={() => navigate("/")}
          className="absolute right-5 top-5 text-slate-500 hover:text-black"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <h1 className="text-3xl font-extrabold text-slate-900">Register</h1>
        <p className="text-slate-500 mt-1 text-sm">Create your account.</p>

        {error && (
          <div className="mt-4 text-sm bg-red-50 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5">
          {/* smaller gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className={inputCls}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className={selectCls}
              >
                <option value="entrepreneur">Entrepreneur</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputCls}
                placeholder="name@email.com"
                autoComplete="email"
              />
            </div>

            {/* Vehicle Type (only driver) */}
            <div>
              {isDriver ? (
                <>
                  <label className="text-xs font-semibold text-slate-700">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicle_type"
                    value={form.vehicle_type}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select vehicle type</option>
                    <option value="bike">Bike</option>
                    <option value="tuktuk">TukTuk</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                  </select>
                </>
              ) : (
                <div className="hidden md:block" />
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className={inputCls}
                placeholder="07XXXXXXXX"
                maxLength={10}
              />
            </div>

            {/* License Number (only driver) */}
            <div>
              {isDriver ? (
                <>
                  <label className="text-xs font-semibold text-slate-700">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={form.license_number}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="License number"
                    autoComplete="off"
                  />
                </>
              ) : (
                <div className="hidden md:block" />
              )}
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
                  className={`${inputCls} pr-12`}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  className={`${inputCls} pr-12`}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((s) => !s)}
                  className={iconBtnCls}
                  aria-label={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Register Button (same size as Google) */}
          <button
            type="submit"
            className="mt-6 w-full h-12 rounded-2xl bg-[#06B6D4] text-white font-bold hover:opacity-90 transition"
          >
            Register
          </button>

          {/* more space between Register & Google */}
          <div className="mt-5">
            <GoogleSignInButton
              fullWidth
              heightClass="h-12"
              onSuccess={handleGoogleSuccess}
              onError={(msg) => setError(msg)}
            />
          </div>

          <p className="text-center mt-4 text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-[#1D4ED8] font-semibold">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}