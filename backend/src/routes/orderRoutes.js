const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder, 
  raiseDispute, 
  resolveDispute 
} = require('../controllers/orderController');
const { authenticateToken, requireRole, requireVerifiedFarmer } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

router.post('/', authenticateToken, requireRole(['consumer', 'admin']), asyncHandler(createOrder));
router.get('/', authenticateToken, asyncHandler(getOrders));
router.get('/:id', authenticateToken, asyncHandler(getOrderById));

// State Machine transitions by Verified Farmer or Admin
router.patch('/:id/status', authenticateToken, requireRole(['farmer', 'admin']), requireVerifiedFarmer, asyncHandler(updateOrderStatus));

// Cancellation endpoint (Consumer can cancel PENDING/CONFIRMED; Farmer/Admin can cancel)
router.post('/:id/cancel', authenticateToken, asyncHandler(cancelOrder));

// Raise Dispute endpoint (Consumer or Admin)
router.post('/:id/dispute', authenticateToken, requireRole(['consumer', 'admin']), asyncHandler(raiseDispute));

// Resolve Dispute endpoint (Admin only)
router.post('/:id/resolve-dispute', authenticateToken, requireRole(['admin']), asyncHandler(resolveDispute));

module.exports = router;
