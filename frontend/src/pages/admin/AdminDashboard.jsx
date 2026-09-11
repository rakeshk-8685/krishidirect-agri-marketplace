import React, { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ShieldCheck, Users, Tractor, ShoppingBag, IndianRupee, CheckCircle2, XCircle, AlertTriangle, Eye, RefreshCw, Clock, MapPin, FileText, Percent, Search, Check, Package, ArrowUpRight, Sliders } from 'lucide-react';

export default function AdminDashboard() {
  const { showToast } = useNotification();

  // Primary Data States
  const [metrics, setMetrics] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [commission, setCommission] = useState({ commissionRatePercent: 5 });
  const [loading, setLoading] = useState(true);

  // Active Tab State
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, farmers, users, products, orders, commission

  // Filter States
  const [farmerFilter, setFarmerFilter] = useState('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [orderFilter, setOrderFilter] = useState('ALL');

  // Inspection & Action States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState(5);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/admin/dashboard');
      if (data.success) {
        setMetrics(data.metrics);
        setFarmers(data.farmers || []);
        setProducts(data.products || []);
        setOrders(data.recentOrders || []);
        setUsers(data.users || []);
        if (data.commission) {
          setCommission(data.commission);
          setNewCommissionRate(data.commission.commissionRatePercent || 5);
        }
      }
    } catch (err) {
      console.error('Fetch admin data error:', err);
      showToast('Failed to load admin telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handlers
  const handleVerifyFarmer = async (farmerId, status) => {
    setSubmittingAction(true);
    try {
      const data = await apiCall(`/admin/farmers/${farmerId}/verify`, 'PATCH', { 
        status, 
        notes: verificationNotes 
      });
      if (data.success) {
        showToast(data.message, 'success');
        setSelectedFarmer(null);
        setVerificationNotes('');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Farmer verification failed', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const data = await apiCall(`/admin/users/${userId}/status`, 'PATCH', { 
        isActive: !currentStatus 
      });
      if (data.success) {
        showToast(data.message, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message || 'User status update failed', 'error');
    }
  };

  const handleModerateProduct = async (productId, status) => {
    try {
      const data = await apiCall(`/admin/products/${productId}/moderate`, 'PATCH', { status });
      if (data.success) {
        showToast(data.message, 'info');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Product moderation failed', 'error');
    }
  };

  const handleResolveDispute = async (orderId, action) => {
    setSubmittingAction(true);
    try {
      const res = await apiCall(`/orders/${orderId}/resolve-dispute`, 'POST', {
        action,
        resolutionNote: resolutionNote || (action === 'refund' ? 'Admin approved full refund & order cancellation.' : 'Admin reviewed dispatch logs & confirmed valid delivery.')
      });
      if (res.success) {
        showToast(res.message, 'success');
        setSelectedOrder(null);
        setResolutionNote('');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to resolve dispute', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSaveCommissionRate = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await apiCall('/admin/commission', 'POST', {
        commissionRatePercent: Number(newCommissionRate)
      });
      if (res.success) {
        showToast(res.message, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Commission update failed', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    const st = (status || '').toUpperCase();
    switch (st) {
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">DELIVERED</span>;
      case 'DISPUTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> DISPUTED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">CANCELLED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">REJECTED</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">PENDING</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">CONFIRMED</span>;
      case 'PREPARING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">PREPARING</span>;
      case 'READY_FOR_DELIVERY':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">READY</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">OUT FOR DELIVERY</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">{st}</span>;
    }
  };

  if (loading) return <LoadingSpinner message="Loading platform administration console..." />;

  const disputedCount = orders.filter(o => (o.orderStatus || '').toUpperCase() === 'DISPUTED').length;

  // Filters
  const filteredFarmers = farmers.filter(f => {
    const st = f.farmDetails?.verificationStatus || 'pending';
    if (farmerFilter === 'ALL') return true;
    return st.toLowerCase() === farmerFilter.toLowerCase();
  });

  const filteredUsers = users.filter(u => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredProducts = products.filter(p => {
    if (productCategoryFilter === 'ALL') return true;
    return p.category === productCategoryFilter;
  });

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'ALL') return true;
    return (o.orderStatus || '').toUpperCase() === orderFilter.toUpperCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-agri-dark rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Super Admin Platform Control</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Marketplace Operations & Moderation</h1>
          <p className="text-xs text-slate-300 mt-1">Audit platform GMV, verify farm producers, manage accounts, settle disputes, and set platform commission.</p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition flex items-center gap-2 text-xs font-bold shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Live Telemetry</span>
        </button>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-extrabold text-slate-600">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border'}`}
        >
          <Sliders className="w-4 h-4" />
          <span>Analytics & Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('farmers')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 ${activeTab === 'farmers' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border'}`}
        >
          <Tractor className="w-4 h-4" />
          <span>Farmer Verification ({metrics?.farmers?.pending || 0} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border'}`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border'}`}
        >
          <Package className="w-4 h-4" />
          <span>Produce Listings ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border'}`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Order Audit ({orders.length})</span>
          {disputedCount > 0 && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('commission')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 ${activeTab === 'commission' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 border'}`}
        >
          <Percent className="w-4 h-4" />
          <span>Commission & Ledger ({commission.commissionRatePercent}%)</span>
        </button>
      </div>

      {/* TAB 1: OPERATIONAL ANALYTICS & METRICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Gross Merchandise Value</span>
              <div className="text-3xl font-black text-slate-900">₹{metrics?.financials?.totalGmv || 0}</div>
              <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <span>Platform Commission ({metrics?.financials?.commissionRatePercent}%):</span>
                <span>₹{metrics?.financials?.platformFeeEarned || 0}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Net Farmer Payouts</span>
              <div className="text-3xl font-black text-slate-900">₹{metrics?.financials?.netFarmerPayouts || 0}</div>
              <span className="text-xs text-slate-500 font-medium">Transferred to producers</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Order Fulfillment Rate</span>
              <div className="text-3xl font-black text-emerald-600">{metrics?.orders?.fulfillmentRatePercent || 0}%</div>
              <span className="text-xs text-slate-500 font-medium">{metrics?.orders?.delivered || 0} of {metrics?.orders?.total || 0} orders delivered</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Average Order Value (AOV)</span>
              <div className="text-3xl font-black text-slate-900">₹{metrics?.financials?.averageOrderValue || 0}</div>
              <span className="text-xs text-slate-500 font-medium">Repeat Rate: {metrics?.financials?.repeatCustomerRatePercent || 0}%</span>
            </div>
          </div>

          {/* Producer & User Counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Verified Farmers</span>
                <Tractor className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics?.farmers?.verified || 0}</div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">{metrics?.farmers?.pending || 0} Pending</span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full">{metrics?.farmers?.rejected || 0} Rejected</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Active Households</span>
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics?.consumers || 0}</div>
              <span className="text-xs text-slate-500 font-medium">Registered consumers</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Active Harvest Listings</span>
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics?.products || 0}</div>
              <span className="text-xs text-slate-500 font-medium">Marketplace produce items</span>
            </div>
          </div>

          {/* Order Status Distribution Progress Bars */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Order State Machine Distribution</h3>
            <div className="space-y-3 text-xs font-semibold">
              {Object.entries(metrics?.orders?.breakdown || {}).map(([st, count]) => {
                const total = metrics?.orders?.total || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={st} className="flex items-center gap-3">
                    <span className="w-40 font-bold text-slate-700">{st}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          st === 'DELIVERED' ? 'bg-emerald-600' :
                          st === 'DISPUTED' ? 'bg-red-600' :
                          st === 'CANCELLED' ? 'bg-rose-500' :
                          'bg-indigo-600'
                        }`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <span className="w-16 text-right font-extrabold text-slate-900">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: FARMER VERIFICATION QUEUE & CREDENTIALS */}
      {activeTab === 'farmers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Tractor className="w-5 h-5 text-indigo-600" />
                <span>Farmer Credentials & Quality Audit Queue</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Review farm size, organic certificates, and approve or reject producer applications.</p>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
              {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFarmerFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl transition ${farmerFilter === tab ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:bg-slate-200/60'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b">
                <tr>
                  <th className="p-3">Farmer Name</th>
                  <th className="p-3">Farm Name</th>
                  <th className="p-3">Location & Size</th>
                  <th className="p-3">Organic Cert</th>
                  <th className="p-3">Verification Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFarmers.map(f => {
                  const farm = f.farmDetails || {};
                  const st = farm.verificationStatus || 'pending';
                  return (
                    <tr key={f._id} className="hover:bg-slate-50">
                      <td className="p-3 font-extrabold text-slate-900">{f.name}</td>
                      <td className="p-3 font-semibold text-slate-800">{farm.farmName || 'Farm'}</td>
                      <td className="p-3 text-slate-600">{farm.farmLocation || farm.state} ({farm.sizeInAcres || 5} Acres)</td>
                      <td className="p-3">
                        {farm.isOrganicCertified ? (
                          <span className="text-emerald-700 font-bold">Organic ({farm.certificationNumber || 'Cert Verified'})</span>
                        ) : (
                          <span className="text-slate-500">Natural</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          st === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                          st === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {st.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedFarmer(f)}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg"
                        >
                          Inspect & Audit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER ACCOUNT MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>User Account Administration & Status</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage registered consumers, farmers, and platform access status.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
                {['ALL', 'consumer', 'farmer', 'admin'].map(role => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-xl transition ${userRoleFilter === role ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:bg-slate-200/60'}`}
                  >
                    {role === 'ALL' ? 'ALL' : role.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email & Contact</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Registered Date</th>
                  <th className="p-3 text-right">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.isActive !== false ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.isActive !== false)}
                          className={`px-3 py-1 font-bold rounded-lg transition ${
                            u.isActive !== false 
                              ? 'bg-rose-100 hover:bg-rose-200 text-rose-800' 
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          }`}
                        >
                          {u.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCE LISTINGS & MODERATION */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <span>Produce Listing Moderation</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Audit produce items, prices, and organic compliance.</p>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
              {['ALL', 'Fruits', 'Vegetables', 'Grains & Pulses', 'Dairy & Poultry', 'Organic & Special'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setProductCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl transition ${productCategoryFilter === cat ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:bg-slate-200/60'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b">
                <tr>
                  <th className="p-3">Produce Title</th>
                  <th className="p-3">Farmer & Farm</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price / Unit</th>
                  <th className="p-3">Stock Quantity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2">
                      <img src={p.images?.[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <span>{p.title}</span>
                    </td>
                    <td className="p-3 text-slate-700">
                      <div className="font-bold">{p.farmName}</div>
                      <div className="text-[10px] text-slate-400">{p.farmerName}</div>
                    </td>
                    <td className="p-3 text-slate-600 font-semibold">{p.category}</td>
                    <td className="p-3 font-extrabold text-slate-900">₹{p.price} / {p.unit}</td>
                    <td className="p-3 text-slate-700 font-bold">{p.availableQuantity} {p.unit}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'in_stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {(p.status || 'in_stock').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {p.status !== 'in_stock' && (
                        <button
                          onClick={() => handleModerateProduct(p._id, 'in_stock')}
                          className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      )}
                      {p.status === 'in_stock' && (
                        <button
                          onClick={() => handleModerateProduct(p._id, 'unlisted')}
                          className="px-3 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300"
                        >
                          Unlist / Hide
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ORDER AUDIT & DISPUTES */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <span>Order State Machine Audit & Dispute Settlement</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Inspect state machine history logs, delivery slots, and settle buyer disputes.</p>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
              {['ALL', 'DISPUTED', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setOrderFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl transition ${orderFilter === tab ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:bg-slate-200/60'}`}
                >
                  {tab === 'READY_FOR_DELIVERY' ? 'READY' : tab === 'OUT_FOR_DELIVERY' ? 'OUT' : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Consumer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Delivery Slot</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(o => (
                  <tr key={o._id} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-slate-900">{o.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{o.consumerName || 'Consumer'}</div>
                      <div className="text-[10px] text-slate-500">{o.consumerPhone}</div>
                    </td>
                    <td className="p-3 font-extrabold text-slate-900">₹{o.totalAmount}</td>
                    <td className="p-3 text-slate-600 font-medium">{o.deliverySlot || 'Standard'}</td>
                    <td className="p-3">{getStatusBadge(o.orderStatus)}</td>
                    <td className="p-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: COMMISSION ENGINE & FARMER LEDGER */}
      {activeTab === 'commission' && (
        <div className="space-y-8">
          
          {/* Commission Config Form */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Revenue Model</span>
                <h3 className="text-2xl font-black">Platform Commission Rate Configuration</h3>
                <p className="text-xs text-slate-300 mt-1">Set the platform fee percentage automatically retained from each order for infrastructure & logistics support.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-indigo-300 block">Current Active Rate</span>
                <span className="text-4xl font-black text-amber-400">{commission.commissionRatePercent}%</span>
              </div>
            </div>

            <form onSubmit={handleSaveCommissionRate} className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-slate-200">Adjust Commission Fee Percentage (0% - 30%):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(e.target.value)}
                    className="w-full accent-amber-400"
                  />
                  <span className="font-black text-xl text-amber-400 w-16">{newCommissionRate}%</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingAction}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow shrink-0"
              >
                {submittingAction ? 'Updating...' : 'Save Commission Rate'}
              </button>
            </form>
          </div>

          {/* Farmer Earnings & Commission Payout Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-indigo-600" />
              <span>Farmer Earnings & Platform Commission Ledger</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-700 border-b">
                  <tr>
                    <th className="p-3">Farmer & Farm Name</th>
                    <th className="p-3">Verification</th>
                    <th className="p-3">Orders Fulfilled</th>
                    <th className="p-3">Gross Sales (GMV)</th>
                    <th className="p-3">Platform Fee ({commission.commissionRatePercent}%)</th>
                    <th className="p-3 text-right">Net Farmer Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics?.farmerLedger?.map(row => (
                    <tr key={row.farmerId} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">{row.farmName}</div>
                        <div className="text-[10px] text-slate-500">{row.farmerName}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {row.verificationStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-bold">{row.ordersCount} orders</td>
                      <td className="p-3 font-extrabold text-slate-900">₹{row.grossSales}</td>
                      <td className="p-3 font-bold text-indigo-600">₹{row.platformFee}</td>
                      <td className="p-3 text-right font-black text-emerald-600 text-sm">₹{row.netPayout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Farmer Inspection Modal */}
      {selectedFarmer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600">PRODUCER CREDENTIAL AUDIT</span>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedFarmer.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedFarmer.farmDetails?.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {(selectedFarmer.farmDetails?.verificationStatus || 'pending').toUpperCase()}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
                <span className="font-bold text-slate-500 uppercase block">Farm Credentials & Location</span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedFarmer.farmDetails?.farmName}</p>
                <p className="text-slate-700">Location: {selectedFarmer.farmDetails?.farmLocation || selectedFarmer.farmDetails?.state}</p>
                <p className="text-slate-700">Farm Size: {selectedFarmer.farmDetails?.sizeInAcres || 10} Acres</p>
                <p className="text-slate-700">Organic Status: {selectedFarmer.farmDetails?.isOrganicCertified ? `Certified (${selectedFarmer.farmDetails?.certificationNumber})` : 'Natural Produce'}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
                <span className="font-bold text-slate-500 uppercase block">Bank Settlement Credentials</span>
                <p className="text-slate-700">Account Holder: {selectedFarmer.farmDetails?.bankDetails?.accountHolder || selectedFarmer.name}</p>
                <p className="text-slate-700">Account Number: {selectedFarmer.farmDetails?.bankDetails?.accountNumber || 'Pending'}</p>
                <p className="text-slate-700">IFSC Code: {selectedFarmer.farmDetails?.bankDetails?.ifscCode || 'Pending'}</p>
                <p className="text-slate-700">UPI ID: {selectedFarmer.farmDetails?.bankDetails?.upiId || 'Pending'}</p>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Admin Quality Audit Notes:</label>
                <input
                  type="text"
                  placeholder="e.g. Organic certificate verified with state board..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={submittingAction}
                  onClick={() => handleVerifyFarmer(selectedFarmer._id, 'verified')}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-extrabold rounded-xl hover:bg-emerald-700 transition"
                >
                  Approve Verification
                </button>
                <button
                  disabled={submittingAction}
                  onClick={() => handleVerifyFarmer(selectedFarmer._id, 'rejected')}
                  className="flex-1 py-2.5 bg-rose-600 text-white font-extrabold rounded-xl hover:bg-rose-700 transition"
                >
                  Reject Application
                </button>
              </div>
            </div>

            <div className="flex justify-end border-t pt-3">
              <button
                onClick={() => setSelectedFarmer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600">INSPECTION CONSOLE</span>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedOrder.orderNumber}</h3>
              </div>
              <div>{getStatusBadge(selectedOrder.orderStatus)}</div>
            </div>

            {/* Customer & Slot Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs space-y-1">
              <div>
                <span className="font-bold text-slate-500 block uppercase">Consumer Contact</span>
                <p className="font-bold text-slate-900">{selectedOrder.consumerName}</p>
                <p className="text-slate-600">{selectedOrder.consumerPhone}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 block uppercase">Delivery Logistics</span>
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{selectedOrder.deliverySlot || 'Standard Morning'}</span>
                </p>
                <p className="text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOrder.deliveryAddress?.addressLine}, {selectedOrder.deliveryAddress?.city}</span>
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700 uppercase">Order Items & Producer Breakdown</h4>
              <div className="divide-y divide-slate-100 border rounded-2xl p-3 bg-slate-50 text-xs">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span className="text-slate-500 ml-2">({item.quantity} {item.unit})</span>
                      <div className="text-[10px] text-indigo-600 font-medium">Farm: {item.farmName} ({item.farmerName})</div>
                    </div>
                    <div className="font-extrabold text-slate-900">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispute Details & Resolution Action */}
            {(selectedOrder.orderStatus || '').toUpperCase() === 'DISPUTED' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-800 font-extrabold text-sm">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Dispute Ticket Information</span>
                </div>
                <div className="text-xs text-red-900 bg-white/80 p-3 rounded-xl border border-red-100">
                  <span className="font-bold block">Consumer Reported Reason:</span>
                  "{selectedOrder.disputeDetails?.reason || 'Issue reported with order delivery'}"
                  <span className="text-[10px] text-red-600 block mt-1">Raised by: {selectedOrder.disputeDetails?.raisedBy} on {new Date(selectedOrder.disputeDetails?.raisedAt).toLocaleString()}</span>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 block">Admin Resolution Note:</label>
                  <input
                    type="text"
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Enter resolution notes for customer & farmer..."
                    className="w-full text-xs p-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={submittingAction}
                    onClick={() => handleResolveDispute(selectedOrder._id, 'refund')}
                    className="flex-1 py-2.5 bg-red-600 text-white font-extrabold rounded-xl text-xs hover:bg-red-700 transition"
                  >
                    Approve Full Refund & Cancel
                  </button>
                  <button
                    disabled={submittingAction}
                    onClick={() => handleResolveDispute(selectedOrder._id, 'close')}
                    className="flex-1 py-2.5 bg-slate-800 text-white font-extrabold rounded-xl text-xs hover:bg-slate-900 transition"
                  >
                    Dismiss & Close Dispute
                  </button>
                </div>
              </div>
            )}

            {/* State Transition History Log */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700 uppercase">State Machine Audit Log</h4>
              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs font-mono max-h-40 overflow-y-auto space-y-1.5">
                {selectedOrder.statusHistory?.map((hist, idx) => (
                  <div key={idx} className="flex items-start justify-between border-b border-slate-800 pb-1 text-[11px]">
                    <div>
                      <span className="font-bold text-emerald-400">[{hist.status}]</span>
                      <span className="ml-2 text-slate-300">{hist.note}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">{new Date(hist.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
