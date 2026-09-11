const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const farmDetailsSchema = new mongoose.Schema({
  farmName: { type: String, required: true },
  farmLocation: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  sizeInAcres: { type: Number, default: 5 },
  primaryCrops: [{ type: String }],
  farmingMethod: { type: String, default: 'Organic Certified' },
  isOrganicCertified: { type: Boolean, default: false },
  certificationNumber: { type: String, default: '' },
  bio: { type: String, default: '' },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  verificationNotes: { type: String, default: '' },
  bankDetails: {
    accountHolder: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    upiId: { type: String, default: '' }
  },
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 12 },
  images: [{ type: String }]
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['consumer', 'farmer', 'admin'], default: 'consumer' },
  avatar: { type: String, default: '' },
  farmDetails: { type: farmDetailsSchema, required: false },
  addresses: [addressSchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
// email already has a unique index from schema definition

// Admin user listing: filter by role + active status
userSchema.index({ role: 1, isActive: 1 });

// Farmer approval queue: pending verification status
userSchema.index({ 'farmDetails.verificationStatus': 1, role: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);
