import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Building2, Phone, MessageSquare, Menu, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Navbar = () => {
  const { settings, getCallUrl, getWhatsAppUrl } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-22 sm:h-24">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group py-1">
            <img
              src="/logo.png"
              alt="Shree Radha Krpa Realty"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-contain bg-white shadow-md ring-2 ring-slate-300 group-hover:scale-105 transition-transform shrink-0"
            />
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight block leading-tight">
                {settings.business_name}
              </span>
              <span className="text-xs sm:text-[13px] font-semibold text-slate-600 tracking-wider uppercase block mt-0.5">
                Your Trust, Our Commitment
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Quick Contact & Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={getCallUrl()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 text-sm font-medium transition-all"
              title="Call Broker"
            >
              <Phone className="w-4 h-4 text-indigo-600" />
              <span>{settings.phone}</span>
            </a>

            <a
              href={getWhatsAppUrl(null)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-xs shadow-emerald-200 transition-all hover:shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href={getCallUrl()}
              className="p-2 text-indigo-600 bg-indigo-50 rounded-lg"
              title="Call Broker"
            >
              <Phone className="w-5 h-5" />
            </a>
            <a
              href={getWhatsAppUrl(null)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white bg-emerald-600 rounded-lg"
              title="WhatsApp"
            >
              <MessageSquare className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <a
              href={getCallUrl()}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm"
            >
              <Phone className="w-4 h-4 text-indigo-600" />
              <span>Call: {settings.phone}</span>
            </a>
            <a
              href={getWhatsAppUrl(null)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-medium text-sm shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
