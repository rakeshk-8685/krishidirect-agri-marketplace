const dataService = require('../services/dataService');

const getProducts = async (req, res) => {
  const { category, isOrganic, search, farmerId, status, sort, location, farmingMethod, limit, skip } = req.query;
  const products = await dataService.getProducts({
    category,
    isOrganic,
    search,
    farmerId,
    status,
    sort,
    location,
    farmingMethod,
    limit,
    skip
  });

  res.json({
    success: true,
    count: products.length,
    products
  });
};

const getProductById = async (req, res) => {
  const product = await dataService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Produce listing not found.' });
  }
  const reviews = await dataService.getReviewsForProduct(req.params.id);
  
  res.json({
    success: true,
    product,
    reviews
  });
};

const createProduct = async (req, res) => {
  const { 
    title, category, price, unit, availableQuantity, minOrderQuantity, 
    harvestDate, shelfLifeDays, isOrganic, farmingMethod, organicCertNo, description, 
    images, originLocation 
  } = req.body;

  if (!title || !category || !price || availableQuantity === undefined || !description) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required produce details (title, category, price, availableQuantity, description).' 
    });
  }

  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ success: false, message: 'Price must be a positive number.' });
  }

  const parsedQty = Number(availableQuantity);
  if (isNaN(parsedQty) || parsedQty < 0) {
    return res.status(400).json({ success: false, message: 'Available quantity must be a non-negative number.' });
  }

  const farmerUser = await dataService.findUserById(req.user.id);
  if (!farmerUser) {
    return res.status(404).json({ success: false, message: 'Farmer profile not found.' });
  }

  const farmName = farmerUser.farmDetails?.farmName || `${farmerUser.name}'s Farm`;
  const location = sanitizeString(originLocation) || farmerUser.farmDetails?.farmLocation || 'Maharashtra, India';

  const categoryImages = {
    'Fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
    'Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'Grains & Pulses': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    'Dairy & Poultry': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    'Organic & Special': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80'
  };

  const selectedImages = (images && images.length > 0 && images[0].trim() !== '') 
    ? images 
    : [categoryImages[category] || categoryImages['Vegetables']];

  const qty = parsedQty;
  const status = qty === 0 ? 'out_of_stock' : (qty <= 10 ? 'low_stock' : 'in_stock');

  const product = await dataService.createProduct({
    title: sanitizeString(title),
    farmer: req.user.id,
    farmerName: farmerUser.name,
    farmName,
    category: sanitizeString(category),
    price: parsedPrice,
    unit: sanitizeString(unit) || 'kg',
    availableQuantity: qty,
    minOrderQuantity: Number(minOrderQuantity) || 1,
    harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
    shelfLifeDays: Number(shelfLifeDays) || 7,
    isOrganic: Boolean(isOrganic),
    farmingMethod: sanitizeString(farmingMethod) || (isOrganic ? 'Organic Certified' : 'Conventional'),
    organicCertNo: sanitizeString(organicCertNo) || farmerUser.farmDetails?.certificationNumber || '',
    description: sanitizeString(description),
    images: selectedImages,
    originLocation: location,
    status,
    rating: 5.0,
    numReviews: 0
  });

  res.status(201).json({
    success: true,
    message: 'Produce listed successfully on KrishiDirect Marketplace!',
    product
  });
};

// Allowlisted fields that a farmer/admin is permitted to update
const PRODUCT_MUTABLE_FIELDS = [
  'title', 'description', 'category', 'price', 'unit', 'availableQuantity',
  'minOrderQuantity', 'harvestDate', 'shelfLifeDays', 'isOrganic',
  'farmingMethod', 'organicCertNo', 'images', 'originLocation', 'status'
];

const updateProduct = async (req, res) => {
  const product = await dataService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Strict Farmer Ownership Check
  const farmerIdStr = product.farmer._id ? product.farmer._id.toString() : product.farmer.toString();
  if (farmerIdStr !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. You can only edit produce items listed by your own farm.' });
  }

  // Explicit allowlist — prevent mass assignment of farmer, rating, numReviews etc.
  const updateFields = {};
  for (const key of PRODUCT_MUTABLE_FIELDS) {
    if (req.body[key] !== undefined) {
      updateFields[key] = typeof req.body[key] === 'string' ? sanitizeString(req.body[key]) : req.body[key];
    }
  }

  if (updateFields.availableQuantity !== undefined) {
    const qty = Number(updateFields.availableQuantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be negative.' });
    }
    updateFields.status = qty === 0 ? 'out_of_stock' : (qty <= 10 ? 'low_stock' : 'in_stock');
  }

  if (updateFields.harvestDate) {
    updateFields.harvestDate = new Date(updateFields.harvestDate);
  }

  if (updateFields.price !== undefined) {
    updateFields.price = Number(updateFields.price);
    if (isNaN(updateFields.price) || updateFields.price <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number.' });
    }
  }

  const updatedProduct = await dataService.updateProduct(req.params.id, updateFields);

  res.json({
    success: true,
    message: 'Produce listing updated successfully.',
    product: updatedProduct
  });
};

const updateInventory = async (req, res) => {
  const { availableQuantity, status } = req.body;
  const product = await dataService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const farmerIdStr = product.farmer._id ? product.farmer._id.toString() : product.farmer.toString();
  if (farmerIdStr !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. You can only update inventory for produce items from your own farm.' });
  }

  const updateFields = {};
  if (availableQuantity !== undefined) {
    const qty = Number(availableQuantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, message: 'Available quantity must be a non-negative number.' });
    }
    updateFields.availableQuantity = qty;
    updateFields.status = qty === 0 ? 'out_of_stock' : (qty <= 10 ? 'low_stock' : 'in_stock');
  }

  if (status) {
    if (!['in_stock', 'low_stock', 'out_of_stock'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid stock status value.' });
    }
    updateFields.status = status;
    if (status === 'out_of_stock' && updateFields.availableQuantity === undefined) {
      updateFields.availableQuantity = 0;
    }
  }

  const updatedProduct = await dataService.updateProduct(req.params.id, updateFields);
  res.json({
    success: true,
    message: 'Produce inventory updated successfully.',
    product: updatedProduct
  });
};

const deleteProduct = async (req, res) => {
  const product = await dataService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Strict Farmer Ownership Check
  const farmerIdStr = product.farmer._id ? product.farmer._id.toString() : product.farmer.toString();
  if (farmerIdStr !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. You can only delete produce items from your own farm.' });
  }

  await dataService.deleteProduct(req.params.id);

  res.json({
    success: true,
    message: 'Produce listing deactivated/unlisted from marketplace.'
  });
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, updateInventory, deleteProduct };
