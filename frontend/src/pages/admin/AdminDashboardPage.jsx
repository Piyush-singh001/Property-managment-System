import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, MessageSquareText, Calendar, Users, Plus, ArrowRight,
  Phone, MessageSquare, ExternalLink, RefreshCw, Archive
} from 'lucide-react';
import api from '../../services/api';
import { formatINR, formatDate, getWhatsAppLink, getCallLink } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useSettings } from '../../context/SettingsContext';

export const AdminDashboardPage = () => {
  const { settings } = useSettings();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Loading dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pipeline metrics for properties, enquiries, and scheduled site visits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Properties */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Active Properties</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{metrics?.total_properties || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span className="text-emerald-600 font-semibold">{metrics?.available_properties || 0}</span> Available •{' '}
              <span className="text-amber-600 font-semibold">{metrics?.reserved_properties || 0}</span> Reserved •{' '}
              <span className="text-purple-600 font-semibold">{metrics?.rented_properties || 0}</span> Rented
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Publication Status Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Publication Status</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{metrics?.published_properties || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span className="text-teal-600 font-semibold">{metrics?.published_properties || 0}</span> Live on Website •{' '}
              <span className="text-amber-600 font-semibold">{metrics?.draft_properties || 0}</span> Draft
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <ExternalLink className="w-6 h-6" />
          </div>
        </div>

        {/* Enquiries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Enquiries</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{metrics?.total_enquiries || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span className="text-blue-600 font-semibold">{metrics?.new_enquiries || 0}</span> New (Uncontacted)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MessageSquareText className="w-6 h-6" />
          </div>
        </div>

        {/* Scheduled Site Visits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Site Visits</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{metrics?.upcoming_visits || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span className="text-amber-600 font-semibold">{metrics?.pending_visits || 0}</span> Pending Confirmation
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Secondary Status Badges Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-slate-400 block text-[11px]">Active Available:</span>
            <span className="font-bold text-emerald-700">{metrics?.available_properties || 0} Listings</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Rented / Off-Market:</span>
            <span className="font-bold text-purple-700">{metrics?.rented_properties || 0} Properties</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Draft Listings:</span>
            <span className="font-bold text-amber-700">{metrics?.draft_properties || 0} Drafts</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Soft-Deleted / Archived:</span>
            <span className="font-bold text-slate-600">{metrics?.archived_properties || 0} Archived</span>
          </div>
        </div>

        <Link
          to="/admin/properties?include_archived=true"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>View Archive Vault</span>
        </Link>
      </div>

      {/* Grid: Recent Enquiries on Left, Upcoming Visits on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Recent Enquiries Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Customer Enquiries</h2>
              <span className="text-xs text-slate-400">Incoming leads from website and campaigns</span>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {metrics?.recent_enquiries && metrics.recent_enquiries.length > 0 ? (
              metrics.recent_enquiries.map((enq) => {
                const whatsappUrl = getWhatsAppLink(
                  enq.customer?.whatsapp || enq.customer?.mobile,
                  `Hi ${enq.customer?.name || ''}, regarding your enquiry for ${enq.property_code || 'property'}: `
                );
                const callUrl = getCallLink(enq.customer?.mobile);

                return (
                  <div key={enq.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {enq.customer?.name || 'Customer'}
                        </span>
                        <StatusBadge type="enquiry" status={enq.status} />
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                          {enq.source}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 truncate mb-1">
                        Ref: <span className="font-mono font-semibold text-slate-700">{enq.property_code || 'General'}</span>{' '}
                        {enq.property_title ? `• ${enq.property_title}` : ''}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {formatDate(enq.created_at)} • Mobile: {enq.customer?.mobile}
                      </div>
                    </div>

                    {/* Quick Call & WhatsApp Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={callUrl}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Call Customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">No recent enquiries yet.</div>
            )}
          </div>
        </div>

        {/* Upcoming Scheduled Site Visits */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Site Visits</h2>
              <span className="text-xs text-slate-400">Scheduled visits requiring broker presence</span>
            </div>
            <Link
              to="/admin/visits"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {metrics?.upcoming_visits_list && metrics.upcoming_visits_list.length > 0 ? (
              metrics.upcoming_visits_list.map((v) => (
                <div key={v.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {v.customer?.name || 'Customer'}
                      </span>
                      <StatusBadge type="visit" status={v.status} />
                    </div>

                    <div className="text-xs text-slate-600 font-medium truncate mb-1">
                      Property: <span className="font-mono text-indigo-600 font-semibold">{v.property_code}</span>
                      {v.property_title ? ` • ${v.property_title}` : ''}
                    </div>

                    <div className="text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(v.scheduled_date)} at {v.scheduled_time}</span>
                    </div>
                  </div>

                  <Link
                    to={`/admin/visits`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0"
                  >
                    Manage
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">No scheduled visits for upcoming dates.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
