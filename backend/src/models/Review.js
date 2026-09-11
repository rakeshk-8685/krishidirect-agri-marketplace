const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  targetType: { 
    type: String, 
    enum: ['product', 'farmer'], 
    default: 'product' 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: false 
  },
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  consumer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  consumerName: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true 
  },
  isVerifiedPurchaser: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Prevent duplicate reviews: one consumer review per product
// Also serves as the lookup index for "did this consumer review this product?"
reviewSchema.index({ consumer: 1, product: 1 }, { sparse: true });

// Prevent duplicate farmer reviews + serve eligibility checks
reviewSchema.index({ consumer: 1, farmer: 1, targetType: 1 });

// Product review listing (sorted by date descending)
reviewSchema.index({ product: 1, createdAt: -1 });

// Farmer review listing
reviewSchema.index({ farmer: 1, targetType: 1, createdAt: -1 });

// Rating recalculation aggregations ($match on product or farmer)
// Covered by the above indexes

module.exports = mongoose.model('Review', reviewSchema);
