import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-200">
      <Link to="/" className="text-xl font-bold text-[#1D4ED8]">
        RouteX
      </Link>

      <div className="flex gap-4">
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
      </div>
    </nav>
  );
}