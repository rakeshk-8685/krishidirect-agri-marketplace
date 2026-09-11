const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  farmName: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Fruits', 'Vegetables', 'Grains & Pulses', 'Dairy & Poultry', 'Organic & Special']
  },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, default: 'kg' },
  availableQuantity: { type: Number, required: true, min: 0 },
  minOrderQuantity: { type: Number, default: 1, min: 1 },
  harvestDate: { type: Date, default: Date.now },
  shelfLifeDays: { type: Number, default: 7 },
  isOrganic: { type: Boolean, default: false },
  farmingMethod: { type: String, default: 'Organic Certified' },
  organicCertNo: { type: String, default: '' },
  description: { type: String, required: true },
  images: [{ type: String }],
  originLocation: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'unlisted'], 
    default: 'in_stock' 
  },
  rating: { type: Number, default: 4.8 },
  numReviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Full-text search index across the most queried text fields
productSchema.index(
  { title: 'text', description: 'text', category: 'text', originLocation: 'text', farmName: 'text' },
  { weights: { title: 10, category: 5, originLocation: 3, farmName: 2, description: 1 } }
);

// Marketplace filter combinations: category + status is the most common query
productSchema.index({ category: 1, status: 1 });

// Farmer's own product listing page
productSchema.index({ farmer: 1, status: 1 });

// Organic filter + status (e.g. isOrganic=true&status=in_stock)
productSchema.index({ isOrganic: 1, status: 1 });

// Sort by newest (default sort), price, rating
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

// Featured products (home page hero section)
productSchema.index({ featured: 1, status: 1 });

module.exports = mongoose.model('Product', productSchema);
