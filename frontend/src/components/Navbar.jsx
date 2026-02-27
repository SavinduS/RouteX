import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    const sync = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!token);
      setMe(user ? JSON.parse(user) : null);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setMe(null);
    window.dispatchEvent(new Event("storage"));

    // no useNavigate (router context issue safe)
    window.location.assign("/");
  };

  const initials = (me?.full_name?.[0] || me?.email?.[0] || "U").toUpperCase();

  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-200">
      <Link to="/" className="text-xl font-bold text-[#1D4ED8]">
        RouteX
      </Link>

      <div className="flex items-center gap-4">
        {!isLoggedIn && (
          <>
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg text-[#1D4ED8] font-semibold hover:bg-sky-50 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-5 py-2 rounded-lg bg-[#06B6D4] text-white font-semibold hover:opacity-90 transition"
            >
              Register
            </Link>
          </>
        )}

        {isLoggedIn && (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-slate-50 transition"
              title="Open profile"
            >
              <div className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 font-bold">
                {initials}
              </div>

              <span className="font-medium text-slate-700">
                {me?.full_name || me?.email || "User"}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:opacity-90 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}