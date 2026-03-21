import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ArrowRight,
  ArrowUpRight,
  Truck,
  MapPin,
  Phone,
  Mail,
  Package,
  Navigation,
  BarChart3,
  Clock,
  Shield,
  ChevronRight,
  Star,
  CheckCircle,
  Send,
} from "lucide-react";

const getInitials = (u) =>
  (u?.full_name || u?.email || "U")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #F1F5F9; font-family: 'Plus Jakarta Sans', sans-serif; }

    :root {
      --base:    #F1F5F9;
      --primary: #1D4ED8;
      --accent:  #06B6D4;
      --dark:    #0F172A;
      --mid:     #475569;
      --soft:    #CBD5E1;
      --white:   #FFFFFF;
      --light:   #E2E8F0;
    }

    .rx3-nav-link {
      font-family: 'DM Mono', monospace;
      font-size: 11px; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase;
      text-decoration: none; color: var(--mid);
      transition: color 0.2s;
    }
    .rx3-nav-link:hover,
    .rx3-nav-link.active { color: var(--primary); }

    .rx3-btn-fill {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 14px 30px; border-radius: 14px;
      background: #1D4ED8; color: white;
      font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase;
      text-decoration: none; border: none; cursor: pointer;
      transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
      box-shadow: 4px 4px 0px rgba(30, 58, 138, 0.35);
    }
    .rx3-btn-fill:hover {
      background: #06B6D4;
      box-shadow: 4px 4px 0px rgba(30, 58, 138, 0.35);
      transform: translate(-2px, -2px);
    }

    .rx3-btn-stroke {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 14px 30px; border-radius: 14px;
      background: transparent; color: #1D4ED8;
      font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase;
      text-decoration: none; cursor: pointer;
      border: 1.5px solid #1D4ED8;
      transition: all 0.25s;
    }
    .rx3-btn-stroke:hover {
      background: #1D4ED8;
      color: white;
    }

    .rx3-input {
      width: 100%; padding: 13px 16px;
      border: 1.5px solid var(--light); border-radius: 10px;
      background: var(--white); color: var(--dark);
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
      outline: none; transition: border-color 0.2s;
    }
    .rx3-input:focus { border-color: var(--primary); }
    .rx3-input::placeholder { color: var(--soft); }

    /* Scroll reveal - both directions */
    .rx3-reveal {
      opacity: 0;
      transform: translateY(60px);
      filter: blur(8px);
      transition:
        opacity 0.75s ease,
        transform 0.75s ease,
        filter 0.75s ease;
      will-change: opacity, transform, filter;
    }

    .rx3-reveal.visible {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }

    .rx3-reveal.delay-1 { transition-delay: 0.12s; }
    .rx3-reveal.delay-2 { transition-delay: 0.22s; }
    .rx3-reveal.delay-3 { transition-delay: 0.32s; }

    /* Optional left/right reveal helpers */
    .rx3-reveal-left {
      opacity: 0;
      transform: translateX(-60px);
      filter: blur(8px);
      transition:
        opacity 0.75s ease,
        transform 0.75s ease,
        filter 0.75s ease;
      will-change: opacity, transform, filter;
    }

    .rx3-reveal-left.visible {
      opacity: 1;
      transform: translateX(0);
      filter: blur(0);
    }

    .rx3-reveal-right {
      opacity: 0;
      transform: translateX(60px);
      filter: blur(8px);
      transition:
        opacity 0.75s ease,
        transform 0.75s ease,
        filter 0.75s ease;
      will-change: opacity, transform, filter;
    }

    .rx3-reveal-right.visible {
      opacity: 1;
      transform: translateX(0);
      filter: blur(0);
    }

    @keyframes rx3-marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    .rx3-marquee-track { display: flex; animation: rx3-marquee 22s linear infinite; width: max-content; }
    .rx3-marquee-wrap { overflow: hidden; border-top: 1px solid rgba(6,182,212,0.2); border-bottom: 1px solid rgba(6,182,212,0.2); }

    .rx3-svc-card {
      padding: 32px 28px; border-radius: 4px;
      border: 1.5px solid var(--light); background: white;
      cursor: pointer; position: relative; overflow: hidden;
      transition: border-color 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease;
      will-change: transform;
    }
    .rx3-svc-card::before {
      content: ''; position: absolute;
      bottom: 0; left: 0; width: 0; height: 3px;
      background: var(--accent); transition: width 0.4s ease;
    }
    .rx3-svc-card:hover { border-color: #BFDBFE; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(29,78,216,0.1); }
    .rx3-svc-card:hover::before { width: 100%; }
    .rx3-svc-card.featured { background: var(--primary); border-color: transparent; }
    .rx3-svc-card.featured::before { background: var(--accent); }

    @keyframes rx3-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.5); }
      50%      { box-shadow: 0 0 0 6px rgba(6,182,212,0); }
    }
    .rx3-pulse { animation: rx3-pulse 2s ease-in-out infinite; }

    @keyframes rx3-float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    .rx3-float { animation: rx3-float 4s ease-in-out infinite; }

    @media (min-width: 768px) {
      .rx3-show-desk { display: flex !important; }
      .rx3-hide-desk { display: none !important; }
    }
    @media (max-width: 767px) { .rx3-show-desk { display: none !important; } }
    @media (min-width: 900px)  { .rx3-two-col { grid-template-columns: 1fr 1fr !important; } }
    @media (min-width: 1024px) { .rx3-hero-col { grid-template-columns: 55fr 45fr !important; } }
  `}</style>
);


/* scroll reveal hook */
function useReveal(threshold = 0.18) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
        } else {
          el.classList.remove("visible");
        }
      },
      {
        threshold,
        root: null,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}


/*  HERO */
function Hero() {
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r5 = useReveal();


  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY * 0.18);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="top"
      style={{
        background: "#F1F5F9",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "100px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "42%",
          height: "100%",
          background: "#E0F2FE",
          clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "#1D4ED8",
          zIndex: 2,
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "84px clamp(18px, 4vw, 32px) 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="rx3-hero-col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 48,
            alignItems: "center",
            minHeight: 500,
          }}
        >
          {/* LEFT */}
          <div
            style={{
              transform: `translateY(${offsetY * 0.12}px)`,
              transition: "transform 0.08s linear",
            }}
          >
            <div
              ref={r1}
              className="rx3-reveal-left"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 28,
                padding: "9px 16px",
                border: "1px solid #BFDBFE",
                borderRadius: 12,
                background: "white",
              }}
            >
              <div
                className="rx3-pulse"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#06B6D4",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "#1D4ED8",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Now operating in 9+ cities
              </span>
            </div>

            <h1
              ref={r2}
              className="rx3-reveal delay-1"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(3rem, 6.5vw, 5.4rem)",
                fontWeight: 700,
                color: "#0F172A",
                lineHeight: 1.0,
                letterSpacing: "-1.5px",
                marginBottom: 28,
              }}
            >
              Last Mile
              <br />
              Delivery,
              <br />
              <em style={{ color: "#1D4ED8", fontStyle: "italic" }}>
                Reimagined.
              </em>
            </h1>

            <div ref={r3} className="rx3-reveal delay-2">
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 16,
                  color: "#475569",
                  lineHeight: 1.85,
                  marginBottom: 36,
                  maxWidth: 420,
                }}
              >
                RouteX gives Sri Lankan businesses a smarter way to deliver - with
                AI route planning, live package tracking, and a vetted driver
                network available across the island.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link to="/login" className="rx3-btn-fill">
                  Place Order <ArrowRight size={14} />
                </Link>

                <Link to="/#services" className="rx3-btn-stroke">
                  See Services
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT — delivery card */}
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              paddingTop: 16,
              transform: `translateY(${offsetY * 0.06}px)`,
              transition: "transform 0.08s linear",
            }}
          >
            <div
              ref={r5}
              className="rx3-reveal-right delay-2"
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 360,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {/* subtle back layer */}
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  maxWidth: 320,
                  height: 372,
                  borderRadius: 20,
                  background: "rgba(29,78,216,0.08)",
                  zIndex: 0,
                }}
              />

              {/* main card */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  width: "100%",
                  maxWidth: 320,
                  borderRadius: 20,
                  background: "#FFFFFF",
                  padding: "24px",
                  border: "1px solid #DBEAFE",
                  boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
                }}
              >
                {/* header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 9,
                        color: "#64748B",
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        marginBottom: 6,
                      }}
                    >
                      Live Tracking
                    </p>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#1E3A8A",
                        lineHeight: 1.1,
                      }}
                    >
                      Order #RX-5581
                    </p>
                  </div>

                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: "#EFF6FF",
                      border: "1px solid #DBEAFE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Package size={16} color="#1D4ED8" />
                  </div>
                </div>

                {/* simple map area */}
                <div
                  style={{
                    height: 110,
                    borderRadius: 16,
                    background: "#F8FBFF",
                    border: "1px solid #DBEAFE",
                    marginBottom: 22,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage:
                        "radial-gradient(rgba(29,78,216,0.08) 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <svg
                    style={{ position: "absolute", inset: 0, margin: "auto" }}
                    width="150"
                    height="60"
                    viewBox="0 0 150 60"
                  >
                    <path
                      d="M20,36 Q50,10 82,28 Q108,42 130,18"
                      stroke="#06B6D4"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      fill="none"
                    />
                    <circle cx="82" cy="28" r="7" fill="#1D4ED8" />
                    <circle cx="82" cy="28" r="14" fill="rgba(6,182,212,0.16)" />
                  </svg>
                </div>

                {/* progress */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 9,
                        color: "#64748B",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Progress
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 9,
                        color: "#1D4ED8",
                        fontWeight: 600,
                      }}
                    >
                      72%
                    </span>
                  </div>

                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: "#E2E8F0",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "72%",
                        height: "100%",
                        borderRadius: 999,
                        background: "#1D4ED8",
                      }}
                    />
                  </div>
                </div>

                {/* steps */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  {[
                    { label: "Picked up", time: "9:41", done: true },
                    { label: "In transit", time: "Now", active: true },
                    { label: "Delivered", time: "~11:10" },
                  ].map(({ label, time, done, active }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: done
                            ? "#1D4ED8"
                            : active
                            ? "#DBEAFE"
                            : "#E2E8F0",
                          border: active ? "1.5px solid #1D4ED8" : "none",
                          flexShrink: 0,
                        }}
                      >
                        {done && <CheckCircle size={11} color="white" />}
                        {active && (
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#1D4ED8",
                            }}
                          />
                        )}
                      </div>

                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: 600,
                          color: done || active ? "#1E3A8A" : "#64748B",
                        }}
                      >
                        {label}
                      </span>

                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 9,
                          color: active ? "#1D4ED8" : "#64748B",
                        }}
                      >
                        {time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* footer */}
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "#1D4ED8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                    }}
                  >
                    NK
                  </div>

                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1E3A8A",
                      }}
                    >
                      Nuwan K.
                    </p>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={8} color="#06B6D4" fill="#06B6D4" />
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: "#EFF6FF",
                      border: "1px solid #DBEAFE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Phone size={13} color="#1D4ED8" />
                  </div>
                </div>
              </div>

              {/* eta badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: -12,
                  right: "6%",
                  zIndex: 3,
                  background: "#FFFFFF",
                  borderRadius: 14,
                  padding: "9px 14px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#22C55E",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "#334155",
                  }}
                >
                  ETA · 54 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* MARQUEE BAND */
function MarqueeBand() {
  const items = ["Last Mile Delivery","Route Optimisation","Live Tracking","Driver Network","Package Insurance","Analytics Dashboard","Scheduled Delivery","Smart Dispatch"];
  const doubled = [...items, ...items];
  return (
    <div className="rx3-marquee-wrap" style={{ background: "#0F172A", padding: "16px 0" }}>
      <div className="rx3-marquee-track">
        {doubled.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: i % 4 === 0 ? "#06B6D4" : "#475569", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 28px" }}>{item}</span>
            <span style={{ color: "#1D4ED8", fontSize: 8 }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/*  ABOUT */
function About() {
  const r1 = useReveal(), r2 = useReveal();

  return (
    <section
      id="about"
      style={{
        background: "#0F172A",
        padding: "100px clamp(18px, 4vw, 32px)",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "100px",
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(29,78,216,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>

        <div ref={r1} className="rx3-reveal-left" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64, gap: 24 }}>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#06B6D4", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 16 }}>- Our Story</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "white", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
              Born in Colombo.<br /><em style={{ color: "#06B6D4", fontStyle: "italic" }}>Built for Sri Lanka.</em>
            </h2>
          </div>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#64748B", maxWidth: 360, lineHeight: 1.85 }}>
            We saw drivers losing time and businesses losing money. So we built the platform that fixes both - one delivery at a time.
          </p>
        </div>

        <div ref={r2} className="rx3-reveal-right delay-2 rx3-two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 56, alignItems: "start" }}>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, color: "#64748B", lineHeight: 1.9, marginBottom: 20 }}>
              RouteX was founded in 2021 after watching courier operations collapse under the weight of paper manifests, phone calls, and zero visibility. We replaced all of that with a single, intelligent platform.
            </p>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, color: "#64748B", lineHeight: 1.9, marginBottom: 36 }}>
              Today we move thousands of packages every day - for e-commerce stores, pharmacies, restaurants, and more - across Colombo, Kandy, Galle, and six other cities.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "AI routing reduces fuel use by up to 40%",
                "Customers get SMS + in-app live tracking",
                "Drivers earn more with optimised job allocation",
                "Businesses get a real-time ops dashboard",
              ].map(t => (
                <div key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 2, background: "rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0 }}>
                    <ChevronRight size={10} color="#06B6D4" />
                  </div>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { year: "2021", title: "RouteX Founded", desc: "Launched in Colombo with 12 drivers and 5 business clients." },
              { year: "2022", title: "Expanded to 5 Cities", desc: "Rolled out to Kandy, Galle, Negombo, and Jaffna within 18 months." },
              { year: "2023", title: "AI Routing Launched", desc: "Deployed our proprietary route optimisation engine, cutting fuel by 38%." },
              { year: "2024", title: "200+ Business Partners", desc: "Crossed the milestone of 200 active business accounts island-wide." },
            ].map(({ year, title, desc }, i) => (
              <div key={year} style={{ display: "flex", gap: 20, paddingBottom: i < 3 ? 28 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 3, background: "rgba(29,78,216,0.2)", border: "1.5px solid rgba(6,182,212,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#06B6D4", letterSpacing: "0.05em" }}>{year}</span>
                  </div>
                  {i < 3 && <div style={{ flex: 1, width: 1, background: "rgba(29,78,216,0.25)", marginTop: 6 }} />}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>{title}</p>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#475569", lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/*  SERVICES */
function Services() {
  const r1 = useReveal(), r2 = useReveal();

  const services = [
    { icon: <Truck size={24} />, title: "Last Mile Delivery", desc: "Door-to-door with live GPS, digital proof of delivery, and automatic customer updates at every stage.", tag: "Core" },
    { icon: <Navigation size={24} />, title: "Route Optimisation", desc: "Our AI engine plans the fastest multi-stop route in seconds - slashing fuel costs and delivery windows.", tag: "AI" },
    { icon: <Package size={24} />, title: "Package Management", desc: "Barcode intake, automated sorting, and tamper-evident workflows from warehouse to final drop.", tag: "Ops" },
    { icon: <BarChart3 size={24} />, title: "Business Analytics", desc: "A live dashboard with delivery KPIs, driver scores, cost-per-drop breakdowns, and CSV exports.", tag: "Data" },
    { icon: <Clock size={24} />, title: "Scheduled Windows", desc: "Customers choose morning, afternoon, or evening slots - dramatically boosting first-attempt rates.", tag: "UX" },
    { icon: <Shield size={24} />, title: "Insured Shipments", desc: "Every item is covered. Our no-hassle 48-hour claims process handles lost or damaged packages fast.", tag: "Safe" },
  ];

  return (
    <section
      id="services"
      style={{
        background: "#F1F5F9",
        padding: "100px clamp(18px, 4vw, 32px)",
        scrollMarginTop: "100px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div ref={r1} className="rx3-reveal-left" style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56 }}>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 16 }}>— What We Offer</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)", fontWeight: 700, color: "#0F172A", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
              Six Reasons Businesses<br /><em style={{ color: "#1D4ED8", fontStyle: "italic" }}>Choose RouteX</em>
            </h2>
          </div>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#475569", maxWidth: 320, lineHeight: 1.85 }}>
            Purpose-built for the real challenges of Sri Lankan last-mile delivery.
          </p>
        </div>

        <div ref={r2} className="rx3-reveal-right delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {services.map(({ icon, title, desc, tag }, i) => (
            <div key={title} className={`rx3-svc-card${i === 0 ? " featured" : ""}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 6, background: i === 0 ? "rgba(6,182,212,0.15)" : "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: i === 0 ? "#06B6D4" : "#1D4ED8" }}>
                  {icon}
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: i === 0 ? "#06B6D4" : "#1D4ED8", background: i === 0 ? "rgba(6,182,212,0.15)" : "#DBEAFE", padding: "4px 10px", borderRadius: 2 }}>{tag}</span>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: i === 0 ? "white" : "#0F172A", marginBottom: 10, lineHeight: 1.2 }}>{title}</h3>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: i === 0 ? "#93C5FD" : "#475569", lineHeight: 1.75, marginBottom: 18 }}>{desc}</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: i === 0 ? "#06B6D4" : "#1D4ED8" }}>
                Learn more <ArrowUpRight size={12} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* CONTACT  */
function Contact() {
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section
      id="contact"
      style={{
        background: "#E0F2FE",
        padding: "100px clamp(18px, 4vw, 32px)",
        scrollMarginTop: "100px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          ref={r1}
          className="rx3-reveal-left"
          style={{ marginBottom: 56 }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "#1D4ED8",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 16,
            }}
          >
            — Get In Touch
          </p>

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              marginBottom: 18,
            }}
          >
            Ready to Deliver
            <br />
            <em style={{ color: "#1D4ED8", fontStyle: "italic" }}>
              Something Great?
            </em>
          </h2>

          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 16,
              color: "#475569",
              lineHeight: 1.85,
              maxWidth: 720,
            }}
          >
            Whether you're scaling an e-commerce operation, building a driver
            career, or simply want to know more about RouteX - we'd love to hear
            from you.
          </p>
        </div>

        <div
          className="rx3-two-col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          {/* LEFT INFO */}
          <div ref={r2} className="rx3-reveal-left delay-1">
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                {
                  icon: <MapPin size={17} />,
                  label: "Address",
                  val: "Kandy Road, Colombo, Sri Lanka",
                },
                {
                  icon: <Phone size={17} />,
                  label: "Phone",
                  val: "+94 91 227 6246",
                },
                {
                  icon: <Mail size={17} />,
                  label: "Email",
                  val: "support@routex.com",
                },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    padding: "18px 20px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.22)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    backdropFilter: "blur(6px)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    boxShadow: "0 8px 24px rgba(148, 163, 184, 0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 16px 32px rgba(29, 78, 216, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(148, 163, 184, 0.08)";
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                      background: "#1D4ED8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      flexShrink: 0,
                      boxShadow: "0 12px 28px rgba(29, 78, 216, 0.25)",
                    }}
                  >
                    {icon}
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        color: "#94A3B8",
                        marginBottom: 6,
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#0F172A",
                        lineHeight: 1.5,
                      }}
                    >
                      {val}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT FORM */}
          <div
            ref={r3}
            className="rx3-reveal-right delay-2"
            style={{
              background: "white",
              borderRadius: 18,
              padding: "36px 32px",
              boxShadow: "8px 8px 0px #BFDBFE",
              border: "1.5px solid #E2E8F0",
              marginTop: "0",
            }}
          >
            {sent ? (
              <div style={{ textAlign: "center", padding: "44px 0" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    background: "#06B6D4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                  }}
                >
                  <CheckCircle size={28} color="#1D4ED8" />
                </div>

                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: 8,
                  }}
                >
                  Message Sent!
                </h3>

                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 14,
                    color: "#475569",
                  }}
                >
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handle}
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: 4,
                  }}
                >
                  Send a Message
                </h3>

                {[
                  { k: "name", label: "Full Name", ph: "Nimal Perera" },
                  {
                    k: "email",
                    label: "Email Address",
                    ph: "nimal@example.com",
                  },
                  { k: "subject", label: "Subject", ph: "How can we help?" },
                ].map(({ k, label, ph }) => (
                  <div key={k}>
                    <label
                      style={{
                        display: "block",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 9,
                        color: "#64748B",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 6,
                      }}
                    >
                      {label}
                    </label>

                    <input
                      className="rx3-input"
                      type={k === "email" ? "email" : "text"}
                      placeholder={ph}
                      value={form[k]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [k]: e.target.value }))
                      }
                      required
                    />
                  </div>
                ))}

                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 6,
                    }}
                  >
                    Message
                  </label>

                  <textarea
                    className="rx3-input"
                    rows={4}
                    placeholder="Tell us about your delivery needs..."
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    required
                    style={{ resize: "vertical", minHeight: 138 }}
                  />
                </div>

                <button
                  type="submit"
                  className="rx3-btn-fill"
                  style={{ justifyContent: "center", width: "100%", marginTop: 12 }}
                >
                  Send Message <Send size={13} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");

    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const navbarOffset = 60;
        const y = el.getBoundingClientRect().top + window.pageYOffset - navbarOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Hero />
          <MarqueeBand />
          <About />
          <Services />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}