import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiCall } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import FarmerNavbar from '../../components/FarmerNavbar';
import FarmerVerificationNotice from '../../components/FarmerVerificationNotice';
import { Sprout, Plus, Edit, Trash2, X, Check, Image, AlertTriangle, ShieldCheck, Tag, Search, Filter, ArrowUpDown, CheckCircle2, XCircle, AlertCircle, Grid, List, Leaf } from 'lucide-react';

export default function FarmerProducts() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const farm = user?.farmDetails || {};
  const isVerified = farm.verificationStatus === 'verified';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStock, setFilterStock] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'new' && isVerified);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [minOrderQuantity, setMinOrderQuantity] = useState('1');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [shelfLifeDays, setShelfLifeDays] = useState('7');
  const [farmingMethod, setFarmingMethod] = useState('Organic');
  const [isOrganic, setIsOrganic] = useState(true);
  const [organicCertNo, setOrganicCertNo] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Fruits', 'Vegetables', 'Grains & Pulses', 'Dairy & Poultry', 'Organic & Special'];
  const units = ['kg', 'quintal', 'dozen', 'piece', 'bunch', 'liter', 'packet'];
  const farmingMethods = ['Organic', 'Conventional'];

  // Presets for quick image selection by farmers
  const presetImages = [
    { label: 'Fresh Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' },
    { label: 'Organic Mangoes', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80' },
    { label: 'Red Onions', url: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80' },
    { label: 'Wheat & Grain', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
    { label: 'A2 Gir Cow Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80' },
    { label: 'Raw Forest Honey', url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80' },
  ];

  const fetchFarmerProducts = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/products?farmerId=${user?.id || user?._id}`);
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Fetch farmer products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFarmerProducts();
    }
  }, [user]);

  const openCreateModal = () => {
    if (!isVerified) {
      showToast('Your farmer account is under review. Produce listing unlocks upon verification approval.', 'error');
      return;
    }
    setEditingProduct(null);
    setTitle('');
    setCategory('Vegetables');
    setPrice('');
    setUnit('kg');
    setAvailableQuantity('');
    setMinOrderQuantity('1');
    setHarvestDate(new Date().toISOString().split('T')[0]);
    setShelfLifeDays('7');
    setFarmingMethod('Organic');
    setIsOrganic(true);
    setOrganicCertNo(farm.certificationNumber || '');
    setDescription('');
    setImageUrl(presetImages[0].url);
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    if (!isVerified) {
      showToast('Action restricted while verification is pending.', 'error');
      return;
    }
    setEditingProduct(prod);
    setTitle(prod.title || '');
    setCategory(prod.category || 'Vegetables');
    setPrice(prod.price || '');
    setUnit(prod.unit || 'kg');
    setAvailableQuantity(prod.availableQuantity !== undefined ? prod.availableQuantity : '');
    setMinOrderQuantity(prod.minOrderQuantity || 1);
    setHarvestDate(prod.harvestDate ? new Date(prod.harvestDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setShelfLifeDays(prod.shelfLifeDays || 7);
    setFarmingMethod(prod.farmingMethod || (prod.isOrganic ? 'Organic' : 'Conventional'));
    setIsOrganic(prod.isOrganic ?? true);
    setOrganicCertNo(prod.organicCertNo || '');
    setDescription(prod.description || '');
    setImageUrl(prod.images?.[0] || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || price === '' || availableQuantity === '' || !description.trim()) {
      showToast('Please fill all required produce fields.', 'error');
      return;
    }

    const priceNum = Number(price);
    const qtyNum = Number(availableQuantity);
    if (priceNum <= 0) {
      showToast('Price must be greater than zero.', 'error');
      return;
    }
    if (qtyNum < 0) {
      showToast('Available quantity cannot be negative.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        price: priceNum,
        unit,
        availableQuantity: qtyNum,
        minOrderQuantity: Number(minOrderQuantity) || 1,
        harvestDate,
        shelfLifeDays: Number(shelfLifeDays) || 7,
        farmingMethod,
        isOrganic: farmingMethod === 'Organic',
        organicCertNo: farmingMethod === 'Organic' ? organicCertNo.trim() : '',
        description: description.trim(),
        images: imageUrl ? [imageUrl] : [presetImages[0].url]
      };

      let res;
      if (editingProduct) {
        res = await apiCall(`/products/${editingProduct._id}`, 'PUT', payload);
      } else {
        res = await apiCall('/products', 'POST', payload);
      }

      if (res.success) {
        showToast(res.message || 'Produce listing updated successfully!', 'success');
        setIsModalOpen(false);
        fetchFarmerProducts();
      }
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isVerified) {
      showToast('Action restricted while verification is pending.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to deactivate and remove this produce listing?')) return;

    try {
      const res = await apiCall(`/products/${id}`, 'DELETE');
      if (res.success) {
        showToast('Produce listing deactivated.', 'info');
        fetchFarmerProducts();
      }
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // Quick inventory quantity adjustment
  const handleQuickQuantityUpdate = async (prod, delta) => {
    if (!isVerified) {
      showToast('Action restricted while verification is pending.', 'error');
      return;
    }
    const newQty = Math.max(0, prod.availableQuantity + delta);
    try {
      const res = await apiCall(`/products/${prod._id}/inventory`, 'PATCH', { 
        availableQuantity: newQty 
      });
      if (res.success) {
        showToast(`Stock updated: ${newQty} ${prod.unit}`, 'success');
        fetchFarmerProducts();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update inventory', 'error');
    }
  };

  // Filter & Search Logic
  const filteredProducts = products.filter(p => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchCategory = p.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory) return false;
    }
    // Stock filter
    if (filterStock === 'in_stock' && p.availableQuantity <= 10) return false;
    if (filterStock === 'low_stock' && (p.availableQuantity === 0 || p.availableQuantity > 10)) return false;
    if (filterStock === 'out_of_stock' && p.availableQuantity > 0) return false;
    // Category filter
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    // Method filter
    if (filterMethod !== 'all') {
      const isMethodOrganic = p.farmingMethod === 'Organic' || p.isOrganic;
      if (filterMethod === 'Organic' && !isMethodOrganic) return false;
      if (filterMethod === 'Conventional' && isMethodOrganic) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'qty_desc') return b.availableQuantity - a.availableQuantity;
    if (sortBy === 'qty_asc') return a.availableQuantity - b.availableQuantity;
    return new Date(b.createdAt || b.harvestDate) - new Date(a.createdAt || a.harvestDate);
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 md:pb-12">
      <FarmerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Verification Alert Banner */}
        <FarmerVerificationNotice farmDetails={farm} />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Sprout className="w-7 h-7 text-emerald-700" />
              <span>Produce Inventory Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              List new crops, update available quantities, adjust pricing, and track stock alerts.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className={`px-5 py-3 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-transform ${
              isVerified
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white hover:-translate-y-0.5 active:scale-95'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>List New Harvest Produce</span>
          </button>
        </div>

        {/* Filter & Search Bar Toolbar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search produce name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Farming Method Filter */}
            <div>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white font-medium"
              >
                <option value="all">All Methods (Organic & Conventional)</option>
                <option value="Organic">Organic Only</option>
                <option value="Conventional">Conventional GAP</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white font-medium"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="qty_desc">Stock: High to Low</option>
                <option value="qty_asc">Stock: Low to High</option>
              </select>
            </div>

          </div>

          {/* Stock Filter Pills & View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="font-bold text-slate-500 text-[11px] uppercase mr-1">Stock Status:</span>
              {[
                { id: 'all', label: `All (${products.length})` },
                { id: 'in_stock', label: `In Stock (${products.filter(p => p.availableQuantity > 10).length})` },
                { id: 'low_stock', label: `Low Stock (${products.filter(p => p.availableQuantity > 0 && p.availableQuantity <= 10).length})` },
                { id: 'out_of_stock', label: `Out of Stock (${products.filter(p => p.availableQuantity === 0).length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStock(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-colors shrink-0 ${
                    filterStock === tab.id
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                title="Card Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <LoadingSpinner message="Fetching your farm produce listings..." />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            <Sprout className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No produce items found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {products.length === 0 
                ? 'Your farm has not posted any harvest listings yet.'
                : 'No produce matches your current filter and search criteria.'}
            </p>
            {isVerified && products.length === 0 && (
              <button
                onClick={openCreateModal}
                className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow"
              >
                + List First Harvest Produce
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Responsive Card Grid View (Mobile-First 320px+) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(prod => (
              <div key={prod._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  {/* Card Image Header */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={prod.images?.[0] || presetImages[0].url}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold">
                        {prod.category}
                      </span>
                      {prod.isOrganic && (
                        <span className="px-2 py-1 rounded-lg bg-emerald-700/90 text-white text-[10px] font-bold flex items-center gap-1">
                          <Leaf className="w-3 h-3" /> Organic
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                        prod.availableQuantity === 0
                          ? 'bg-rose-600 text-white'
                          : prod.availableQuantity <= 10
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {prod.availableQuantity === 0 ? 'Out of Stock' : prod.availableQuantity <= 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-tight line-clamp-1">{prod.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{prod.description}</p>
                      </div>
                    </div>

                    {/* Price and MOQ */}
                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-xl font-extrabold text-emerald-950">₹{prod.price}</span>
                        <span className="text-xs text-slate-500"> / {prod.unit}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Min: {prod.minOrderQuantity || 1} {prod.unit}
                      </span>
                    </div>

                    {/* Harvest Date & Farming Method */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Harvest Date</span>
                        <span className="font-bold text-slate-700">
                          {prod.harvestDate ? new Date(prod.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Shelf Life</span>
                        <span className="font-bold text-slate-700">{prod.shelfLifeDays || 7} Days</span>
                      </div>
                    </div>

                    {/* Quick Stock Controls */}
                    <div className="pt-2 flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-700">Stock Qty:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickQuantityUpdate(prod, -5)}
                          disabled={!isVerified || prod.availableQuantity <= 0}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-800 font-extrabold text-xs hover:bg-slate-100 active:scale-95 disabled:opacity-40"
                          title="Decrease 5"
                        >
                          -5
                        </button>
                        <span className="text-xs font-extrabold text-slate-950 min-w-[50px] text-center">
                          {prod.availableQuantity} {prod.unit}
                        </span>
                        <button
                          onClick={() => handleQuickQuantityUpdate(prod, 5)}
                          disabled={!isVerified}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-800 font-extrabold text-xs hover:bg-slate-100 active:scale-95 disabled:opacity-40"
                          title="Add 5"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openEditModal(prod)}
                    disabled={!isVerified}
                    className="flex-1 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Edit Produce</span>
                  </button>

                  <button
                    onClick={() => handleDelete(prod._id)}
                    disabled={!isVerified}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                    title="Deactivate / Unlist Produce"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Produce Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Price / Unit</th>
                    <th className="p-4">Available Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(prod => (
                    <tr key={prod._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        <img 
                          src={prod.images?.[0] || presetImages[0].url} 
                          alt={prod.title} 
                          className="w-12 h-12 rounded-2xl object-cover border bg-slate-50 shrink-0" 
                        />
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{prod.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {prod.isOrganic && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                Organic
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">Min: {prod.minOrderQuantity || 1} {prod.unit}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-slate-600">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      <td className="p-4 font-medium text-slate-700">
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {prod.farmingMethod || (prod.isOrganic ? 'Organic' : 'Conventional')}
                        </span>
                      </td>

                      <td className="p-4 font-extrabold text-slate-900 text-sm">
                        ₹{prod.price} <span className="text-xs text-slate-500 font-normal">/ {prod.unit}</span>
                      </td>

                      <td className="p-4 font-bold">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickQuantityUpdate(prod, -5)}
                            disabled={!isVerified || prod.availableQuantity <= 0}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40"
                          >
                            -
                          </button>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                            prod.availableQuantity === 0 
                              ? 'bg-rose-100 text-rose-800'
                              : prod.availableQuantity <= 10 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {prod.availableQuantity} {prod.unit}
                          </span>
                          <button
                            onClick={() => handleQuickQuantityUpdate(prod, 5)}
                            disabled={!isVerified}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          prod.availableQuantity === 0 
                            ? 'bg-rose-100 text-rose-900' 
                            : prod.availableQuantity <= 10 
                            ? 'bg-amber-100 text-amber-900' 
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {prod.availableQuantity === 0 ? 'Out of Stock' : prod.availableQuantity <= 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => openEditModal(prod)}
                          disabled={!isVerified}
                          className="p-2 text-slate-600 hover:text-emerald-700 font-bold rounded-xl hover:bg-slate-100 disabled:opacity-40"
                          title="Edit Produce Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(prod._id)}
                          disabled={!isVerified}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 disabled:opacity-40"
                          title="Unlist Produce"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add / Edit Produce Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-700" />
                  <span>{editingProduct ? 'Edit Harvest Produce Listing' : 'List New Produce Lot'}</span>
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                
                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Produce Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Farm Fresh Alphonso Mangoes"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Category & Farming Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Farming Method *</label>
                    <select
                      value={farmingMethod}
                      onChange={(e) => setFarmingMethod(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      {farmingMethods.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price, Unit & Quantities */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price per Unit (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 120"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit *</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      {units.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Available Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 250"
                      value={availableQuantity}
                      onChange={(e) => setAvailableQuantity(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* MOQ, Harvest Date, Shelf Life */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Minimum Order Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={minOrderQuantity}
                      onChange={(e) => setMinOrderQuantity(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Harvest Date</label>
                    <input
                      type="date"
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Shelf Life (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={shelfLifeDays}
                      onChange={(e) => setShelfLifeDays(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Organic Certification (if organic) */}
                {farmingMethod === 'Organic' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Organic Certification Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. NPOP/NAB/0014/2024"
                      value={organicCertNo}
                      onChange={(e) => setOrganicCertNo(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Produce Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe flavor, grade, farm harvesting method, and packaging..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Image Selection Presets */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Produce Image *</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {presetImages.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`rounded-xl border overflow-hidden relative group p-1 transition-all ${
                          imageUrl === preset.url ? 'border-emerald-600 ring-2 ring-emerald-600' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-12 object-cover rounded-lg" />
                        <span className="text-[9px] block text-center truncate mt-1 text-slate-700 font-medium">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    placeholder="Or enter custom image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-md flex items-center gap-2"
                  >
                    {submitting ? 'Saving Produce...' : (editingProduct ? 'Update Produce Listing' : 'Publish Produce Lot')}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
