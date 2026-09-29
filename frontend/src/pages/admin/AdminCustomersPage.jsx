import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, MessageSquare, Edit, Check } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { formatDate, formatINR, getWhatsAppLink, getCallLink } from '../../utils/formatters';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Edit Customer Modal
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    preferred_location: '',
    budget: '',
    preferred_bhk: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerService.getAdminCustomers({
        page,
        limit: 12,
        search: search.trim() || undefined
      });
      setCustomers(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      whatsapp: customer.whatsapp || '',
      email: customer.email || '',
      preferred_location: customer.preferred_location || '',
      budget: customer.budget || '',
      preferred_bhk: customer.preferred_bhk || '',
      notes: customer.notes || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setSubmitting(true);
    try {
      await customerService.updateCustomer(editingCustomer.id, {
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.trim() || undefined,
        email: formData.email.trim() || undefined,
        preferred_location: formData.preferred_location.trim() || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        preferred_bhk: formData.preferred_bhk || undefined,
        notes: formData.notes.trim() || undefined
      });
      showToast('Customer information updated.');
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to update customer');
    } finally {
      setSubmitting(false);
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer & Tenant Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Auto-deduplicated client records created via public enquiries and site visit bookings.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, mobile number (e.g. 9811...), or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Contact Number</th>
                <th className="px-4 py-3.5">Preferences</th>
                <th className="px-4 py-3.5">Enquiries</th>
                <th className="px-4 py-3.5">Visits</th>
                <th className="px-4 py-3.5">Notes</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => {
                  const whatsappUrl = getWhatsAppLink(c.whatsapp || c.mobile, `Hi ${c.name}, `);
                  const callUrl = getCallLink(c.mobile);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {c.name}
                        {c.email && <span className="block text-[10px] text-slate-400 font-normal">{c.email}</span>}
                      </td>

                      {/* Mobile */}
                      <td className="px-4 py-4">
                        <span className="font-mono text-slate-800 font-semibold">{c.mobile}</span>
                      </td>

                      {/* Preferences */}
                      <td className="px-4 py-4 text-slate-600">
                        {c.preferred_bhk || c.preferred_location || c.budget ? (
                          <div className="text-[11px] space-y-0.5">
                            {c.preferred_bhk && <div>{c.preferred_bhk}</div>}
                            {c.preferred_location && <div>Loc: {c.preferred_location}</div>}
                            {c.budget && <div>Budget: {formatINR(c.budget)}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Enquiries count */}
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                          {c.total_enquiries || 0}
                        </span>
                      </td>

                      {/* Visits count */}
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px]">
                          {c.total_visits || 0}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-4 max-w-xs truncate text-slate-500 italic">
                        {c.notes || '—'}
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
                            title="WhatsApp Customer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            title="Edit Customer Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No customers found matching search.
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

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <Modal
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          title={`Customer Profile: ${editingCustomer.name} (${editingCustomer.mobile})`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Location</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62"
                  value={formData.preferred_location}
                  onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Budget (₹)</label>
                <input
                  type="number"
                  placeholder="35000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
              <textarea
                rows={3}
                placeholder="Client preferences, move-in timeline, special constraints..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
