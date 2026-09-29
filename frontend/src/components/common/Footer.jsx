import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer = () => {
  const { settings, getCallUrl, getWhatsAppUrl } = useSettings();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Shree Radha Krpa Realty"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-contain bg-white p-1 shadow-lg ring-2 ring-slate-600 shrink-0"
              />
              <div>
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight block">
                  {settings.business_name}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-300 tracking-wider uppercase block mt-0.5">
                  Your Trust, Our Commitment
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your trusted property rental advisory. We help families, working professionals, and corporate tenants find verified rental flats, builder floors, and villas with 100% transparency.
            </p>
          </div>

          {/* Quick Property Search Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore Properties
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/properties" className="hover:text-white transition-colors">
                  All Rental Properties
                </Link>
              </li>
              <li>
                <Link to="/properties?bhk=1+BHK" className="hover:text-white transition-colors">
                  1 BHK Studio & Flats
                </Link>
              </li>
              <li>
                <Link to="/properties?bhk=2+BHK" className="hover:text-white transition-colors">
                  2 BHK Family Homes
                </Link>
              </li>
              <li>
                <Link to="/properties?bhk=3+BHK" className="hover:text-white transition-colors">
                  3 BHK Premium Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties?property_type=Villa" className="hover:text-white transition-colors">
                  Luxury Independent Villas
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Agency
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Location
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Broker Contact
            </h3>
            <div className="space-y-3 text-sm">
              <a href={getCallUrl()} className="flex items-start gap-3 hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{settings.phone}</span>
              </a>
              <a href={getWhatsAppUrl(null)} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.whatsapp} (WhatsApp)</span>
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-start gap-3 hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.email}</span>
              </a>
              <div className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            &copy; {new Date().getFullYear()} {settings.business_name}. All rights reserved. Registered Rental Brokerage.
          </p>
          <p className="text-center md:text-right">
            Disclaimer: All property listings and specifications are subject to physical verification.
          </p>
        </div>
      </div>
    </footer>
  );
};
