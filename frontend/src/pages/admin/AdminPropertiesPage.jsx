import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Search, Plus, Edit, Copy, Eye, Archive, RotateCcw,
  ExternalLink, Check, MoreVertical, Play
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { formatINR, formatDate, isVideoUrl, getMediaUrl } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [tabFilter, setTabFilter] = useState('all'); // all, Available, Reserved, Rented, Draft, Published, archived
  const [page, setPage] = useState(1);

  // Modals state
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined
      };

      if (tabFilter === 'archived') {
        params.include_archived = true;
      } else if (['Available', 'Reserved', 'Rented'].includes(tabFilter)) {
        params.property_status = tabFilter;
      } else if (['Draft', 'Published'].includes(tabFilter)) {
        params.publication_status = tabFilter;
      }

      const res = await propertyService.getAdminProperties(params);
      setProperties(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to load admin properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [tabFilter, page, search]);

  const handleDuplicate = async (propertyId) => {
    setActionLoading(true);
    try {
      const cloned = await propertyService.duplicateProperty(propertyId);
      showToast(`Property duplicated as ${cloned.property_code} (Status: Draft).`);
      fetchProperties();
    } catch (err) {
      alert(err.message || 'Failed to duplicate property');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublication = async (property) => {
    const nextStatus = property.publication_status === 'Published' ? 'Unpublished' : 'Published';
    try {
      await propertyService.updatePublicationStatus(property.id, nextStatus);
      showToast(`Publication status updated to ${nextStatus}.`);
      fetchProperties();
    } catch (err) {
      alert(err.message || 'Failed to update publication status');
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await propertyService.updatePropertyStatus(propertyId, newStatus);
      showToast(`Property status changed to ${newStatus}.`);
      fetchProperties();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    setActionLoading(true);
    try {
      await propertyService.archiveProperty(archiveTarget.id);
      showToast(`Property ${archiveTarget.property_code} archived successfully.`);
      setArchiveTarget(null);
      fetchProperties();
    } catch (err) {
      alert(err.message || 'Failed to archive property');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (propertyId) => {
    try {
      const res = await propertyService.restoreProperty(propertyId);
      showToast(`Property ${res.property_code} restored to active list.`);
      fetchProperties();
    } catch (err) {
      alert(err.message || 'Failed to restore property');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Properties Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your inventory of rental properties, track publication states, and duplicate listings.
          </p>
        </div>

        <Link
          to="/admin/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        
        {/* Navigation Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-100">
          {[
            { id: 'all', label: 'All Active' },
            { id: 'Available', label: 'Available' },
            { id: 'Reserved', label: 'Reserved' },
            { id: 'Rented', label: 'Rented' },
            { id: 'Published', label: 'Published' },
            { id: 'Draft', label: 'Drafts' },
            { id: 'archived', label: 'Archived Vault' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setTabFilter(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-colors shrink-0 ${
                tabFilter === tab.id
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code (e.g. PROP-0001), title, locality..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
          />
        </div>

      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Property</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Rent / Month</th>
                <th className="px-4 py-3.5">Property Status</th>
                <th className="px-4 py-3.5">Publication</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading properties...
                  </td>
                </tr>
              ) : properties.length > 0 ? (
                properties.map((prop) => {
                  const photoImg = prop.images?.find((i) => !isVideoUrl(i.image_url))?.image_url;
                  const rawCover = photoImg || prop.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80';
                  const coverImg = getMediaUrl(rawCover);
                  const isCoverVideo = isVideoUrl(coverImg);
                  const isArchived = !!prop.deleted_at;

                  return (
                    <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Property Image, Code & Title */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-900 relative flex items-center justify-center">
                            {isCoverVideo ? (
                              <>
                                <video src={coverImg} className="w-full h-full object-cover opacity-70" preload="metadata" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Play className="w-3.5 h-3.5 text-white fill-current" />
                                </div>
                              </>
                            ) : (
                              <img
                                src={coverImg}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="font-mono text-[11px] font-bold text-indigo-600 block">
                              {prop.property_code}
                            </span>
                            <span className="font-bold text-slate-900 block truncate leading-snug">
                              {prop.title}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {prop.bhk} • {prop.furnishing}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Locality */}
                      <td className="px-4 py-4">
                        <span className="font-medium text-slate-800 block truncate">{prop.locality}</span>
                        {prop.society_name && <span className="text-[11px] text-slate-400 block">{prop.society_name}</span>}
                      </td>

                      {/* Rent */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-900">{formatINR(prop.rent)}</span>
                        {prop.maintenance && (
                          <span className="text-[11px] text-slate-400 block">
                            + {formatINR(prop.maintenance)} maint.
                          </span>
                        )}
                      </td>

                      {/* Property Status Dropdown */}
                      <td className="px-4 py-4">
                        {!isArchived ? (
                          <select
                            value={prop.property_status}
                            onChange={(e) => handleStatusChange(prop.id, e.target.value)}
                            className="text-xs font-semibold rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-hidden"
                          >
                            <option value="Available">Available</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Rented">Rented</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        ) : (
                          <StatusBadge type="property" status="Archived" />
                        )}
                      </td>

                      {/* Publication Status Toggle */}
                      <td className="px-4 py-4">
                        {!isArchived ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePublication(prop)}
                            className="group cursor-pointer"
                            title="Click to toggle publication"
                          >
                            <StatusBadge type="property" status={prop.publication_status} />
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Archived</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Public View link if published */}
                          {prop.publication_status === 'Published' && !isArchived && (
                            <Link
                              to={`/properties/${prop.property_code}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Edit */}
                          {!isArchived && (
                            <Link
                              to={`/admin/properties/edit/${prop.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                              title="Edit Property"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Duplicate */}
                          {!isArchived && (
                            <button
                              onClick={() => handleDuplicate(prop.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                              title="Duplicate Property (Creates New Code)"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}

                          {/* Archive or Restore */}
                          {!isArchived ? (
                            <button
                              onClick={() => setArchiveTarget(prop)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Archive Property (Soft Delete)"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(prop.id)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors font-semibold flex items-center gap-1"
                              title="Restore Property"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
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
                    No properties match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      {/* Confirm Soft-Delete / Archive Dialog */}
      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
        title="Archive Property?"
        message={`Are you sure you want to archive ${archiveTarget?.property_code} - "${archiveTarget?.title}"? It will be safely removed from the public website and normal admin queries, while preserving all historical enquiries and visit logs.`}
        confirmLabel="Archive Property"
        isDanger={true}
        isLoading={actionLoading}
      />

    </div>
  );
};
