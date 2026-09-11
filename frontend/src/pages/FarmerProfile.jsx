import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiCall } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Tractor, MapPin, Star, ShieldCheck, ArrowLeft, Sprout, MessageSquare, CheckCircle2, Lock, X, Award, Edit3 } from 'lucide-react';

export default function FarmerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    avgRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    userReview: null
  });
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [eligibility, setEligibility] = useState({ eligible: false, reason: '' });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchFarmerProfile = async () => {
    setLoading(true);
    try {
      // Fire all API calls in parallel — 3x faster than sequential awaits
      const requests = [
        apiCall(`/farmers/${id}`),
        apiCall(`/reviews/farmer/${id}`)
      ];

      if (user) {
        requests.push(apiCall(`/reviews/eligibility?farmerId=${id}`));
      }

      const [profileData, revsData, elData] = await Promise.all(requests);

      if (profileData?.success) {
        setFarmer(profileData.farmer);
        setProducts(profileData.products || []);
      }

      if (revsData?.success) {
        setReviewsData(revsData);
        if (revsData.userReview) {
          setRating(revsData.userReview.rating);
          setComment(revsData.userReview.comment);
        }
      }

      if (elData?.success) {
        setEligibility(elData);
        if (elData.existingReview) {
          setRating(elData.existingReview.rating);
          setComment(elData.existingReview.comment);
        }
      }
    } catch (err) {
      console.error('Fetch farmer profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerProfile();
  }, [id, user]);

  const handleFarmerReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to rate this producer.', 'error');
      return;
    }
    if (!comment.trim()) {
      showToast('Please write a short review about your experience with this farmer.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const data = await apiCall('/reviews', 'POST', {
        farmerId: id,
        targetType: 'farmer',
        rating,
        comment: comment.trim()
      });
      if (data.success) {
        showToast(data.message, 'success');
        setShowReviewModal(false);
        fetchFarmerProfile();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit rating', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading verified farm profile..." />;
  if (!farmer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Farmer profile not found</h2>
        <Link to="/farmers" className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-xs">
          Explore All Verified Farms
        </Link>
      </div>
    );
  }

  const farm = farmer.farmDetails || {};
  const totalRev = reviewsData.totalReviews || farm.reviewCount || 0;
  const avgRate = reviewsData.avgRating || farm.rating || 4.9;
  const breakdown = reviewsData.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <Link to="/farmers" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Verified Farms</span>
      </Link>

      {/* Farm Banner Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-900 relative">
          <img 
            src={farm.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'} 
            alt={farm.farmName} 
            className="w-full h-full object-cover opacity-50"
          />
        </div>

        <div className="p-8 relative -mt-16 sm:-mt-20 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white bg-slate-100 shadow-xl overflow-hidden shrink-0">
                <img src={farmer.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=250&q=80'} alt={farmer.name} className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{farm.farmName || `${farmer.name}'s Farm`}</h1>
                  <ShieldCheck className="w-6 h-6 text-emerald-600" title="Verified Farm Origin" />
                </div>
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mt-1">
                  <Tractor className="w-4 h-4" />
                  Farmer: {farmer.name} • {farm.sizeInAcres || 10} Acres Farm
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {farm.farmLocation || 'Maharashtra, India'}
                </p>
              </div>
            </div>

            {/* Rating pill */}
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div className="text-xs">
                <span className="font-extrabold text-slate-900 text-sm">{avgRate} / 5.0</span>
                <span className="text-slate-500 font-medium block">({totalRev} verified reviews)</span>
              </div>
            </div>
          </div>

          {/* Organic Certificate & Farm Story */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">About Farm & Agricultural Practice</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{farm.bio || 'Dedicated to zero-chemical natural farming practices.'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Certification Credentials</span>
              </div>
              <p className="text-slate-600">Organic Status: <strong className="text-emerald-700">{farm.isOrganicCertified ? 'Certified Organic' : 'Natural Produce'}</strong></p>
              {farm.certificationNumber && (
                <p className="text-slate-500 text-[11px]">Cert #: {farm.certificationNumber}</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Produce Listed By This Farmer */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            <span>Harvest Produce Available From This Farm ({products.length})</span>
          </h2>
        </div>

        {products.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center bg-white rounded-2xl border border-slate-200">
            No active produce items listed by this farmer right now. Check back soon for the next harvest batch!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* MARKETPLACE TRUST SYSTEM: FARMER RATINGS & REVIEWS */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-emerald-600" />
              <span>Verified Producer Ratings & Reviews</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Direct feedback from verified households who received delivered orders from this farmer.</p>
          </div>

          {/* Rate Farmer Button */}
          {eligibility.eligible ? (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
            >
              {reviewsData.userReview ? <Edit3 className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              <span>{reviewsData.userReview ? 'Edit Producer Rating' : 'Rate This Producer'}</span>
            </button>
          ) : (
            <div className="px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>{user ? 'Requires delivered order from farm to review' : 'Sign in to rate producer'}</span>
            </div>
          )}
        </div>

        {/* Rating Overview & Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
          
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
              {totalRev} {totalRev === 1 ? 'verified consumer review' : 'verified consumer reviews'}
            </p>
          </div>

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
              No reviews posted yet for this producer. Delivered buyers will appear here!
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
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Verified Producer Feedback</span>
              <h3 className="text-xl font-extrabold text-slate-900">Rate Farmer {farmer.name}</h3>
              <p className="text-xs text-slate-500">{farm.farmName}</p>
            </div>

            <form onSubmit={handleFarmerReviewSubmit} className="space-y-5">
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
                <label className="text-xs font-bold text-slate-700 block">Your Review & Experience:</label>
                <textarea
                  rows="4"
                  placeholder="Share feedback on packaging freshness, produce quality, and farmer communication..."
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
                  {submittingReview ? 'Publishing...' : (reviewsData.userReview ? 'Update Rating' : 'Publish Rating')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
