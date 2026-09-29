import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize2, MapPin, Phone, MessageSquare, ArrowRight, Play } from 'lucide-react';
import { formatINR, isVideoUrl, getMediaUrl } from '../../utils/formatters';
import { useSettings } from '../../context/SettingsContext';

export const PropertyCard = ({ property }) => {
  const { getWhatsAppUrl, getCallUrl } = useSettings();

  const rawCover = property.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  const coverUrl = getMediaUrl(rawCover);
  const isVideo = isVideoUrl(coverUrl);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
      
      {/* Property Image & Overlays */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
        {isVideo ? (
          <div className="w-full h-full relative flex items-center justify-center">
            <video src={coverUrl} className="w-full h-full object-cover opacity-80" preload="metadata" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
            <span className="absolute bottom-16 left-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow-sm flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Video Tour</span>
            </span>
          </div>
        ) : (
          <img
            src={coverUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-white">
            {property.bhk}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200">
            {property.furnishing}
          </span>
        </div>

        {/* Property Code Snapshot */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-indigo-600/90 text-white backdrop-blur-md">
            {property.property_code}
          </span>
        </div>

        {/* Rent Overlay Gradient */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-4 flex items-end justify-between">
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              {formatINR(property.rent)}
              <span className="text-xs font-normal text-slate-200 ml-1">/month</span>
            </div>
            {property.maintenance ? (
              <div className="text-[11px] text-slate-300">
                + {formatINR(property.maintenance)} Maint. {property.maintenance_included ? '(Inc)' : ''}
              </div>
            ) : null}
          </div>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            {property.property_status}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">
              {property.locality} {property.society_name ? `• ${property.society_name}` : ''}
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/properties/${property.property_code}`}
            className="block text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug"
          >
            {property.title}
          </Link>

          {/* Specs Highlights */}
          <div className="grid grid-cols-3 gap-2 py-3.5 my-3.5 border-y border-slate-100 text-slate-600 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-slate-400" />
              <span>{property.bedrooms ? `${property.bedrooms} Bed` : property.bhk}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-slate-400" />
              <span>{property.bathrooms ? `${property.bathrooms} Bath` : '—'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-slate-400" />
              <span>{property.built_up_area ? `${property.built_up_area} sqft` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            to={`/properties/${property.property_code}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <a
            href={getWhatsAppUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
            title="Chat on WhatsApp about this property"
          >
            <MessageSquare className="w-4 h-4" />
          </a>

          <a
            href={getCallUrl()}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            title="Call Broker"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
