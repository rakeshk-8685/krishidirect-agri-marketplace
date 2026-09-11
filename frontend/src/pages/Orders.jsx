import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { ShoppingBag, MapPin, ArrowRight, Truck, CheckCircle2, Clock, XCircle, ShieldAlert, PackageCheck, Tractor } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await apiCall('/orders');
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const normalize = (st) => {
    if (!st) return 'PENDING';
    const s = st.toUpperCase();
    if (s === 'ACCEPTED') return 'CONFIRMED';
    if (s === 'PACKING') return 'PREPARING';
    if (s === 'READY') return 'READY_FOR_DELIVERY';
    return s;
  };

  const getStatusBadge = (status) => {
    const norm = normalize(status);
    switch (norm) {
      case 'DELIVERED':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> DELIVERED</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> OUT FOR DELIVERY</span>;
      case 'READY_FOR_DELIVERY':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5" /> READY FOR PICKUP</span>;
      case 'PREPARING':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> PREPARING HARVEST</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1"><Tractor className="w-3.5 h-3.5" /> FARM CONFIRMED</span>;
      case 'DISPUTED':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-950 border border-amber-400 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> DISPUTED</span>;
      case 'CANCELLED':
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> {norm}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800">PENDING</span>;
    }
  };

  const filteredOrders = orders.filter(o => {
    const norm = normalize(o.orderStatus);
    if (activeTab === 'active') return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(norm);
    if (activeTab === 'completed') return norm === 'DELIVERED';
    if (activeTab === 'disputed') return norm === 'DISPUTED';
    if (activeTab === 'cancelled') return ['CANCELLED', 'REJECTED'].includes(norm);
    return true;
  });

  if (loading) return <LoadingSpinner message="Fetching your order history..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-emerald-600" />
            <span>My Orders ({orders.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track dispatch status, manage order cancellations, and view receipts.</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'all', label: `All (${orders.length})` },
            { id: 'active', label: `Active (${orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(normalize(o.orderStatus))).length})` },
            { id: 'completed', label: `Completed (${orders.filter(o => normalize(o.orderStatus) === 'DELIVERED').length})` },
            { id: 'disputed', label: `Disputed (${orders.filter(o => normalize(o.orderStatus) === 'DISPUTED').length})` },
            { id: 'cancelled', label: `Cancelled (${orders.filter(o => ['CANCELLED', 'REJECTED'].includes(normalize(o.orderStatus))).length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl border transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState 
          title="No Orders Found"
          description="No orders match your current filter view. Explore produce marketplace to order fresh harvest."
          actionLabel="Browse Produce Marketplace"
          actionPath="/marketplace"
        />
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                <div>
                  <span className="font-extrabold text-base text-slate-900">{order.orderNumber || order._id}</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Slot: <strong>{order.deliverySlot}</strong>
                  </p>
                </div>
                <div>{getStatusBadge(order.orderStatus)}</div>
              </div>

              {/* Items summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-800">Harvest Items</span>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-medium">{item.title} x {item.quantity} {item.unit}</span>
                      <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Info & CTA */}
                <div className="flex flex-col justify-between space-y-4">
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">Delivery Address</span>
                    <p className="text-slate-600">
                      {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Total Amount Paid</span>
                      <span className="font-extrabold text-lg text-emerald-800">₹{order.totalAmount}</span>
                    </div>

                    <Link
                      to={`/orders/${order._id || order.orderNumber}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow transition-colors"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
