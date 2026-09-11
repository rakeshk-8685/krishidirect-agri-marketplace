const express = require('express');
const router = express.Router();
const { 
  getAdminDashboard, 
  getAllUsers, 
  updateUserStatus, 
  verifyFarmer, 
  moderateProduct, 
  updateCommission 
} = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

// Enforce authentication & strict admin role authorization
router.use(authenticateToken, requireRole(['admin']));

router.get('/dashboard', asyncHandler(getAdminDashboard));
router.get('/users', asyncHandler(getAllUsers));
router.patch('/users/:userId/status', asyncHandler(updateUserStatus));
router.patch('/farmers/:farmerId/verify', asyncHandler(verifyFarmer));
router.patch('/products/:productId/moderate', asyncHandler(moderateProduct));
router.post('/commission', asyncHandler(updateCommission));

module.exports = router;
