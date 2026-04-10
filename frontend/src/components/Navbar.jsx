import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Truck } from "lucide-react";

const getInitials = (u) =>
  (u?.full_name || u?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMobile, setOpenMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("top");

  const dropdownRef = useRef(null);

  const syncAuthState = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");

      setUser(storedUser);
      setIsLoggedIn(!!token);
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== "/") return;

      const sections = ["top", "about", "services", "contact"];
      const scrollPosition = window.scrollY + 120; 

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const currentHash = location.hash.replace("#", "");
    setActiveSection(currentHash || "top");
  }, [location.pathname, location.hash]);

  useEffect(() => {
    syncAuthState();

    const handleStorageChange = () => {
      syncAuthState();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChanged", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        // placeholder if dropdown added later
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const close = () => {
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
    window.dispatchEvent(new Event("authChanged"));
    setOpenMobile(false);
    navigate("/");
  };


  const linkBase =
    "px-4 py-2 rounded-[16px] text-[14px] font-bold transition-all duration-200 cursor-pointer";
  const linkInactive =
    "text-slate-700 hover:text-[#1D4ED8] hover:bg-slate-100";
  const linkActive = "text-[#1D4ED8] bg-[#DBEAFE] shadow-sm";

  const handleBrandClick = (e) => {
    e.preventDefault();
    setOpenMobile(false);

    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("top");
      window.history.replaceState(null, "", "/");
    } else {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", "/");
      }, 120);
    }
  };

  const scrollToSection = (section) => {
  const el = document.getElementById(section);
  if (!el) return;

  const navbarOffset = 60;
  const y = el.getBoundingClientRect().top + window.pageYOffset - navbarOffset;

  window.scrollTo({
    top: y,
    behavior: "smooth",
  });
};

const handleNavClick = (section) => {
  setActiveSection(section);
  setOpenMobile(false);

  if (location.pathname !== "/") {
    navigate("/", { replace: false });

    setTimeout(() => {
      scrollToSection(section);
    }, 120);
    return;
  }

  scrollToSection(section);

  // URL eke hash ekak nathi karanawa
  window.history.replaceState(null, "", "/");
};

  const sectionLinkClass = (section) => {
    const isActive = location.pathname === "/" && section === activeSection;
    return `${linkBase} ${isActive ? linkActive : linkInactive}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">  <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3">
        <Link
          to="/#top"
          onClick={handleBrandClick}
          className="flex items-center gap-3 shrink-0"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D4ED8] shadow-sm">
            <Truck size={22} className="text-white" />
          </div>

          <div className="leading-none">
            <h1 className="text-[20px] sm:text-[22px] font-black tracking-tight text-slate-900">
              Route<span className="text-cyan-500">X</span>
            </h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.32em] text-slate-400 font-semibold">
              Logistics Platform
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-[20px] border border-slate-200 bg-white p-1 shadow-sm">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("top");
            }}
            className={sectionLinkClass("top")}
          >
            Home
          </Link>

          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("about");
            }}
            className={sectionLinkClass("about")}
          >
            About
          </Link>

          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("services");
            }}
            className={sectionLinkClass("services")}
          >
            Services
          </Link>

          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("contact");
            }}
            className={sectionLinkClass("contact")}
          >
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-600 active:scale-95"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div
                onClick={() => navigate("/profile")}
                className="flex cursor-pointer items-center gap-3 transition hover:opacity-80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D4ED8] text-base font-bold text-white">
                  {getInitials(user)}
                </div>

                <div className="leading-tight">
                  <p className="text-[15px] font-bold text-slate-900 leading-tight">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-[13px] capitalize text-slate-500 leading-tight">
                    {user?.role}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="rounded-2xl border border-red-400 px-5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100 md:hidden"
          onClick={() => setOpenMobile((s) => !s)}
          aria-label="Toggle menu"
        >
          {openMobile ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {openMobile && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto max-w-7xl space-y-3 px-5 py-4">
            <div className="grid gap-2">
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("top");
                }}
                className={`block ${sectionLinkClass("top")}`}
              >
                Home
              </Link>

              <Link
                to="/#about"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("about");
                }}
                className={`block ${sectionLinkClass("about")}`}
              >
                About
              </Link>

              <Link
                to="/#services"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("services");
                }}
                className={`block ${sectionLinkClass("services")}`}
              >
                Services
              </Link>

              <Link
                to="/#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("contact");
                }}
                className={`block ${sectionLinkClass("contact")}`}
              >
                Contact
              </Link>
            </div>

            <div className="my-2 h-px bg-slate-200" />

            {!isLoggedIn ? (
              <div className="grid gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpenMobile(false)}
                  className="w-full rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setOpenMobile(false)}
                  className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-cyan-600"
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
                  className="w-full rounded-xl bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Profile
                </button>

                <button
                  onClick={logout}
                  className="w-full rounded-xl bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100"
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