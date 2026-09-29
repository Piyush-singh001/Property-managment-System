import React from 'react';
import { useSettings } from '../../context/SettingsContext';

export const PrivacyPolicyPage = () => {
  const { settings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: September 2026</p>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            When you browse properties on {settings.business_name}, we do not require account registration or passwords. When you choose to submit an enquiry or schedule a property visit, we collect your name, mobile phone number, and optional email or message preferences.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">2. How We Use Your Information</h2>
          <p>
            The collected information is solely utilized to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Facilitate property viewings and coordinate site visits between you and our verified broker representatives.</li>
            <li>Send property updates and availability notifications via WhatsApp or direct phone calls.</li>
            <li>Maintain customer inquiry history to prevent duplicate data collection.</li>
          </ul>

          <h2 className="text-base font-bold text-slate-900 mt-6">3. Data Security & Third Parties</h2>
          <p>
            We strictly protect your contact details. We never sell, rent, or trade customer contact numbers to third-party telemarketers. Only authorized property managers have access to customer enquiry logs.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">4. Contacting Us</h2>
          <p>
            If you have questions regarding your contact details or wish to have your inquiry removed, please contact us at {settings.email} or call {settings.phone}.
          </p>
        </section>
      </div>
    </div>
  );
};
