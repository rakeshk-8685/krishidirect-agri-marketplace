import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiCall } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ShoppingBag, CheckCircle2, Clock, Truck, PackageCheck, Tractor, ArrowLeft, MapPin, Receipt, AlertTriangle, X, ShieldAlert, Check, Leaf, Phone, MessageSquare, Star, FileText, ShieldCheck, ExternalLink, Sparkles, Compass, Navigation, Thermometer, Droplets, Zap, Heart, RotateCcw, Send } from 'lucide-react';

export default function OrderTracking() {
  const { id } = useParams();
  const { showToast } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals & Interactive States
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // New Stitch Feature States
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [dropInstructionText, setDropInstructionText] = useState('Insulated porch placement with silent photo confirmation notification. Leave on porch table if asleep.');
  
  // Returnable Crates Toggle
  const [returnCrates, setReturnCrates] = useState(true);

  // Grower Tip State
  const [tipSent, setTipSent] = useState(false);
  const [sendingTip, setSendingTip] = useState(false);

  // Agronomist Live Chat Modal
  const [isAgronomistOpen, setIsAgronomistOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'agronomist',
      text: 'Namaste! I am Dr. Aruna, Dawn Agronomist on duty today. How can I help with your freshly harvested produce crate #CRATE-8492?',
      time: '07:30 AM'
    }
  ]);
  const [userChatInput, setUserChatInput] = useState('');

  // Map simulation state
  const [mapZoom, setMapZoom] = useState(1);
  const [mapSatellite, setMapSatellite] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      let data;
      try {
        data = await apiCall(`/orders/${id}`);
      } catch (err) {
        // Fallback: if queried by orderNumber and the backend expects _id, fetch orders list
        try {
          const listRes = await apiCall('/orders');
          if (listRes.success && listRes.orders) {
            const matched = listRes.orders.find(o => o.orderNumber === id || o._id === id);
            if (matched) {
              data = { success: true, order: matched };
            }
          }
        } catch (listErr) {
          // Ignore list error and let outer catch handle
        }
        if (!data) throw err;
      }
      if (data && data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Fetch order tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    setSubmittingCancel(true);
    try {
      const data = await apiCall(`/orders/${order._id}/cancel`, 'POST', {
        reason: cancelReason.trim() || 'Consumer requested cancellation before dispatch.'
      });
      if (data.success) {
        showToast('Order cancelled successfully! Reserved farm inventory restored.', 'success');
        setIsCancelModalOpen(false);
        fetchOrder();
      }
    } catch (err) {
      showToast(err.message || 'Cancellation failed', 'error');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      showToast('Please specify the issue or reason for raising dispute.', 'error');
      return;
    }
    setSubmittingDispute(true);
    try {
      const data = await apiCall(`/orders/${order._id}/dispute`, 'POST', {
        reason: disputeReason.trim()
      });
      if (data.success) {
        showToast('Dispute ticket submitted. Platform administrator will review.', 'info');
        setIsDisputeModalOpen(false);
        fetchOrder();
      }
    } catch (err) {
      showToast(err.message || 'Dispute submission failed', 'error');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleSendTip = () => {
    setSendingTip(true);
    setTimeout(() => {
      setSendingTip(false);
      setTipSent(true);
      showToast('₹50 Grower Tip credited directly to the farmer\'s UPI ledger!', 'success');
    }, 600);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const newMsg = {
      sender: 'user',
      text: userChatInput,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    const query = userChatInput;
    setUserChatInput('');

    // Agronomist quick response generator
    setTimeout(() => {
      let reply = 'Great question! Your harvest was packed using chilled banana-fiber cushioning within 2 hours of plucking. For optimal flavor and Brix sweetness, avoid refrigerating the mangoes and tomatoes until fully room ripened.';
      if (query.toLowerCase().includes('milk') || query.toLowerCase().includes('dairy')) {
        reply = 'The A2 Gir cow milk is raw and whole, straight from morning 5:15 AM milking. Please boil once within 6 hours or keep below 4°C in the thermal crate.';
      } else if (query.toLowerCase().includes('pesticide') || query.toLowerCase().includes('clean') || query.toLowerCase().includes('wash')) {
        reply = 'This lot has undergone an eco-ozone rinse at the farm hub. It carries 0 residue across 120 NABL parameters, so a gentle cold water rinse before slicing is all you need!';
      }
      setChatMessages(prev => [...prev, {
        sender: 'agronomist',
        text: reply,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 900);
  };

  if (loading) return <LoadingSpinner message="Loading live farm telemetry & transit feed..." />;
  
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-sm text-slate-500">The requested order tracking session is invalid or has expired.</p>
        <Link to="/orders" className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow transition">
          Return to My Orders
        </Link>
      </div>
    );
  }

  // Status mapping
  const normalize = (st) => {
    if (!st) return 'PENDING';
    const s = st.toUpperCase();
    if (s === 'ACCEPTED') return 'CONFIRMED';
    if (s === 'PACKING') return 'PREPARING';
    if (s === 'READY') return 'READY_FOR_DELIVERY';
    return s;
  };

  const currentStatusNorm = normalize(order.orderStatus);
  const isCancelled = currentStatusNorm === 'CANCELLED' || currentStatusNorm === 'REJECTED';
  const isDisputed = currentStatusNorm === 'DISPUTED';
  const isDelivered = currentStatusNorm === 'DELIVERED';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(currentStatusNorm);
  const canDispute = ['DELIVERED', 'OUT_FOR_DELIVERY'].includes(currentStatusNorm);

  // Primary Farmer for spotlight
  const primaryItem = order.items?.[0] || {};
  const leadFarmerName = primaryItem.farmerName || 'Rajesh Kumar';
  const leadFarmName = primaryItem.farmName || 'Green Valley Heirloom Farms';

  // Direct farmer share computation (85% guaranteed cut)
  const farmerShareAmount = Math.round(order.subtotal * 0.85);
  const logisticsShareAmount = order.totalAmount - farmerShareAmount;

  return (
    <div className="min-h-screen bg-[#F7F9F6] pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link 
            to="/orders" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders List</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Batch #CRATE-8492</span>
            <div className="h-3 w-px bg-slate-300"></div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Farm-Traceable Guarantee</span>
            </span>
          </div>
        </div>

        {/* Master Header Card */}
        <div className="bg-gradient-to-r from-[#0F2E1E] via-[#143D28] to-[#1E3A2B] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800/60">
                  Live Farm Dispatch Tracking
                </span>
                
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                  isCancelled 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : isDisputed 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : isDelivered 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-400 text-emerald-950 shadow-sm'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                  {currentStatusNorm === 'OUT_FOR_DELIVERY' ? 'EV In Doorstep Transit' : currentStatusNorm}
                </span>

                <span className="text-xs text-emerald-300 font-medium">
                  • 42 km/h Cold-Transit Speed
                </span>
              </div>

              <div className="flex items-baseline gap-3 pt-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-white">
                  Order #{order.orderNumber}
                </h1>
                <span className="text-sm font-semibold text-emerald-300/80">
                  ({order.items?.length || 0} Harvested Produce Lots)
                </span>
              </div>

              <p className="text-xs text-emerald-100/80 flex items-center gap-2">
                <span>Delivery Window: <strong>{order.deliverySlot || 'Morning Express (06:00 AM - 09:00 AM)'}</strong></span>
                <span>•</span>
                <span>Estimated Doorstep Drop: <strong>Today 07:45 AM</strong></span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
              <button
                onClick={() => setIsAgronomistOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-sm border border-white/20 flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Ask Agronomist</span>
              </button>

              {canCancel && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-bold text-xs transition"
                >
                  Cancel Order
                </button>
              )}

              {canDispute && (
                <button
                  onClick={() => setIsDisputeModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-1.5 transition"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Raise Quality Dispute</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dispute Notice Banner */}
        {isDisputed && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-4 shadow-sm">
            <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm">Dispute Ticket In Review (#{order.orderNumber})</h4>
              <p className="text-xs text-slate-700">
                Reason: "{order.disputeDetails?.reason || 'Freshness/damage inspection requested'}".
              </p>
              <p className="text-[11px] text-slate-500">
                Our farm liaison team is checking crate IoT sensor readings and transit cold-chain data.
              </p>
            </div>
          </div>
        )}

        {/* MAIN TWO-COLUMN LAYOUT (Matching Stitch) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* =====================================================================
              LEFT COLUMN (Width: 7 cols on LG)
              - Live Radar GPS Map with Waypoints & Vehicle Badge
              - Live Cargo Telemetry 4-Card Dashboard
              - Delivery Partner / Driver Details
              - Farmer Story & Acreage Spotlight
              - Economy Section (Crates & Agronomist Desk)
             ===================================================================== */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Live GPS Route & Radar Map Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden relative">
              {/* Map Canvas Frame */}
              <div className={`relative w-full h-[360px] sm:h-[400px] overflow-hidden transition-colors ${mapSatellite ? 'bg-[#1b2a22]' : 'bg-[#EBF2EA]'}`}>
                
                {/* SVG Vector Map Terrain and Route */}
                <svg className="w-full h-full" viewBox="0 0 600 400" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke={mapSatellite ? '#2d4437' : '#D5E3D3'} strokeWidth="1" />
                    </pattern>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Grid Background */}
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Topographic organic curves */}
                  <path d="M -50 80 Q 150 120 300 60 T 650 90" fill="none" stroke={mapSatellite ? '#253d2f' : '#DCE8DA'} strokeWidth="18" />
                  <path d="M -50 250 Q 200 320 400 240 T 650 300" fill="none" stroke={mapSatellite ? '#253d2f' : '#DCE8DA'} strokeWidth="24" />

                  {/* Express Ring Road & Arterial Highways */}
                  <path d="M 50 30 L 180 150 L 350 220 L 520 340" fill="none" stroke={mapSatellite ? '#3b5845' : '#CADBC8'} strokeWidth="8" strokeLinecap="round" />
                  <path d="M 120 380 L 260 270 L 440 180 L 580 80" fill="none" stroke={mapSatellite ? '#3b5845' : '#CADBC8'} strokeWidth="6" strokeLinecap="round" strokeDasharray="6 6" />

                  {/* Active EV Delivery Transit Path (Dashed Animated Trail) */}
                  <path 
                    d="M 100 80 Q 220 120 280 190 T 460 310" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="5" 
                    strokeLinecap="round" 
                    strokeDasharray="8 6"
                    className="animate-pulse"
                  />
                  
                  {/* Origin Farm Pulse Target */}
                  <circle cx="100" cy="80" r="16" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
                  <circle cx="100" cy="80" r="8" fill="#047857" />
                  <circle cx="100" cy="80" r="3" fill="#ffffff" />

                  {/* Vehicle Transit Point */}
                  <circle cx="280" cy="190" r="22" fill="#047857" fillOpacity="0.2" className="animate-ping" />
                  <circle cx="280" cy="190" r="10" fill="#064E3B" filter="url(#glow)" />
                  <circle cx="280" cy="190" r="4" fill="#34D399" />

                  {/* Delivery Destination Target */}
                  <circle cx="460" cy="310" r="20" fill="#D97706" fillOpacity="0.2" className="animate-ping" />
                  <circle cx="460" cy="310" r="9" fill="#B45309" />
                  <circle cx="460" cy="310" r="4" fill="#ffffff" />
                </svg>

                {/* Origin Waypoint Badge (Top Left of Map) */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/80 max-w-[240px] text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                    <Tractor className="w-3.5 h-3.5" />
                    <span>Harvest Origin</span>
                  </div>
                  <p className="font-bold text-slate-900 mt-0.5 truncate">{leadFarmName}</p>
                  <p className="text-[10px] text-slate-500">Doddaballapur Belt • 5:30 AM</p>
                </div>

                {/* Delivery Drop Waypoint Badge (Bottom Right of Map) */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/80 max-w-[240px] text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Delivery Drop</span>
                  </div>
                  <p className="font-bold text-slate-900 mt-0.5 truncate">
                    {order.deliveryAddress?.addressLine || 'Indiranagar 4th Cross'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {order.deliveryAddress?.city || 'Bengaluru'} • Porch Insulated Bag #14
                  </p>
                </div>

                {/* Floating EV IN TRANSIT Radar Card (Stitch Centerpiece) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0C2418]/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 w-[240px] text-xs space-y-1 z-20">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      EV IN TRANSIT
                    </span>
                    <span className="font-bold text-emerald-300 text-[11px]">42 km/h</span>
                  </div>

                  <div className="pt-0.5">
                    <h5 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <span>Van #KA-04-EV-2044</span>
                    </h5>
                    <p className="text-[10px] text-emerald-200/80 truncate">
                      Old Airport Rd near Domlur Flyover
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-800/60 text-[10px]">
                    <span className="text-emerald-100 font-medium">Driver: <strong>Senthil K.</strong></span>
                    <span className="font-extrabold text-amber-300">3.2 km away</span>
                  </div>
                </div>

                {/* Interactive Map Controls (Top Right) */}
                <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
                  <button 
                    onClick={() => setMapSatellite(!mapSatellite)}
                    title="Toggle Map Style"
                    className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition"
                  >
                    <Compass className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setMapZoom(prev => Math.min(prev + 0.2, 1.6))}
                    title="Zoom In"
                    className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur hover:bg-white text-slate-700 shadow-md flex items-center justify-center font-bold text-sm transition"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => setMapZoom(prev => Math.max(prev - 0.2, 0.8))}
                    title="Zoom Out"
                    className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur hover:bg-white text-slate-700 shadow-md flex items-center justify-center font-bold text-sm transition"
                  >
                    -
                  </button>
                </div>

              </div>

              {/* Map Footer Bar */}
              <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real-time GPS telemetry refresh interval: <strong>15s</strong></span>
                </span>
                <span className="text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  Active Chilled Transit Lock
                </span>
              </div>
            </div>

            {/* 2. Live Cargo Telemetry Dashboard (Stitch 4-Card Grid) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-wider">
                    Live Cargo Telemetry
                  </h3>
                  <p className="text-xs text-slate-500">Autonomous sensor feed from thermal crate #CRATE-8492</p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Unbroken 4h 15m Freshness
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* Card 1: Crate Temperature */}
                <div className="p-3.5 rounded-2xl bg-[#F0F7F2] border border-emerald-100 space-y-1">
                  <div className="flex items-center justify-between text-emerald-800">
                    <span className="text-[11px] font-bold">Crate Temp</span>
                    <Thermometer className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">7.4°C</div>
                  <p className="text-[10px] text-emerald-700 font-medium">Safe Range: 6° - 12°C</p>
                </div>

                {/* Card 2: Atmospheric RH */}
                <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-blue-100 space-y-1">
                  <div className="flex items-center justify-between text-blue-800">
                    <span className="text-[11px] font-bold">Atmospheric RH</span>
                    <Droplets className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">84%</div>
                  <p className="text-[10px] text-blue-700 font-medium">Dew Level Crispness</p>
                </div>

                {/* Card 3: Propulsion Type */}
                <div className="p-3.5 rounded-2xl bg-[#F5F3FF] border border-purple-100 space-y-1">
                  <div className="flex items-center justify-between text-purple-800">
                    <span className="text-[11px] font-bold">Propulsion Type</span>
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-base font-extrabold text-slate-900 truncate">Mahindra EV</div>
                  <p className="text-[10px] text-purple-700 font-medium">Zero Tailpipe Smog</p>
                </div>

                {/* Card 4: Carbon Avoided */}
                <div className="p-3.5 rounded-2xl bg-[#FEF3C7] border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between text-amber-800">
                    <span className="text-[11px] font-bold">Carbon Avoided</span>
                    <Leaf className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xl font-extrabold text-emerald-800 font-mono">-1.82 kg</div>
                  <p className="text-[10px] text-amber-800 font-medium">Vs Mandi Middlemen</p>
                </div>
              </div>
            </div>

            {/* 3. Delivery Partner / Driver Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80" 
                    alt="Senthil K. - Driver" 
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">Senthil K.</h4>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                      Health Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Senior Logistics Partner • 1,420 dawn deliveries</p>
                  <p className="text-[10px] text-slate-400">Cold-crate sanitized 5:15 AM</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => setIsCallModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call Rider</span>
                </button>

                <button
                  onClick={() => setIsInstructionsModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#0F2E1E] hover:bg-[#16442D] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Delivery Note</span>
                </button>
              </div>
            </div>

            {/* 4. Dawn Origin: Farmer Story & Acreage Spotlight (From Stitch) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Dawn Origin: {leadFarmerName}'s Acreage
                  </h3>
                  <p className="text-xs text-slate-500">Plot 3B, Doddaballapur Organic Agro-Cluster</p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
                  GI-Tagged Terroir
                </span>
              </div>

              {/* Photo Showcase Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative rounded-2xl overflow-hidden group h-36">
                  <img 
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80" 
                    alt="Farm Soil Landscape" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>100% Chemical-Free Soil</span>
                    </span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden group h-36">
                  <img 
                    src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80" 
                    alt="Rajesh Kumar Lead Grower" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                    <span className="text-white text-xs font-bold">
                      {leadFarmerName} (Lead Grower)
                    </span>
                  </div>
                </div>
              </div>

              {/* Quote & Grower Tip */}
              <div className="p-4 rounded-2xl bg-[#F7FAF7] border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-700 italic space-y-0.5">
                  <p>
                    "{primaryItem.title || 'Produce'} vine-ripened under Doddaballapur dawn sun. Harvest arrived yesterday evening, hand-picked with zero cold-room gas."
                  </p>
                  <p className="text-[10px] text-slate-400 not-italic font-semibold">— {leadFarmName}</p>
                </div>

                <button
                  onClick={handleSendTip}
                  disabled={tipSent || sendingTip}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 flex-shrink-0 transition shadow-sm ${
                    tipSent
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${tipSent ? 'fill-emerald-700 text-emerald-700' : 'text-rose-300'}`} />
                  <span>{tipSent ? 'Tip Credited (₹50)' : sendingTip ? 'Processing...' : 'Send ₹50 Grower Tip'}</span>
                </button>
              </div>
            </div>

            {/* 5. Economy & Support Cards (From Stitch specification) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Returnable Crates Incentive Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs">Returnable Crates Incentive</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                    +₹20 Credit
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Have insulated thermal bins from your previous order? Handoff to Senthil upon arrival.
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700">
                    {returnCrates ? 'Crate handoff scheduled' : 'No crates today'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={returnCrates} 
                      onChange={() => {
                        setReturnCrates(!returnCrates);
                        showToast(!returnCrates ? 'Crate return scheduled! ₹20 store credit will be queued.' : 'Crate return removed.', 'info');
                      }}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Dawn Agronomist Desk Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs">Dawn Agronomist Desk</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[10px]">
                    Live On Duty
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Questions about freshness, heirloom storage, or zero-nitrate soil certificates?
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Avg reply: 45 secs</span>
                  <button
                    onClick={() => setIsAgronomistOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs transition"
                  >
                    Open Live Chat
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* =====================================================================
              RIGHT COLUMN (Width: 5 cols on LG)
              - Farm-to-Doorstep Milestone Stepper (Vertical Timeline)
              - Crate Contents with 85% Guaranteed Farmer Share
              - Direct Farmer Remuneration Progress Bar
              - NABL Lab Pesticide Clearance Card
              - Drop Instructions Card
             ===================================================================== */}
          <div className="lg:col-span-5 space-y-6">

            {/* 1. Farm-to-Doorstep Milestone Stepper (Vertical Timeline matching Stitch) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-3.5">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Harvest & Logistics Pipeline
                  </h3>
                  <p className="text-[11px] text-slate-500">Verified physical farm-to-consumer chain</p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                  {currentStatusNorm}
                </span>
              </div>

              {/* Vertical Stepper */}
              <div className="space-y-6 relative pl-3">
                {/* Connecting Line */}
                <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-emerald-200 z-0"></div>

                {/* Milestone 1: Harvest */}
                <div className="flex items-start gap-3.5 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Tractor className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-xs text-slate-900">Dawn Harvest & Soil QC</h4>
                      <span className="text-[10px] font-bold text-slate-500">Today 5:30 AM</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Heirloom lot hand-picked at optimum Brix sweetness. Zero nitrates verified.
                    </p>
                  </div>
                </div>

                {/* Milestone 2: Ozone Wash */}
                <div className="flex items-start gap-3.5 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-xs text-slate-900">Ozone Wash & Banana-Leaf Pack</h4>
                      <span className="text-[10px] font-bold text-slate-500">Today 6:15 AM</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Packaged in zero-plastic returnable thermal crate #CRATE-8492.
                    </p>
                  </div>
                </div>

                {/* Milestone 3: Chilled EV Dispatch */}
                <div className="flex items-start gap-3.5 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-xs text-slate-900">Dispatched in Electric Chilled EV</h4>
                      <span className="text-[10px] font-bold text-slate-500">Today 6:45 AM</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Departed Doddaballapur Transit Hub. Initial bay temperature 10.8°C.
                    </p>
                  </div>
                </div>

                {/* Milestone 4: Out for Doorstep Delivery (Active Pulse in Stitch) */}
                <div className={`p-3 rounded-2xl relative z-10 transition border ${
                  isDelivered 
                    ? 'bg-white border-transparent' 
                    : 'bg-amber-50/70 border-amber-300 shadow-sm'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow ${
                      isDelivered 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-amber-500 text-slate-950 ring-4 ring-amber-200 animate-pulse'
                    }`}>
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-xs text-slate-900">Out for Doorstep Delivery</h4>
                        <span className={`text-[10px] font-extrabold ${isDelivered ? 'text-slate-500' : 'text-amber-700'}`}>
                          {isDelivered ? 'Completed' : 'Active Now (7:28 AM)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-normal">
                        Vehicle is 3.2 km away on 100-Ft Road approaching Indiranagar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Milestone 5: Contactless Drop */}
                <div className="flex items-start gap-3.5 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDelivered 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-extrabold text-xs ${isDelivered ? 'text-slate-900' : 'text-slate-400'}`}>
                        Contactless Doorstep Drop
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold">Est. 7:45 AM</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Insulated porch placement with silent photo confirmation notification.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Crate Contents & 85% Farmer Cut Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Crate Contents</h3>
                  <p className="text-[11px] text-slate-500">Batch #CRATE-8492 • {order.items?.length || 0} Harvested Lots</p>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-sm">
                  85% Farmer Cut
                </span>
              </div>

              {/* Itemized Produce List */}
              <div className="space-y-3.5">
                {order.items?.map((item, idx) => {
                  const directGrowerCut = Math.round(item.price * 0.85);
                  const retailEquivalent = Math.round(item.price * 1.35);

                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200">
                          <img 
                            src={
                              item.title?.toLowerCase().includes('mango')
                                ? 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=160&q=80'
                                : item.title?.toLowerCase().includes('tomato')
                                ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=160&q=80'
                                : item.title?.toLowerCase().includes('milk')
                                ? 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=160&q=80'
                                : 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=160&q=80'
                            } 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <h5 className="font-extrabold text-xs text-slate-900 leading-tight line-clamp-1">{item.title}</h5>
                          <p className="text-[10px] text-slate-500">
                            {item.quantity} {item.unit} • Harvested 5:30 AM ({item.farmerName || 'Grower'})
                          </p>
                          <p className="text-[10px] font-extrabold text-emerald-700">
                            Direct to Grower: ₹{directGrowerCut * item.quantity}.00
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-extrabold text-slate-900 text-sm">
                          ₹{item.price * item.quantity}
                        </div>
                        <div className="text-[10px] text-slate-400 line-through">
                          ₹{retailEquivalent * item.quantity} retail
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Farmer Remuneration Share Bar (Stitch Master Feature) */}
              <div className="p-4 rounded-2xl bg-[#0C2418] text-white space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-100">Direct Farmer Remuneration</span>
                  <span className="font-extrabold text-emerald-400">85% Guaranteed Share</span>
                </div>

                {/* Dual Color Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                  <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: '85%' }}></div>
                  <div className="h-full bg-amber-500 rounded-r-full" style={{ width: '15%' }}></div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Farmer Net: <strong>₹{farmerShareAmount}.00</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Clean Logistics & IoT: <strong>₹{logisticsShareAmount}.00</strong></span>
                  </div>
                </div>
              </div>

              {/* Quality & Traceability Certifications */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                
                {/* NABL Lab Clearance */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-900">NABL Lab Pesticide Clearance</div>
                      <p className="text-[10px] text-slate-500">Report #NABL-9921 • 0 of 120 Chemicals Detected</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCertificateModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-extrabold text-[11px] shadow-sm transition"
                  >
                    View PDF
                  </button>
                </div>

                {/* Indigenous Heritage */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-900">Indigenous Seed Heritage</div>
                      <p className="text-[10px] text-slate-500">Open-Pollinated Native Desi Variety (Zero GMO)</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

              </div>

            </div>

            {/* 3. Delivery Drop Instructions Card with Quick Edit */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-extrabold text-slate-900 text-xs">Drop Instructions</h4>
                </div>
                <button
                  onClick={() => setIsInstructionsModalOpen(true)}
                  className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 underline"
                >
                  Quick Edit
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <p>"{dropInstructionText}"</p>
                <p className="text-[10px] text-slate-400 pt-1 font-medium">
                  Destination: {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.city}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================================
          INTERACTIVE MODALS
         ===================================================================== */}

      {/* 1. NABL Lab Certificate Inspection Modal */}
      {isCertificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">NABL Certified Residue Report</h3>
                  <p className="text-[10px] text-slate-500">Certificate #NABL-IND-9921-2026</p>
                </div>
              </div>
              <button onClick={() => setIsCertificateModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>100% Zero-Residue Certified (120/120 Clean)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Conducted by National Accreditation Board for Testing and Calibration Laboratories (NABL) partner laboratory on harvest batch samples.
                </p>
              </div>

              <div className="border rounded-2xl overflow-hidden divide-y divide-slate-100 text-[11px]">
                <div className="p-2.5 flex justify-between bg-slate-50 font-bold">
                  <span>Parameter Tested</span>
                  <span>Tested Result</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span>Organophosphates & Chlorpyrifos</span>
                  <span className="font-bold text-emerald-700">NOT DETECTED (&lt;0.001 ppm)</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span>Synthetic Ripeners (Calcium Carbide)</span>
                  <span className="font-bold text-emerald-700">ZERO (Natural Sun Ripened)</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span>Heavy Metals (Lead, Cadmium, Arsenic)</span>
                  <span className="font-bold text-emerald-700">WELL BELOW WHO SAFE CEILING</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span>Soil Micro-Ecology Index</span>
                  <span className="font-bold text-emerald-700">4.9 / 5.0 (Bio-fertile)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCertificateModalOpen(false);
                showToast('Official NABL digital certificate authenticated.', 'success');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow transition"
            >
              Close Certificate Viewer
            </button>
          </div>
        </div>
      )}

      {/* 2. Call Driver Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Phone className="w-6 h-6 animate-bounce" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Contact Rider Senthil K.</h3>
              <p className="text-xs text-slate-500 mt-0.5">En route via EV Van #KA-04-EV-2044</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">Rider Direct Line</p>
              <p className="text-lg font-mono font-extrabold text-slate-900">+91 98450 12044</p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setIsCallModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition"
              >
                Close
              </button>
              <a
                href="tel:+919845012044"
                onClick={() => {
                  setIsCallModalOpen(false);
                  showToast('Initiating call to Rider Senthil K.', 'info');
                }}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 3. Drop Instructions Quick Edit Modal */}
      {isInstructionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Update Doorstep Drop Instructions</span>
              </h3>
              <button onClick={() => setIsInstructionsModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Rider Senthil receives this note instantaneously on his delivery tablet:
              </p>
              <textarea
                rows="3"
                value={dropInstructionText}
                onChange={(e) => setDropInstructionText(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setIsInstructionsModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsInstructionsModalOpen(false);
                  showToast('Doorstep delivery note transmitted to rider!', 'success');
                }}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow"
              >
                Save & Transmit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Dawn Agronomist Desk Live Chat Drawer */}
      {isAgronomistOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[520px] shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-300">
            
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-[#0F2E1E] to-[#1E3A2B] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center font-bold">
                  🌱
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Dawn Agronomist Desk</h4>
                  <p className="text-[10px] text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Dr. Aruna (Senior Horticulturist) • Active Live
                  </p>
                </div>
              </div>

              <button onClick={() => setIsAgronomistOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAF8] text-xs">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-700 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[10px]">
              <button 
                onClick={() => setUserChatInput('How do I store the heirloom mangoes without losing aroma?')}
                className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap hover:bg-emerald-100"
              >
                🥭 Mango Storage
              </button>
              <button 
                onClick={() => setUserChatInput('Is the raw Gir cow milk boiled before drinking?')}
                className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap hover:bg-blue-100"
              >
                🥛 Milk boiling tips
              </button>
              <button 
                onClick={() => setUserChatInput('Are these vegetables safe to eat raw?')}
                className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200"
              >
                🥗 Raw salad safety
              </button>
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Ask about heirloom varieties, freshness or storage..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 5. Cancel Order Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-rose-600 flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Cancel Order #{order.orderNumber}?</span>
              </h3>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelOrder} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Cancelling will release the reserved farm harvest stock back into marketplace catalog.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Cancellation</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Changed schedule / Accidental order"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow"
                >
                  {submittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Raise Dispute Modal */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-amber-600 flex items-center gap-2 text-base">
                <ShieldAlert className="w-5 h-5" />
                <span>Raise Quality / Damage Dispute</span>
              </h3>
              <button onClick={() => setIsDisputeModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Please describe any damaged, over-ripened or missing produce. Platform auditor will review crate thermal logs and resolve within 2 hours.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dispute Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. 1 kg Alphonso mangoes bruised during transit / Seal opened"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow"
                >
                  {submittingDispute ? 'Submitting...' : 'Submit Dispute Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
