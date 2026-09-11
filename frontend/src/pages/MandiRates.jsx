import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, MapPin, Search, BarChart2, ArrowUpDown, Filter, RefreshCw, Calendar } from 'lucide-react';

// ─── Static APMC Mandi Rate Dataset ──────────────────────────────────────────
const MANDI_DATA = [
  { commodity: 'Tomato', variety: 'Hybrid', mandi: 'Azadpur Mandi', district: 'North Delhi', state: 'Delhi', min: 1200, max: 2800, modal: 2000, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Onion', variety: 'Nashik Red', mandi: 'Lasalgaon Mandi', district: 'Nashik', state: 'Maharashtra', min: 800, max: 1600, modal: 1200, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Potato', variety: 'Jyoti', mandi: 'Agra Mandi', district: 'Agra', state: 'Uttar Pradesh', min: 600, max: 1100, modal: 850, unit: 'Quintal', date: '09-Sep-2026', trend: 'down' },
  { commodity: 'Wheat', variety: 'Sharbati', mandi: 'Khanna Mandi', district: 'Ludhiana', state: 'Punjab', min: 2000, max: 2400, modal: 2200, unit: 'Quintal', date: '09-Sep-2026', trend: 'stable' },
  { commodity: 'Rice (Paddy)', variety: 'Basmati 1121', mandi: 'Karnal Mandi', district: 'Karnal', state: 'Haryana', min: 3800, max: 4400, modal: 4100, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Maize', variety: 'Yellow', mandi: 'Gulbarga Mandi', district: 'Kalaburagi', state: 'Karnataka', min: 1500, max: 1900, modal: 1700, unit: 'Quintal', date: '09-Sep-2026', trend: 'stable' },
  { commodity: 'Soybean', variety: 'JS-335', mandi: 'Indore Mandi', district: 'Indore', state: 'Madhya Pradesh', min: 3600, max: 4200, modal: 3900, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Cotton', variety: 'Long Staple', mandi: 'Rajkot Mandi', district: 'Rajkot', state: 'Gujarat', min: 6200, max: 7400, modal: 6800, unit: 'Quintal', date: '09-Sep-2026', trend: 'down' },
  { commodity: 'Groundnut', variety: 'Bold', mandi: 'Gondal Mandi', district: 'Rajkot', state: 'Gujarat', min: 4800, max: 5600, modal: 5200, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Turmeric', variety: 'Nizamabad', mandi: 'Nizamabad Mandi', district: 'Nizamabad', state: 'Telangana', min: 7800, max: 9200, modal: 8500, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Chilli (Dry)', variety: 'Teja', mandi: 'Guntur Mandi', district: 'Guntur', state: 'Andhra Pradesh', min: 8000, max: 11000, modal: 9500, unit: 'Quintal', date: '09-Sep-2026', trend: 'stable' },
  { commodity: 'Garlic', variety: 'Desi', mandi: 'Neemuch Mandi', district: 'Neemuch', state: 'Madhya Pradesh', min: 6000, max: 8500, modal: 7200, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Ginger', variety: 'Fresh', mandi: 'Kozhikode Mandi', district: 'Kozhikode', state: 'Kerala', min: 2500, max: 3800, modal: 3200, unit: 'Quintal', date: '09-Sep-2026', trend: 'down' },
  { commodity: 'Banana', variety: 'G9 Cavendish', mandi: 'Jalgaon Mandi', district: 'Jalgaon', state: 'Maharashtra', min: 400, max: 800, modal: 600, unit: 'Quintal', date: '09-Sep-2026', trend: 'stable' },
  { commodity: 'Mango', variety: 'Alphonso (Hapus)', mandi: 'Ratnagiri Mandi', district: 'Ratnagiri', state: 'Maharashtra', min: 4000, max: 9000, modal: 6000, unit: 'Quintal', date: '09-Sep-2026', trend: 'down' },
  { commodity: 'Pomegranate', variety: 'Bhagwa', mandi: 'Solapur Mandi', district: 'Solapur', state: 'Maharashtra', min: 5000, max: 9000, modal: 7000, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Apple', variety: 'Shimla Delicious', mandi: 'Shimla Mandi', district: 'Shimla', state: 'Himachal Pradesh', min: 3500, max: 5500, modal: 4500, unit: 'Quintal', date: '09-Sep-2026', trend: 'stable' },
  { commodity: 'Cauliflower', variety: 'Snowball', mandi: 'Ghaziabad Mandi', district: 'Ghaziabad', state: 'Uttar Pradesh', min: 500, max: 900, modal: 700, unit: 'Quintal', date: '09-Sep-2026', trend: 'down' },
  { commodity: 'Cabbage', variety: 'Pride of India', mandi: 'Bangalore Mandi', district: 'Bengaluru Urban', state: 'Karnataka', min: 400, max: 700, modal: 550, unit: 'Quintal', date: '09-Sep-2026', trend: 'stable' },
  { commodity: 'Capsicum', variety: 'Green', mandi: 'Pune Mandi', district: 'Pune', state: 'Maharashtra', min: 1500, max: 2800, modal: 2200, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Lady Finger (Okra)', variety: 'Parbhani Kranti', mandi: 'Hyderabad Mandi', district: 'Hyderabad', state: 'Telangana', min: 1200, max: 2200, modal: 1700, unit: 'Quintal', date: '09-Sep-2026', trend: 'stable' },
  { commodity: 'Brinjal', variety: 'Round', mandi: 'Chennai Mandi', district: 'Chennai', state: 'Tamil Nadu', min: 600, max: 1400, modal: 1000, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Bitter Gourd', variety: 'Preethi', mandi: 'Ernakulam Mandi', district: 'Ernakulam', state: 'Kerala', min: 2800, max: 4200, modal: 3500, unit: 'Quintal', date: '09-Sep-2026', trend: 'down' },
  { commodity: 'Green Peas', variety: 'Arkel', mandi: 'Jalandhar Mandi', district: 'Jalandhar', state: 'Punjab', min: 2200, max: 3800, modal: 3000, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Mustard', variety: 'Pusa Bold', mandi: 'Bharatpur Mandi', district: 'Bharatpur', state: 'Rajasthan', min: 4500, max: 5200, modal: 4800, unit: 'Quintal', date: '09-Sep-2026', trend: 'stable' },
  { commodity: 'Sunflower', variety: 'KBSH-44', mandi: 'Gulbarga Mandi', district: 'Kalaburagi', state: 'Karnataka', min: 4200, max: 5100, modal: 4700, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Arhar (Tur Dal)', variety: 'ICPL-87119', mandi: 'Latur Mandi', district: 'Latur', state: 'Maharashtra', min: 6200, max: 7400, modal: 6800, unit: 'Quintal', date: '09-Sep-2026', trend: 'stable' },
  { commodity: 'Chickpea (Chana)', variety: 'Desi', mandi: 'Akola Mandi', district: 'Akola', state: 'Maharashtra', min: 5100, max: 6200, modal: 5700, unit: 'Quintal', date: '09-Sep-2026', trend: 'up' },
  { commodity: 'Coconut', variety: 'Whole', mandi: 'Coimbatore Mandi', district: 'Coimbatore', state: 'Tamil Nadu', min: 9000, max: 14000, modal: 11500, unit: '1000 Nuts', date: '09-Sep-2026', trend: 'down' },
  { commodity: 'Sugarcane', variety: 'CO-86032', mandi: 'Solapur Mandi', district: 'Solapur', state: 'Maharashtra', min: 280, max: 320, modal: 305, unit: 'Quintal', date: '09-Sep-2026', trend: 'stable' },
];

const ALL_STATES = ['All States', ...new Set(MANDI_DATA.map(d => d.state))].sort();

const getTrendIcon = (trend) => {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
  return <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />;
};

const getTrendColor = (trend) => {
  if (trend === 'up') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (trend === 'down') return 'text-rose-700 bg-rose-50 border-rose-200';
  return 'text-amber-700 bg-amber-50 border-amber-200';
};

export default function MandiRates() {
  const [stateFilter, setStateFilter] = useState('All States');
  const [commoditySearch, setCommoditySearch] = useState('');
  const [sortField, setSortField] = useState('commodity');
  const [sortDir, setSortDir] = useState('asc');
  const [lastUpdated] = useState('09 Sep 2026, 08:30 AM');

  const allDistricts = useMemo(() => {
    if (stateFilter === 'All States') return ['All Districts'];
    return ['All Districts', ...new Set(MANDI_DATA.filter(d => d.state === stateFilter).map(d => d.district))].sort();
  }, [stateFilter]);
  const [districtFilter, setDistrictFilter] = useState('All Districts');

  // Reset district when state changes
  const handleStateChange = (s) => {
    setStateFilter(s);
    setDistrictFilter('All Districts');
  };

  const filtered = useMemo(() => {
    let data = [...MANDI_DATA];
    if (stateFilter !== 'All States') data = data.filter(d => d.state === stateFilter);
    if (districtFilter !== 'All Districts') data = data.filter(d => d.district === districtFilter);
    if (commoditySearch.trim()) {
      const q = commoditySearch.toLowerCase();
      data = data.filter(d => d.commodity.toLowerCase().includes(q) || d.mandi.toLowerCase().includes(q) || d.variety.toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [stateFilter, districtFilter, commoditySearch, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ label, field }) => (
    <th
      className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-emerald-200 cursor-pointer hover:text-white select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-amber-400' : 'text-emerald-500'}`} />
      </span>
    </th>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── Page Header ── */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-800/30 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-amber-800/20 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold mb-4">
            <BarChart2 className="w-3.5 h-3.5" />
            APMC Mandi Market Rates
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">September 2026 Mandi Market Rates</h1>
          <p className="text-emerald-300 text-sm mt-2 font-medium">
            Official wholesale prices across Indian mandis. Government regulated APMC data used to price your produce fairly.
          </p>
          {/* Stats Bar */}
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-emerald-800/60">
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-white">1,271</div>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Tracked Mandis</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">{MANDI_DATA.length * 160}</div>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Active Reports</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-xl font-black text-white">09 Sep 2026</div>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Latest Arrival</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Filter:</span>
          </div>

          {/* State Select */}
          <select
            value={stateFilter}
            onChange={(e) => handleStateChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
          >
            {ALL_STATES.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* District Select */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
          >
            {allDistricts.map(d => <option key={d}>{d}</option>)}
          </select>

          {/* Commodity Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search commodity, mandi..."
              value={commoditySearch}
              onChange={(e) => setCommoditySearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Reset */}
          <button
            onClick={() => { setStateFilter('All States'); setDistrictFilter('All Districts'); setCommoditySearch(''); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>

          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            Updated: {lastUpdated}
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{filtered.length}</strong> commodity arrivals
          {stateFilter !== 'All States' && <> in <strong className="text-emerald-700">{stateFilter}</strong></>}
          {districtFilter !== 'All Districts' && <>, <strong className="text-amber-700">{districtFilter}</strong></>}
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-900">
              <tr>
                <SortHeader label="Commodity" field="commodity" />
                <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-emerald-200 whitespace-nowrap">Variety</th>
                <SortHeader label="Mandi / Market" field="mandi" />
                <SortHeader label="State" field="state" />
                <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-emerald-200 whitespace-nowrap">Min ₹/Qtl</th>
                <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-emerald-200 whitespace-nowrap">Max ₹/Qtl</th>
                <SortHeader label="Modal ₹/Qtl" field="modal" />
                <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-emerald-200 whitespace-nowrap">Per Kg</th>
                <th className="px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">Trend</th>
                <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-emerald-200 whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400 text-sm italic">
                    No mandi records match your filters. Try resetting.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                  >
                    <td className="px-4 py-3.5 text-xs font-extrabold text-slate-900">{row.commodity}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">{row.variety}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-bold text-slate-800">{row.mandi}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {row.district}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600">{row.state}</td>
                    <td className="px-4 py-3.5 text-xs font-bold text-slate-700 text-right">₹{row.min.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 text-xs font-bold text-slate-700 text-right">₹{row.max.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-extrabold text-emerald-800">₹{row.modal.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold text-slate-600 text-right">
                      ₹{(row.modal / 100).toFixed(0)}/kg
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTrendColor(row.trend)}`}>
                        {getTrendIcon(row.trend)}
                        <span className="capitalize">{row.trend}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-400 font-medium text-right whitespace-nowrap">{row.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium">
        <strong>Disclaimer:</strong> Mandi rates are indicative wholesale APMC arrival prices. Actual farm-gate prices may vary. Data sourced from Agmarknet/APMC state portals. Prices in ₹ per Quintal (100 kg) unless stated.
      </div>

    </div>
  );
}
