import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import FarmerNavbar from '../../components/FarmerNavbar';
import FarmerVerificationNotice from '../../components/FarmerVerificationNotice';
import { Tractor, IndianRupee, ShoppingBag, Sprout, AlertTriangle, Plus, ArrowRight, CheckCircle2, Clock, ShieldCheck, XCircle, AlertCircle, Settings, PackageCheck, BarChart3, TrendingUp, Truck } from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await apiCall('/farmers/dashboard');
        if (data.success) {
          setMetrics(data.metrics);
          setRecentOrders(data.recentOrders || []);
          setProductsList(data.productsList || []);
        }
      } catch (err) {
        console.error('Fetch farmer dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your farmer portal..." />;

  const farm = user?.farmDetails || {};
  const isVerified = farm.verificationStatus === 'verified';

  // Calculate stock health
  const healthyStockCount = productsList.filter(p => p.availableQuantity > 10).length;
  const lowStockCount = productsList.filter(p => p.availableQuantity > 0 && p.availableQuantity <= 10).length;
  const outOfStockCount = productsList.filter(p => p.availableQuantity === 0).length;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 md:pb-12">
      {/* Farmer Specialized Header */}
      <FarmerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Verification Alert Banner */}
        <FarmerVerificationNotice farmDetails={farm} />

        {/* Hero Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-2">
              <Tractor className="w-3.5 h-3.5 text-amber-400" />
              <span>{farm.farmName || `${user?.name}'s Farm`}</span>
              <span className="text-emerald-400">• {farm.district || 'India'}, {farm.state || ''}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Farmer Management Hub</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Track real-time harvest demand, monitor customer orders, and manage crop stock with transparent direct-to-consumer payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isVerified ? (
              <Link
                to="/farmer/products?action=new"
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>List New Produce</span>
              </Link>
            ) : (
              <button
                disabled
                title="Account is pending verification"
                className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-400 font-extrabold text-xs cursor-not-allowed flex items-center justify-center gap-2 border border-slate-700"
              >
                <Plus className="w-4 h-4" />
                <span>List Produce (Pending Approval)</span>
              </button>
            )}

            <Link
              to="/farmer/sales"
              className="px-4 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-600/50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span>Sales Report</span>
            </Link>
          </div>
        </div>

        {/* 5 Core Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          
          {/* 1. Gross Earnings */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Gross Sales</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ₹{metrics?.totalEarnings || 0}
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <span>95% direct payout</span>
            </p>
          </div>

          {/* 2. Total Orders */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Total Orders</span>
              <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics?.totalOrders || 0}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">All consumer orders</p>
          </div>

          {/* 3. Pending Acceptance */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Pending Orders</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {metrics?.pendingOrders || 0}
            </div>
            <p className="text-[10px] text-amber-700 font-semibold">Requires acceptance</p>
          </div>

          {/* 4. Active Deliveries */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Active Delivery</span>
              <div className="w-9 h-9 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
              {metrics?.activeDeliveries || 0}
            </div>
            <p className="text-[10px] text-blue-700 font-semibold">Packing / In-transit</p>
          </div>

          {/* 5. Completed Orders */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Completed</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics?.completedOrders || 0}
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold">Delivered & settled</p>
          </div>

        </div>

        {/* Inventory Stock Health Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>Crop Inventory Health</span>
              </h2>
              <p className="text-xs text-slate-500">Keep inventory accurate so buyers only order available farm lots.</p>
            </div>
            <Link to="/farmer/products" className="text-xs font-bold text-emerald-700 hover:underline">
              Manage Produce Listings →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800">In Stock (&gt;10 units)</span>
                <div className="text-xl font-extrabold text-emerald-950 mt-0.5">{healthyStockCount} items</div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-800">Low Stock (&le;10 units)</span>
                <div className="text-xl font-extrabold text-amber-950 mt-0.5">{lowStockCount} items</div>
              </div>
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-800">Out of Stock (0 units)</span>
                <div className="text-xl font-extrabold text-rose-950 mt-0.5">{outOfStockCount} items</div>
              </div>
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>

        {/* Two Columns: Recent Orders & Quick Stock Adjustments */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Recent Customer Orders */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Incoming Produce Orders</span>
                </h3>
                <p className="text-[11px] text-slate-500">Orders placed by consumers for your farm produce</p>
              </div>
              <Link to="/farmer/orders" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                <span>All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs italic">No orders received yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-emerald-300 transition-colors">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-900">{order.orderNumber}</span>
                      <span className={`capitalize px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        order.orderStatus === 'delivered' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : order.orderStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p>Buyer: <strong className="text-slate-900">{order.consumerName}</strong> ({order.consumerPhone})</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-200">
                      <span className="font-extrabold text-slate-900">
                        Order Cut: <span className="text-emerald-700">₹{order.totalAmount}</span>
                      </span>
                      <Link to="/farmer/orders" className="text-xs font-bold text-emerald-700 hover:underline">
                        Manage Status →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Active Inventory Items */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-amber-600" />
                  <span>My Active Crops</span>
                </h3>
                <p className="text-[11px] text-slate-500">Live prices & quantities in market</p>
              </div>
              <Link to="/farmer/products" className="text-xs font-bold text-amber-700 hover:underline">
                View All ({productsList.length})
              </Link>
            </div>

            {productsList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Sprout className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs italic">No produce items listed yet.</p>
                {isVerified && (
                  <Link
                    to="/farmer/products?action=new"
                    className="inline-block mt-2 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs"
                  >
                    + Add Your First Crop
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {productsList.slice(0, 5).map(prod => (
                  <div key={prod._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img 
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'} 
                        alt={prod.title} 
                        className="w-11 h-11 rounded-xl object-cover border bg-white shrink-0" 
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 max-w-[140px] truncate">{prod.title}</h4>
                        <p className="text-[11px] text-slate-500">₹{prod.price} / {prod.unit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-extrabold ${
                        prod.availableQuantity === 0 
                          ? 'text-rose-600' 
                          : prod.availableQuantity <= 10 
                          ? 'text-amber-600' 
                          : 'text-emerald-700'
                      }`}>
                        {prod.availableQuantity} {prod.unit}
                      </span>
                      <p className="text-[10px] text-slate-400 capitalize">{prod.status?.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
