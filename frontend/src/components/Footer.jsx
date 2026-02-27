import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, Navigation } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1B5E20] text-gray-200 pt-16 pb-10 px-10 font-sans mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
        
        {/* Section 1: Brand Info */}
        <div className="space-y-6">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="bg-[#A5D6A7] p-2 rounded-lg">
              <Navigation className="text-[#1B5E20]" size={24} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase">RouteX</h2>
          </div>
          <p className="text-sm leading-relaxed text-gray-300/80 max-w-xs mx-auto md:mx-0">
            Smart Last Mile Delivery platform for rural entrepreneurs. Connecting businesses with reliable logistics solutions nationwide.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="p-2.5 rounded-full bg-[#144718] text-[#A5D6A7] hover:bg-[#A5D6A7] hover:text-[#1B5E20] transition-all duration-300">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Section 2: Quick Links */}
        <div className="md:pl-10">
          <h3 className="text-[#A5D6A7] font-black uppercase tracking-widest text-xs mb-8">Quick Links</h3>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
            <li><a href="/admin/orders" className="hover:text-white transition-colors">Track Order</a></li>
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
          </ul>
        </div>

        {/* Section 3: Contact Details */}
        <div>
          <h3 className="text-[#A5D6A7] font-black uppercase tracking-widest text-xs mb-8">Contact Us</h3>
          <ul className="space-y-6">
            <li className="flex items-start justify-center md:justify-start gap-4">
              <MapPin className="text-[#A5D6A7] shrink-0" size={20} />
              <span className="text-sm leading-tight">Kandy Road, Colombo, Sri Lanka</span>
            </li>
            <li className="flex items-center justify-center md:justify-start gap-4">
              <Phone className="text-[#A5D6A7] shrink-0" size={20} />
              <span className="text-sm font-bold">+94 91 227 6246</span>
            </li>
            <li className="flex items-center justify-center md:justify-start gap-4">
              <Mail className="text-[#A5D6A7] shrink-0" size={20} />
              <span className="text-sm font-bold">support@routex.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
        <p>© {currentYear} RouteX Logistics. All Rights Reserved.</p>
        <div className="flex gap-10">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;