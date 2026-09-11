import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Leaf, MapPin, Heart, Star, ShoppingBag, Check, Calendar } from 'lucide-react';

// memo: prevents re-render of every card when cart state changes in parent
const ProductCard = memo(function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-600/40 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Image Header Container */}
      <Link to={`/products/${product._id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img 
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Wishlist Heart Icon */}
        <button
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow ${
            isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-600 hover:text-rose-500'
          }`}
          title="Save to Wishlist"
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.isOrganic && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-emerald-100 shadow-sm">
              <Leaf className="w-3 h-3 text-emerald-300" />
              Organic
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-slate-950 uppercase tracking-wider shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Harvest Traceability Badge at bottom of image */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-sm text-slate-800">
          <span className="flex items-center gap-1 text-emerald-800">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Farm Harvest</span>
          </span>
          <span className="text-slate-600 font-medium truncate max-w-[120px]">
            {product.originLocation ? product.originLocation.split(',')[0] : 'Direct Farm'}
          </span>
        </div>
      </Link>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow space-y-3">
        
        {/* Farm & Rating Info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link 
            to={`/farmers/${product.farmer?._id || product.farmer}`} 
            className="font-semibold text-emerald-900 hover:text-emerald-700 truncate max-w-[160px]"
          >
            {product.farmName || product.farmerName || 'Verified Farm'}
          </Link>
          <span className="flex items-center gap-1 font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {product.rating ? Number(product.rating).toFixed(1) : '4.9'}
          </span>
        </div>

        {/* Product Title */}
        <Link to={`/products/${product._id}`} className="group-hover:text-emerald-800 transition-colors">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Unit Info */}
        <div className="text-xs text-slate-500 font-medium">
          Per {product.unit} • Min order: {product.minOrderQuantity || 1} {product.unit}
        </div>

        {/* Price Row */}
        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-2xl text-slate-950">₹{product.price}</span>
              <span className="text-xs text-slate-500">/ {product.unit}</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700">Direct Farm Gate Price</span>
          </div>
        </div>

        {/* Stock Status Indicator */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600">
            <span>Availability</span>
            <span className={product.availableQuantity <= 10 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-semibold'}>
              {product.availableQuantity > 0 ? `${product.availableQuantity} ${product.unit} in stock` : 'Out of stock'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                product.availableQuantity <= 10 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(8, (product.availableQuantity / 40) * 100))}%` }} 
            />
          </div>
        </div>

        {/* Add to Basket Button */}
        <button
          onClick={handleAdd}
          disabled={product.availableQuantity <= 0}
          className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all duration-200 mt-auto ${
            added 
              ? 'bg-emerald-800 text-white'
              : product.availableQuantity <= 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-900 hover:bg-emerald-950 text-white hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Basket</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-emerald-300" />
              <span>{product.availableQuantity <= 0 ? 'Sold Out' : 'Add to Cart'}</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
});

export default ProductCard;
