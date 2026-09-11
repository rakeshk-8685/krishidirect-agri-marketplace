import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiCall } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Search, Filter, SlidersHorizontal, Leaf, RefreshCw, X, ArrowUpDown, MapPin, User, CheckCircle2 } from 'lucide-react';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [farmersList, setFarmersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [farmerId, setFarmerId] = useState(searchParams.get('farmerId') || 'All');
  const [farmingMethod, setFarmingMethod] = useState(searchParams.get('farmingMethod') || 'All');
  const [isOrganic, setIsOrganic] = useState(searchParams.get('isOrganic') === 'true');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = ['All', 'Fruits', 'Vegetables', 'Grains & Pulses', 'Dairy & Poultry', 'Organic & Special'];
  const locations = ['All', 'Ratnagiri', 'Ludhiana', 'Wayanad', 'Nashik', 'Pune', 'Maharashtra', 'Punjab', 'Kerala'];
  const farmingMethods = [
    'All',
    'Organic Certified',
    'Natural / ZBNF (Zero Budget Natural Farming)',
    'Hydroponic / Protected Cultivation',
    'Permaculture & Regenerative',
    'Conventional Good Agricultural Practices (GAP)'
  ];

  // Fetch Verified Farmers list for Filter Dropdown
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const data = await apiCall('/farmers');
        if (data.success) {
          setFarmersList(data.farmers || []);
        }
      } catch (err) {
        console.error('Fetch farmers error:', err);
      }
    };
    fetchFarmers();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category && category !== 'All') queryParams.append('category', category);
      if (location && location !== 'All') queryParams.append('location', location);
      if (farmerId && farmerId !== 'All') queryParams.append('farmerId', farmerId);
      if (farmingMethod && farmingMethod !== 'All') queryParams.append('farmingMethod', farmingMethod);
      if (isOrganic) queryParams.append('isOrganic', 'true');
      if (inStockOnly) queryParams.append('status', 'in_stock');
      if (sort) queryParams.append('sort', sort);
      // Server-side pagination: limit marketplace to 48 products per page
      queryParams.append('limit', '48');

      const data = await apiCall(`/products?${queryParams.toString()}`);
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Marketplace fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, location, farmerId, farmingMethod, isOrganic, inStockOnly, sort]);

  // Debounced fetch: waits 300ms after the last filter change before firing
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setLocation('All');
    setFarmerId('All');
    setFarmingMethod('All');
    setIsOrganic(false);
    setInStockOnly(false);
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>Direct Farm-to-Table Marketplace</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">Farm-Fresh Produce Marketplace</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">Sustainably grown, tree-ripened, and harvested to order directly from verified local farms.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search produce (e.g. Alphonso Mangoes, Basmati, A2 Milk)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-24 py-3 bg-white text-slate-900 text-sm font-medium rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <button 
              type="submit" 
              className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Main Grid Layout (Filters + Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>Filter Produce</span>
            </h3>
            <button 
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Crop Category</label>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-emerald-800 text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Farm Region / Location</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc === 'All' ? 'All Farm Locations' : loc}</option>
              ))}
            </select>
          </div>

          {/* Farmer Filter */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Filter by Farmer</span>
            </label>
            <select
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Verified Farmers</option>
              {farmersList.map(f => (
                <option key={f._id || f.id} value={f._id || f.id}>
                  {f.farmDetails?.farmName || f.name} ({f.farmDetails?.district || f.farmDetails?.state || 'Verified'})
                </option>
              ))}
            </select>
          </div>

          {/* Farming Method Filter */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Farming Method</label>
            <select
              value={farmingMethod}
              onChange={(e) => setFarmingMethod(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {farmingMethods.map(m => (
                <option key={m} value={m}>{m === 'All' ? 'All Farming Methods' : m}</option>
              ))}
            </select>
          </div>

          {/* Organic Only Toggle */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Organic Certified</span>
              </div>
              <input 
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            {/* In Stock Only Toggle */}
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">In Stock Only</span>
              </div>
              <input 
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>

          {/* Sorting Option */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort Catalogue</span>
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="newest">Newest Harvest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated Growers</option>
            </select>
          </div>

        </aside>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow"
          >
            <Filter className="w-4 h-4" />
            <span>Filter & Sort ({products.length})</span>
          </button>

          <span className="text-xs font-semibold text-slate-500">
            Category: <strong className="text-slate-900">{category}</strong>
          </span>
        </div>

        {/* Products Grid Content Area */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Status Counter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>Showing <strong className="text-slate-900">{products.length}</strong> available produce items</span>
            
            <div className="flex flex-wrap items-center gap-2">
              {category !== 'All' && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                  {category}
                </span>
              )}
              {isOrganic && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  Organic Only
                </span>
              )}
              {location !== 'All' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
                  Region: {location}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Searching produce catalogue for fresh harvest..." />
          ) : products.length === 0 ? (
            <EmptyState 
              title="No produce matches your filters"
              description="Try resetting location or category filters to explore full farm listings."
              onReset={handleReset}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>

      </div>

      {/* Mobile Drawer Modal for Filters */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="font-extrabold text-slate-900">Filters & Sorting</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-800 uppercase">Category</label>
              <div className="flex flex-col gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setMobileFilterOpen(false); }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium text-left ${category === cat ? 'bg-emerald-800 text-white font-bold' : 'bg-slate-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase">Farm Region</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border text-xs"
              >
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="pt-4 border-t space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase">Farming Method</label>
              <select
                value={farmingMethod}
                onChange={(e) => setFarmingMethod(e.target.value)}
                className="w-full p-2.5 rounded-xl border text-xs"
              >
                {farmingMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="pt-4 border-t space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold">Organic Only</span>
                <input 
                  type="checkbox"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
              </label>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
