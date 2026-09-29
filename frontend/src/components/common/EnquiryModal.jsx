import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { enquiryService } from '../../services/enquiryService';

const indianMobileRegex = /^[6-9]\d{9}$/;

const enquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(indianMobileRegex, 'Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, 9)'),
  whatsapp: z.string().optional(),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  preferred_visit_date: z.string().optional().or(z.literal('')),
  preferred_visit_time: z.string().optional().or(z.literal('')),
  message: z.string().optional()
});

export const EnquiryModal = ({ isOpen, onClose, property }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: '',
      mobile: '',
      whatsapp: '',
      email: '',
      preferred_visit_date: '',
      preferred_visit_time: '',
      message: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      setSuccessMessage('');
      setErrorMessage('');
      reset({
        message: property ? `Hi, I am interested in ${property.property_code} - ${property.title}. Please provide more details.` : ''
      });
    }
  }, [isOpen, property, reset]);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // Capture UTM params from URL
      const searchParams = new URLSearchParams(window.location.search);
      const source = searchParams.get('source') || (searchParams.get('utm_source') ? 'Campaign' : 'Website');
      const utm_source = searchParams.get('utm_source') || undefined;
      const utm_medium = searchParams.get('utm_medium') || undefined;
      const utm_campaign = searchParams.get('utm_campaign') || undefined;

      const payload = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        whatsapp: formData.whatsapp ? formData.whatsapp.trim() : formData.mobile.trim(),
        email: formData.email ? formData.email.trim() : undefined,
        property_code: property?.property_code || undefined,
        message: formData.message || undefined,
        preferred_visit_date: formData.preferred_visit_date || undefined,
        preferred_visit_time: formData.preferred_visit_time || undefined,
        source: source,
        utm_source: utm_source,
        utm_medium: utm_medium,
        utm_campaign: utm_campaign
      };

      await enquiryService.submitPublicEnquiry(payload);
      setSuccessMessage('Thank you! Your enquiry has been received. Our broker representative will call you shortly.');
      reset();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit enquiry. Please try again or reach out via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property ? `Enquire about ${property.property_code}` : 'Submit Property Enquiry'}
      maxWidth="max-w-lg"
    >
      {successMessage ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Enquiry Submitted!</h4>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">{successMessage}</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {property && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-600 text-white">
                {property.property_code}
              </span>
              <div className="truncate text-xs">
                <span className="font-semibold text-slate-900 block truncate">{property.title}</span>
                <span className="text-slate-500">{property.locality}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              {...register('name')}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${
                errors.name ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-medium">+91</span>
                <input
                  type="tel"
                  placeholder="8510992504"
                  maxLength={10}
                  {...register('mobile')}
                  className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${
                    errors.mobile ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.mobile && <p className="mt-1 text-xs text-rose-500">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="rahul@example.com"
                {...register('email')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${
                  errors.email ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-600'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Visit Date (Optional)
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('preferred_visit_date')}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Time Slot (Optional)
              </label>
              <select
                {...register('preferred_visit_time')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              >
                <option value="">Any Time</option>
                <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message or Specific Requirement
            </label>
            <textarea
              rows={3}
              placeholder="Tell us when you are looking to move, family/bachelor status, etc."
              {...register('message')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              <span>Submit Enquiry</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
