import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { apiCall } from '../services/api';
import { ShieldCheck, MapPin, CreditCard, QrCode, Banknote, Building2, CheckCircle2, ArrowRight, Clock, AlertTriangle, User, Phone, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [deliverySlot, setDeliverySlot] = useState('Morning Express (06:00 AM - 09:00 AM)');

  // Recipient Contact State
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');

  // Delivery Address State
  const defaultAddress = user?.addresses?.[0] || {
    label: 'Home',
    addressLine: 'Flat 402, Sunshine Apartments, MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001'
  };

  const [address, setAddress] = useState(defaultAddress);

  const deliveryFee = cartSubtotal > 1000 ? 0 : 50;
  const platformFee = 15;
  const totalAmount = cartSubtotal + deliveryFee + platformFee;

  // Inventory Validation Check
  const insufficientItems = cartItems.filter(item => item.quantity > (item.availableQuantity ?? 999));
  const hasInsufficientStock = insufficientItems.length > 0;

  const deliverySlots = [
    { id: 'morning', label: 'Morning Express (06:00 AM - 09:00 AM)', tag: 'Recommended • Harvest Fresh' },
    { id: 'afternoon', label: 'Afternoon Slot (12:00 PM - 03:00 PM)', tag: 'Standard Logistics' },
    { id: 'evening', label: 'Evening Slot (05:00 PM - 08:00 PM)', tag: 'Post-Work Home Arrival' }
  ];

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in to place your order.', 'error');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your basket is empty. Please add produce items.', 'error');
      navigate('/marketplace');
      return;
    }

    if (hasInsufficientStock) {
      showToast(`Cannot proceed: ${insufficientItems[0].title} exceeds available farm stock.`, 'error');
      return;
    }

    if (!recipientName.trim() || !recipientPhone.trim()) {
      showToast('Please specify recipient name and contact phone number.', 'error');
      return;
    }

    if (!address.addressLine || !address.city || !address.pincode) {
      showToast('Please provide a complete delivery address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await apiCall('/orders', 'POST', {
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          title: item.title
        })),
        deliveryAddress: address,
        recipientName,
        recipientPhone,
        deliverySlot,
        paymentMethod
      });

      if (data.success) {
        clearCart();
        showToast(data.message, 'success');
        navigate(`/orders/${data.order._id || data.order.orderNumber}`);
      }
    } catch (err) {
      showToast(err.message || 'Order placement failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Your basket is empty</h2>
        <Link to="/marketplace" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow">
          Explore Produce Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shopping Cart</span>
      </Link>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Checkout & Farm Dispatch Destination</h1>
        <p className="text-xs text-slate-500 mt-1">Specify recipient contact details, select delivery slot, and choose payment mode.</p>
      </div>

      {/* Stock Insufficiency Alert Banner */}
      {hasInsufficientStock && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-sm">Insufficient Farm Inventory Warning</h3>
            <p className="text-xs text-rose-800 mt-1">
              Some items in your basket exceed available harvest stock. Please adjust quantities in your cart before placing order:
            </p>
            <ul className="list-disc pl-5 text-xs text-rose-900 font-bold mt-1">
              {insufficientItems.map(item => (
                <li key={item._id}>
                  {item.title} (Requested: {item.quantity} {item.unit}, Available: {item.availableQuantity} {item.unit})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Contact, Address, Delivery Slot & Payment */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Recipient Contact Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>1. Recipient Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input 
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Sonu Pal"
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Contact Number *</label>
                <input 
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              <span>2. Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Address Line *</label>
                <input 
                  type="text"
                  required
                  value={address.addressLine}
                  onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                  placeholder="House / Flat / Building number, Street name"
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City / District *</label>
                <input 
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">State *</label>
                <input 
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">PIN Code *</label>
                <input 
                  type="text"
                  required
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Slot Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>3. Fresh Farm Delivery Slot</span>
            </h3>

            <div className="space-y-3 text-xs">
              {deliverySlots.map(slot => (
                <label
                  key={slot.id}
                  onClick={() => setDeliverySlot(slot.label)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    deliverySlot === slot.label ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliverySlot"
                      checked={deliverySlot === slot.label}
                      onChange={() => setDeliverySlot(slot.label)}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">{slot.label}</span>
                      <span className="text-[11px] text-slate-500">{slot.tag}</span>
                    </div>
                  </div>
                  {deliverySlot === slot.label && (
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">Selected</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>4. Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <label 
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'
                }`}
              >
                <QrCode className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">UPI Instant Direct Pay</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              </label>

              <label 
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'
                }`}
              >
                <CreditCard className="w-6 h-6 text-indigo-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Debit / Credit Card</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Visa, Mastercard, RuPay Cards</p>
                </div>
              </label>

              <label 
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'netbanking' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'
                }`}
              >
                <Building2 className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Net Banking</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">SBI, HDFC, ICICI, Axis Bank</p>
                </div>
              </label>

              <label 
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'
                }`}
              >
                <Banknote className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Cash on Delivery</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pay cash upon delivery verification</p>
                </div>
              </label>

            </div>

          </div>

        </div>

        {/* Right Column: Checkout Final Review & Order CTA */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg border-b pb-3">Final Order Summary</h3>

          {/* Itemized list */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={item._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 block truncate max-w-[170px]">{item.title}</span>
                  <span className="text-[11px] text-slate-500">{item.quantity} {item.unit} x ₹{item.price}</span>
                </div>
                <span className="font-extrabold text-slate-950">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 pt-3 border-t">
            <div className="flex justify-between">
              <span>Produce Subtotal</span>
              <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Direct Farm Logistics Fee</span>
              <span className="font-bold text-emerald-600">{deliveryFee === 0 ? 'FREE (Over ₹1000)' : `₹${deliveryFee}`}</span>
            </div>

            <div className="flex justify-between">
              <span>Platform Service Fee</span>
              <span className="font-bold text-slate-900">₹{platformFee}</span>
            </div>

            <div className="pt-3 border-t flex justify-between items-baseline text-sm">
              <span className="font-extrabold text-slate-900">Total Payable Amount</span>
              <span className="font-extrabold text-2xl text-emerald-800">₹{totalAmount}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || hasInsufficientStock}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-transform ${
              hasInsufficientStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <span>Confirming Harvest Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Place Order (₹{totalAmount})</span>
              </>
            )}
          </button>

          <div className="p-3 rounded-2xl bg-emerald-50 text-[11px] text-emerald-800 flex items-center gap-2 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Server recalculates price & validates inventory prior to dispatch.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
