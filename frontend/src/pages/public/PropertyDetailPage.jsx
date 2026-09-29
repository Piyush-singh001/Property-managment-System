import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bed, Bath, Maximize2, MapPin, Phone, MessageSquare, Calendar, ChevronLeft,
  ChevronRight, Check, X, Shield, ArrowLeft, ExternalLink, Compass,
  CheckCircle2, Play
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { formatINR, formatDate, isVideoUrl, getMediaUrl } from '../../utils/formatters';
import { useSettings } from '../../context/SettingsContext';
import { EnquiryModal } from '../../components/common/EnquiryModal';
import { ScheduleVisitModal } from '../../components/common/ScheduleVisitModal';

export const PropertyDetailPage = () => {
  const { code } = useParams();
  const { settings, getWhatsAppUrl, getCallUrl } = useSettings();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Modals state
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await propertyService.getPublicPropertyDetail(code);
        setProperty(data);
        setActiveImageIndex(0);
      } catch (err) {
        setError(err.message || 'Property not found or is currently not publicly active.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [code]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Property Unavailable</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'This property is not currently available.'}</p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Available Properties</span>
          </Link>
        </div>
      </div>
    );
  }

  const mediaList = [];
  if (property.images && property.images.length > 0) {
    property.images.forEach((img) => mediaList.push(getMediaUrl(img.image_url)));
  }
  if (property.videos && property.videos.length > 0) {
    property.videos.forEach((vid) => mediaList.push(getMediaUrl(vid.video_url)));
  }
  if (mediaList.length === 0) {
    mediaList.push('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80');
  }

  const currentMedia = mediaList[activeImageIndex] || mediaList[0];
  const isCurrentVideo = isVideoUrl(currentMedia);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link to="/properties" className="hover:text-indigo-600">Properties</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate">{property.property_code}</span>
      </nav>

      {/* Property Title & Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-600 text-white">
              {property.property_code}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 text-white">
              {property.bhk}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              {property.furnishing}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              {property.property_type}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {property.title}
          </h1>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-2">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{property.locality}{property.society_name ? `, ${property.society_name}` : ''}</span>
            {property.pincode && <span>• Pincode {property.pincode}</span>}
          </div>
        </div>

        {/* Rent Highlight Box */}
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 lg:text-right shrink-0">
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Monthly Rent</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            {formatINR(property.rent)}
            <span className="text-xs font-normal text-slate-500 ml-1">/month</span>
          </div>
          {property.maintenance ? (
            <div className="text-xs text-slate-600 mt-0.5">
              + {formatINR(property.maintenance)} Maintenance {property.maintenance_included ? '(Included)' : ''}
            </div>
          ) : null}
        </div>
      </div>

      {/* Main Grid: Gallery & Details on Left, Sticky Contact on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Two Columns: Gallery, Specs, Description, Amenities, Preferences */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gallery Section */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            
            {/* Main Stage Media (Image or Video) */}
            <div className="relative aspect-16/10 bg-slate-950 overflow-hidden group flex items-center justify-center">
              {isCurrentVideo ? (
                <video
                  key={currentMedia}
                  src={currentMedia}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={currentMedia}
                  alt={property.title}
                  onClick={() => setFullscreenImage(currentMedia)}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
              )}

              {/* Prev / Next Arrows */}
              {mediaList.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-colors z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-colors z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Counter Badge */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium z-10 flex items-center gap-1.5">
                {isCurrentVideo && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                <span>{activeImageIndex + 1} / {mediaList.length} {isCurrentVideo ? '(Video Tour)' : ''}</span>
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            {mediaList.length > 1 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                {mediaList.map((mediaUrl, idx) => {
                  const isVid = isVideoUrl(mediaUrl);
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all bg-slate-900 ${
                        activeImageIndex === idx ? 'border-indigo-600 scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {isVid ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                          <video src={mediaUrl} className="w-full h-full object-cover opacity-60" preload="metadata" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-black/80 text-white px-1 rounded">
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <img src={mediaUrl} alt="thumbnail" className="w-full h-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Specifications Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <div className="text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-indigo-500" />
                <span>Bedrooms</span>
              </div>
              <div className="text-base font-bold text-slate-900">{property.bedrooms || property.bhk}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <div className="text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-indigo-500" />
                <span>Bathrooms</span>
              </div>
              <div className="text-base font-bold text-slate-900">{property.bathrooms || '1'}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <div className="text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-indigo-500" />
                <span>Super Area</span>
              </div>
              <div className="text-base font-bold text-slate-900">{property.built_up_area ? `${property.built_up_area} sq.ft` : 'N/A'}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <div className="text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>Facing</span>
              </div>
              <div className="text-base font-bold text-slate-900">{property.facing || 'East'}</div>
            </div>
          </div>

          {/* Detailed Property Information Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Property Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Property Code:</span>
                <span className="font-semibold text-slate-900 font-mono">{property.property_code}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Property Type:</span>
                <span className="font-semibold text-slate-900">{property.property_type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Carpet Area:</span>
                <span className="font-semibold text-slate-900">{property.carpet_area ? `${property.carpet_area} sq.ft` : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Floor:</span>
                <span className="font-semibold text-slate-900">{property.floor !== null ? `${property.floor} of ${property.total_floors || 'N/A'}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Balconies:</span>
                <span className="font-semibold text-slate-900">{property.balconies !== null ? property.balconies : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Property Age:</span>
                <span className="font-semibold text-slate-900">{property.property_age || '1-3 Years'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Parking:</span>
                <span className="font-semibold text-slate-900">{property.parking || 'Available'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Lift Facility:</span>
                <span className="font-semibold text-slate-900">{property.lift ? 'Available' : 'No'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Security Deposit:</span>
                <span className="font-semibold text-slate-900">{formatINR(property.security_deposit)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Electricity & Water:</span>
                <span className="font-semibold text-slate-900">{property.electricity_included ? 'Electricity Included' : 'As per meter'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

          {/* Amenities Section */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Features & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((am) => (
                  <div key={am.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{am.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rental Preferences */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Rental Preferences</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                {property.family_allowed ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />}
                <span>Family: {property.family_allowed ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div className="flex items-center gap-2">
                {property.bachelor_allowed ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />}
                <span>Bachelors: {property.bachelor_allowed ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div className="flex items-center gap-2">
                {property.pets_allowed ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />}
                <span>Pets: {property.pets_allowed ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div className="flex items-center gap-2">
                {property.smoking_allowed ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />}
                <span>Smoking: {property.smoking_allowed ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div className="flex items-center gap-2">
                {property.non_veg_allowed ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />}
                <span>Non-Veg Cooking: {property.non_veg_allowed ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Available From: {property.available_from ? formatDate(property.available_from) : 'Immediately'}</span>
              </div>
            </div>
          </div>

          {/* Location & Map */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Address & Location</h2>
            <p className="text-sm text-slate-600 mb-4">{property.address}</p>
            {property.maps_url && (
              <a
                href={property.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
              >
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
          </div>

        </div>

        {/* Right Sticky Sidebar: Contact / Enquiry / Schedule Visit */}
        <div className="space-y-6 lg:sticky lg:top-28">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-lg space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Direct Contact Actions
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Interested in this property?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Reach the broker directly with reference to <span className="font-mono font-semibold text-indigo-600">{property.property_code}</span>.
              </p>
            </div>

            <div className="space-y-3">
              {/* Direct WhatsApp */}
              <a
                href={getWhatsAppUrl(property)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              {/* Direct Call */}
              <a
                href={getCallUrl()}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50 font-bold text-sm transition-all"
              >
                <Phone className="w-4 h-4 text-indigo-600" />
                <span>Call {settings.phone}</span>
              </a>

              {/* Schedule Visit Modal Button */}
              <button
                type="button"
                onClick={() => setVisitOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule a Physical Visit</span>
              </button>

              {/* Enquire Now Modal Button */}
              <button
                type="button"
                onClick={() => setEnquiryOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
              >
                <span>Submit Enquiry Form</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No registration needed. Zero spam guaranteed.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Fullscreen Media Lightbox Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          {isVideoUrl(fullscreenImage) ? (
            <video
              src={fullscreenImage}
              controls
              autoPlay
              playsInline
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            />
          )}
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Public Action Modals */}
      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        property={property}
      />

      <ScheduleVisitModal
        isOpen={visitOpen}
        onClose={() => setVisitOpen(false)}
        property={property}
      />

    </div>
  );
};
