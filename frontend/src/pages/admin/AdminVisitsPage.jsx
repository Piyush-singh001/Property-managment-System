import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Phone, MessageSquare, Check, X,
  Clock, AlertCircle, Edit, CheckCircle2
} from 'lucide-react';
import { visitService } from '../../services/visitService';
import { formatDate, getWhatsAppLink, getCallLink } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';

export const AdminVisitsPage = () => {
  const [visits, setVisits] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [propertyCodeSearch, setPropertyCodeSearch] = useState('');
  const [page, setPage] = useState(1);

  // Reschedule Modal
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('Evening (4 PM - 7 PM)');
  const [adminNotes, setAdminNotes] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await visitService.getAdminVisits({
        page,
        limit: 12,
        status: statusFilter || undefined,
        date_filter: dateFilter || undefined,
        property_code: propertyCodeSearch.trim() || undefined
      });
      setVisits(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to load visits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [statusFilter, dateFilter, propertyCodeSearch, page]);

  const handleUpdateStatus = async (visitId, status) => {
    try {
      await visitService.updateStatus(visitId, { status });
      showToast(`Visit marked as ${status}`);
      fetchVisits();
    } catch (err) {
      alert(err.message || 'Failed to update visit status');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget || !newDate) return;

    setModalSubmitting(true);
    try {
      await visitService.updateStatus(rescheduleTarget.id, {
        status: 'Rescheduled',
        scheduled_date: newDate,
        scheduled_time: newTime,
        admin_notes: adminNotes.trim() || undefined
      });
      showToast(`Visit rescheduled to ${newDate} (${newTime})`);
      setRescheduleTarget(null);
      fetchVisits();
    } catch (err) {
      alert(err.message || 'Failed to reschedule visit');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Property Visit Requests</h1>
        <p className="text-xs text-slate-500 mt-1">
          Coordinate on-site client inspections, manage confirmations, and reschedule appointments.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-100">
          {[
            { id: '', label: 'All Visits' },
            { id: 'Pending', label: 'Pending' },
            { id: 'Confirmed', label: 'Confirmed' },
            { id: 'Rescheduled', label: 'Rescheduled' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Cancelled', label: 'Cancelled' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStatusFilter(st.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors shrink-0 ${
                statusFilter === st.id
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              placeholder="Search by Property Code (PROP-...)"
              value={propertyCodeSearch}
              onChange={(e) => {
                setPropertyCodeSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          {dateFilter && (
            <div>
              <button
                onClick={() => setDateFilter('')}
                className="px-3 py-2 text-xs text-rose-600 hover:underline font-semibold"
              >
                Clear Date Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Property</th>
                <th className="px-4 py-3.5">Scheduled Timing</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Admin Notes</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading visits...
                  </td>
                </tr>
              ) : visits.length > 0 ? (
                visits.map((v) => {
                  const whatsappUrl = getWhatsAppLink(
                    v.customer?.whatsapp || v.customer?.mobile,
                    `Hi ${v.customer?.name || ''}, confirming your property visit for ${v.property_code} scheduled on ${formatDate(v.scheduled_date)} at ${v.scheduled_time}: `
                  );
                  const callUrl = getCallLink(v.customer?.mobile);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{v.customer?.name || 'Customer'}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{v.customer?.mobile}</div>
                        {v.customer?.email && <div className="text-slate-400 text-[10px]">{v.customer?.email}</div>}
                      </td>

                      {/* Property */}
                      <td className="px-4 py-4">
                        <span className="font-mono text-[11px] font-bold text-indigo-600 block">
                          {v.property_code || '—'}
                        </span>
                        <span className="font-medium text-slate-800 truncate block max-w-xs">
                          {v.property_title || '—'}
                        </span>
                      </td>

                      {/* Scheduled Timing */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-indigo-700 flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>{formatDate(v.scheduled_date)}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{v.scheduled_time}</div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge type="visit" status={v.status} />
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-4 text-slate-600 italic">
                        {v.admin_notes || '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={callUrl}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {v.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(v.id, 'Confirmed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                            >
                              Confirm
                            </button>
                          )}

                          {['Pending', 'Confirmed'].includes(v.status) && (
                            <button
                              onClick={() => {
                                setRescheduleTarget(v);
                                setNewDate(v.scheduled_date);
                                setNewTime(v.scheduled_time);
                                setAdminNotes(v.admin_notes || '');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold"
                            >
                              Reschedule
                            </button>
                          )}

                          {v.status === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(v.id, 'Completed')}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No visit requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <Modal
          isOpen={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          title={`Reschedule Visit: ${rescheduleTarget.customer?.name} (${rescheduleTarget.property_code})`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRescheduleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Visit Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes on Rescheduling</label>
              <textarea
                rows={2}
                placeholder="Reason for reschedule..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                {modalSubmitting ? 'Updating...' : 'Confirm Reschedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
