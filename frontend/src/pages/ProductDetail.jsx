import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiCall } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Tractor, Calendar, MapPin, Leaf, Star, ShieldCheck, Minus, Plus, ShoppingBag, ArrowLeft, MessageSquare, CheckCircle2, AlertCircle, Phone, ChevronRight, Home, MessageCircle, Edit3, Lock, Heart } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [product, setProduct] = useState(null);
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    avgRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    userReview: null
  });
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Review Modal & Eligibility state
  const [eligibility, setEligibility] = useState({ eligible: false, reason: '' });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      // Parallelize product, reviews, and eligibility fetches
      const fetchPromises = [
        apiCall(`/products/${id}`),
        apiCall(`/reviews/product/${id}`)
      ];

      if (user) {
        fetchPromises.push(apiCall(`/reviews/eligibility?productId=${id}`));
      }

      const results = await Promise.all(fetchPromises);
      const data = results[0];
      const revsData = results[1];
      const elData = results[2];

      if (data && data.success) {
        setProduct(data.product);
        if (data.product.minOrderQuantity) {
          setQuantity(data.product.minOrderQuantity);
        }
      }

      if (revsData && revsData.success) {
        setReviewsData(revsData);
        if (revsData.userReview) {
          setRating(revsData.userReview.rating);
          setComment(revsData.userReview.comment);
        }
      }

      if (elData && elData.success) {
        setEligibility(elData);
        if (elData.existingReview) {
          setRating(elData.existingReview.rating);
          setComment(elData.existingReview.comment);
        }
      }
    } catch (err) {
      console.error('Fetch product detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id, user]);

  const handleAddToCart = () => {
    if (!product) return;
    if (quantity > product.availableQuantity) {
      showToast(`Cannot add ${quantity} units. Only ${product.availableQuantity} ${product.unit} available in farm inventory.`, 'error');
      return;
    }
    addToCart(product, quantity);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to submit a produce review.', 'error');
      return;
    }
    if (!comment.trim()) {
      showToast('Please write a short comment about your experience with this harvest batch.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const data = await apiCall('/reviews', 'POST', {
        productId: product._id,
        rating,
        comment: comment.trim(),
        targetType: 'product'
      });
      if (data.success) {
        showToast(data.message, 'success');
        setShowReviewModal(false);
        fetchProductDetail();
      }
    } catch (err) {
      showToast(err.message || 'Failed to post review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading harvest details..." />;
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Produce listing not found</h2>
        <Link to="/marketplace" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const daysSinceHarvest = Math.max(0, Math.floor((new Date() - new Date(product.harvestDate || Date.now())) / (1000 * 60 * 60 * 24)));
  const farmerObj = product.farmer || {};
  const totalRev = reviewsData.totalReviews || product.numReviews || 0;
  const avgRate = reviewsData.avgRating || product.rating || 4.8;
  const breakdown = reviewsData.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 flex-wrap">
        <Link to="/" className="flex items-center gap-1 hover:text-emerald-700 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/marketplace" className="hover:text-emerald-700 transition-colors">Marketplace</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link
              to={`/marketplace?category=${encodeURIComponent(product.category)}`}
              className="hover:text-emerald-700 transition-colors"
            >
              {product.category}
            </Link>
          </>
        )}
        {product.originLocation && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link
              to={`/marketplace?location=${encodeURIComponent(product.originLocation)}`}
              className="hover:text-emerald-700 transition-colors"
            >
              {product.originLocation}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-semibold truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main Grid: Images + Product Details Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Image Gallery Slider */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md relative">
            <img 
              src={product.images?.[selectedImage] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'} 
              alt={product.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              {product.isOrganic && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-800 text-emerald-100 shadow">
                  <Leaf className="w-3.5 h-3.5 text-emerald-300" />
                  100% Organic Certified
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 uppercase tracking-wider shadow">
                {product.category}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 ${selectedImage === idx ? 'border-emerald-600 ring-2 ring-emerald-500' : 'border-transparent'}`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & CTA */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                {product.farmingMethod || (product.isOrganic ? 'Organic Certified' : 'Conventional GAP')}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                product.availableQuantity <= 0
                  ? 'bg-rose-100 text-rose-900'
                  : product.availableQuantity <= 10
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-900'
              }`}>
                {product.availableQuantity <= 0 ? 'Out of Stock' : product.availableQuantity <= 10 ? `Low Stock (${product.availableQuantity} ${product.unit})` : `In Stock (${product.availableQuantity} ${product.unit})`}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.title}
              </h1>
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-2xl border transition-all shadow-xs shrink-0 flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                  isWishlisted(product._id)
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
                }`}
                title={isWishlisted(product._id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted(product._id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span className="hidden sm:inline">{isWishlisted(product._id) ? 'Wishlisted' : 'Save'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-extrabold text-slate-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{avgRate} / 5.0</span>
                <span className="text-slate-500 font-medium">({totalRev} verified reviews)</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Farm Origin: {product.originLocation}</span>
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Direct Farm Gate Price</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-950">₹{product.price}</span>
                <span className="text-sm font-bold text-slate-600">/ {product.unit}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-800">Freshness Assurance</span>
              <p className="text-xs text-slate-600 mt-0.5">Harvested {daysSinceHarvest === 0 ? 'Today' : `${daysSinceHarvest} days ago`}</p>
            </div>
          </div>

          {/* Batch Harvest Details */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Batch Harvest Date
              </span>
              <span className="text-slate-500">Shelf Life: ~{product.shelfLifeDays || 7} days</span>
            </div>
            <p className="text-slate-700 font-medium">
              Harvested on: <strong>{new Date(product.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </p>
            {product.organicCertNo && (
              <p className="text-[11px] text-emerald-800 font-bold">
                Organic Certification #: {product.organicCertNo}
              </p>
            )}
          </div>

          {/* Overview Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Produce Overview & Quality Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity Selector + Add to Cart CTA */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-800">Quantity ({product.unit}):</span>
              <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(product.minOrderQuantity || 1, quantity - 1))}
                  className="p-2 text-slate-600 hover:text-emerald-700 disabled:opacity-50"
                  disabled={quantity <= (product.minOrderQuantity || 1)}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-1 text-sm font-extrabold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.availableQuantity, quantity + 1))}
                  className="p-2 text-slate-600 hover:text-emerald-700 disabled:opacity-50"
                  disabled={quantity >= product.availableQuantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                (Min: {product.minOrderQuantity || 1} {product.unit} • Max Available: {product.availableQuantity} {product.unit})
              </span>
            </div>

            {user ? (
              <button
                onClick={handleAddToCart}
                disabled={product.availableQuantity <= 0}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 ${
                  product.availableQuantity <= 0 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{product.availableQuantity <= 0 ? 'Out of Stock' : `Add ${quantity} ${product.unit} to Basket • ₹${product.price * quantity}`}</span>
              </button>
            ) : (
              <Link
                to={`/login?redirect=/products/${product._id}`}
                className="w-full py-4 rounded-2xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white transition-transform hover:-translate-y-0.5 text-center"
              >
                <ShoppingBag className="w-5 h-5 text-slate-400" />
                <span>Sign In to Buy • ₹{product.price * quantity}</span>
              </Link>
            )}

            {/* Direct Contact Buttons — Call Farmer & WhatsApp */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${farmerObj?.phone || farmerObj?.contactNumber || '+911800419880'}`}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border-2 border-emerald-700 text-emerald-800 font-extrabold text-xs hover:bg-emerald-700 hover:text-white transition-all shadow-sm"
              >
                <Phone className="w-4 h-4" />
                Call Farmer / Seller
              </a>
              <a
                href={`https://wa.me/${farmerObj?.whatsapp || farmerObj?.phone?.replace(/[^0-9]/g, '') || '911800419880'}?text=${encodeURIComponent(`Hi! I'm interested in buying ${quantity} ${product.unit} of ${product.title} listed on KrishiDirect. Please share availability and delivery details.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20b958] text-white font-extrabold text-xs transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>

            <p className="text-[11px] text-slate-400 text-center font-medium">
              🔒 Safe & secure transactions • Verified farmer listings
            </p>
          </div>

        </div>

      </div>

      {/* Farmer Information Showcase */}
      <section className="bg-gradient-to-r from-emerald-900 via-agri-dark to-slate-900 text-white rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-700 border-2 border-emerald-400 flex items-center justify-center font-bold text-2xl shadow shrink-0">
              <Tractor className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xl">{product.farmName}</h3>
                <ShieldCheck className="w-5 h-5 text-emerald-400" title="Verified Producer" />
              </div>
              <p className="text-xs text-emerald-300 font-medium mt-0.5">
                Grower: <strong>{product.farmerName}</strong> • {product.originLocation}
              </p>
              <div className="flex items-center gap-3 text-xs text-amber-300 font-bold mt-1">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Farmer Rating: {farmerObj.farmDetails?.rating || '4.9'}</span>
                </span>
                <span>•</span>
                <span>Farming Method: {product.farmingMethod || 'Organic Certified'}</span>
              </div>
            </div>
          </div>

          <Link
            to={`/farmers/${product.farmer._id || product.farmer}`}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow transition-transform hover:-translate-y-0.5"
          >
            Visit Farmer Profile & Showcase
          </Link>
        </div>
      </section>

      {/* MARKETPLACE TRUST SYSTEM: RATINGS & REVIEWS */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
              <span>Verified Produce Ratings & Feedback</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Only verified buyers with delivered orders can submit ratings to ensure complete authenticity.</p>
          </div>

          {/* Write / Edit Review Button */}
          {eligibility.eligible ? (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
            >
              {reviewsData.userReview ? <Edit3 className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              <span>{reviewsData.userReview ? 'Edit Your Review' : 'Write Verified Review'}</span>
            </button>
          ) : (
            <div className="px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>{user ? 'Requires delivered order to review' : 'Sign in to write a review'}</span>
            </div>
          )}
        </div>

        {/* Rating Breakdown & Average Overview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
          
          {/* Average Rating Block */}
          <div className="md:col-span-4 text-center space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
            <div className="text-5xl font-black text-slate-900">{avgRate}</div>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(avgRate) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-extrabold text-slate-600">
              Based on {totalRev} {totalRev === 1 ? 'verified review' : 'verified reviews'}
            </p>
          </div>

          {/* Rating Distribution Bars */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = breakdown[starNum] || 0;
              const pct = totalRev > 0 ? Math.round((count / totalRev) * 100) : 0;
              return (
                <div key={starNum} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                  <span className="w-12 flex items-center gap-1">
                    {starNum} <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  </span>
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-500">{pct}%</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsData.reviews?.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm italic border-2 border-dashed rounded-3xl">
              No reviews submitted yet for this harvest batch. Verified buyers with completed orders will appear here!
            </div>
          ) : (
            reviewsData.reviews.map((rev) => (
              <div key={rev._id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-xs">
                      {rev.consumerName?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <span>{rev.consumerName}</span>
                        {rev.isVerifiedPurchaser && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Purchaser
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium pl-11">
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Verified Purchase Feedback</span>
              <h3 className="text-xl font-extrabold text-slate-900">Rate & Review Produce</h3>
              <p className="text-xs text-slate-500">{product.title}</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Select Star Rating (1 to 5):</label>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Your Detailed Review:</label>
                <textarea
                  rows="4"
                  placeholder="Share details about fresh taste, aroma, packing quality, and delivery speed..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow transition"
                >
                  {submittingReview ? 'Publishing...' : (reviewsData.userReview ? 'Update Review' : 'Publish Review')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
