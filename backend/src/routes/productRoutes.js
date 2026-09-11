const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, updateInventory, deleteProduct } = require('../controllers/productController');
const { authenticateToken, requireRole, requireVerifiedFarmer } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/', asyncHandler(getProducts));
router.get('/:id', asyncHandler(getProductById));

// Only VERIFIED farmers or Admins can list, update, or unlist produce!
router.post('/', authenticateToken, requireRole(['farmer', 'admin']), requireVerifiedFarmer, asyncHandler(createProduct));
router.put('/:id', authenticateToken, requireRole(['farmer', 'admin']), requireVerifiedFarmer, asyncHandler(updateProduct));
router.patch('/:id/inventory', authenticateToken, requireRole(['farmer', 'admin']), requireVerifiedFarmer, asyncHandler(updateInventory));
router.delete('/:id', authenticateToken, requireRole(['farmer', 'admin']), requireVerifiedFarmer, asyncHandler(deleteProduct));

module.exports = router;
