import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft, Upload, Trash2, CheckCircle2, Image as ImageIcon,
  AlertCircle, Star, MoveLeft, MoveRight, Play
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { settingService } from '../../services/settingService';
import { isVideoUrl, getMediaUrl } from '../../utils/formatters';

export const AdminPropertyFormPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState([]);
  
  // Media state
  const [images, setImages] = useState([]); // [{ id, image_url, sort_order, is_cover }] or string URLs for new
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      property_type: 'Apartment',
      bhk: '2 BHK',
      furnishing: 'Semi Furnished',
      property_status: 'Available',
      publication_status: 'Draft',
      description: '',

      locality: '',
      society_name: '',
      tower: '',
      flat_number: '',
      address: '',
      pincode: '',
      maps_url: '',

      built_up_area: '',
      carpet_area: '',
      floor: '',
      total_floors: '',
      bedrooms: '2',
      bathrooms: '2',
      balconies: '1',
      facing: 'East',
      property_age: '1-3 Years',
      parking: 'Covered',
      lift: true,

      rent: '',
      security_deposit: '',
      maintenance: '',
      maintenance_included: false,
      electricity_included: false,
      water_charges: 'Included',
      brokerage: '',
      other_charges: '',
      lock_in_period: '6 Months',
      minimum_stay: '11 Months',

      family_allowed: true,
      bachelor_allowed: true,
      male_allowed: true,
      female_allowed: true,
      pets_allowed: false,
      smoking_allowed: false,
      non_veg_allowed: true,
      available_from: new Date().toISOString().split('T')[0],
      notice_period: '1 Month'
    }
  });

  // Load amenities and property data if edit mode
  useEffect(() => {
    const initData = async () => {
      try {
        const ams = await settingService.getAmenities();
        setAvailableAmenities(ams || []);

        if (isEditMode) {
          const prop = await propertyService.getAdminPropertyDetail(id);
          // Set form values
          reset({
            ...prop,
            built_up_area: prop.built_up_area || '',
            carpet_area: prop.carpet_area || '',
            floor: prop.floor !== null ? prop.floor : '',
            total_floors: prop.total_floors !== null ? prop.total_floors : '',
            bedrooms: prop.bedrooms !== null ? prop.bedrooms : '',
            bathrooms: prop.bathrooms !== null ? prop.bathrooms : '',
            balconies: prop.balconies !== null ? prop.balconies : '',
            rent: prop.rent || '',
            security_deposit: prop.security_deposit || '',
            maintenance: prop.maintenance || '',
            brokerage: prop.brokerage || '',
            other_charges: prop.other_charges || '',
            available_from: prop.available_from ? prop.available_from.split('T')[0] : ''
          });

          if (prop.amenities) {
            setSelectedAmenityIds(prop.amenities.map((a) => a.id));
          }
          if (prop.images) {
            setImages(prop.images);
          }
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load property data');
      }
    };
    initData();
  }, [id, isEditMode, reset]);

  const toggleAmenity = (amenityId) => {
    if (selectedAmenityIds.includes(amenityId)) {
      setSelectedAmenityIds(selectedAmenityIds.filter((x) => x !== amenityId));
    } else {
      setSelectedAmenityIds([...selectedAmenityIds, amenityId]);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setErrorMessage('');
    try {
      for (const file of files) {
        const res = await propertyService.uploadMedia(file);
        // Build image object
        const newImg = {
          id: Date.now() + Math.random(),
          image_url: res.url,
          sort_order: images.length,
          is_cover: images.length === 0
        };
        setImages((prev) => [...prev, newImg]);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error uploading media file');
    } finally {
      setUploading(false);
    }
  };

  const setCoverImage = (index) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_cover: i === index
      }))
    );
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // Ensure at least one cover if remaining
      if (filtered.length > 0 && !filtered.some((img) => img.is_cover)) {
        filtered[0].is_cover = true;
      }
      return filtered;
    });
  };

  const moveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages((prev) => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[targetIndex];
      arr[targetIndex] = temp;
      return arr;
    });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const payload = {
        ...data,
        rent: parseFloat(data.rent),
        built_up_area: data.built_up_area ? parseFloat(data.built_up_area) : null,
        carpet_area: data.carpet_area ? parseFloat(data.carpet_area) : null,
        floor: data.floor ? parseInt(data.floor, 10) : null,
        total_floors: data.total_floors ? parseInt(data.total_floors, 10) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms, 10) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms, 10) : null,
        balconies: data.balconies ? parseInt(data.balconies, 10) : null,
        security_deposit: data.security_deposit ? parseFloat(data.security_deposit) : null,
        maintenance: data.maintenance ? parseFloat(data.maintenance) : null,
        brokerage: data.brokerage ? parseFloat(data.brokerage) : null,
        other_charges: data.other_charges ? parseFloat(data.other_charges) : null,
        amenity_ids: selectedAmenityIds,
        image_urls: images.map((img) => img.image_url)
      };

      if (isEditMode) {
        await propertyService.updateProperty(id, payload);
        // Also update image ordering
        if (images.length > 0 && images[0].id) {
          const reorderPayload = images.map((img, idx) => ({
            id: img.id,
            sort_order: idx,
            is_cover: img.is_cover
          }));
          await propertyService.reorderImages(id, reorderPayload);
        }
      } else {
        await propertyService.createProperty(payload);
      }

      navigate('/admin/properties');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save property. Please review form fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/properties"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Rental Property' : 'Add New Rental Property'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode ? 'Update specifications and media.' : 'Property Code (PROP-xxxx) will be automatically generated.'}
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section A: Basic Info */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">A</span>
            <span>Basic Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Luxury 3 BHK High-Rise Flat with Panoramic View"
                {...register('title', { required: true })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Type <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('property_type')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white"
              >
                <option value="Apartment">Apartment</option>
                <option value="Builder Floor">Builder Floor</option>
                <option value="Villa">Villa</option>
                <option value="Independent House">Independent House</option>
                <option value="Flat">Flat</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                BHK Configuration <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('bhk')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white"
              >
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="5+ BHK">5+ BHK</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Furnishing <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('furnishing')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white"
              >
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Semi Furnished">Semi Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Status <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('property_status')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Rented">Rented</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Publication Status <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('publication_status')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-white"
              >
                <option value="Draft">Draft (Internal Only)</option>
                <option value="Published">Published (Public)</option>
                <option value="Unpublished">Unpublished (Hidden)</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Highlights
              </label>
              <textarea
                rows={3}
                placeholder="Detailed property highlights, flooring, view, etc."
                {...register('description')}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section B: Location */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">B</span>
            <span>Location & Sensitive Address</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Locality / Area <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sector 62, Indirapuram"
                {...register('locality', { required: true })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Society / Project Name
              </label>
              <input
                type="text"
                placeholder="e.g. Stellar Park Residences"
                {...register('society_name')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 201309"
                {...register('pincode')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Tower / Block (Admin Only - Hidden from Public)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tower B"
                  {...register('tower')}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-medium focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Flat Number (Admin Only - Hidden from Public)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1402"
                  {...register('flat_number')}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-medium focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Address Display <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stellar Park Residences, Sector 62, Noida"
                {...register('address', { required: true })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Maps Link
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/..."
                {...register('maps_url')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Section C: Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">C</span>
            <span>Dimensions & Specifications</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Built-up Area (sq.ft)</label>
              <input
                type="number"
                step="any"
                placeholder="1850"
                {...register('built_up_area')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Carpet Area (sq.ft)</label>
              <input
                type="number"
                step="any"
                placeholder="1520"
                {...register('carpet_area')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Floor No.</label>
              <input
                type="number"
                placeholder="14"
                {...register('floor')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Floors</label>
              <input
                type="number"
                placeholder="24"
                {...register('total_floors')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
              <input
                type="number"
                placeholder="3"
                {...register('bedrooms')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
              <input
                type="number"
                placeholder="3"
                {...register('bathrooms')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Balconies</label>
              <input
                type="number"
                placeholder="3"
                {...register('balconies')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Facing</label>
              <input
                type="text"
                placeholder="North-East"
                {...register('facing')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Age</label>
              <input
                type="text"
                placeholder="2 Years"
                {...register('property_age')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parking Space</label>
              <input
                type="text"
                placeholder="1 Covered Reserved"
                {...register('parking')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="liftCheckbox"
                {...register('lift')}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <label htmlFor="liftCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Lift / Elevator Available
              </label>
            </div>
          </div>
        </div>

        {/* Section D: Rent & Charges */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">D</span>
            <span>Rent & Financial Charges (INR ₹)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Rent (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="42000"
                {...register('rent', { required: true })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                step="any"
                placeholder="84000"
                {...register('security_deposit')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maintenance (₹)
              </label>
              <input
                type="number"
                step="any"
                placeholder="4500"
                {...register('maintenance')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintenanceInc"
                {...register('maintenance_included')}
                className="rounded border-slate-300 text-indigo-600 w-4 h-4"
              />
              <label htmlFor="maintenanceInc" className="text-xs font-medium text-slate-700 cursor-pointer">
                Maintenance Included in Rent
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="electricityInc"
                {...register('electricity_included')}
                className="rounded border-slate-300 text-indigo-600 w-4 h-4"
              />
              <label htmlFor="electricityInc" className="text-xs font-medium text-slate-700 cursor-pointer">
                Electricity Included in Rent
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brokerage (Admin Only) (₹)
              </label>
              <input
                type="number"
                step="any"
                placeholder="21000"
                {...register('brokerage')}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section E: Amenities */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">E</span>
              <span>Amenities & Facilities</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">
              {selectedAmenityIds.length} selected
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {availableAmenities.map((am) => {
              const isChecked = selectedAmenityIds.includes(am.id);
              return (
                <button
                  key={am.id}
                  type="button"
                  onClick={() => toggleAmenity(am.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center gap-2 ${
                    isChecked
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300'}`}>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="truncate">{am.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section F: Rental Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">F</span>
            <span>Tenant Preferences & Terms</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('family_allowed')} className="rounded text-indigo-600" />
              <span>Family Allowed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('bachelor_allowed')} className="rounded text-indigo-600" />
              <span>Bachelors Allowed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('pets_allowed')} className="rounded text-indigo-600" />
              <span>Pets Allowed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('smoking_allowed')} className="rounded text-indigo-600" />
              <span>Smoking Allowed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('non_veg_allowed')} className="rounded text-indigo-600" />
              <span>Non-Veg Cooking Allowed</span>
            </label>
          </div>
        </div>

        {/* Section G: Media Management */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">G</span>
            <span>Property Photos & Media</span>
          </h2>

          {/* Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center bg-slate-50/60 transition-colors">
            <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-800">Upload Property Photos & Videos</div>
            <p className="text-xs text-slate-500 mt-1">Select multiple JPEG, PNG, WebP images or MP4 videos (up to 10MB each)</p>
            <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-xs">
              <span>Choose Files</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {uploading && <span className="block mt-2 text-xs text-indigo-600 font-semibold animate-pulse">Uploading media...</span>}
          </div>

          {/* Uploaded Media List with Set Cover and Move Actions */}
          {images.length > 0 && (
            <div className="space-y-3 pt-4">
              <div className="text-xs font-bold text-slate-700">Uploaded Media ({images.length})</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img, idx) => {
                  const mediaSrc = getMediaUrl(img.image_url);
                  const isVid = isVideoUrl(mediaSrc);
                  return (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                      {isVid ? (
                        <div className="w-full h-32 bg-slate-900 flex items-center justify-center relative">
                          <video src={mediaSrc} className="w-full h-full object-cover opacity-60" preload="metadata" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-bold">
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <img src={mediaSrc} alt="" className="w-full h-32 object-cover" />
                      )}

                      {img.is_cover && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm z-10">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Cover</span>
                        </div>
                      )}

                    <div className="absolute inset-x-0 bottom-0 p-2 bg-slate-950/80 backdrop-blur-xs flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, -1)}
                          className="p-1 text-white hover:text-indigo-400 disabled:opacity-30"
                          title="Move Left"
                        >
                          <MoveLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => moveImage(idx, 1)}
                          className="p-1 text-white hover:text-indigo-400 disabled:opacity-30"
                          title="Move Right"
                        >
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {!img.is_cover && (
                          <button
                            type="button"
                            onClick={() => setCoverImage(idx)}
                            className="text-[10px] text-white hover:text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-slate-800"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>

        {/* Form Submission Footer */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <Link
            to="/admin/properties"
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            <span>{isEditMode ? 'Update Property' : 'Save & Create Property'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
