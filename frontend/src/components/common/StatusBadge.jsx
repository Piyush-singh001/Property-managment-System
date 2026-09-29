import React from 'react';

export const StatusBadge = ({ type = 'property', status }) => {
  if (!status) return null;

  const styles = {
    // Property Status
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Reserved: 'bg-amber-50 text-amber-700 border-amber-200',
    Rented: 'bg-purple-50 text-purple-700 border-purple-200',
    Inactive: 'bg-slate-100 text-slate-700 border-slate-200',

    // Publication Status
    Published: 'bg-teal-50 text-teal-700 border-teal-200',
    Draft: 'bg-amber-50 text-amber-700 border-amber-200',
    Unpublished: 'bg-slate-100 text-slate-600 border-slate-200',

    // Enquiry Status
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    Contacted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Interested: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Visit Scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
    Visited: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Negotiation: 'bg-orange-50 text-orange-700 border-orange-200',
    Booked: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    Closed: 'bg-slate-100 text-slate-700 border-slate-300',
    'Not Interested': 'bg-rose-50 text-rose-700 border-rose-200',

    // Visit Status
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rescheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-purple-50 text-purple-700 border-purple-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    'No Show': 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const badgeClass = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
};
