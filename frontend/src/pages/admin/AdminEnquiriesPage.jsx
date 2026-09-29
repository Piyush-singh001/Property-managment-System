import React, { useState, useEffect } from 'react';
import {
  MessageSquareText, Search, Phone, MessageSquare, Plus, FileText,
  Calendar, Check, AlertCircle, Filter, X
} from 'lucide-react';
import { enquiryService } from '../../services/enquiryService';
import { formatDate, getWhatsAppLink, getCallLink } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';

export const AdminEnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [propertyCodeSearch, setPropertyCodeSearch] = useState('');
  const [page, setPage] = useState(1);

  // Notes Modal state
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await enquiryService.getAdminEnquiries({
        page,
        limit: 12,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        property_code: propertyCodeSearch.trim() || undefined
      });
      setEnquiries(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to load enquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, sourceFilter, propertyCodeSearch, page]);

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await enquiryService.updateStatus(enquiryId, newStatus);
      showToast(`Status updated to ${newStatus}`);
      fetchEnquiries();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || !activeEnquiry) return;
    setNoteSubmitting(true);
    try {
      await enquiryService.addNote(activeEnquiry.id, noteText.trim());
      setNoteText('');
      // Refresh current enquiry
      const updated = await enquiryService.getEnquiryDetail(activeEnquiry.id);
      setActiveEnquiry(updated);
      showToast('Internal note logged.');
      fetchEnquiries();
    } catch (err) {
      alert(err.message || 'Failed to add note');
    } finally {
      setNoteSubmitting(false);
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Enquiries</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming tenant leads, update deal statuses, and record internal customer notes.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-100">
          {[
            { id: '', label: 'All Enquiries' },
            { id: 'New', label: 'New' },
            { id: 'Contacted', label: 'Contacted' },
            { id: 'Interested', label: 'Interested' },
            { id: 'Visit Scheduled', label: 'Visit Scheduled' },
            { id: 'Booked', label: 'Booked' },
            { id: 'Closed', label: 'Closed' },
            { id: 'Not Interested', label: 'Not Interested' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStatusFilter(st.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors shrink-0 ${
                statusFilter === st.id
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search & Source Filter */}
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
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="">All Lead Sources</option>
              <option value="Website">Website</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Google">Google</option>
              <option value="OLX">OLX</option>
              <option value="Referral">Referral</option>
              <option value="Direct">Direct</option>
            </select>
          </div>
        </div>

      </div>

      {/* Enquiries List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Property Snapshot</th>
                <th className="px-4 py-3.5">Source & Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Notes</th>
                <th className="px-4 py-3.5 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading enquiries...
                  </td>
                </tr>
              ) : enquiries.length > 0 ? (
                enquiries.map((enq) => {
                  const whatsappUrl = getWhatsAppLink(
                    enq.customer?.whatsapp || enq.customer?.mobile,
                    `Hi ${enq.customer?.name || ''}, regarding your enquiry for ${enq.property_code || 'our rental property'}: `
                  );
                  const callUrl = getCallLink(enq.customer?.mobile);

                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{enq.customer?.name || 'Customer'}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{enq.customer?.mobile}</div>
                        {enq.customer?.email && <div className="text-slate-400 text-[10px]">{enq.customer?.email}</div>}
                      </td>

                      {/* Property Info */}
                      <td className="px-4 py-4">
                        <div className="font-mono text-[11px] font-bold text-indigo-600">
                          {enq.property_code || 'General Inquiry'}
                        </div>
                        <div className="font-medium text-slate-800 truncate max-w-xs">{enq.property_title || '—'}</div>
                        {enq.message && <div className="text-slate-500 text-[11px] italic mt-0.5 line-clamp-1">"{enq.message}"</div>}
                      </td>

                      {/* Source & Date */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {enq.source}
                          </span>
                          {enq.utm_source && (
                            <span className="text-[10px] text-indigo-600 font-mono">
                              ({enq.utm_source})
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-1">{formatDate(enq.created_at)}</div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-4">
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                          className="text-xs font-semibold rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-hidden"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Interested">Interested</option>
                          <option value="Visit Scheduled">Visit Scheduled</option>
                          <option value="Visited">Visited</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Booked">Booked</option>
                          <option value="Closed">Closed</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </td>

                      {/* Notes Button */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setActiveEnquiry(enq)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Notes ({enq.notes?.length || 0})</span>
                        </button>
                      </td>

                      {/* Quick Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
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
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No enquiries found.
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

      {/* Internal Notes Modal */}
      {activeEnquiry && (
        <Modal
          isOpen={!!activeEnquiry}
          onClose={() => setActiveEnquiry(null)}
          title={`Internal Notes: ${activeEnquiry.customer?.name || 'Customer'} (${activeEnquiry.property_code || 'Inquiry'})`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            {/* Historical Notes Log */}
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {activeEnquiry.notes && activeEnquiry.notes.length > 0 ? (
                activeEnquiry.notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="text-slate-800 whitespace-pre-wrap">{n.note}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{formatDate(n.created_at)}</span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">No notes logged yet. Add your first note below.</div>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="pt-2 border-t border-slate-100 space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Write internal note (e.g. Customer wants possession next Monday, offered ₹38,000)..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEnquiry(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={noteSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {noteSubmitting ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

    </div>
  );
};
