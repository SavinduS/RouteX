import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowRight, ArrowUpRight, Truck, MapPin, Phone, Mail, Package, Navigation, BarChart3, Clock, Shield, CheckCircle, Send,
} from "lucide-react";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #F1F5F9; font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Scroll reveal animations */
    .rx3-reveal {
      opacity: 0;
      transform: translateY(60px);
      filter: blur(8px);
      transition: opacity 0.75s ease, transform 0.75s ease, filter 0.75s ease;
      will-change: opacity, transform, filter;
    }
    .rx3-reveal.visible { opacity: 1; transform: translateY(0); filter: blur(0); }
    .rx3-reveal.delay-1 { transition-delay: 0.12s; }
    .rx3-reveal.delay-2 { transition-delay: 0.22s; }
    .rx3-reveal.delay-3 { transition-delay: 0.32s; }

    .rx3-reveal-left {
      opacity: 0;
      transform: translateX(-60px);
      filter: blur(8px);
      transition: opacity 0.75s ease, transform 0.75s ease, filter 0.75s ease;
      will-change: opacity, transform, filter;
    }
    .rx3-reveal-left.visible { opacity: 1; transform: translateX(0); filter: blur(0); }

    .rx3-reveal-right {
      opacity: 0;
      transform: translateX(60px);
      filter: blur(8px);
      transition: opacity 0.75s ease, transform 0.75s ease, filter 0.75s ease;
      will-change: opacity, transform, filter;
    }
    .rx3-reveal-right.visible { opacity: 1; transform: translateX(0); filter: blur(0); }

    /* Marquee animation */
    @keyframes rx3-marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    .rx3-marquee-track { display: flex; animation: rx3-marquee 22s linear infinite; width: max-content; }

    /* Service card hover line */
    .rx3-svc-card-line::before {
      content: ''; position: absolute;
      bottom: 0; left: 0; width: 0; height: 3px;
      background: #06B6D4; transition: width 0.4s ease;
    }
    .rx3-svc-card-line:hover::before { width: 100%; }

    /* Utility animations */
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
        if (entry.isIntersecting) { el.classList.add("visible"); }
        else { el.classList.remove("visible"); }
      },
      { threshold, root: null, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

/*  HERO */
function Hero() {
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal();

  return (
    <section
      id="top"
      className="relative flex min-h-[95vh] lg:min-h-[92vh] items-center overflow-hidden bg-center bg-no-repeat bg-cover"
      style={{
        scrollMarginTop: "100px",
        backgroundImage: 'linear-gradient(to right, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.85) 50%, rgba(15, 23, 42, 0.4) 100%), linear-gradient(to bottom, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%), url("/delivery.jpg")',
      }}
    >
      <div className="relative z-[1] mx-auto w-full max-w-[1200px] px-6 pb-24 pt-[120px] lg:pt-[100px]">
        <div className="max-w-[720px]">
          <div
            ref={r1}
            className="rx3-reveal mb-[32px] lg:mb-[42px] inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-xl backdrop-blur-md"
          >
            <div className="rx3-pulse h-2 w-2 rounded-full bg-[#06B6D4]" />
            <span className="font-mono text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">
              Smart Logistics Across Sri Lanka
            </span>
          </div>

          <h1
            ref={r2}
            className="rx3-reveal delay-1 mb-8 lg:mb-12 font-['Poppins'] text-[clamp(2.2rem,8vw,4.8rem)] font-black leading-[1.05] tracking-[-0.03em] text-white"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
          >
            Last Mile Delivery, <br />
            <span className="text-[#06B6D4]">Reimagined.</span>
          </h1>

          <p
            ref={r3}
            className="rx3-reveal delay-2 mb-[40px] max-w-[600px] font-['Plus_Jakarta_Sans'] text-[16px] lg:text-[18px] leading-[1.8] text-slate-300 font-medium"
          >
            RouteX gives Sri Lankan businesses a smarter way to deliver with AI
            route planning, live package tracking, and a trusted driver network
            built for speed, visibility, and reliability.
          </p>

          <div ref={r4} className="rx3-reveal delay-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              to="/entrepreneur/create-delivery"
              className="inline-flex h-[56px] items-center justify-center gap-3 rounded-[20px] bg-[#1D4ED8] px-8 font-['Poppins'] text-[13px] font-black uppercase tracking-[0.1em] text-white shadow-[0_12px_24px_rgba(29,78,216,0.3)] transition-all duration-300 hover:bg-[#2563EB] hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(29,78,216,0.4)] active:scale-95"
            >
              Place Order <ArrowRight size={18} />
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById("services");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex h-[56px] items-center justify-center gap-3 rounded-[20px] border-2 border-white/20 bg-white/5 px-8 font-['Poppins'] text-[13px] font-black uppercase tracking-[0.1em] text-white backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/40 active:scale-95"
            >
              Explore Solutions
            </button>
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
    <div className="overflow-hidden border-y border-cyan-500/20 bg-[#0F172A] py-4">
      <div className="rx3-marquee-track">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center whitespace-nowrap">
            <span className={`px-7 font-['Poppins'] text-[10px] font-semibold uppercase tracking-[0.12em] ${i % 4 === 0 ? "text-[#06B6D4]" : "text-slate-500"}`}>{item}</span>
            <span className="text-[8px] text-blue-700">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/*  ABOUT */
function About() {
  const r1 = useReveal();
  const bullets = [
    "Better visibility, faster coordination, and dependable delivery service.",
    "Simpler pickup-to-drop-off operations for daily business needs.",
    "Smarter planning and better control for growing businesses.",
    "More reliable logistics for businesses, drivers, and customers across Sri Lanka.",
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#071327] px-[clamp(18px,4vw,32px)] py-20"
      style={{ scrollMarginTop: "100px" }}
    >
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none bg-[radial-gradient(rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[length:32px_32px]" />

      <div className="relative z-[1] mx-auto max-w-[1200px]">
        <div ref={r1} className="rx3-reveal max-w-[1150px]">
          <p className="mb-[18px] font-mono text-[11px] uppercase tracking-[0.22em] text-[#22D3EE]">
            — Our Story
          </p>

          <h2 className="mb-[26px] font-['Poppins'] text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.35] tracking-[-0.04em] text-white">
            Born in Colombo.
            <br />
            <span className="text-[#22D3EE]">Built for Sri Lanka.</span>
          </h2>

          <div className="grid max-w-[1000px] gap-[22px]">
            {bullets.map((item, i) => (
              <div key={i} className="flex items-start gap-[10px]">
                <div className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-[#22D3EE]" />
                <p className="m-0 font-['Plus_Jakarta_Sans'] text-[19px] leading-[1.8] text-slate-200/75">
                  {item}
                </p>
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
      className="bg-[#F1F5F9] px-[clamp(18px,4vw,32px)] py-[60px] pb-[100px]"
      style={{ scrollMarginTop: "100px" }}
    >
      <div className="mx-auto max-w-[1200px]">
        <div ref={r1} className="rx3-reveal-left mb-[56px]">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-blue-700">— What We Offer</p>
          <h2 className="font-['Poppins'] text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.1] tracking-[-0.5px] text-[#0F172A]">
            Six Reasons Businesses<br /><span className="text-blue-700">Choose RouteX</span>
          </h2>
        </div>

        <div ref={r2} className="rx3-reveal-right delay-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon, title, desc, tag }) => (
            <div key={title} className="rx3-svc-card-line relative cursor-pointer overflow-hidden rounded bg-white border-[1.5px] border-slate-200 p-8 pt-7 transition-all duration-350 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_40px_rgba(29,78,216,0.1)]">
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-blue-700">{icon}</div>
                <span className="rounded-[2px] bg-blue-100 px-[10px] py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-blue-700">{tag}</span>
              </div>
              <h3 className="mb-[10px] font-['Poppins'] text-[18px] font-bold leading-[1.2] text-[#0F172A]">{title}</h3>
              <p className="mb-[18px] font-['Plus_Jakarta_Sans'] text-[13px] leading-[1.75] text-slate-600">{desc}</p>
              <span className="inline-flex items-center gap-[5px] font-mono text-[10px] uppercase tracking-[0.08em] text-blue-700">
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
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const handle = (e) => { e.preventDefault(); setSent(true); };

  const inputClass = "w-full rounded-lg border-[1.5px] border-slate-200 bg-white px-4 py-[13px] font-['Plus_Jakarta_Sans'] text-sm text-[#0F172A] outline-none transition-colors placeholder:text-slate-300 focus:border-blue-700";
  const labelClass = "mb-1.5 block font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500";

  return (
    <section
      id="contact"
      className="bg-[#E0F2FE] px-[clamp(18px,4vw,32px)] py-[60px] pb-[100px]"
      style={{ scrollMarginTop: "100px" }}
    >
      <div className="mx-auto max-w-[1200px]">
        <div ref={r1} className="rx3-reveal-left mb-4">
          <p className="m-0 font-mono text-[10px] uppercase tracking-[0.2em] text-blue-700">— Get In Touch</p>
        </div>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 items-start">
          <div ref={r2} className="rx3-reveal-left delay-1">
            <div className="mb-8">
              <h2 className="mb-8 font-['Poppins'] text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-slate-900">
                Ready to Deliver <br />
                <span className="text-blue-700">Something Great?</span>
              </h2>
              <p className="font-['Plus_Jakarta_Sans'] text-base leading-[1.85] text-slate-600">
                Whether you're scaling an e-commerce operation, building a driver career, or simply want to know more about RouteX - we'd love to hear from you.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {[
                { icon: <MapPin size={17} />, label: "Address", val: "Kandy Road, Colombo, Sri Lanka" },
                { icon: <Phone size={17} />, label: "Phone", val: "+94 91 227 6246" },
                { icon: <Mail size={17} />, label: "Email", val: "support@routex.com" },
              ].map(({ icon, label, val }) => (
                <div key={label} className="group flex items-center gap-4 rounded-[20px] border border-white/25 bg-white/22 p-5 backdrop-blur-md shadow-[0_8px_24px_rgba(148,163,184,0.08)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(29,78,216,0.12)]">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-[0_12px_28px_rgba(29,78,216,0.25)]">{icon}</div>
                  <div>
                    <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
                    <p className="m-0 font-['Plus_Jakarta_Sans'] text-[15px] font-bold leading-[1.5] text-[#0F172A]">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={r3} className="rx3-reveal-right delay-2 rounded-[18px] border-[1.5px] border-slate-200 bg-white p-8 pb-9 shadow-[8px_8px_0px_#BFDBFE]">
            {sent ? (
              <div className="py-11 text-center">
                <div className="mx-auto mb-[18px] flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-cyan-500"><CheckCircle size={28} className="text-blue-700" /></div>
                <h3 className="mb-2 font-['Poppins'] text-[22px] font-bold text-[#0F172A]">Message Sent!</h3>
                <p className="font-['Plus_Jakarta_Sans'] text-sm text-slate-600">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handle} className="flex flex-col gap-[18px]">
                <h3 className="mb-1 font-['Poppins'] text-xl font-bold text-[#0F172A]">Send a Message</h3>
                {[
                  { k: "name", label: "Full Name", ph: "Nimal Perera" },
                  { k: "email", label: "Email Address", ph: "nimal@example.com", type: "email" },
                  { k: "subject", label: "Subject", ph: "How can we help?" },
                ].map(({ k, label, ph, type = "text" }) => (
                  <div key={k}>
                    <label className={labelClass}>{label}</label>
                    <input className={inputClass} type={type} placeholder={ph} value={form[k]} onChange={(e) => setForm(f => ({ ...f, [k]: e.target.value }))} required />
                  </div>
                ))}
                <div>
                  <label className={labelClass}>Message</label>
                  <textarea className={`${inputClass} min-h-[138px] resize-y`} rows={4} placeholder="Tell us about your delivery needs..." value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} required />
                </div>
                <button type="submit" className="mt-3 flex h-[50px] w-full items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-blue-700 px-6 py-[13px] font-['Poppins'] text-[12px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_8px_18px_rgba(29,78,216,0.20)] transition-all duration-300 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(29,78,216,0.28)]">
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
  const isInitialLoad = useRef(true);


  useEffect(() => {
    // On initial load, scroll to #top (Hero) if no hash is present
    if (!window.location.hash) {
      const el = document.getElementById("top");
      if (el) {
        const navbarOffset = 60;
        const y = el.getBoundingClientRect().top + window.pageYOffset - navbarOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

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
