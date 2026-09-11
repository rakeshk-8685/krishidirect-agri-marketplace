import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/EmptyState';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ArrowLeft, Tractor } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartSubtotal } = useCart();
  const navigate = useNavigate();

  const deliveryFee = cartSubtotal > 1000 || cartSubtotal === 0 ? 0 : 50;
  const platformFee = cartSubtotal > 0 ? 15 : 0;
  const totalAmount = cartSubtotal + deliveryFee + platformFee;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState 
          title="Your Shopping Cart is Empty"
          description="Add fresh fruits, organic veggies, or grains directly from verified local farms to get started."
          actionLabel="Explore Produce Marketplace"
          actionPath="/marketplace"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-emerald-600" />
            <span>Farm Harvest Shopping Cart</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review produce quantities directly sourced from verified farm origin.</p>
        </div>
        <button 
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <img 
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'} 
                  alt={item.title}
                  className="w-20 h-20 rounded-2xl object-cover border shrink-0 bg-slate-100"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h3>
                  <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                    <Tractor className="w-3.5 h-3.5" />
                    {item.farmName || item.farmerName}
                  </p>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    ₹{item.price} <span className="text-slate-500 font-normal">/ {item.unit}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Subtotal */}
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center border rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-2 text-slate-600 hover:text-emerald-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-xs font-extrabold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-2 text-slate-600 hover:text-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Subtotal</span>
                  <span className="font-extrabold text-base text-slate-950">₹{item.price * item.quantity}</span>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg border-b pb-3">Order Price Summary</h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Produce Subtotal</span>
              <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Direct Farm Logistics Fee</span>
              {deliveryFee === 0 ? (
                <span className="font-bold text-emerald-600 uppercase">FREE (Over ₹1000)</span>
              ) : (
                <span className="font-bold text-slate-900">₹{deliveryFee}</span>
              )}
            </div>

            <div className="flex justify-between">
              <span>Platform Technology Fee</span>
              <span className="font-bold text-slate-900">₹{platformFee}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm">
              <span className="font-extrabold text-slate-900">Total Payable</span>
              <span className="font-extrabold text-2xl text-emerald-800">₹{totalAmount}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
          >
            <span>Proceed to Secure Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="p-3 rounded-2xl bg-emerald-50 text-[11px] text-emerald-800 flex items-center gap-2 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>95%+ of this payment goes directly to verified farmers.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
