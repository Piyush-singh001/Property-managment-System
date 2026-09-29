import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Phone, MessageSquare } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const PublicLayout = () => {
  const { getCallUrl, getWhatsAppUrl } = useSettings();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Mobile Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 z-30 flex items-center gap-2 shadow-lg">
        <a
          href={getCallUrl()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          <Phone className="w-4 h-4 text-indigo-600" />
          <span>Call Broker</span>
        </a>
        <a
          href={getWhatsAppUrl(null)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs hover:bg-emerald-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
