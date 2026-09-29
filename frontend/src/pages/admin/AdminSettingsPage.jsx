import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, AlertCircle, Phone, MessageSquare, Mail, MapPin } from 'lucide-react';
import { settingService } from '../../services/settingService';
import { useSettings } from '../../context/SettingsContext';

export const AdminSettingsPage = () => {
  const { refreshSettings } = useSettings();

  const [formData, setFormData] = useState({
    business_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    maps_url: '',
    default_whatsapp_message: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingService.getAdminSettings();
        setFormData(data);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load business settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      await settingService.updateAdminSettings(formData);
      await refreshSettings();
      showToast('Business settings saved! Public website updated.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Loading business profile settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Profile & Contact Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Centralized contact numbers, WhatsApp configurations, and business identity for your public website.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Business / Agency Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Public Contact Phone <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Displayed in navbar, property cards, and call buttons.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Number <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Include country code (e.g. +918510992504).</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>Business Email Address <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Google Maps URL</span>
            </label>
            <input
              type="url"
              value={formData.maps_url || ''}
              onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Office / Brokerage Physical Address
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            />
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Default WhatsApp Message Template
            </label>
            <textarea
              rows={3}
              value={formData.default_whatsapp_message}
              onChange={(e) => setFormData({ ...formData, default_whatsapp_message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            ></textarea>
            <div className="text-[11px] text-slate-400 mt-1">
              Available place-holders: <code className="text-indigo-600 font-bold">{'{property_code}'}</code>, <code className="text-indigo-600 font-bold">{'{bhk}'}</code>, <code className="text-indigo-600 font-bold">{'{furnishing}'}</code>, <code className="text-indigo-600 font-bold">{'{locality}'}</code>, <code className="text-indigo-600 font-bold">{'{title}'}</code>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            {saving ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
