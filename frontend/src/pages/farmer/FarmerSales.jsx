import React, { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import FarmerNavbar from '../../components/FarmerNavbar';
import FarmerVerificationNotice from '../../components/FarmerVerificationNotice';
import { TrendingUp, IndianRupee, ShoppingBag, Clock, CheckCircle2, Sprout, ArrowDownRight, ArrowUpRight, Filter, Download, Calendar } from 'lucide-react';

export default function FarmerSales() {
  const { user } = useAuth();
  const farm = user?.farmDetails || {};

  const [period, setPeriod] = useState('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSalesSummary = async () => {
    setLoading(true);
    try {
      let endpoint = `/farmers/sales?period=${period}`;
      if (isCustom && startDate && endDate) {
        endpoint = `/farmers/sales?period=custom&startDate=${startDate}&endDate=${endDate}`;
      }
      const data = await apiCall(endpoint);
      if (data.success) {
        setSalesData(data);
      }
    } catch (err) {
      console.error('Fetch farmer sales error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesSummary();
  }, [period]);

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      setIsCustom(true);
      fetchSalesSummary();
    }
  };

  const metrics = salesData?.metrics || {
    grossSales: 0,
    platformFee: 0,
    netPayout: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0
  };

  const timeline = salesData?.timeline || [];
  const topCrops = salesData?.topCrops || [];
  const orderLedger = salesData?.orderLedger || [];

  // Find max sales in timeline for SVG scaling
  const maxDailySales = Math.max(...timeline.map(d => d.sales), 100);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 md:pb-12">
      <FarmerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Verification Alert Banner */}
        <FarmerVerificationNotice farmDetails={farm} compact={true} />

        {/* Page Header & Period Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <TrendingUp className="w-7 h-7 text-emerald-700" />
              <span>Sales Performance & Payout Summary</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Transparent revenue analytics, 5% platform commission deductions, and net bank realization.
            </p>
          </div>

          {/* Time Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: 'all', label: 'All Time' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setIsCustom(false); setPeriod(tab.id); }}
                className={`px-3.5 py-2 rounded-xl font-bold border transition-colors ${
                  !isCustom && period === tab.id
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Custom Date Range Toggle */}
            <button
              onClick={() => setIsCustom(!isCustom)}
              className={`px-3.5 py-2 rounded-xl font-bold border transition-colors flex items-center gap-1.5 ${
                isCustom
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Form */}
        {isCustom && (
          <form onSubmit={handleApplyCustom} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">From:</span>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">To:</span>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow transition-colors"
            >
              Apply Filter
            </button>
          </form>
        )}

        {loading ? (
          <LoadingSpinner message="Calculating farmer sales and net realizations..." />
        ) : (
          <>
            {/* 5 Financial Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              
              {/* Gross Sales */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Gross Sales</span>
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ₹{metrics.grossSales.toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Total value of produce sold</p>
              </div>

              {/* Platform Commission (5%) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Platform Fee (5%)</span>
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                  -₹{metrics.platformFee.toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-amber-800 font-medium">Platform operations & logistics</p>
              </div>

              {/* Net Realization (95%) */}
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-5 shadow-md space-y-2 col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-emerald-300">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Net Payout</span>
                  <div className="w-9 h-9 rounded-2xl bg-emerald-800 flex items-center justify-center text-amber-300 font-bold">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-100">
                  ₹{metrics.netPayout.toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-emerald-300 font-semibold">95% net bank realization</p>
              </div>

              {/* Completed Orders */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Completed Orders</span>
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {metrics.completedOrders}
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">Settled to bank account</p>
              </div>

              {/* Pending Orders */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Pending Orders</span>
                  <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {metrics.pendingOrders}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Awaiting delivery / fulfillment</p>
              </div>

            </div>

            {/* Daily Sales Revenue Chart (Lightweight Responsive SVG Chart) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <span>Daily Sales Timeline</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Gross revenue generated across recent dates</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  {timeline.length} Days Tracked
                </span>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div className="w-full pt-4">
                <div className="h-56 flex items-end gap-2 sm:gap-3 overflow-x-auto pb-4 pt-4 px-2 border-b border-slate-100">
                  {timeline.map((day, idx) => {
                    const heightPercent = maxDailySales > 0 ? Math.max(12, Math.round((day.sales / maxDailySales) * 100)) : 12;
                    return (
                      <div key={idx} className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group relative">
                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-10">
                          ₹{day.sales} ({day.orders} ord)
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-xl transition-all duration-500 group-hover:brightness-110 ${
                            day.sales > 0 
                              ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-sm' 
                              : 'bg-slate-100 border-t border-slate-200'
                          }`}
                        />

                        {/* Date Label */}
                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-full">
                          {day.date.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Two Column Grid: Top Selling Produce & Payout Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Top-Selling Crops Breakdown */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-700" />
                    <span>Top-Selling Produce</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">High-demand crops ranked by revenue</p>
                </div>

                {topCrops.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No crop sales registered in this period.</p>
                ) : (
                  <div className="space-y-3">
                    {topCrops.map((crop, idx) => {
                      const sharePercent = metrics.grossSales > 0 ? Math.round((crop.revenue / metrics.grossSales) * 100) : 0;
                      return (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-900">{crop.title}</span>
                            <span className="font-extrabold text-emerald-800">₹{crop.revenue.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{crop.quantitySold} units sold ({crop.ordersCount} orders)</span>
                            <span className="font-bold text-slate-700">{sharePercent}% of sales</span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${sharePercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Payout Ledger & Transaction History */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-700" />
                      <span>Order Payout Ledger</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Line-item revenue realization and platform deductions</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                    {orderLedger.length} Records
                  </span>
                </div>

                {orderLedger.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No transactions in this period.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Order ID & Date</th>
                          <th className="p-3">Gross</th>
                          <th className="p-3">Fee (5%)</th>
                          <th className="p-3">Net Realization</th>
                          <th className="p-3 text-right">Fulfillment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orderLedger.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3">
                              <span className="font-extrabold text-slate-900 block">{tx.orderNumber}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </td>

                            <td className="p-3 font-semibold text-slate-800">
                              ₹{tx.grossAmount}
                            </td>

                            <td className="p-3 text-amber-700 font-semibold">
                              -₹{tx.platformFee}
                            </td>

                            <td className="p-3 font-extrabold text-emerald-800">
                              ₹{tx.netPayout}
                            </td>

                            <td className="p-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                tx.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {tx.status?.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
