const express = require('express');
const router = express.Router();
const { 
  getFarmerProfile, 
  getMyFarmerProfile,
  getFarmerDashboardMetrics, 
  getFarmerSalesSummary,
  updateFarmerFarmProfile,
  getAllVerifiedFarmers 
} = require('../controllers/farmerController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

// Public endpoints
router.get('/', asyncHandler(getAllVerifiedFarmers));
router.get('/list/all', asyncHandler(getAllVerifiedFarmers));

// Authenticated farmer panel endpoints
router.get('/me', authenticateToken, requireRole(['farmer']), asyncHandler(getMyFarmerProfile));
router.get('/profile', authenticateToken, requireRole(['farmer']), asyncHandler(getMyFarmerProfile));
router.put('/profile', authenticateToken, requireRole(['farmer']), asyncHandler(updateFarmerFarmProfile));
router.get('/dashboard', authenticateToken, requireRole(['farmer']), asyncHandler(getFarmerDashboardMetrics));
router.get('/sales', authenticateToken, requireRole(['farmer']), asyncHandler(getFarmerSalesSummary));

// Public profile by ID (placed after static paths to avoid colliding with /me, /sales, etc.)
router.get('/:id', asyncHandler(getFarmerProfile));

module.exports = router;
