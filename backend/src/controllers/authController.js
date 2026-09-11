const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dataService = require('../services/dataService');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/secrets');

const register = async (req, res) => {
  const { name, email, password, confirmPassword, phone, role, farmDetails, addresses } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'Required fields missing (name, email, password, phone).' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  // Prevent role privilege escalation (Users cannot self-register as admin)
  let userRole = 'consumer';
  if (role === 'farmer') {
    userRole = 'farmer';
  }

  const existingUser = await dataService.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
  }

  let farmData = null;
  if (userRole === 'farmer') {
    if (!farmDetails || !farmDetails.farmName || !farmDetails.farmLocation) {
      return res.status(400).json({ success: false, message: 'Farmers must provide Farm Name and Location details.' });
    }
    
    // Normalize farming method: Organic vs Conventional
    const rawMethod = farmDetails.farmingMethod || (farmDetails.isOrganicCertified ? 'Organic' : 'Conventional');
    const isOrganic = rawMethod.toLowerCase().includes('organic') || Boolean(farmDetails.isOrganicCertified);
    const farmingMethod = isOrganic ? 'Organic' : 'Conventional';

    // Farmer Onboarding starts strictly in PENDING verification status!
    farmData = {
      farmName: farmDetails.farmName,
      farmLocation: farmDetails.farmLocation,
      state: farmDetails.state || 'Maharashtra',
      district: farmDetails.district || 'Pune',
      sizeInAcres: Number(farmDetails.sizeInAcres) || 5,
      primaryCrops: Array.isArray(farmDetails.primaryCrops) && farmDetails.primaryCrops.length > 0 
        ? farmDetails.primaryCrops 
        : (farmDetails.cropTypes ? farmDetails.cropTypes.split(',').map(c => c.trim()).filter(Boolean) : ['Vegetables']),
      farmingMethod,
      isOrganicCertified: isOrganic,
      certificationNumber: farmDetails.certificationNumber || '',
      bio: farmDetails.bio || `Welcome to ${farmDetails.farmName}. Producing fresh natural harvests directly for consumers.`,
      verificationStatus: 'pending', // STRICT REQUIREMENT: Newly registered farmers start as PENDING!
      verificationNotes: 'Awaiting admin review of farm land details & identity documents.',
      bankDetails: farmDetails.bankDetails || { accountHolder: name, accountNumber: '987654321098', ifscCode: 'SBIN0001234', upiId: `${email.split('@')[0]}@upi` },
      rating: 5.0,
      reviewCount: 0,
      images: farmDetails.images || ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80']
    };
  }

  const user = await dataService.createUser({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: userRole,
    farmDetails: farmData,
    addresses: addresses || [{ label: 'Home', addressLine: '123 Main Street', city: 'Pune', state: 'Maharashtra', pincode: '411001', isDefault: true }]
  });

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const welcomeMessage = userRole === 'farmer' 
    ? 'Farmer registration successful! Your farm profile has been submitted for admin verification approval.'
    : 'Registration successful! Welcome to KrishiDirect.';

  const sanitizedRegFarmDetails = user.farmDetails ? {
    ...user.farmDetails.toObject?.() || user.farmDetails,
    bankDetails: undefined
  } : undefined;

  res.status(201).json({
    success: true,
    message: welcomeMessage,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      farmDetails: sanitizedRegFarmDetails,
      addresses: user.addresses
    }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await dataService.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  // Deactivated user check — prevent disabled accounts from authenticating
  if (user.isActive === false) {
    return res.status(401).json({ 
      success: false, 
      message: 'Your account has been deactivated. Please contact KrishiDirect platform support.' 
    });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Strip sensitive bankDetails from farmDetails in auth response
  const sanitizedFarmDetails = user.farmDetails ? {
    ...user.farmDetails.toObject?.() || user.farmDetails,
    bankDetails: undefined
  } : undefined;

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      farmDetails: sanitizedFarmDetails,
      addresses: user.addresses
    }
  });
};

const me = async (req, res) => {
  const user = await dataService.findUserById(req.user.id);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Session expired or user profile not found. Please sign in again.' });
  }
  // Explicit projection — never expose password or internal fields
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      farmDetails: user.farmDetails,
      addresses: user.addresses,
      isActive: user.isActive,
      createdAt: user.createdAt
    }
  });
};

const updateProfile = async (req, res) => {
  const { name, phone, addresses, farmDetails } = req.body;
  const updateFields = {};
  if (name) updateFields.name = sanitizeString(name);
  if (phone) updateFields.phone = sanitizeString(phone);
  if (addresses) updateFields.addresses = addresses;
  
  // Prevent farmers from self-modifying verification status during profile update!
  if (farmDetails && req.user.role === 'farmer') {
    const existingUser = await dataService.findUserById(req.user.id);
    updateFields.farmDetails = {
      ...farmDetails,
      verificationStatus: existingUser.farmDetails?.verificationStatus || 'pending'
    };
  }

  const updatedUser = await dataService.updateUser(req.user.id, updateFields);
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
};

const googleAuth = async (req, res) => {
  const { email, name, avatar, role } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Google account email is required.' });
  }

  let user = await dataService.findUserByEmail(email);
  if (!user) {
    user = await dataService.createUser({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: 'GoogleOAuth2026@Password',
      phone: '+91 9811223344',
      role: role || 'consumer',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      isActive: true,
      addresses: [{ label: 'Home', addressLine: '12 Green Park', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', isDefault: true }]
    });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    success: true,
    message: `Welcome, ${user.name}! Authenticated with Google.`,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      farmDetails: user.farmDetails,
      addresses: user.addresses
    }
  });
};

module.exports = { register, login, me, updateProfile, googleAuth };
