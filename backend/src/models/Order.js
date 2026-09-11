const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  farmName: { type: String, required: true }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  consumerName: { type: String, required: true },
  consumerPhone: { type: String, required: true },
  items: [orderItemSchema],
  deliveryAddress: {
    label: String,
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true, default: 40 },
  platformFee: { type: Number, required: true, default: 15 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['upi', 'card', 'cod', 'netbanking'], default: 'upi' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'paid' },
  orderStatus: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED', 'DISPUTED'], 
    default: 'PENDING',
    uppercase: true
  },
  disputeDetails: {
    isDisputed: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['open', 'resolved', 'closed'], default: 'open' },
    raisedBy: { type: String, default: '' },
    raisedAt: { type: Date },
    resolutionNote: { type: String, default: '' },
    resolvedAt: { type: Date }
  },
  statusHistory: [statusHistorySchema],
  farmerNotes: { type: String, default: '' },
  deliverySlot: { type: String, default: 'Morning Slot (06:00 AM - 09:00 AM)' },
  estimatedDeliveryDate: { type: Date }
}, {
  timestamps: true
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Consumer order history (most common consumer query)
orderSchema.index({ consumer: 1, createdAt: -1 });

// Farmer incoming orders — queries against embedded array field
orderSchema.index({ 'items.farmer': 1, createdAt: -1 });

// Status-based filtering (admin monitor, farmer active orders)
orderSchema.index({ orderStatus: 1, createdAt: -1 });

// Disputed orders for admin resolution queue
orderSchema.index({ 'disputeDetails.isDisputed': 1, orderStatus: 1 });

// Unique orderNumber already has implicit index via unique: true

module.exports = mongoose.model('Order', orderSchema);
