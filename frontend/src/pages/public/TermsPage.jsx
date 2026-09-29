import React from 'react';
import { useSettings } from '../../context/SettingsContext';

export const TermsPage = () => {
  const { settings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Terms & Conditions</h1>
        <p className="text-xs text-slate-400">Effective Date: September 2026</p>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and utilizing {settings.business_name} property portal, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">2. Property Information & Availability</h2>
          <p>
            While every effort is made to maintain verified and up-to-date property listings, rental availability, monthly rents, maintenance charges, and society rules are subject to final confirmation upon physical site inspection and landlord agreement.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">3. Brokerage & Commission Policies</h2>
          <p>
            Brokerage services provided by {settings.business_name} are subject to standard local market terms agreed upon prior to rental agreement execution. No fee is charged for browsing properties or submitting initial inquiries.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">4. Rental Agreements & Compliance</h2>
          <p>
            All tenancies facilitated through our brokerage require mandatory police verification and registered or notarized rent agreements in compliance with prevailing state tenancy regulations.
          </p>
        </section>
      </div>
    </div>
  );
};
