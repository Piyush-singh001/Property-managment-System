import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { enquiryService } from '../../services/enquiryService';

export const ContactPage = () => {
  const { settings, getWhatsAppUrl, getCallUrl } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim()) {
      setError('Please provide your name and mobile number.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await enquiryService.submitPublicEnquiry({
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim() || undefined,
        message: formData.message.trim() || 'General contact enquiry',
        source: 'Contact Page'
      });
      setSuccess(true);
      setFormData({ name: '', mobile: '', email: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">Get in Touch</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Contact Our Property Team
        </h1>
        <p className="mt-3 text-base text-slate-500">
          Have a question about an available rental property or want us to find a flat tailored to your requirements? Reach out today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Direct Contact Information</h2>
            
            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Call Broker</span>
                  <a href={getCallUrl()} className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {settings.phone}
                  </a>
                  <span className="text-xs text-slate-500 block mt-0.5">Available Mon-Sun, 9 AM - 8 PM</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">WhatsApp Direct</span>
                  <a
                    href={getWhatsAppUrl(null)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-emerald-700 hover:underline block"
                  >
                    {settings.whatsapp}
                  </a>
                  <span className="text-xs text-slate-500 block mt-0.5">Instant message support</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Email Support</span>
                  <a href={`mailto:${settings.email}`} className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Office Address</span>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed mt-0.5">
                    {settings.address}
                  </p>
                  {settings.maps_url && (
                    <a
                      href={settings.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline font-semibold mt-1 inline-block"
                    >
                      View on Google Maps &rarr;
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Message Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Send us a Message</h2>
          <p className="text-xs text-slate-500 mb-6">
            Leave your contact details and our broker will get back to you within 2 hours.
          </p>

          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Message Received!</h4>
              <p className="text-xs text-slate-600">
                Thank you. We have received your query and will contact you via phone or WhatsApp.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="amit@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Requirement / Message
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Looking for a 2 BHK fully furnished apartment in Sector 62 around ₹30k budget."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
