import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, UserCircle2, Menu, X } from "lucide-react";

const getInitials = (u) =>
  (u?.full_name || u?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function Navbar() {
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  const dropdownRef = useRef(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isLoggedIn = !!localStorage.getItem("token");

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setOpenProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // close menus on route change (simple)
  useEffect(() => {
    const close = () => {
      setOpenProfile(false);
      setOpenMobile(false);
    };
    window.addEventListener("hashchange", close);
    window.addEventListener("popstate", close);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("popstate", close);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    setOpenProfile(false);
    setOpenMobile(false);
    navigate("/");
  };

  const linkBase =
    "px-3 py-2 rounded-xl text-sm font-semibold transition-colors";
  const linkInactive = "text-slate-700 hover:text-[#1D4ED8] hover:bg-[#F1F5F9]";
  const linkActive = "text-[#1D4ED8] bg-[#1D4ED8]/10";

  const NavItem = ({ to, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? linkActive : linkInactive}`
      }
      end={to === "/"}
    >
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-[#1D4ED8] shadow-sm" />
        <span className="text-lg font-extrabold text-slate-900">RouteX</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 bg-white rounded-2xl p-1 border border-slate-200">
          <NavItem to="/" label="Home" />
          <NavItem to="/about" label="About" />
          <NavItem to="/services" label="Services" />
          <NavItem to="/contact" label="Contact" />
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
  {!isLoggedIn ? (
    <>
      <Link
        to="/login"
        className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-[#F1F5F9] transition"
      >
        Login
      </Link>
      <Link
        to="/register"
        className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] active:scale-95 transition"
      >
        Register
      </Link>
    </>
  ) : (
    <div className="flex items-center gap-4">
      {/* Clickable User Info */}
      <div
        onClick={() => navigate("/profile")}
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
      >
        <div className="w-10 h-10 rounded-full bg-[#1D4ED8] text-white font-bold flex items-center justify-center">
          {getInitials(user)}
        </div>

        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900">
            {user?.full_name || "User"}
          </p>
          <p className="text-xs text-slate-500 capitalize">
            {user?.role}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="px-4 py-2 rounded-xl border border-red-500 text-red-500 font-semibold text-sm hover:bg-red-50 transition"
      >
        Logout
      </button>
    </div>
  )}
</div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-xl border border-slate-200 hover:bg-[#F1F5F9]"
          onClick={() => setOpenMobile((s) => !s)}
          aria-label="Toggle menu"
        >
          {openMobile ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {openMobile && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-5 py-4 space-y-2">
            <div className="grid gap-2">
              <NavLink
                to="/"
                end
                onClick={() => setOpenMobile(false)}
                className={({ isActive }) =>
                  `block ${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setOpenMobile(false)}
                className={({ isActive }) =>
                  `block ${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                About
              </NavLink>
              <NavLink
                to="/services"
                onClick={() => setOpenMobile(false)}
                className={({ isActive }) =>
                  `block ${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Services
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setOpenMobile(false)}
                className={({ isActive }) =>
                  `block ${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Contact
              </NavLink>
            </div>

            <div className="h-px bg-slate-200 my-2" />

            {!isLoggedIn ? (
              <div className="grid gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpenMobile(false)}
                  className="w-full text-center px-4 py-2 rounded-xl text-sm font-bold text-slate-700 bg-[#F1F5F9] hover:bg-slate-200 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpenMobile(false)}
                  className="w-full text-center px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="grid gap-2">
                <button
                  onClick={() => {
                    setOpenMobile(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-[#F1F5F9] hover:bg-slate-200 transition"
                >
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}