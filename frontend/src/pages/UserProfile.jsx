import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Pencil,
  Check,
  X,
  KeyRound,
  AlertCircle,
  CheckCircle,
  Car,
  IdCard,
} from "lucide-react";

// helpers
const getInitials = (user) =>
  (user?.full_name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

    const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function StatusBadge({ message }) {
  if (!message) return null;

  const msg = (message || "").trim().toLowerCase();

  // treat as error only if it looks like an error
  const isError =
    msg.includes("fail") ||
    msg.includes("wrong") ||
    msg.includes("match") ||
    msg.includes("error") ||
    msg.includes("invalid") ||
    msg.includes("please");

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm mb-6 border ${
        isError
          ? "bg-rose-50 text-rose-800 border-rose-200"
          : "bg-emerald-50 text-emerald-800 border-emerald-200"
      }`}
    >
      {isError ? (
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle size={16} className="mt-0.5 shrink-0" />
      )}

      <span className="text-slate-900">{message.trim()}</span>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  name,
  value,
  type = "text",
  disabled,
  onChange,
  autoComplete,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full h-11 rounded-xl pl-9 pr-3 text-sm transition-all duration-200
            ${
              disabled
                ? "bg-[#F1F5F9] text-slate-700 border border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-900 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
            }`}
        />
      </div>
    </div>
  );
}

function PwInput({
  label,
  name,
  value,
  visible,
  onToggle,
  onChange,
  autoComplete,
  placeholder,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
        {label}
      </label>

      <div className="relative">
        <KeyRound
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />

        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}

          inputMode="text"
          spellCheck={false}

          className="w-full h-11 rounded-xl pl-9 pr-10 text-sm bg-white border border-slate-200 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-all appearance-none"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#06B6D4] transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  // auto-hide status message after 3s
  useEffect(() => {
    if (!message) return;

    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const [pw, setPw] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [show, setShow] = useState({ current: false, next: false, confirm: false });

  const toggleShow = (key) => {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPw((p) => ({ ...p, [name]: value }));
  };

  useEffect(() => {
    const load = async () => {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const hasStored = Object.keys(stored).length > 0;

      setUser(hasStored ? stored : null);
      setForm(hasStored ? stored : {});

      try {
        const { data } = await api.get("/users/profile");
        setUser(data);
        setForm(data);
        localStorage.setItem("user", JSON.stringify(data));
        window.dispatchEvent(new Event("storage"));
      } catch {
        // keep cache
      }
    };
    load();
  }, []);

  const isDriver = user?.role === "driver";
  const memberSince = useMemo(() => formatDate(user?.createdAt), [user?.createdAt]);

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "phone_number") {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setForm((p) => ({ ...p, phone_number: digitsOnly }));
    return;
  }

  if (name === "full_name") {
    const cleanName = value.replace(/[^a-zA-Z\s]/g, "");
    setForm((p) => ({ ...p, full_name: cleanName }));
    return;
  }

  setForm((p) => ({ ...p, [name]: value }));
};

  const handleSave = async () => {
    setMessage("");

    //  validations (like register)
    const fullName = (form.full_name || "").trim();
    const email = (form.email || "").trim().toLowerCase();
    const phone = (form.phone_number || "").trim();

    if (!fullName) return setMessage("Full name is required");
    if (!email) return setMessage("Email is required");

    // phone: only digits, must be 10
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 10)
      return setMessage("Phone number must be exactly 10 digits");

    // simple email format check
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return setMessage("Please enter a valid email address");

    try {
      const payload = {
        full_name: fullName,
        email,
        phone_number: digitsOnly,
      };

      const { data } = await api.put("/users/update", payload);

      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));

      setUser(data.user);
      setForm(data.user);
      setEditing(false);
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0]?.msg ||
          "Update failed"
      );
    }
  };

  const handleCancel = () => {
    setForm(user || {});
    setEditing(false);
    setMessage("");
    setPw({ current_password: "", new_password: "", confirm_new_password: "" });
    setShow({ current: false, next: false, confirm: false });
  };

  const handleChangePassword = async () => {
    setMessage("");

    const current = (pw.current_password || "").trim();
    const next = (pw.new_password || "").trim();
    const confirm = (pw.confirm_new_password || "").trim();

    if (!current || !next) return setMessage("Please fill in current and new password");

    //  minimum 5 for both
    if (current.length < 5) return setMessage("Current password must be at least 5 characters");
    if (next.length < 5) return setMessage("New password must be at least 5 characters");

    if (next !== confirm) return setMessage("New passwords do not match");

    try {
      setPwLoading(true);
      await api.put("/users/password", {
        current_password: current,
        new_password: next,
      });

      setPw({ current_password: "", new_password: "", confirm_new_password: "" });
      setShow({ current: false, next: false, confirm: false });
      setMessage("Password updated successfully");
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0]?.msg ||
          "Password update failed"
      );
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
  setMessage("");

  const confirmed = window.confirm(
    "Are you sure you want to delete your profile? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    await api.delete("/users/profile"); 

    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));

    window.location.href = "/login"; 
  } catch (err) {
    setMessage(
      err?.response?.data?.message || "Profile delete failed"
    );
  }
};

  if (!user) return null;
  
  const isAdmin = user?.role === "admin";

  const tabs = [
  { id: "info", label: "Personal Info" },
  { id: "security", label: "Security" },
];


  //  user_id
  const displayUserId = user?.user_id || "—";

  return (
    <div className="min-h-screen bg-[#F1F5F9]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {!isAdmin && <Navbar />}

      {isAdmin && (
        <div className="max-w-5xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            ← Back
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-6 sm:py-10 grid lg:grid-cols-[268px_1fr] gap-4 sm:gap-6 items-start">
        {/* SIDEBAR */}
        <aside className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#06B6D4] flex items-center justify-center text-2xl font-black text-white shadow-md">
              {getInitials(user)}
            </div>

            <h2 className="mt-4 font-bold text-lg leading-tight text-slate-900">
              {user.full_name || "User"}
            </h2>
            <p className="text-slate-600 text-xs mt-1 truncate">{user.email}</p>

            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-[#1D4ED8] text-white text-xs font-semibold capitalize">
              {user.role}
            </span>

            {/*  User ID */}
            <div className="mt-5 flex justify-center">
              <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#F1F5F9] border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  ID
                </span>
                <span className="text-sm font-bold text-slate-900 tracking-widest break-all">
                  {user?.user_id}
                </span>
              </div>
            </div>
        </div>

          {/* tab nav */}
          <nav className="bg-white rounded-2xl p-2 space-y-1 shadow-sm border border-slate-100">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setMessage("");
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === t.id
                    ? "bg-[#1D4ED8] text-white shadow-sm"
                    : "text-slate-700 hover:text-[#1D4ED8] hover:bg-[#F1F5F9]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/*  stats strip  */}
          <div className="bg-white rounded-2xl p-4 grid grid-cols-2 gap-3 shadow-sm border border-slate-100">
            <div className="bg-[#F1F5F9] rounded-xl py-3 px-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">
                MEMBER SINCE
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900">{memberSince}</p>
            </div>

            <div className="bg-[#F1F5F9] rounded-xl py-3 px-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">
                STATUS
              </p>
              <p className="text-sm font-bold text-slate-900">Active</p>
            </div>
          </div>
        </aside>

        {/* MAIN PANEL */}
        <main>
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100">
            {/* panel header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeTab === "info" ? "Personal Information" : "Security Settings"}
                </h2>
                {activeTab === "security" && (
                  <p className="text-slate-700 text-sm mt-0.5">Change your account password</p>
                )}
              </div>

              {activeTab === "info" && (
                <div className="flex flex-wrap gap-2">
                  {!editing ? (
                    <button
                      onClick={() => {
                        setEditing(true);
                        setMessage("");
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#06B6D4] text-white hover:bg-[#0891B2] active:scale-95 transition-all"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all"
                      >
                        <Check size={14} /> Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#F1F5F9] text-slate-800 hover:bg-slate-200 active:scale-95 transition-all"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100 mb-7" />

            <StatusBadge message={message} />

            {/* INFO TAB */}
            {activeTab === "info" && (
              <>
                {/*  Personal Info editable fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    icon={User}
                    label="Full Name"
                    name="full_name"
                    value={form.full_name || ""}
                    disabled={!editing}
                    onChange={handleChange}
                  />
                  <Field
                    icon={Mail}
                    label="Email"
                    name="email"
                    value={form.email || ""}
                    disabled={!editing}
                    onChange={handleChange}
                  />
                  <Field
                    icon={Phone}
                    label="Phone Number"
                    name="phone_number"
                    value={form.phone_number || ""}
                    disabled={!editing}
                    onChange={handleChange}
                  />
                </div>

                {/*  Driver-only */}
                {isDriver && (
                  <div className="mt-8 rounded-2xl border border-slate-100 bg-[#F1F5F9] p-5">
                    <h3 className="text-sm font-bold text-slate-900">
                      Driver Information
                    </h3>
                    <p className="text-xs text-slate-700 mt-1">
                      Some fields are read-only for security reasons.
                    </p>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 rounded-xl bg-white border border-slate-100 p-4">
                        <Car size={16} className="text-slate-600 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">
                            Vehicle Type
                          </p>
                          <p className="text-sm font-semibold text-slate-900 capitalize">
                            {user.vehicle_type || "—"}
                          </p>
                          {editing && (
                            <p className="text-xs text-slate-600 mt-1">
                              (You can’t edit this)
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl bg-white border border-slate-100 p-4">
                        <IdCard size={16} className="text-slate-600 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">
                            License Number
                          </p>
                          <p className="text-sm font-semibold text-slate-900 break-all">
                            {user.license_number || "—"}
                          </p>
                          {editing && (
                            <p className="text-xs text-slate-600 mt-1">
                              (You can’t edit this)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-5 w-full max-w-md">
                <PwInput
                  label="Current Password"
                  name="current_password"
                  value={pw.current_password}
                  visible={show.current}
                  onToggle={() => toggleShow("current")}
                  onChange={handlePwChange}
                  autoComplete="current-password"
                  placeholder="Enter current password"
                />
                <PwInput
                  label="New Password"
                  name="new_password"
                  value={pw.new_password}
                  visible={show.next}
                  onToggle={() => toggleShow("next")}
                  onChange={handlePwChange}
                  autoComplete="new-password"
                  placeholder="Minimum 5 characters"
                />
                <PwInput
                  label="Confirm New Password"
                  name="confirm_new_password"
                  value={pw.confirm_new_password}
                  visible={show.confirm}
                  onToggle={() => toggleShow("confirm")}
                  onChange={handlePwChange}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                />

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={pwLoading}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-[#06B6D4] text-white hover:bg-[#0891B2] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {pwLoading ? "Updating…" : "Update Password"}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteProfile}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-rose-700 text-white hover:bg-rose-800 active:scale-95 transition-all mt-2"
                >
                  Delete Profile
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}