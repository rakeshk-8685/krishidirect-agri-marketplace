const dataService = require('../services/dataService');
const { sanitizeString } = require('../middleware/validation');

const createOrUpdateReview = async (req, res) => {
  const { productId, farmerId, rating, comment, targetType } = req.body;

  // Only consumers can submit reviews — prevent farmers reviewing competitors
  if (req.user.role !== 'consumer') {
    return res.status(403).json({
      success: false,
      message: 'Only consumers with completed purchases can submit reviews.'
    });
  }

  if (!rating || !comment || !comment.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Star rating (1-5) and review comment are required.' 
    });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ 
      success: false, 
      message: 'Rating must be a valid number between 1 and 5 stars.' 
    });
  }

  if (!productId && !farmerId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Either productId or farmerId must be provided to submit a review.' 
    });
  }

  // Get consumer user
  const consumerUser = await dataService.findUserById(req.user.id);
  if (!consumerUser) {
    return res.status(404).json({ success: false, message: 'Consumer profile not found.' });
  }

  let resolvedFarmerId = farmerId;
  let resolvedProductId = productId;

  if (productId) {
    const product = await dataService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produce listing not found.' });
    }
    resolvedFarmerId = product.farmer._id ? product.farmer._id : product.farmer;
  }

  try {
    const { review, isUpdate } = await dataService.upsertReview({
      targetType: targetType || (productId ? 'product' : 'farmer'),
      productId: resolvedProductId,
      farmerId: resolvedFarmerId,
      consumerId: req.user.id,
      consumerName: consumerUser.name,
      rating: numRating,
      comment: sanitizeString(comment.trim())
    });

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate 
        ? 'Your verified purchase review has been updated successfully.' 
        : 'Thank you! Your verified purchase review has been published.',
      review
    });
  } catch (err) {
    return res.status(403).json({ 
      success: false, 
      message: err.message || 'You are not eligible to review this produce/farmer.' 
    });
  }
};

const getProductReviews = async (req, res) => {
  const { productId } = req.params;
  const data = await dataService.getReviewsForProduct(productId);
  
  let userReview = null;
  if (req.user) {
    userReview = await dataService.getUserReviewForTarget(req.user.id, productId, null);
  }

  res.json({
    success: true,
    ...data,
    userReview
  });
};

const getFarmerReviews = async (req, res) => {
  const { farmerId } = req.params;
  const data = await dataService.getReviewsForFarmer(farmerId);
  
  let userReview = null;
  if (req.user) {
    userReview = await dataService.getUserReviewForTarget(req.user.id, null, farmerId);
  }

  res.json({
    success: true,
    ...data,
    userReview
  });
};

const checkEligibility = async (req, res) => {
  const { productId, farmerId } = req.query;
  const result = await dataService.checkReviewEligibility(req.user.id, productId, farmerId);
  
  const existingReview = await dataService.getUserReviewForTarget(req.user.id, productId, farmerId);

  res.json({
    success: true,
    eligible: result.eligible,
    reason: result.reason || null,
    existingReview
  });
};

module.exports = { 
  createOrUpdateReview, 
  getProductReviews, 
  getFarmerReviews, 
  checkEligibility 
};
