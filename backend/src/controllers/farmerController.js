const dataService = require('../services/dataService');
const { normalizeStatus } = require('../utils/orderStateMachine');

// Public farmer profile for consumers
const getFarmerProfile = async (req, res) => {
  const farmer = await dataService.findUserById(req.params.id);
  if (!farmer || farmer.role !== 'farmer') {
    return res.status(404).json({ success: false, message: 'Farmer profile not found.' });
  }

  const products = await dataService.getProducts({ farmerId: req.params.id, status: 'in_stock' });

  res.json({
    success: true,
    farmer: {
      id: farmer._id,
      name: farmer.name,
      avatar: farmer.avatar,
      farmDetails: farmer.farmDetails,
      createdAt: farmer.createdAt
    },
    products
  });
};

// Private farmer profile for logged-in farmer management
const getMyFarmerProfile = async (req, res) => {
  const farmer = await dataService.findUserById(req.user.id);
  if (!farmer || farmer.role !== 'farmer') {
    return res.status(404).json({ success: false, message: 'Farmer account not found.' });
  }

  res.json({
    success: true,
    farmer: {
      id: farmer._id,
      name: farmer.name,
      email: farmer.email,
      phone: farmer.phone,
      avatar: farmer.avatar,
      role: farmer.role,
      farmDetails: farmer.farmDetails,
      addresses: farmer.addresses,
      createdAt: farmer.createdAt
    }
  });
};

// Farmer Dashboard Overview Metrics
const getFarmerDashboardMetrics = async (req, res) => {
  const farmerId = req.user.id;

  // Strict Farmer Ownership Scope
  const products = await dataService.getProducts({ farmerId });
  const orders = await dataService.getOrders({ farmerId });

  let totalEarnings = 0;
  let pendingOrders = 0;
  let activeDeliveries = 0;
  let completedOrders = 0;

  for (const order of orders) {
    const farmerItems = (order.items || []).filter(item => {
      const fId = item.farmer?._id ? item.farmer._id.toString() : item.farmer?.toString();
      return fId === farmerId.toString();
    });
    const farmerItemsSubtotal = farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const norm = normalizeStatus(order.orderStatus);
    if (order.paymentStatus === 'paid' || norm === 'DELIVERED') {
      totalEarnings += Math.round(farmerItemsSubtotal * 0.95); // Net after 5% platform fee
    }

    if (norm === 'PENDING') {
      pendingOrders++;
    } else if (['CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(norm)) {
      activeDeliveries++;
    } else if (norm === 'DELIVERED') {
      completedOrders++;
    }
  }

  const activeProducts = products.filter(p => p.status === 'in_stock').length;
  const lowStockCount = products.filter(p => p.availableQuantity <= 10 && p.availableQuantity > 0).length;
  const outOfStockCount = products.filter(p => p.availableQuantity === 0 || p.status === 'out_of_stock').length;

  // Sanitize recent orders for farmer view (hide non-farmer items and customer sensitive PII)
  const recentOrders = orders.slice(0, 5).map(o => {
    const farmerItems = (o.items || []).filter(item => {
      const fId = item.farmer?._id ? item.farmer._id.toString() : item.farmer?.toString();
      return fId === farmerId.toString();
    });
    const farmerSubtotal = farmerItems.reduce((s, i) => s + (i.price * i.quantity), 0);

    return {
      _id: o._id,
      orderNumber: o.orderNumber,
      orderStatus: normalizeStatus(o.orderStatus),
      createdAt: o.createdAt,
      consumerName: o.consumerName,
      deliveryCity: o.deliveryAddress?.city || 'Local',
      deliverySlot: o.deliverySlot,
      items: farmerItems,
      farmerSubtotal,
      netPayout: Math.round(farmerSubtotal * 0.95)
    };
  });

  res.json({
    success: true,
    metrics: {
      totalOrders: orders.length,
      pendingOrders,
      activeDeliveries,
      completedOrders,
      totalEarnings,
      totalProducts: products.length,
      activeProducts,
      lowStockCount,
      outOfStockCount
    },
    recentOrders,
    productsList: products.slice(0, 8)
  });
};

// Dedicated Farmer Sales Summary Endpoint
const getFarmerSalesSummary = async (req, res) => {
  const farmerId = req.user.id;
  const { period = '30days', startDate, endDate } = req.query;

  const orders = await dataService.getOrders({ farmerId });

  // Determine time boundary
  const now = new Date();
  let filterStart = null;
  let filterEnd = now;

  if (period === 'today') {
    filterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === '7days') {
    filterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30days') {
    filterStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (period === 'custom' && startDate) {
    filterStart = new Date(startDate);
    if (endDate) filterEnd = new Date(endDate);
  }

  // Filter orders by date if filterStart is set
  const scopedOrders = filterStart
    ? orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= filterStart && orderDate <= filterEnd;
      })
    : orders;

  let grossSales = 0;
  let completedOrders = 0;
  let pendingOrders = 0;
  let activeOrders = 0;
  let totalUnitsSold = 0;

  const productStatsMap = {};
  const timelineMap = {};

  for (const order of scopedOrders) {
    const norm = normalizeStatus(order.orderStatus);
    const orderDateKey = new Date(order.createdAt).toISOString().split('T')[0];

    if (!timelineMap[orderDateKey]) {
      timelineMap[orderDateKey] = { date: orderDateKey, gross: 0, net: 0, orders: 0 };
    }

    const farmerItems = (order.items || []).filter(item => {
      const fId = item.farmer?._id ? item.farmer._id.toString() : item.farmer?.toString();
      return fId === farmerId.toString();
    });

    const orderFarmerTotal = farmerItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    const orderFarmerNet = Math.round(orderFarmerTotal * 0.95);

    if (norm === 'DELIVERED') {
      completedOrders++;
      grossSales += orderFarmerTotal;
      timelineMap[orderDateKey].gross += orderFarmerTotal;
      timelineMap[orderDateKey].net += orderFarmerNet;
      timelineMap[orderDateKey].orders++;

      for (const item of farmerItems) {
        totalUnitsSold += Number(item.quantity || 0);
        const prodId = item.product?._id ? item.product._id.toString() : item.product?.toString() || item.title;
        if (!productStatsMap[prodId]) {
          productStatsMap[prodId] = {
            id: prodId,
            title: item.title,
            unit: item.unit,
            unitsSold: 0,
            revenue: 0
          };
        }
        productStatsMap[prodId].unitsSold += Number(item.quantity || 0);
        productStatsMap[prodId].revenue += (item.price * item.quantity);
      }
    } else if (norm === 'PENDING') {
      pendingOrders++;
    } else if (['CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(norm)) {
      activeOrders++;
    }
  }

  const platformFee = Math.round(grossSales * 0.05);
  const netEarnings = grossSales - platformFee;
  const avgOrderValue = completedOrders > 0 ? Math.round(grossSales / completedOrders) : 0;

  // Sort top products
  const topProducts = Object.values(productStatsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Timeline list (sorted chronologically)
  const timeline = Object.values(timelineMap).sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json({
    success: true,
    period,
    summary: {
      grossSales,
      platformFee,
      netEarnings,
      completedOrders,
      pendingOrders,
      activeOrders,
      totalUnitsSold,
      avgOrderValue,
      commissionRatePercent: 5
    },
    topProducts,
    timeline
  });
};

// Update Farmer Personal and Farm Credentials
const updateFarmerFarmProfile = async (req, res) => {
  const farmerId = req.user.id;
  const { 
    name, 
    phone, 
    avatar, 
    farmName, 
    farmLocation, 
    state, 
    district, 
    sizeInAcres, 
    primaryCrops, 
    farmingMethod, 
    isOrganicCertified,
    certificationNumber,
    bio, 
    bankDetails 
  } = req.body;

  const farmer = await dataService.findUserById(farmerId);
  if (!farmer || farmer.role !== 'farmer') {
    return res.status(403).json({ success: false, message: 'Only registered farmers can update farmer profile.' });
  }

  // Normalize crops array
  let cropsArray = farmer.farmDetails?.primaryCrops || ['Vegetables'];
  if (Array.isArray(primaryCrops)) {
    cropsArray = primaryCrops.filter(Boolean);
  } else if (typeof primaryCrops === 'string') {
    cropsArray = primaryCrops.split(',').map(c => c.trim()).filter(Boolean);
  }

  const updatedFarmDetails = {
    ...farmer.farmDetails,
    farmName: farmName || farmer.farmDetails?.farmName,
    farmLocation: farmLocation || farmer.farmDetails?.farmLocation,
    state: state || farmer.farmDetails?.state,
    district: district || farmer.farmDetails?.district,
    sizeInAcres: sizeInAcres !== undefined ? Number(sizeInAcres) : farmer.farmDetails?.sizeInAcres,
    primaryCrops: cropsArray,
    farmingMethod: farmingMethod || farmer.farmDetails?.farmingMethod || 'Organic',
    isOrganicCertified: isOrganicCertified !== undefined ? Boolean(isOrganicCertified) : farmer.farmDetails?.isOrganicCertified,
    certificationNumber: certificationNumber !== undefined ? certificationNumber : farmer.farmDetails?.certificationNumber,
    bio: bio !== undefined ? bio : farmer.farmDetails?.bio,
    bankDetails: bankDetails || farmer.farmDetails?.bankDetails,
    // SYSTEM CONTROLLED: farmer CANNOT mutate verificationStatus or admin notes
    verificationStatus: farmer.farmDetails?.verificationStatus || 'pending',
    verificationNotes: farmer.farmDetails?.verificationNotes || 'Awaiting admin review.'
  };

  const updateFields = {
    farmDetails: updatedFarmDetails
  };

  if (name && name.trim()) updateFields.name = name.trim();
  if (phone && phone.trim()) updateFields.phone = phone.trim();
  if (avatar && avatar.trim()) updateFields.avatar = avatar.trim();

  const updatedUser = await dataService.updateUser(farmerId, updateFields);

  res.json({
    success: true,
    message: 'Farmer profile updated successfully.',
    farmer: updatedUser
  });
};

// Public verified farmers catalog
const getAllVerifiedFarmers = async (req, res) => {
  const farmers = await dataService.getAllFarmers({ verificationStatus: 'verified' });
  const sanitized = farmers.map(f => ({
    id: f._id,
    name: f.name,
    avatar: f.avatar,
    farmDetails: f.farmDetails ? {
      farmName: f.farmDetails.farmName,
      farmLocation: f.farmDetails.farmLocation,
      state: f.farmDetails.state,
      district: f.farmDetails.district,
      primaryCrops: f.farmDetails.primaryCrops,
      farmingMethod: f.farmDetails.farmingMethod,
      isOrganicCertified: f.farmDetails.isOrganicCertified,
      rating: f.farmDetails.rating,
      reviewCount: f.farmDetails.reviewCount
    } : null
  }));

  res.json({
    success: true,
    count: sanitized.length,
    farmers: sanitized
  });
};

module.exports = { 
  getFarmerProfile, 
  getMyFarmerProfile,
  getFarmerDashboardMetrics, 
  getFarmerSalesSummary,
  updateFarmerFarmProfile,
  getAllVerifiedFarmers 
};
