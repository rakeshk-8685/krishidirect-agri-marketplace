import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import FarmerCard from '../components/FarmerCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Sprout, ShieldCheck, Search } from 'lucide-react';

export default function VerifiedFarms() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      try {
        const data = await apiCall('/farmers');
        if (data && data.success) {
          setFarmers(data.farmers || []);
        }
      } catch (err) {
        console.error('Fetch farmers error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  const filteredFarmers = farmers.filter(f => {
    const term = search.toLowerCase();
    const farm = f.farmDetails || {};
    return (
      f.name.toLowerCase().includes(term) ||
      (farm.farmName || '').toLowerCase().includes(term) ||
      (farm.farmLocation || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Identity & Soil Verified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Verified Indian Farmers</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">Discover family-owned farms growing pesticide-free, nutrient-rich produce.</p>
        </div>

        <div className="w-full md:max-w-md">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search farm name or region (e.g. Ratnagiri, Punjab)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 text-sm font-medium rounded-2xl focus:outline-none shadow"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching verified farm profiles..." />
      ) : filteredFarmers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Sprout className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No farms matched your search</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search term to see all verified growers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFarmers.map(farmer => (
            <FarmerCard key={farmer._id || farmer.id} farmer={farmer} />
          ))}
        </div>
      )}

    </div>
  );
}
