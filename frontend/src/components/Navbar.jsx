import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function Navbar() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-200">
      
      <Link to="/" className="text-xl font-bold text-[#1D4ED8]">
        RouteX
      </Link>

      <div className="flex items-center gap-4">

        {/* If NOT logged in */}
        {!isAuthenticated && (
          <>
            <button
              onClick={() => loginWithRedirect()}
              className="px-5 py-2 rounded-lg text-[#1D4ED8] font-semibold hover:bg-sky-50 transition"
            >
              Login
            </button>

            <button
              onClick={() => loginWithRedirect({ screen_hint: "signup" })}
              className="px-5 py-2 rounded-lg bg-[#06B6D4] text-white font-semibold hover:opacity-90 transition"
            >
              Register
            </button>
          </>
        )}

        {/* If Logged in */}
        {isAuthenticated && (
          <>
            {/* Profile Section */}
            <div className="flex items-center gap-3">
              <img
                src={user?.picture}
                alt="Profile"
                className="w-9 h-9 rounded-full border border-slate-300"
              />
              <span className="font-medium text-slate-700">
                {user?.name}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
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