import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Home, X } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { settingService } from '../../services/settingService';
import { PropertyCard } from '../../components/common/PropertyCard';
import { Pagination } from '../../components/common/Pagination';

export const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [bhk, setBhk] = useState(searchParams.get('bhk') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
  const [furnishing, setFurnishing] = useState(searchParams.get('furnishing') || '');
  const [minRent, setMinRent] = useState(searchParams.get('min_rent') || '');
  const [maxRent, setMaxRent] = useState(searchParams.get('max_rent') || '');
  const [selectedAmenities, setSelectedAmenities] = useState(searchParams.getAll('amenities') || []);
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Load available amenities list for filters
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const data = await settingService.getAmenities();
        setAvailableAmenities(data || []);
      } catch (err) {
        console.error('Failed to load amenities', err);
      }
    };
    fetchAmenities();
  }, []);

  // Fetch properties whenever filter params change
  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page,
          limit: 9,
          sort
        };
        if (search) queryParams.search = search;
        if (locality) queryParams.locality = locality;
        if (bhk) queryParams.bhk = bhk;
        if (propertyType) queryParams.property_type = propertyType;
        if (furnishing) queryParams.furnishing = furnishing;
        if (minRent) queryParams.min_rent = minRent;
        if (maxRent) queryParams.max_rent = maxRent;
        if (selectedAmenities.length > 0) queryParams.amenities = selectedAmenities;

        const res = await propertyService.getPublicProperties(queryParams);
        setProperties(res.items || []);
        setTotal(res.total || 0);
        setTotalPages(res.total_pages || 1);
      } catch (err) {
        console.error('Failed to fetch properties', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProps();
  }, [search, locality, bhk, propertyType, furnishing, minRent, maxRent, selectedAmenities, sort, page]);

  // Sync state changes to URL
  const updateUrlParams = (newParams) => {
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocality('');
    setBhk('');
    setPropertyType('');
    setFurnishing('');
    setMinRent('');
    setMaxRent('');
    setSelectedAmenities([]);
    setSort('latest');
    setPage(1);
    setSearchParams({});
  };

  const toggleAmenity = (name) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
    setPage(1);
  };

  const hasActiveFilters = search || locality || bhk || propertyType || furnishing || minRent || maxRent || selectedAmenities.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse Rental Properties
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing <span className="font-semibold text-slate-800">{total}</span> verified properties for rent
          </p>
        </div>

        {/* Sorting & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filters {hasActiveFilters ? `(Active)` : ''}</span>
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline font-medium text-xs text-slate-500">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            >
              <option value="latest">Latest Added</option>
              <option value="rent_asc">Rent: Low to High</option>
              <option value="rent_desc">Rent: High to Low</option>
              <option value="area_asc">Area: Small to Large</option>
              <option value="area_desc">Area: Large to Small</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-6 shadow-xs sticky top-28 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Keyword */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keyword Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Title, society, code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Locality */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Locality / Area</label>
            <input
              type="text"
              placeholder="e.g. Sector 62, Indirapuram"
              value={locality}
              onChange={(e) => {
                setLocality(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* BHK */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">BHK</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setBhk(bhk === b ? '' : b);
                    setPage(1);
                  }}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    bhk === b
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => {
                setPropertyType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value="">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Builder Floor">Builder Floor</option>
              <option value="Villa">Villa</option>
              <option value="Independent House">Independent House</option>
              <option value="Flat">Flat</option>
            </select>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Furnishing</label>
            <select
              value={furnishing}
              onChange={(e) => {
                setFurnishing(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value="">Any Furnishing</option>
              <option value="Fully Furnished">Fully Furnished</option>
              <option value="Semi Furnished">Semi Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>

          {/* Rent Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Monthly Rent Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minRent}
                onChange={(e) => {
                  setMinRent(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxRent}
                onChange={(e) => {
                  setMaxRent(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Amenities Multi-select */}
          {availableAmenities.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Amenities</label>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {availableAmenities.slice(0, 12).map((am) => (
                  <label key={am.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(am.name)}
                      onChange={() => toggleAmenity(am.name)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="truncate">{am.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Property Grid Results */}
        <div className="lg:col-span-3">
          
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-500">Active Filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                  Search: "{search}"
                  <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                </span>
              )}
              {locality && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                  Area: {locality}
                  <button onClick={() => setLocality('')} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                </span>
              )}
              {bhk && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                  {bhk}
                  <button onClick={() => setBhk('')} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                </span>
              )}
              {propertyType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                  {propertyType}
                  <button onClick={() => setPropertyType('')} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                </span>
              )}
              {furnishing && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                  {furnishing}
                  <button onClick={() => setFurnishing('')} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedAmenities.map((am) => (
                <span key={am} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                  {am}
                  <button onClick={() => toggleAmenity(am)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:underline ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse"></div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <PropertyCard key={prop.property_code} property={prop} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
              <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No Properties Found</h3>
              <p className="text-xs text-slate-500 mb-6">
                We could not find any properties matching your selected filter criteria. Try clearing filters or adjusting your budget.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-950/60" onClick={() => setMobileFilterOpen(false)}></div>
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Filter Properties</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* BHK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">BHK</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['1 BHK', '2 BHK', '3 BHK', '4 BHK'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBhk(bhk === b ? '' : b)}
                      className={`py-1.5 text-xs font-medium rounded-lg border ${
                        bhk === b ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Furnishing</label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                >
                  <option value="">Any</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi Furnished">Semi Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
