import { Link, useLocation } from "react-router-dom";

const navLinks = [
  {
    to: "/entrepreneur/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/entrepreneur/create-delivery",
    label: "New Delivery",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    to: "/entrepreneur/my-deliveries",
    label: "My Deliveries",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
      </svg>
    ),
  },
];

const SidebarLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
      ${active
        ? "bg-white text-[#1D4ED8] shadow-md shadow-black/10"
        : "text-blue-100 hover:bg-white/10 hover:text-white"
      }`}
  >
    <span className={`transition-colors ${active ? "text-[#1D4ED8]" : "text-blue-200 group-hover:text-white"}`}>
      {icon}
    </span>
    {label}
    {active && (
      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
    )}
  </Link>
);

const EntrepreneurSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 w-[240px] h-screen bg-[#1D4ED8] flex flex-col z-30 shadow-2xl shadow-[#1D4ED8]/40">

      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#06B6D4] flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white text-xl font-extrabold tracking-tight">RouteX</span>
        </div>
        <p className="text-blue-200 text-[11px] font-medium mt-1.5 ml-0.5">Entrepreneur Portal</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300/60 px-4 mb-3">
          Navigation
        </p>
        {navLinks.map((link) => (
          <SidebarLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            active={isActive(link.to)}
          />
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-5 border-t border-white/10 space-y-3">
        {/* User pill */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10">
          <div className="w-8 h-8 rounded-full bg-[#06B6D4]/30 border border-[#06B6D4]/50 flex items-center justify-center text-sm font-bold text-white shrink-0">
            E
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">Entrepreneur</p>
            <p className="text-blue-200 text-[10px] truncate">Active account</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-red-500 text-blue-100 hover:text-white text-sm font-bold rounded-xl transition-all duration-200 group"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default EntrepreneurSidebar;