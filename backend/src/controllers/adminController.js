const dataService = require('../services/dataService');

const getAdminDashboard = async (req, res) => {
  // Fetch metrics and only recent slices — do NOT load all orders/products
  const [metrics, pendingFarmers, recentOrders, commission] = await Promise.all([
    dataService.getAdminMetrics(),
    dataService.getAllFarmers({ verificationStatus: 'pending' }),
    dataService.getOrders({ limit: 20 }),  // Last 20 orders only
    Promise.resolve(dataService.getCommissionConfig())
  ]);

  res.json({
    success: true,
    metrics,
    pendingFarmers,
    commission,
    recentOrders
  });
};

const getAllUsers = async (req, res) => {
  const { role } = req.query;
  const users = await dataService.getAllUsers(role);
  res.json({
    success: true,
    count: users.length,
    users
  });
};

const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({ success: false, message: 'isActive status boolean is required.' });
  }

  // Prevent admin from accidentally locking themselves out
  if (userId === req.user.id) {
    return res.status(400).json({ success: false, message: 'Admins cannot change their own account status.' });
  }

  const updatedUser = await dataService.updateUserStatus(userId, isActive);
  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User account not found.' });
  }

  res.json({
    success: true,
    message: `User account '${updatedUser.name}' status set to ${isActive ? 'Active' : 'Deactivated'}.`,
    user: updatedUser
  });
};

const verifyFarmer = async (req, res) => {
  const { farmerId } = req.params;
  const { status, notes } = req.body;

  // Strict allowlist — prevent arbitrary status injection
  const ALLOWED_STATUSES = ['verified', 'rejected', 'pending'];
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: `Invalid verification status. Must be one of: ${ALLOWED_STATUSES.join(', ')}.`
    });
  }

  const farmer = await dataService.findUserById(farmerId);
  if (!farmer || farmer.role !== 'farmer') {
    return res.status(404).json({ success: false, message: 'Farmer account not found.' });
  }

  const currentFarmDetails = farmer.farmDetails?.toObject ? farmer.farmDetails.toObject() : (farmer.farmDetails || {});
  const updatedFarmDetails = {
    ...currentFarmDetails,
    verificationStatus: status,
    verificationNotes: notes || ''
  };

  const updated = await dataService.updateUser(farmerId, { 
    'farmDetails.verificationStatus': status,
    'farmDetails.verificationNotes': notes || ''
  });

  res.json({
    success: true,
    message: `Farmer '${farmer.name}' verification status set to '${status}'.`,
    farmer: updated
  });
};

const moderateProduct = async (req, res) => {
  const { productId } = req.params;
  const { status } = req.body;

  const ALLOWED_PRODUCT_STATUSES = ['in_stock', 'unlisted', 'out_of_stock', 'low_stock'];
  if (!status || !ALLOWED_PRODUCT_STATUSES.includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: `Invalid product status. Must be one of: ${ALLOWED_PRODUCT_STATUSES.join(', ')}.` 
    });
  }

  const product = await dataService.getProductById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Produce listing not found.' });
  }

  const updated = await dataService.updateProduct(productId, { status });

  res.json({
    success: true,
    message: `Product '${product.title}' moderation status updated to '${status}'.`,
    product: updated
  });
};

const updateCommission = async (req, res) => {
  const { commissionRatePercent } = req.body;
  if (commissionRatePercent === undefined || isNaN(Number(commissionRatePercent))) {
    return res.status(400).json({ success: false, message: 'Valid commission rate percentage is required.' });
  }

  const config = dataService.updateCommissionConfig(commissionRatePercent);

  res.json({
    success: true,
    message: `Platform commission rate updated to ${config.commissionRatePercent}%.`,
    commission: config
  });
};

module.exports = { 
  getAdminDashboard, 
  getAllUsers, 
  updateUserStatus, 
  verifyFarmer, 
  moderateProduct, 
  updateCommission 
};
