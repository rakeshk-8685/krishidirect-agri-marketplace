const dataService = require('../services/dataService');
const { canRolePerformTransition, normalizeStatus, ORDER_STATES } = require('../utils/orderStateMachine');
const { sanitizeString } = require('../middleware/validation');

const createOrder = async (req, res) => {
  const { items, deliveryAddress, paymentMethod, deliverySlot } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Cart is empty. Please add items to order.' });
  }

  if (!deliveryAddress || !deliveryAddress.addressLine || !deliveryAddress.city) {
    return res.status(400).json({ success: false, message: 'Please provide a valid delivery address.' });
  }

  const consumerUser = await dataService.findUserById(req.user.id);
  if (!consumerUser) {
    return res.status(404).json({ success: false, message: 'Consumer account not found.' });
  }

  // Concurrently fetch all products in cart to eliminate sequential roundtrips
  const productFetches = await Promise.all(
    items.map(item => dataService.getProductById(item.productId || item.product))
  );

  let subtotal = 0;
  const processedItems = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const product = productFetches[i];
    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${item.title || 'selected'} no longer exists.` });
    }

    if (product.availableQuantity < item.quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${product.availableQuantity} ${product.unit} of "${product.title}" available in stock.` 
      });
    }

    // Server-side price recalculation (Do not trust client supplied prices)
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    const farmerId = product.farmer._id ? product.farmer._id : product.farmer;

    processedItems.push({
      product: product._id,
      title: product.title,
      price: product.price,
      unit: product.unit,
      quantity: Number(item.quantity),
      farmer: farmerId,
      farmerName: product.farmerName,
      farmName: product.farmName
    });
  }

  const deliveryFee = subtotal > 1000 ? 0 : 50; // Free delivery over ₹1000
  const platformFee = 15;
  const totalAmount = subtotal + deliveryFee + platformFee;

  const orderNumber = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  
  const estDeliveryDate = new Date();
  estDeliveryDate.setDate(estDeliveryDate.getDate() + 2); // 2 days fresh farm delivery

  const order = await dataService.createOrder({
    orderNumber,
    consumer: req.user.id,
    consumerName: consumerUser.name,
    consumerPhone: consumerUser.phone,
    items: processedItems,
    deliveryAddress,
    subtotal,
    deliveryFee,
    platformFee,
    totalAmount,
    paymentMethod: paymentMethod || 'upi',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    orderStatus: ORDER_STATES.PENDING,
    deliverySlot: deliverySlot || 'Morning Express (06:00 AM - 09:00 AM)',
    estimatedDeliveryDate: estDeliveryDate
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully! Fresh farm harvest will be packed shortly.',
    order
  });
};

const getOrders = async (req, res) => {
  let params = {};
  if (req.user.role === 'consumer') {
    params.consumerId = req.user.id;
  } else if (req.user.role === 'farmer') {
    params.farmerId = req.user.id;
  }

  if (req.query.status) {
    params.status = req.query.status;
  }

  const orders = await dataService.getOrders(params);

  res.json({
    success: true,
    count: orders.length,
    orders
  });
};

const getOrderById = async (req, res) => {
  const order = await dataService.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Ownership authorization check
  const isConsumer = order.consumer.toString() === req.user.id;
  const isFarmerInOrder = order.items.some(item => item.farmer.toString() === req.user.id);
  const isAdmin = req.user.role === 'admin';

  if (!isConsumer && !isFarmerInOrder && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to view this order.' });
  }

  res.json({
    success: true,
    order
  });
};

const updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Target status is required.' });
  }

  const order = await dataService.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Farmer Authorization Check
  if (req.user.role === 'farmer') {
    const isFarmerInOrder = order.items.some(item => item.farmer.toString() === req.user.id);
    if (!isFarmerInOrder) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only manage orders containing items from your farm.' });
    }
  }

  const currentStatus = normalizeStatus(order.orderStatus);
  const targetStatus = normalizeStatus(status);

  // State Machine transition check
  const check = canRolePerformTransition(req.user.role, currentStatus, targetStatus);
  if (!check.valid) {
    return res.status(400).json({ 
      success: false, 
      message: check.reason || `Invalid transition from ${currentStatus} to ${targetStatus}.` 
    });
  }

  const noteMsg = note || `Status updated from ${currentStatus} to ${targetStatus}`;
  const updatedOrder = await dataService.updateOrderStatus(req.params.id, targetStatus, noteMsg);

  res.json({
    success: true,
    message: `Order status transitioned from ${currentStatus} to ${targetStatus}.`,
    order: updatedOrder
  });
};

const cancelOrder = async (req, res) => {
  const { reason } = req.body;
  const order = await dataService.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (req.user.role === 'consumer' && order.consumer.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden. You can only cancel your own orders.' });
  }

  // Farmer can only cancel orders that contain produce from their own farm
  if (req.user.role === 'farmer') {
    const isFarmerInOrder = order.items.some(item => {
      const fId = item.farmer?._id ? item.farmer._id.toString() : item.farmer?.toString();
      return fId === req.user.id;
    });
    if (!isFarmerInOrder) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only cancel orders containing items from your farm.' });
    }
  }

  const currentStatus = normalizeStatus(order.orderStatus);
  const check = canRolePerformTransition(req.user.role, currentStatus, ORDER_STATES.CANCELLED);
  if (!check.valid) {
    return res.status(400).json({ success: false, message: check.reason });
  }

  const safeReason = reason ? sanitizeString(reason) : null;
  const noteMsg = safeReason ? `Order cancelled by ${req.user.role}: ${safeReason}` : `Order cancelled by ${req.user.role}`;
  const updatedOrder = await dataService.updateOrderStatus(req.params.id, ORDER_STATES.CANCELLED, noteMsg);

  res.json({
    success: true,
    message: 'Order cancelled successfully and inventory stock restored.',
    order: updatedOrder
  });
};

const raiseDispute = async (req, res) => {
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, message: 'Dispute reason is required.' });
  }

  const order = await dataService.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (req.user.role === 'consumer' && order.consumer.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden. You can only raise disputes on your own orders.' });
  }

  const currentStatus = normalizeStatus(order.orderStatus);
  const check = canRolePerformTransition(req.user.role, currentStatus, ORDER_STATES.DISPUTED);
  if (!check.valid) {
    return res.status(400).json({ success: false, message: check.reason });
  }

  const updatedOrder = await dataService.raiseOrderDispute(req.params.id, {
    reason: sanitizeString(reason),
    raisedBy: req.user.name || 'Consumer'
  });

  res.json({
    success: true,
    message: 'Dispute ticket submitted successfully. Platform admin will review and resolve.',
    order: updatedOrder
  });
};

const resolveDispute = async (req, res) => {
  const { action, resolutionNote } = req.body; // action: 'refund' or 'close'
  if (!action || !['refund', 'close'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Valid resolution action ("refund" or "close") is required.' });
  }

  const order = await dataService.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (normalizeStatus(order.orderStatus) !== ORDER_STATES.DISPUTED) {
    return res.status(400).json({ success: false, message: 'Order is not currently in DISPUTED state.' });
  }

  const updatedOrder = await dataService.resolveOrderDispute(req.params.id, {
    action,
    resolutionNote
  });

  res.json({
    success: true,
    message: action === 'refund' 
      ? 'Dispute resolved with full refund. Inventory restored.' 
      : 'Dispute resolved and closed.',
    order: updatedOrder
  });
};

module.exports = { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder, 
  raiseDispute, 
  resolveDispute 
};
