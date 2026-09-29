import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { visitService } from '../../services/visitService';

const indianMobileRegex = /^[6-9]\d{9}$/;

const visitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(indianMobileRegex, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  scheduled_date: z.string().min(1, 'Please select a visit date'),
  scheduled_time: z.string().min(1, 'Please select a preferred time slot'),
  message: z.string().optional()
});

export const ScheduleVisitModal = ({ isOpen, onClose, property }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      name: '',
      mobile: '',
      email: '',
      scheduled_date: todayStr,
      scheduled_time: 'Evening (4 PM - 7 PM)',
      message: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      setSuccessMessage('');
      setErrorMessage('');
      reset({
        name: '',
        mobile: '',
        email: '',
        scheduled_date: todayStr,
        scheduled_time: 'Evening (4 PM - 7 PM)',
        message: ''
      });
    }
  }, [isOpen, reset, todayStr]);

  const onSubmit = async (formData) => {
    if (!property?.property_code) {
      setErrorMessage('Property reference missing. Please try from a property page.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const source = searchParams.get('source') || 'Website';
      const utm_source = searchParams.get('utm_source') || undefined;

      const payload = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email ? formData.email.trim() : undefined,
        property_code: property.property_code,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        message: formData.message || undefined,
        source: source,
        utm_source: utm_source
      };

      await visitService.bookPublicVisit(payload);
      setSuccessMessage(`Visit request for ${property.property_code} submitted for ${formData.scheduled_date} (${formData.scheduled_time}). Our broker will contact you to coordinate arrival.`);
      reset();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to schedule visit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property ? `Schedule Visit: ${property.property_code}` : 'Schedule a Property Visit'}
      maxWidth="max-w-lg"
    >
      {successMessage ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Visit Scheduled!</h4>
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
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="truncate text-xs">
                <span className="font-semibold text-slate-900 block truncate">{property.title}</span>
                <span className="text-slate-500">{property.locality} • Rent: ₹{property.rent}/mo</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Priya Nair"
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
                placeholder="priya@example.com"
                {...register('email')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                {...register('scheduled_date')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${
                  errors.scheduled_date ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-600'
                }`}
              />
              {errors.scheduled_date && <p className="mt-1 text-xs text-rose-500">{errors.scheduled_date.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Time Slot <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('scheduled_time')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              >
                <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Any special requests or instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Will visit with family, need keys ready at 5 PM"
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
              <span>Confirm Visit Request</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
