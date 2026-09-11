import React, { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import FarmerNavbar from '../../components/FarmerNavbar';
import FarmerVerificationNotice from '../../components/FarmerVerificationNotice';
import { ShoppingBag, CheckCircle2, Clock, Truck, PackageCheck, Tractor, XCircle, Eye, MapPin, Phone, User, Calendar, AlertTriangle, X, ArrowRight, ShieldCheck, IndianRupee } from 'lucide-react';

export default function FarmerOrders() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const farm = user?.farmDetails || {};
  const isVerified = farm.verificationStatus === 'verified';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchFarmerOrders = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/orders');
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Fetch farmer orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, note = '') => {
    if (!isVerified) {
      showToast('Order fulfillment actions are locked until farmer verification is approved.', 'error');
      return;
    }

    setUpdatingId(orderId);
    try {
      const data = await apiCall(`/orders/${orderId}/status`, 'PATCH', {
        status: newStatus,
        note
      });
      if (data.success) {
        showToast(data.message || `Order status updated to ${newStatus}`, 'success');
        if (rejectingOrder) setRejectingOrder(null);
        if (selectedOrder) {
          setSelectedOrder(data.order || { ...selectedOrder, orderStatus: newStatus });
        }
        fetchFarmerOrders();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectingOrder) return;
    const note = rejectReason.trim() || 'Produce unfulfillable due to weather or crop inventory constraint.';
    handleUpdateStatus(rejectingOrder._id, 'cancelled', note);
  };

  // Helper to normalize status strings
  const normalizeStatus = (s) => (s || '').toLowerCase();

  const filteredOrders = orders.filter(o => {
    const s = normalizeStatus(o.orderStatus);
    if (activeTab === 'pending') return s === 'pending';
    if (activeTab === 'active') return ['accepted', 'confirmed', 'packing', 'preparing', 'ready', 'ready_for_delivery', 'out_for_delivery'].includes(s);
    if (activeTab === 'completed') return s === 'delivered';
    if (activeTab === 'cancelled') return ['cancelled', 'rejected'].includes(s);
    return true;
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
              <ShoppingBag className="w-7 h-7 text-emerald-700" />
              <span>Farmer Order Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review customer orders, start harvest packing, and advance dispatch delivery stages.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{orders.length} Total Orders Received</span>
          </div>
        </div>

        {/* Pipeline Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          {[
            { id: 'all', label: `All Orders (${orders.length})` },
            { id: 'pending', label: `Pending Acceptance (${orders.filter(o => normalizeStatus(o.orderStatus) === 'pending').length})` },
            { id: 'active', label: `Active Fulfillment (${orders.filter(o => ['accepted', 'confirmed', 'packing', 'preparing', 'ready', 'ready_for_delivery', 'out_for_delivery'].includes(normalizeStatus(o.orderStatus))).length})` },
            { id: 'completed', label: `Completed (${orders.filter(o => normalizeStatus(o.orderStatus) === 'delivered').length})` },
            { id: 'cancelled', label: `Cancelled / Rejected (${orders.filter(o => ['cancelled', 'rejected'].includes(normalizeStatus(o.orderStatus))).length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-bold border transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <LoadingSpinner message="Fetching customer order queue..." />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No orders in this status tab</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {orders.length === 0
                ? 'No consumer orders have been placed for your farm produce lots yet.'
                : 'There are currently no orders under this fulfillment category.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => {
              const status = normalizeStatus(order.orderStatus);
              const gross = order.totalAmount || 0;
              const fee = Math.round(gross * 0.05);
              const netPayout = gross - fee;

              return (
                <div key={order._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 hover:border-emerald-200 transition-colors">
                  
                  {/* Order Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-base sm:text-lg text-slate-900">{order.orderNumber}</span>
                        
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'pending'
                            ? 'bg-amber-100 text-amber-900'
                            : status === 'cancelled' || status === 'rejected'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
                    >
                      <Eye className="w-4 h-4 text-emerald-700" />
                      <span>View Full Order Details</span>
                    </button>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs border border-slate-100">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[10px] block">Customer Contact</span>
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 text-emerald-700" />
                        <span>{order.consumerName}</span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-1.5 pt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.consumerPhone || 'Contact details provided'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[10px] block">Delivery Destination</span>
                      <div className="font-medium text-slate-800 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          {order.deliveryAddress?.addressLine 
                            ? `${order.deliveryAddress.addressLine}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`
                            : 'Direct Farm Delivery'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items List Ordered */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">Produce Items Ordered</span>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div>
                            <span className="font-bold text-slate-900">{item.title}</span>
                            <div className="text-[11px] text-slate-500">₹{item.price} per {item.unit}</div>
                          </div>
                          <span className="font-extrabold text-slate-900">
                            {item.quantity} {item.unit} • <span className="text-emerald-800">₹{item.price * item.quantity}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Realization Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-600">Payment:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {order.paymentStatus} ({order.paymentMethod?.toUpperCase() || 'UPI'})
                      </span>
                    </div>

                    <div className="flex items-baseline gap-4 text-slate-700">
                      <div>
                        <span className="text-[11px] text-slate-500">Order Gross: </span>
                        <span className="font-bold text-slate-900">₹{gross}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Fee (5%): </span>
                        <span className="text-rose-600 font-semibold">-₹{fee}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-950">Net Payout: </span>
                        <span className="text-base font-extrabold text-emerald-800">₹{netPayout}</span>
                      </div>
                    </div>
                  </div>

                  {/* State Machine Transition Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-600">Next Action:</span>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Step 1: Pending -> Accept or Reject */}
                      {status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'accepted', 'Farmer accepted produce order')}
                            disabled={updatingId === order._id || !isVerified}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow transition-transform active:scale-95 disabled:opacity-50"
                          >
                            Accept Order (Start Fulfillment)
                          </button>
                          <button
                            onClick={() => { setRejectingOrder(order); setRejectReason(''); }}
                            disabled={updatingId === order._id || !isVerified}
                            className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors disabled:opacity-50"
                          >
                            Reject Order
                          </button>
                        </>
                      )}

                      {/* Step 2: Accepted -> Packing */}
                      {(status === 'accepted' || status === 'confirmed') && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'packing', 'Produce harvesting & crate packing started')}
                          disabled={updatingId === order._id || !isVerified}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                        >
                          <Tractor className="w-4 h-4" />
                          <span>Start Harvest & Packing</span>
                        </button>
                      )}

                      {/* Step 3: Packing -> Ready */}
                      {(status === 'packing' || status === 'preparing') && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'ready', 'Harvest lot packed and crated for pickup')}
                          disabled={updatingId === order._id || !isVerified}
                          className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                        >
                          <PackageCheck className="w-4 h-4" />
                          <span>Mark Crates Ready for Delivery</span>
                        </button>
                      )}

                      {/* Step 4: Ready -> Out for Delivery */}
                      {status === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'out_for_delivery', 'Produce handed over to driver')}
                          disabled={updatingId === order._id || !isVerified}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Dispatch Out for Delivery</span>
                        </button>
                      )}

                      {/* Step 5: Out for Delivery -> Delivered */}
                      {status === 'out_for_delivery' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'delivered', 'Produce safely delivered to customer')}
                          disabled={updatingId === order._id || !isVerified}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Delivered & Settle</span>
                        </button>
                      )}

                      {/* Completed */}
                      {status === 'delivered' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Delivered & Settled</span>
                        </span>
                      )}

                      {/* Cancelled */}
                      {(status === 'cancelled' || status === 'rejected') && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-bold text-xs">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Order Cancelled</span>
                        </span>
                      )}

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Order Rejection Reason Modal */}
        {rejectingOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Reject Produce Order</span>
                </h3>
                <button onClick={() => setRejectingOrder(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to reject order <strong>{rejectingOrder.orderNumber}</strong>? Please provide a reason to notify the customer.
              </p>

              <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason for Rejection *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Unseasonal rain damaged tomato crop, insufficient inventory to fulfill."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingOrder(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detailed Order Inspection Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-200 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Order Details: {selectedOrder.orderNumber}
                  </h3>
                  <p className="text-[11px] text-slate-500">Full customer delivery & crop lot manifest</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Timeline */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">Fulfillment Stages</span>
                <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                  {[
                    { label: 'Pending', active: true },
                    { label: 'Accepted', active: ['accepted', 'packing', 'ready', 'out_for_delivery', 'delivered'].includes(normalizeStatus(selectedOrder.orderStatus)) },
                    { label: 'Harvest/Pack', active: ['packing', 'ready', 'out_for_delivery', 'delivered'].includes(normalizeStatus(selectedOrder.orderStatus)) },
                    { label: 'Dispatched', active: ['out_for_delivery', 'delivered'].includes(normalizeStatus(selectedOrder.orderStatus)) },
                    { label: 'Delivered', active: normalizeStatus(selectedOrder.orderStatus) === 'delivered' }
                  ].map((st, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        st.active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {i + 1}
                      </div>
                      <span className={`font-semibold leading-tight ${st.active ? 'text-emerald-950 font-bold' : 'text-slate-400'}`}>
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Produce Lots */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">Items in this Manifest</span>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-900">{item.title}</span>
                        <div className="text-[11px] text-slate-500">₹{item.price} / {item.unit}</div>
                      </div>
                      <span className="font-extrabold text-emerald-800">
                        {item.quantity} {item.unit} • ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payout Calculation */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1.5 text-emerald-950">
                <div className="flex justify-between">
                  <span>Gross Order Value:</span>
                  <span className="font-bold">₹{selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Platform Processing (5%):</span>
                  <span>-₹{Math.round(selectedOrder.totalAmount * 0.05)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-emerald-900 pt-1 border-t border-emerald-200">
                  <span>Direct Farmer Payout Realization:</span>
                  <span>₹{selectedOrder.totalAmount - Math.round(selectedOrder.totalAmount * 0.05)}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
