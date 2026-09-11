const express = require('express');
const router = express.Router();
const { 
  createOrUpdateReview, 
  getProductReviews, 
  getFarmerReviews, 
  checkEligibility 
} = require('../controllers/reviewController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

router.post('/', authenticateToken, asyncHandler(createOrUpdateReview));
router.get('/eligibility', authenticateToken, asyncHandler(checkEligibility));
router.get('/product/:productId', optionalAuth, asyncHandler(getProductReviews));
router.get('/farmer/:farmerId', optionalAuth, asyncHandler(getFarmerReviews));

module.exports = router;
