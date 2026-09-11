import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import { Heart, Trash2, ShoppingBag, ArrowRight, Tractor, Star, ArrowLeft, Plus } from 'lucide-react';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login?redirect=/wishlist');
      return;
    }
    addToCart(product, 1);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Your Wishlist is Empty"
          description="Save high-grade seasonal harvests, organic veggies, and artisanal grains directly from verified local farms to revisit them anytime."
          actionLabel="Explore Farm Marketplace"
          actionPath="/marketplace"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/marketplace" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 sm:hidden">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-rose-600" />
            </span>
            <span>Saved Farm Wishlist</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            You have {wishlistItems.length} farm-fresh {wishlistItems.length === 1 ? 'item' : 'items'} saved for later ordering.
          </p>
        </div>

        <button
          onClick={clearWishlist}
          className="self-start sm:self-auto text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Wishlist</span>
        </button>
      </div>

      {/* Grid of Wishlisted Produce Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => {
          const prodId = product._id || product.id;
          return (
            <div
              key={prodId}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Image & Badges */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <Link to={`/products/${prodId}`}>
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(prodId)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-rose-600 flex items-center justify-center shadow-md transition-transform hover:scale-110"
                  title="Remove from Wishlist"
                  aria-label="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Tag Badge */}
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-950/80 text-white backdrop-blur-xs">
                  {product.isOrganic ? '100% Organic' : product.category || 'Direct Farm'}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1 truncate text-emerald-800">
                      <Tractor className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{product.farmerName || product.farmer?.name || 'Verified Grower'}</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-500 shrink-0 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {product.rating ? Number(product.rating).toFixed(1) : '4.9'}
                    </span>
                  </div>

                  <Link to={`/products/${prodId}`}>
                    <h3 className="font-extrabold text-slate-900 text-sm hover:text-emerald-700 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                  </Link>

                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {product.description || 'Direct harvested and packed in farm gate origin.'}
                  </p>
                </div>

                {/* Price and Add to Basket Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-slate-900">₹{product.price}</span>
                      <span className="text-[11px] text-slate-500 font-medium">/{product.unit || 'Kg'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 block">
                      {product.availableQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {user ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.availableQuantity <= 0}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Basket</span>
                    </button>
                  ) : (
                    <Link
                      to={`/login?redirect=/wishlist`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] shadow-sm transition-all"
                    >
                      Sign In to Buy
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
