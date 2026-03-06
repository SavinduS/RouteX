import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(stored);
    setForm(stored);
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const { data } = await api.put("/users/me", form);

      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));

      setUser(data.user);
      setEditing(false);
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Update failed");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100">
    <Navbar />
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-10 py-6">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">
          Manage your account information
        </p>
      </div>

      {/* Content Area */}
      <div className="max-w-5xl mx-auto px-10 py-10">
        <div className="grid md:grid-cols-3 gap-10">

          {/* Left Side - Avatar Section */}
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#06B6D4] text-white flex items-center justify-center text-3xl font-bold">
              {(user.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-800">
              {user.full_name || "User"}
            </h2>

            <p className="text-sm text-slate-500 mt-1">{user.role}</p>
          </div>

          {/* Right Side - Details */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-8">
            {message && (
              <div className="mb-5 text-sm bg-sky-50 text-sky-700 px-4 py-3 rounded-xl">
                {message}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Full Name
                </label>
                <input
                  name="full_name"
                  value={form.full_name || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-sky-50 px-4 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Email
                </label>
                <input
                  value={form.email || ""}
                  disabled
                  className="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Phone Number
                </label>
                <input
                  name="phone_number"
                  value={form.phone_number || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-sky-50 px-4 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Role
                </label>
                <input
                  value={form.role || ""}
                  disabled
                  className="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 rounded-xl bg-[#06B6D4] text-white font-semibold"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 rounded-xl bg-green-500 text-white font-semibold"
                  >
                    Save Changes
                  </button>

                  <button
                    onClick={() => {
                      setForm(user);
                      setEditing(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-slate-400 text-white font-semibold"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}