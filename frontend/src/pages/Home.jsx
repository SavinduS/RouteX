import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-5 py-16 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900">
          Welcome to RouteX
        </h1>

        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
          Manage deliveries, track orders, and control logistics easily from one dashboard.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/track"
            className="px-6 py-3 rounded-xl bg-[#1D4ED8] text-white font-semibold hover:bg-[#1E40AF] transition"
          >
            Track Order
          </Link>

          <Link
            to="/services"
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
          >
            View Services
          </Link>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white mt-20">
        <div className="max-w-6xl mx-auto px-5 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} RouteX. All rights reserved.
        </div>
      </footer>
    </div>
  );
}