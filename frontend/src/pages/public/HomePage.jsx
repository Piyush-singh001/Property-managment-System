import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Building, IndianRupee, ShieldCheck, Clock, CheckCircle2,
  Phone, MessageSquare, ArrowRight, Home, Sparkles
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { PropertyCard } from '../../components/common/PropertyCard';
import { useSettings } from '../../context/SettingsContext';

export const HomePage = () => {
  const { settings, getWhatsAppUrl, getCallUrl } = useSettings();
  const navigate = useNavigate();

  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero search form state
  const [searchLocality, setSearchLocality] = useState('');
  const [searchBhk, setSearchBhk] = useState('');
  const [searchBudget, setSearchBudget] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await propertyService.getPublicProperties({ limit: 6, sort: 'latest' });
        setFeaturedProperties(res.items || []);
      } catch (err) {
        console.error('Failed to load featured properties', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocality.trim()) params.set('locality', searchLocality.trim());
    if (searchBhk) params.set('bhk', searchBhk);
    if (searchBudget) params.set('max_rent', searchBudget);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-16 lg:space-y-24">
      
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 lg:py-24">
        {/* Background Decorative Gradient */}
        <div className="absolute inset-0 bg-radial-[at_top_right] from-indigo-900/60 via-slate-900 to-slate-950"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Verified Rental Homes • No Fake Listings</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Find Your Dream <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-300">Rental Home</span> with Total Transparency
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Browse verified flats, apartments, builder floors, and luxury villas. Contact the broker directly on Call or WhatsApp with zero hassle.
          </p>

          {/* Quick Search Box */}
          <div className="mt-10 max-w-4xl mx-auto bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl text-slate-900">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              
              {/* Locality Input */}
              <div className="text-left px-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Locality / Sector</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indirapuram, Sector 62"
                  value={searchLocality}
                  onChange={(e) => setSearchLocality(e.target.value)}
                  className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden py-1"
                />
              </div>

              {/* BHK Select */}
              <div className="text-left px-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0">
                <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>BHK Requirement</span>
                </label>
                <select
                  value={searchBhk}
                  onChange={(e) => setSearchBhk(e.target.value)}
                  className="w-full text-sm font-medium text-slate-900 bg-transparent focus:outline-hidden py-1"
                >
                  <option value="">All BHKs</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="5+ BHK">5+ BHK</option>
                </select>
              </div>

              {/* Budget Select */}
              <div className="text-left px-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0">
                <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Max Budget / Month</span>
                </label>
                <select
                  value={searchBudget}
                  onChange={(e) => setSearchBudget(e.target.value)}
                  className="w-full text-sm font-medium text-slate-900 bg-transparent focus:outline-hidden py-1"
                >
                  <option value="">Any Budget</option>
                  <option value="20000">Up to ₹20,000</option>
                  <option value="35000">Up to ₹35,000</option>
                  <option value="50000">Up to ₹50,000</option>
                  <option value="75000">Up to ₹75,000</option>
                  <option value="100000">Up to ₹1,00,000+</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="pt-2 sm:pt-0">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Properties</span>
                </button>
              </div>

            </form>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto pt-6 border-t border-slate-800 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Physical Verification</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">Zero</div>
              <div className="text-xs text-slate-400 mt-0.5">Hidden Fees</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">24 Hr</div>
              <div className="text-xs text-slate-400 mt-0.5">Visit Coordination</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">500+</div>
              <div className="text-xs text-slate-400 mt-0.5">Happy Tenants</div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              Handpicked Listings
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Rental Properties
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore our most sought-after apartments and family homes available for immediate occupancy.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group"
          >
            <span>Browse All Properties</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse"></div>
            ))}
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.property_code} property={property} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Home className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 text-sm font-medium">No published properties available right now.</p>
          </div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              Our Value Proposition
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Rent Through Us?
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              We make renting straightforward, secure, and stress-free for both tenants and property owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">100% Verified Properties</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every property listed has been physically inspected by our team. Real photos, verified ownership, accurate maintenance charges, and honest amenities.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Same-Day Physical Visits</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Schedule a site visit in 30 seconds without creating an account. Our area executive will accompany you and arrange access directly with the owner.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Direct WhatsApp & Call Access</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No endless automated forms or hidden phone numbers. Reach our dedicated property manager directly on Call or WhatsApp anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-8 sm:p-12 lg:p-16 shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Need Help Finding the Right Rental Flat?
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed mb-8">
              Speak directly with our broker. We have exclusive access to verified gated societies, builder floors, and ready-to-move flats tailored to your budget.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={getCallUrl()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-indigo-900 text-sm font-bold hover:bg-indigo-50 shadow-md transition-all"
              >
                <Phone className="w-4 h-4 text-indigo-600" />
                <span>Call {settings.phone}</span>
              </a>
              <a
                href={getWhatsAppUrl(null)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden lg:block">
            <Building className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

    </div>
  );
};
