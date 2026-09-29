import React from 'react';
import { Building2, ShieldCheck, Users, Award, CheckCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const AboutPage = () => {
  const { settings } = useSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">About Our Brokerage</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Simplifying Rental Discovery for Tenants & Owners
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          {settings.business_name} is a premier property advisory firm dedicated to connecting tenants with verified rental apartments, builder floors, and luxury homes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">100% Genuine Listings</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We do not engage in bait-and-switch listings. Every home featured on our platform is physically visited and photographed by our field agents.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Dedicated Broker Support</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Tenants deal directly with professional rental specialists. We assist with landlord negotiations, police verification, and lease agreement paperwork.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Fair & Clear Pricing</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Complete transparency on monthly rent, security deposits, maintenance fees, and society move-in guidelines. No surprise charges on move-in day.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12">
        <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
            <span>Zero spam calls — we only contact you regarding your requested property.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
            <span>Instant physical visits arranged within 24 hours of enquiry.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
            <span>Assistance with rent agreements and official documentation.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
            <span>Specialized portfolios for families, working bachelors, and corporate tenants.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
