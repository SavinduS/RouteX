import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Truck,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-700 bg-slate-900 px-6 pb-10 pt-16 text-slate-300 md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 text-center md:grid-cols-3 md:text-left">
        {/* Brand Info */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3 md:justify-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D4ED8] shadow-sm">
              <Truck className="text-white" size={22} />
            </div>

            <div className="leading-none">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Route<span className="text-cyan-500">X</span>
              </h2>
              <p className="mt-1 text-[9px] uppercase tracking-[0.35em] text-slate-400 font-semibold">
                Logistics Platform
              </p>
            </div>
          </div>

          <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-400 md:mx-0">
            Smart last mile delivery platform for modern businesses. Connecting
            customers, drivers, and logistics operations through one reliable system.
          </p>

          <div className="flex items-center justify-center gap-4 md:justify-start">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="rounded-full border border-slate-600 bg-slate-800 p-2.5 text-slate-100 transition-all duration-300 hover:border-cyan-500 hover:bg-cyan-500 hover:text-white"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:pl-10">
          <h3 className="mb-8 text-xs font-black uppercase tracking-widest text-slate-100">
            Quick Links
          </h3>
          <ul className="space-y-4 text-sm font-medium text-slate-300">
            <li>
              <a href="#top" className="transition-colors hover:text-cyan-500">
                Home
              </a>
            </li>
            <li>
              <a href="#services" className="transition-colors hover:text-cyan-500">
                Services
              </a>
            </li>
            <li>
              <a href="/track" className="transition-colors hover:text-cyan-500">
                Track Order
              </a>
            </li>
            <li>
              <a href="#about" className="transition-colors hover:text-cyan-500">
                About Us
              </a>
            </li>
            <li>
              <a href="#contact" className="transition-colors hover:text-cyan-500">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-8 text-xs font-black uppercase tracking-widest text-slate-100">
            Contact Us
          </h3>
          <ul className="space-y-6">
            <li className="flex items-start justify-center gap-4 md:justify-start">
              <MapPin className="shrink-0 text-cyan-500" size={20} />
              <span className="text-sm leading-tight">
                Kandy Road, Colombo, Sri Lanka
              </span>
            </li>
            <li className="flex items-center justify-center gap-4 md:justify-start">
              <Phone className="shrink-0 text-cyan-500" size={20} />
              <span className="text-sm font-bold">+94 91 227 6246</span>
            </li>
            <li className="flex items-center justify-center gap-4 md:justify-start">
              <Mail className="shrink-0 text-cyan-500" size={20} />
              <span className="text-sm font-bold">support@routex.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-700 pt-8 text-xs font-black uppercase tracking-widest text-slate-500 md:flex-row">
        <p>© {currentYear} RouteX Logistics. All Rights Reserved.</p>
        <div className="flex gap-10">
          <a href="#" className="transition-colors hover:text-cyan-500">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors hover:text-cyan-500">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;