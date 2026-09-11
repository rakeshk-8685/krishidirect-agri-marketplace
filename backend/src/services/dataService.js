const mongoose = require('mongoose');
const { getMongoStatus } = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { normalizeStatus } = require('../utils/orderStateMachine');
const bcrypt = require('bcryptjs');

// In-Memory Fallback State (holds data if MongoDB daemon is offline)
let memoryUsers = [];
let memoryProducts = [];
let memoryOrders = [];
let memoryReviews = [];

let isInitialized = false;
let platformCommissionRate = 5; // Default 5% platform commission fee

// Pre-seeded high quality realistic data
const initialUsers = [
  {
    _id: '66d8e0010000000000000001',
    name: 'Admin Supervisor',
    email: 'admin@agridirect.in',
    password: '', // will be hashed in init
    phone: '+91 9876543210',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    addresses: [{ label: 'Office', addressLine: '102 Tech Park, Sector 5', city: 'Pune', state: 'Maharashtra', pincode: '411057', isDefault: true }],
    isActive: true,
    createdAt: new Date('2026-01-01')
  },
  {
    _id: '66d8e0010000000000000002',
    name: 'Ramesh Patil',
    email: 'farmer.ramesh@agridirect.in',
    password: '', // hashed
    phone: '+91 9822104567',
    role: 'farmer',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=250&q=80',
    farmDetails: {
      farmName: 'Patil Organic Farms',
      farmLocation: 'Ratnagiri, Konkan Belt',
      state: 'Maharashtra',
      district: 'Ratnagiri',
      sizeInAcres: 12,
      primaryCrops: ['Alphonso Mangoes', 'Cashews', 'Spices'],
      isOrganicCertified: true,
      certificationNumber: 'IND-ORG-2024-8849',
      bio: 'Family-owned 3rd generation organic farm specializing in GI-Tagged Ratnagiri Alphonso Mangoes and fresh tree-harvested fruits.',
      verificationStatus: 'verified',
      bankDetails: { accountHolder: 'Ramesh Patil', accountNumber: '987612345678', ifscCode: 'SBIN0001234', upiId: 'ramesh.patil@okicici' },
      rating: 4.9,
      reviewCount: 48,
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80']
    },
    addresses: [{ label: 'Farm Depot', addressLine: 'Gat No 42, Post Murud', city: 'Ratnagiri', state: 'Maharashtra', pincode: '415612', isDefault: true }],
    isActive: true,
    createdAt: new Date('2026-01-10')
  },
  {
    _id: '66d8e0010000000000000003',
    name: 'Gurpreet Singh',
    email: 'farmer.gurpreet@agridirect.in',
    password: '',
    phone: '+91 9814098765',
    role: 'farmer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    farmDetails: {
      farmName: 'Golden Grain Acres',
      farmLocation: 'Ludhiana Plains',
      state: 'Punjab',
      district: 'Ludhiana',
      sizeInAcres: 25,
      primaryCrops: ['Traditional Basmati Rice', 'Sharbati Wheat', 'Mustard Green'],
      isOrganicCertified: true,
      certificationNumber: 'IND-ORG-2023-1029',
      bio: 'Sustaining rich soil traditions with zero pesticide residue. Producers of extra long grain aromatic Basmati rice.',
      verificationStatus: 'verified',
      bankDetails: { accountHolder: 'Gurpreet Singh', accountNumber: '112233445566', ifscCode: 'HDFC0000999', upiId: 'gurpreet.gold@okhdfc' },
      rating: 4.8,
      reviewCount: 32,
      images: ['https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80']
    },
    addresses: [{ label: 'Farm Office', addressLine: 'GT Road Near Grain Market', city: 'Ludhiana', state: 'Punjab', pincode: '141001', isDefault: true }],
    isActive: true,
    createdAt: new Date('2026-01-15')
  },
  {
    _id: '66d8e0010000000000000004',
    name: 'Lakshmi Devi',
    email: 'farmer.lakshmi@agridirect.in',
    password: '',
    phone: '+91 9448012345',
    role: 'farmer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    farmDetails: {
      farmName: 'Green Valley Dairy & Produce',
      farmLocation: 'Wayanad Hills',
      state: 'Kerala',
      district: 'Wayanad',
      sizeInAcres: 8,
      primaryCrops: ['Fresh A2 Desi Cow Milk', 'Hill Bananas', 'Black Pepper'],
      isOrganicCertified: true,
      certificationNumber: 'IND-ORG-2025-4412',
      bio: 'Pasture-raised indigenous cows and natural spices harvested using traditional eco-farming methods.',
      verificationStatus: 'verified',
      bankDetails: { accountHolder: 'Lakshmi Devi', accountNumber: '556677889900', ifscCode: 'CNRB0002233', upiId: 'lakshmi.dairy@okaxis' },
      rating: 4.95,
      reviewCount: 64,
      images: ['https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80']
    },
    addresses: [{ label: 'Homestead', addressLine: 'Green Valley Estate, Vythiri', city: 'Wayanad', state: 'Kerala', pincode: '673576', isDefault: true }],
    isActive: true,
    createdAt: new Date('2026-01-20')
  },
  {
    _id: '66d8e0010000000000000005',
    name: 'Ananya Sharma',
    email: 'consumer@gmail.com',
    password: '',
    phone: '+91 9811223344',
    role: 'consumer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    addresses: [
      { label: 'Home', addressLine: 'Flat 402, Sunshine Apartments, MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', isDefault: true },
      { label: 'Parents House', addressLine: '12 Green Park Extension', city: 'Delhi', state: 'Delhi', pincode: '110016', isDefault: false }
    ],
    isActive: true,
    createdAt: new Date('2026-02-01')
  }
];

const initialProducts = [
  {
    _id: '66d8e1010000000000000011',
    title: 'GI-Tagged Ratnagiri Alphonso Mangoes (Hapus)',
    farmer: '66d8e0010000000000000002',
    farmerName: 'Ramesh Patil',
    farmName: 'Patil Organic Farms',
    category: 'Fruits',
    price: 850,
    unit: 'dozen',
    availableQuantity: 45,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-05-10'),
    shelfLifeDays: 10,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2024-8849',
    description: 'Authentic Ratnagiri Alphonso Mangoes freshly handpicked from coastal Konkan orchards. Naturally tree-ripened without carbide or chemicals. Unmatched aroma and sweet velvety pulp.',
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Ratnagiri, Maharashtra',
    status: 'in_stock',
    rating: 4.9,
    numReviews: 24,
    featured: true
  },
  {
    _id: '66d8e1010000000000000012',
    title: 'Organic Vine-Ripened Desi Tomatoes',
    farmer: '66d8e0010000000000000002',
    farmerName: 'Ramesh Patil',
    farmName: 'Patil Organic Farms',
    category: 'Vegetables',
    price: 45,
    unit: 'kg',
    availableQuantity: 120,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-05-12'),
    shelfLifeDays: 7,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2024-8849',
    description: 'Juicy, tangy organic tomatoes grown using neem oil protection and natural compost. Rich in antioxidants and perfect for daily cooking.',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Ratnagiri, Maharashtra',
    status: 'in_stock',
    rating: 4.7,
    numReviews: 14,
    featured: true
  },
  {
    _id: '66d8e1010000000000000013',
    title: 'Extra Long Grain Traditional Basmati Rice (1121 Raw)',
    farmer: '66d8e0010000000000000003',
    farmerName: 'Gurpreet Singh',
    farmName: 'Golden Grain Acres',
    category: 'Grains & Pulses',
    price: 160,
    unit: 'kg',
    availableQuantity: 500,
    minOrderQuantity: 5,
    harvestDate: new Date('2026-04-15'),
    shelfLifeDays: 365,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2023-1029',
    description: 'Aged for 12 months for fluffy non-sticky grains that expand up to 2.5x in size when cooked. Distinct natural aroma straight from Punjab canal-irrigated fields.',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Ludhiana, Punjab',
    status: 'in_stock',
    rating: 4.95,
    numReviews: 38,
    featured: true
  },
  {
    _id: '66d8e1010000000000000014',
    title: 'Fresh Farm A2 Gir Cow Milk (Chilled Glass Bottle)',
    farmer: '66d8e0010000000000000004',
    farmerName: 'Lakshmi Devi',
    farmName: 'Green Valley Dairy & Produce',
    category: 'Dairy & Poultry',
    price: 85,
    unit: 'liter',
    availableQuantity: 60,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-05-14'),
    shelfLifeDays: 3,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2025-4412',
    description: 'Pure 100% A2 Beta-Casein milk from free-range indigenous Gir cows fed on green pasture and herbal forage. Unprocessed, zero preservatives.',
    images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Wayanad, Kerala',
    status: 'in_stock',
    rating: 4.98,
    numReviews: 52,
    featured: true
  },
  {
    _id: '66d8e1010000000000000015',
    title: 'Cold-Pressed Raw Organic Wildflower Honey',
    farmer: '66d8e0010000000000000004',
    farmerName: 'Lakshmi Devi',
    farmName: 'Green Valley Dairy & Produce',
    category: 'Organic & Special',
    price: 450,
    unit: 'packet',
    availableQuantity: 30,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-03-20'),
    shelfLifeDays: 730,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2025-4412',
    description: 'Unfiltered, unheated, raw wildflower honey collected directly from sustainable bee boxes in Wayanad forest fringes. Retains all natural pollen and enzymes.',
    images: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Wayanad, Kerala',
    status: 'in_stock',
    rating: 4.88,
    numReviews: 19,
    featured: false
  },
  {
    _id: '66d8e1010000000000000016',
    title: 'Fresh Red Nashik Onions (Export Quality)',
    farmer: '66d8e0010000000000000002',
    farmerName: 'Ramesh Patil',
    farmName: 'Patil Organic Farms',
    category: 'Vegetables',
    price: 32,
    unit: 'kg',
    availableQuantity: 300,
    minOrderQuantity: 2,
    harvestDate: new Date('2026-05-01'),
    shelfLifeDays: 30,
    isOrganic: false,
    description: 'Crisp, pungent red onions harvested from Nashik belt. Well dried for extended shelf storage with crisp skin.',
    images: ['https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Nashik, Maharashtra',
    status: 'in_stock',
    rating: 4.6,
    numReviews: 11,
    featured: false
  },
  {
    _id: '66d8e1010000000000000017',
    title: 'Organic Shimla Red Royal Apples (Crisp & Juicy)',
    farmer: '66d8e0010000000000000002',
    farmerName: 'Ramesh Patil',
    farmName: 'Patil Organic Farms',
    category: 'Fruits',
    price: 180,
    unit: 'kg',
    availableQuantity: 150,
    minOrderQuantity: 2,
    harvestDate: new Date('2026-05-08'),
    shelfLifeDays: 21,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2024-8849',
    description: 'Crisp, sweet, high-altitude handpicked Red Royal apples from snow-fed hillside orchards. Wax-free, pesticide-free, and full of natural crunch.',
    images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Shimla, Himachal Pradesh',
    status: 'in_stock',
    rating: 4.92,
    numReviews: 31,
    featured: true
  },
  {
    _id: '66d8e1010000000000000018',
    title: 'Traditional Vedic Bilona A2 Desi Gir Cow Ghee',
    farmer: '66d8e0010000000000000004',
    farmerName: 'Lakshmi Devi',
    farmName: 'Green Valley Dairy & Produce',
    category: 'Dairy & Poultry',
    price: 1450,
    unit: 'liter',
    availableQuantity: 40,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-05-12'),
    shelfLifeDays: 365,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2025-4412',
    description: 'Crafted using the ancient two-way wooden bilona churning of cultured A2 curd, slow simmered on cow dung cakes. Golden, granular, aromatic and gut-friendly.',
    images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Wayanad, Kerala',
    status: 'in_stock',
    rating: 4.97,
    numReviews: 44,
    featured: true
  },
  {
    _id: '66d8e1010000000000000019',
    title: 'GI-Tagged High Curcumin Lakadong Turmeric Powder (8%+ Curcumin)',
    farmer: '66d8e0010000000000000004',
    farmerName: 'Lakshmi Devi',
    farmName: 'Green Valley Dairy & Produce',
    category: 'Organic & Special',
    price: 320,
    unit: 'packet',
    availableQuantity: 80,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-04-10'),
    shelfLifeDays: 540,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2025-4412',
    description: 'Renowned world over for naturally containing 8-10% curcumin. Sun-dried and slow stone-milled to protect therapeutic volatile oils.',
    images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Jaintia Hills, Meghalaya',
    status: 'in_stock',
    rating: 4.94,
    numReviews: 28,
    featured: true
  },
  {
    _id: '66d8e1010000000000000020',
    title: 'Fresh Farm Tender Baby Spinach / Palak (Dawn Harvest)',
    farmer: '66d8e0010000000000000002',
    farmerName: 'Ramesh Patil',
    farmName: 'Patil Organic Farms',
    category: 'Vegetables',
    price: 35,
    unit: 'bunch',
    availableQuantity: 95,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-05-14'),
    shelfLifeDays: 5,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2024-8849',
    description: 'Tender baby spinach leaves hand-cut at 5:00 AM while the morning dew is still on the plants. Washed with pure well water, zero chemical residue.',
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Ratnagiri, Maharashtra',
    status: 'in_stock',
    rating: 4.85,
    numReviews: 17,
    featured: true
  },
  {
    _id: '66d8e1010000000000000021',
    title: 'Cold-Pressed Raw Wood-Pressed Mustard Oil (Kachi Ghani)',
    farmer: '66d8e0010000000000000003',
    farmerName: 'Gurpreet Singh',
    farmName: 'Golden Grain Acres',
    category: 'Organic & Special',
    price: 210,
    unit: 'liter',
    availableQuantity: 120,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-04-25'),
    shelfLifeDays: 365,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2023-1029',
    description: 'Extracted slowly on wooden kolhu without any artificial heat or solvent chemicals. Retains pungent natural aroma and vital omega-3 fatty acids.',
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Ludhiana, Punjab',
    status: 'in_stock',
    rating: 4.88,
    numReviews: 22,
    featured: false
  },
  {
    _id: '66d8e1010000000000000022',
    title: 'Unpolished Native Desi Toor / Arhar Dal',
    farmer: '66d8e0010000000000000003',
    farmerName: 'Gurpreet Singh',
    farmName: 'Golden Grain Acres',
    category: 'Grains & Pulses',
    price: 165,
    unit: 'kg',
    availableQuantity: 250,
    minOrderQuantity: 2,
    harvestDate: new Date('2026-03-30'),
    shelfLifeDays: 365,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2023-1029',
    description: 'Stone chakki split native yellow toor dal with zero oil, water, or color polishing. Cooks faster and delivers authentic rich homestyle flavor.',
    images: ['https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Latur, Maharashtra',
    status: 'in_stock',
    rating: 4.9,
    numReviews: 29,
    featured: true
  },
  {
    _id: '66d8e1010000000000000023',
    title: 'Kashmiri Kagzi Walnuts & Royal Kesar Combo',
    farmer: '66d8e0010000000000000002',
    farmerName: 'Ramesh Patil',
    farmName: 'Patil Organic Farms',
    category: 'Organic & Special',
    price: 780,
    unit: 'packet',
    availableQuantity: 50,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-03-15'),
    shelfLifeDays: 240,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2024-8849',
    description: 'Thin-shelled easy-to-crack Kashmiri Kagzi walnuts packed with pure omega-3 paired with 1g GI-Tagged certified Pampore saffron (kesar).',
    images: ['https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Pampore, Jammu & Kashmir',
    status: 'in_stock',
    rating: 4.96,
    numReviews: 33,
    featured: true
  },
  {
    _id: '66d8e1010000000000000024',
    title: 'Certified Organic Kolhapuri Desi Jaggery Cubes (No Chemicals)',
    farmer: '66d8e0010000000000000002',
    farmerName: 'Ramesh Patil',
    farmName: 'Patil Organic Farms',
    category: 'Organic & Special',
    price: 85,
    unit: 'kg',
    availableQuantity: 200,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-04-05'),
    shelfLifeDays: 300,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2024-8849',
    description: 'Traditionally prepared from freshly squeezed single-farm sugarcane juice clarified with organic ladyfinger mucilage. No hydros or artificial bleach.',
    images: ['https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Kolhapur, Maharashtra',
    status: 'in_stock',
    rating: 4.87,
    numReviews: 21,
    featured: false
  },
  {
    _id: '66d8e1010000000000000025',
    title: 'Freshly Picked White Button Mushrooms (Solan Crop)',
    farmer: '66d8e0010000000000000004',
    farmerName: 'Lakshmi Devi',
    farmName: 'Green Valley Dairy & Produce',
    category: 'Vegetables',
    price: 65,
    unit: 'punnet',
    availableQuantity: 70,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-05-14'),
    shelfLifeDays: 4,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2025-4412',
    description: 'Plump, firm, spotless white button mushrooms grown in pristine climate-controlled alpine rooms. Excellent source of plant protein and vitamin D.',
    images: ['https://images.unsplash.com/photo-1509783236416-c9ad59bae472?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Solan, Himachal Pradesh',
    status: 'in_stock',
    rating: 4.79,
    numReviews: 15,
    featured: false
  },
  {
    _id: '66d8e1010000000000000026',
    title: 'Single-Estate Shade-Grown Coorg Arabica Coffee Beans',
    farmer: '66d8e0010000000000000004',
    farmerName: 'Lakshmi Devi',
    farmName: 'Green Valley Dairy & Produce',
    category: 'Organic & Special',
    price: 380,
    unit: 'packet',
    availableQuantity: 60,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-03-01'),
    shelfLifeDays: 365,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2025-4412',
    description: 'Hand-picked red coffee cherries grown under natural jungle canopy in Western Ghats. Medium roasted with notes of chocolate, caramel, and citrus.',
    images: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Coorg, Karnataka',
    status: 'in_stock',
    rating: 4.93,
    numReviews: 36,
    featured: true
  },
  {
    _id: '66d8e1010000000000000027',
    title: 'Heritage Manipuri Black Rice (Chak-Hao Forbidden Rice)',
    farmer: '66d8e0010000000000000003',
    farmerName: 'Gurpreet Singh',
    farmName: 'Golden Grain Acres',
    category: 'Grains & Pulses',
    price: 240,
    unit: 'kg',
    availableQuantity: 110,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-04-10'),
    shelfLifeDays: 365,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2023-1029',
    description: 'Deep purple-black ancient grain loaded with anthocyanin antioxidants. Features a rich nutty aroma and delightful purple hue when cooked.',
    images: ['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Imphal Valley, Manipur',
    status: 'in_stock',
    rating: 4.91,
    numReviews: 19,
    featured: false
  },
  {
    _id: '66d8e1010000000000000028',
    title: 'Single-Origin Grade-A Bold Green Cardamom (Elaichi)',
    farmer: '66d8e0010000000000000004',
    farmerName: 'Lakshmi Devi',
    farmName: 'Green Valley Dairy & Produce',
    category: 'Organic & Special',
    price: 490,
    unit: 'packet',
    availableQuantity: 75,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-04-20'),
    shelfLifeDays: 540,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2025-4412',
    description: 'Extra-bold 8mm+ vibrant green cardamom pods bursting with natural fragrant oils. Hand-harvested in high-altitude Cardamom Hills.',
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Idukki, Kerala',
    status: 'in_stock',
    rating: 4.95,
    numReviews: 27,
    featured: true
  },
  {
    _id: '66d8e1010000000000000029',
    title: 'Nagpur Sweet Mandarin Oranges (Direct Orchard Pick)',
    farmer: '66d8e0010000000000000002',
    farmerName: 'Ramesh Patil',
    farmName: 'Patil Organic Farms',
    category: 'Fruits',
    price: 90,
    unit: 'kg',
    availableQuantity: 220,
    minOrderQuantity: 2,
    harvestDate: new Date('2026-05-11'),
    shelfLifeDays: 14,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2024-8849',
    description: 'Juicy, thin-skinned, sweet and tangy Nagpur oranges picked directly from tree branches. Unwaxed, rich in natural Vitamin C.',
    images: ['https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Nagpur, Maharashtra',
    status: 'in_stock',
    rating: 4.86,
    numReviews: 23,
    featured: true
  },
  {
    _id: '66d8e1010000000000000030',
    title: 'Hydroponic Italian Sweet Basil & Salad Herb Bouquet',
    farmer: '66d8e0010000000000000002',
    farmerName: 'Ramesh Patil',
    farmName: 'Patil Organic Farms',
    category: 'Vegetables',
    price: 50,
    unit: 'bunch',
    availableQuantity: 85,
    minOrderQuantity: 1,
    harvestDate: new Date('2026-05-14'),
    shelfLifeDays: 6,
    isOrganic: true,
    organicCertNo: 'IND-ORG-2024-8849',
    description: 'Fragrant Genovese sweet basil and aromatic herbs grown using clean protected hydroponics. Shipped with roots wrapped in moisture sponge.',
    images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'],
    originLocation: 'Pune Hills, Maharashtra',
    status: 'in_stock',
    rating: 4.89,
    numReviews: 18,
    featured: false
  }
];

const initialOrders = [
  {
    _id: '66d8e2010000000000000021',
    orderNumber: 'ORD-2026-9041',
    consumer: '66d8e0010000000000000005',
    consumerName: 'Ananya Sharma',
    consumerPhone: '+91 9811223344',
    items: [
      {
        product: '66d8e1010000000000000011',
        title: 'GI-Tagged Ratnagiri Alphonso Mangoes (Hapus)',
        price: 850,
        unit: 'dozen',
        quantity: 2,
        farmer: '66d8e0010000000000000002',
        farmerName: 'Ramesh Patil',
        farmName: 'Patil Organic Farms'
      },
      {
        product: '66d8e1010000000000000012',
        title: 'Organic Vine-Ripened Desi Tomatoes',
        price: 45,
        unit: 'kg',
        quantity: 3,
        farmer: '66d8e0010000000000000002',
        farmerName: 'Ramesh Patil',
        farmName: 'Patil Organic Farms'
      }
    ],
    deliveryAddress: {
      label: 'Home',
      addressLine: 'Flat 402, Sunshine Apartments, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001'
    },
    subtotal: 1835,
    deliveryFee: 60,
    platformFee: 15,
    totalAmount: 1910,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    orderStatus: 'DELIVERED',
    statusHistory: [
      { status: 'pending', timestamp: new Date('2026-05-13T09:00:00Z'), note: 'Order placed by consumer' },
      { status: 'accepted', timestamp: new Date('2026-05-13T09:30:00Z'), note: 'Farmer accepted order' },
      { status: 'packing', timestamp: new Date('2026-05-13T11:00:00Z'), note: 'Packed with eco-cushioning crates' },
      { status: 'out_for_delivery', timestamp: new Date('2026-05-14T07:00:00Z'), note: 'Dispatched via KrishiExpress local logisitics' },
      { status: 'DELIVERED', timestamp: new Date('2026-05-14T14:00:00Z'), note: 'Delivered directly to consumer doorstep' }
    ],
    farmerNotes: 'Freshly packed directly from tree harvest yesterday.',
    estimatedDeliveryDate: new Date('2026-05-15'),
    createdAt: new Date('2026-05-13T09:00:00Z')
  }
];

const initialReviews = [
  {
    _id: '66d8e3010000000000000031',
    product: '66d8e1010000000000000011',
    consumer: '66d8e0010000000000000005',
    consumerName: 'Ananya Sharma',
    farmer: '66d8e0010000000000000002',
    rating: 5,
    comment: 'The mangoes were divine! Incredible aroma and no artificial ripening taste whatsoever. Buying again for my parents!',
    createdAt: new Date('2026-05-02')
  }
];

// Initialize Memory DB state & Sync to Mongo if connected
const initMemoryState = async () => {
  if (isInitialized) return;
  const defaultHash = await bcrypt.hash('Password@123', 10);
  
  memoryUsers = initialUsers.map(u => ({ ...u, password: defaultHash }));
  memoryProducts = [...initialProducts];
  memoryOrders = [...initialOrders];
  memoryReviews = [...initialReviews];
  isInitialized = true;
  console.log(`[DataService] Seed dataset initialized with ${memoryUsers.length} Users, ${memoryProducts.length} Products, and Active Orders.`);
};

const syncToMongo = async (force = false) => {
  try {
    if (!getMongoStatus()) return;
    if (!isInitialized) await initMemoryState();
    const productCount = await Product.countDocuments();
    if (productCount === 0 || force) {
      console.log('[DataService] Synchronizing seed dataset into MongoDB Atlas...');
      await User.deleteMany({});
      await Product.deleteMany({});
      await Order.deleteMany({});
      await Review.deleteMany({});

      await User.insertMany(memoryUsers);
      await Product.insertMany(memoryProducts);
      await Order.insertMany(memoryOrders);
      await Review.insertMany(memoryReviews);
      console.log(`[DataService] MongoDB Atlas successfully synchronized with ${memoryUsers.length} Users and ${memoryProducts.length} Products!`);
    }
  } catch (err) {
    console.error('[DataService] Mongo sync error:', err.message);
  }
};

// Auto initialize memory state
initMemoryState();

// --- DATA ACCESS LAYER WRAPPERS ---

const dataService = {
  // USER METHODS
  async findUserByEmail(email) {
    if (getMongoStatus()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    await initMemoryState();
    return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (getMongoStatus()) {
      return await User.findById(id).select('-password');
    }
    await initMemoryState();
    const u = memoryUsers.find(user => user._id.toString() === id.toString());
    if (!u) return null;
    const { password, ...userWithoutPass } = u;
    return userWithoutPass;
  },

  async createUser(userData) {
    if (getMongoStatus()) {
      const user = new User(userData);
      return await user.save();
    }
    await initMemoryState();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      _id: '66d8e0010000000000000' + Math.floor(1000 + Math.random() * 9000),
      ...userData,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date()
    };
    memoryUsers.push(newUser);
    const { password, ...createdWithoutPass } = newUser;
    return createdWithoutPass;
  },

  async updateUser(id, updateData) {
    if (getMongoStatus()) {
      return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }
    await initMemoryState();
    const index = memoryUsers.findIndex(u => u._id.toString() === id.toString());
    if (index === -1) return null;
    
    // Handle nested dot updates for memory fallback
    Object.keys(updateData).forEach(key => {
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        if (!memoryUsers[index][parent]) memoryUsers[index][parent] = {};
        memoryUsers[index][parent][child] = updateData[key];
      }
    });

    memoryUsers[index] = { ...memoryUsers[index], ...updateData };
    const { password, ...userWithoutPass } = memoryUsers[index];
    return userWithoutPass;
  },

  async getAllFarmers(filter = {}) {
    if (getMongoStatus()) {
      const query = { role: 'farmer' };
      if (filter.verificationStatus) {
        query['farmDetails.verificationStatus'] = filter.verificationStatus;
      }
      return await User.find(query).select('-password');
    }
    await initMemoryState();
    let result = memoryUsers.filter(u => u.role === 'farmer');
    if (filter.verificationStatus) {
      result = result.filter(u => u.farmDetails?.verificationStatus === filter.verificationStatus);
    }
    return result;
  },

  // PRODUCT METHODS
  async getProducts(params = {}) {
    const { category, isOrganic, search, farmerId, status, sort, location, farmingMethod, limit, skip } = params;
    // Clamp limit: default 48, never exceed 96 to prevent DoS via large result sets
    const pageLimit = Math.min(Number(limit) || 48, 96);
    const pageSkip  = Number(skip) || 0;
    
    if (getMongoStatus()) {
      const query = {};
      if (category && category !== 'All') query.category = category;
      if (isOrganic === 'true' || isOrganic === true) query.isOrganic = true;
      if (farmerId && farmerId !== 'All') query.farmer = farmerId;
      if (status && status !== 'All') query.status = status;
      if (location && location !== 'All') {
        query.originLocation = { $regex: location, $options: 'i' };
      }
      if (farmingMethod && farmingMethod !== 'All') {
        query.farmingMethod = farmingMethod;
      }
      if (search) {
        // Use the compound text index for search — avoids multiple $regex table scans
        query.$text = { $search: search };
      }
      
      let sortOpt = { createdAt: -1 };
      if (sort === 'price_asc') sortOpt = { price: 1 };
      if (sort === 'price_desc') sortOpt = { price: -1 };
      if (sort === 'rating') sortOpt = { rating: -1 };
      // Text search relevance sort when searching
      if (search && !sort) sortOpt = { score: { $meta: 'textScore' } };
      
      return await Product.find(query)
        .sort(sortOpt)
        .skip(pageSkip)
        .limit(pageLimit)
        .lean(); // Return plain objects (faster serialization, no Mongoose overhead)
    }

    await initMemoryState();
    let result = [...memoryProducts];

    if (category && category !== 'All') {
      result = result.filter(p => p.category === category);
    }
    if (isOrganic === 'true' || isOrganic === true) {
      result = result.filter(p => p.isOrganic === true);
    }
    if (farmerId && farmerId !== 'All') {
      result = result.filter(p => p.farmer.toString() === farmerId.toString());
    }
    if (status && status !== 'All') {
      result = result.filter(p => p.status === status);
    }
    if (location && location !== 'All') {
      const locTerm = location.toLowerCase();
      result = result.filter(p => (p.originLocation || '').toLowerCase().includes(locTerm));
    }
    if (farmingMethod && farmingMethod !== 'All') {
      result = result.filter(p => (p.farmingMethod || (p.isOrganic ? 'Organic Certified' : 'Conventional')) === farmingMethod);
    }
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.originLocation.toLowerCase().includes(term) ||
        p.farmName.toLowerCase().includes(term)
      );
    }

    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // Apply pagination in memory too
    return result.slice(pageSkip, pageSkip + pageLimit);
  },

  async getProductById(id) {
    if (!id) return null;
    if (getMongoStatus()) {
      try {
        // Populate only public fields shown on product detail page (smaller payload + PII protection)
        const prod = await Product.findById(id)
          .populate('farmer', 'name avatar farmDetails createdAt')
          .lean();
        if (prod) {
          if (prod.farmer?.farmDetails?.bankDetails) {
            delete prod.farmer.farmDetails.bankDetails;
          }
          return prod;
        }
      } catch (e) {
        // Fall through to memory fallback
      }
    }
    await initMemoryState();
    const product = memoryProducts.find(p => p._id.toString() === id.toString());
    if (!product) return null;
    const farmer = memoryUsers.find(u => u._id.toString() === product.farmer.toString());
    const farmerDetailsSanitized = farmer?.farmDetails ? {
      farmName: farmer.farmDetails.farmName,
      farmLocation: farmer.farmDetails.farmLocation,
      state: farmer.farmDetails.state,
      district: farmer.farmDetails.district,
      sizeInAcres: farmer.farmDetails.sizeInAcres,
      primaryCrops: farmer.farmDetails.primaryCrops,
      isOrganicCertified: farmer.farmDetails.isOrganicCertified,
      certificationNumber: farmer.farmDetails.certificationNumber,
      bio: farmer.farmDetails.bio,
      verificationStatus: farmer.farmDetails.verificationStatus,
      rating: farmer.farmDetails.rating,
      reviewCount: farmer.farmDetails.reviewCount,
      images: farmer.farmDetails.images
    } : null;

    return {
      ...product,
      farmer: farmer ? { 
        _id: farmer._id, 
        name: farmer.name, 
        farmDetails: farmerDetailsSanitized 
      } : null
    };
  },

  async createProduct(productData) {
    if (getMongoStatus()) {
      const product = new Product(productData);
      return await product.save();
    }
    await initMemoryState();
    const newProduct = {
      _id: '66d8e1010000000000000' + Math.floor(1000 + Math.random() * 9000),
      ...productData,
      rating: 5.0,
      numReviews: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryProducts.unshift(newProduct);
    return newProduct;
  },

  async updateProduct(id, updateData) {
    if (getMongoStatus()) {
      return await Product.findByIdAndUpdate(id, updateData, { new: true });
    }
    await initMemoryState();
    const idx = memoryProducts.findIndex(p => p._id.toString() === id.toString());
    if (idx === -1) return null;
    memoryProducts[idx] = { ...memoryProducts[idx], ...updateData, updatedAt: new Date() };
    return memoryProducts[idx];
  },

  async deleteProduct(id) {
    if (getMongoStatus()) {
      return await Product.findByIdAndDelete(id);
    }
    await initMemoryState();
    const idx = memoryProducts.findIndex(p => p._id.toString() === id.toString());
    if (idx === -1) return null;
    const removed = memoryProducts[idx];
    memoryProducts.splice(idx, 1);
    return removed;
  },

  // ORDER METHODS
  async createOrder(orderData) {
    const status = normalizeStatus(orderData.orderStatus || 'PENDING');
    
    if (getMongoStatus()) {
      // Atomic Inventory Deduction
      for (const item of orderData.items) {
        const updatedProd = await Product.findOneAndUpdate(
          { _id: item.product, availableQuantity: { $gte: item.quantity } },
          { $inc: { availableQuantity: -item.quantity } },
          { new: true }
        );
        if (!updatedProd) {
          throw new Error(`Insufficient inventory for produce item "${item.title}".`);
        }
      }

      const order = new Order({ ...orderData, orderStatus: status });
      return await order.save();
    }

    await initMemoryState();

    // Atomic Memory Inventory Check & Reservation
    for (const item of orderData.items) {
      const pIdx = memoryProducts.findIndex(p => p._id.toString() === item.product.toString());
      if (pIdx === -1 || memoryProducts[pIdx].availableQuantity < item.quantity) {
        throw new Error(`Insufficient inventory for produce item "${item.title}".`);
      }
    }

    // Deduct stock
    for (const item of orderData.items) {
      const pIdx = memoryProducts.findIndex(p => p._id.toString() === item.product.toString());
      if (pIdx !== -1) {
        memoryProducts[pIdx].availableQuantity -= item.quantity;
        if (memoryProducts[pIdx].availableQuantity === 0) {
          memoryProducts[pIdx].status = 'out_of_stock';
        } else if (memoryProducts[pIdx].availableQuantity <= 10) {
          memoryProducts[pIdx].status = 'low_stock';
        }
      }
    }

    const newOrder = {
      _id: '66d8e2010000000000000' + Math.floor(1000 + Math.random() * 9000),
      ...orderData,
      orderStatus: status,
      statusHistory: [
        { status, timestamp: new Date(), note: 'Order placed by customer' }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryOrders.unshift(newOrder);

    return newOrder;
  },

  async restoreOrderInventory(items) {
    if (!items || !items.length) return;
    for (const item of items) {
      if (getMongoStatus()) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { availableQuantity: item.quantity },
          $set: { status: 'in_stock' }
        });
      } else {
        const pIdx = memoryProducts.findIndex(p => p._id.toString() === item.product.toString());
        if (pIdx !== -1) {
          memoryProducts[pIdx].availableQuantity += item.quantity;
          memoryProducts[pIdx].status = 'in_stock';
        }
      }
    }
  },

  async getOrders(params = {}) {
    const { consumerId, farmerId, status, limit, skip } = params;
    const normStatus = status ? normalizeStatus(status) : null;
    // Consumer/farmer views: default 50 most recent; admin: up to 200
    const pageLimit = Math.min(Number(limit) || 50, 200);
    const pageSkip  = Number(skip) || 0;

    if (getMongoStatus()) {
      const query = {};
      if (consumerId) query.consumer = consumerId;
      if (farmerId) query['items.farmer'] = farmerId;
      if (normStatus) query.orderStatus = normStatus;
      return await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(pageSkip)
        .limit(pageLimit)
        .lean();
    }

    await initMemoryState();
    let result = [...memoryOrders];
    if (consumerId) {
      result = result.filter(o => o.consumer.toString() === consumerId.toString());
    }
    if (farmerId) {
      result = result.filter(o => o.items.some(item => item.farmer.toString() === farmerId.toString()));
    }
    if (normStatus) {
      result = result.filter(o => normalizeStatus(o.orderStatus) === normStatus);
    }
    return result.slice(pageSkip, pageSkip + pageLimit);
  },

  async getOrderById(id) {
    if (!id || id === 'undefined') return null;
    if (getMongoStatus()) {
      try {
        const query = mongoose.isValidObjectId(id)
          ? { $or: [{ _id: id }, { orderNumber: id }] }
          : { orderNumber: id };
        return await Order.findOne(query);
      } catch (e) {
        return null;
      }
    }
    await initMemoryState();
    return memoryOrders.find(o => o._id.toString() === id.toString() || o.orderNumber === id) || null;
  },

  async updateOrderStatus(id, newStatus, note = '') {
    if (!id || id === 'undefined') return null;
    const targetStatus = normalizeStatus(newStatus);

    if (getMongoStatus()) {
      let order;
      try {
        const query = mongoose.isValidObjectId(id)
          ? { $or: [{ _id: id }, { orderNumber: id }] }
          : { orderNumber: id };
        order = await Order.findOne(query);
      } catch (e) {
        return null;
      }
      if (!order) return null;
      
      const previousStatus = normalizeStatus(order.orderStatus);

      // Restore inventory if cancelling or rejecting
      if ((targetStatus === 'CANCELLED' || targetStatus === 'REJECTED') && 
          previousStatus !== 'CANCELLED' && previousStatus !== 'REJECTED') {
        await this.restoreOrderInventory(order.items);
      }

      order.orderStatus = targetStatus;
      order.statusHistory.push({ status: targetStatus, timestamp: new Date(), note });
      return await order.save();
    }

    await initMemoryState();
    const idx = memoryOrders.findIndex(o => o._id.toString() === id.toString() || o.orderNumber === id);
    if (idx === -1) return null;

    const previousStatus = normalizeStatus(memoryOrders[idx].orderStatus);

    // Restore inventory if cancelling or rejecting
    if ((targetStatus === 'CANCELLED' || targetStatus === 'REJECTED') && 
        previousStatus !== 'CANCELLED' && previousStatus !== 'REJECTED') {
      await this.restoreOrderInventory(memoryOrders[idx].items);
    }

    memoryOrders[idx].orderStatus = targetStatus;
    memoryOrders[idx].statusHistory.push({ status: targetStatus, timestamp: new Date(), note });
    memoryOrders[idx].updatedAt = new Date();
    return memoryOrders[idx];
  },

  async raiseOrderDispute(id, disputeData) {
    const { reason, raisedBy } = disputeData;
    const targetStatus = 'DISPUTED';

    if (getMongoStatus()) {
      let order;
      try {
        const query = mongoose.isValidObjectId(id)
          ? { $or: [{ _id: id }, { orderNumber: id }] }
          : { orderNumber: id };
        order = await Order.findOne(query);
      } catch (e) {
        return null;
      }
      if (!order) return null;

      order.orderStatus = targetStatus;
      order.disputeDetails = {
        isDisputed: true,
        reason,
        status: 'open',
        raisedBy: raisedBy || order.consumerName,
        raisedAt: new Date(),
        resolutionNote: ''
      };
      order.statusHistory.push({ status: targetStatus, timestamp: new Date(), note: `Dispute raised: ${reason}` });
      return await order.save();
    }

    await initMemoryState();
    const idx = memoryOrders.findIndex(o => o._id.toString() === id.toString() || o.orderNumber === id);
    if (idx === -1) return null;

    memoryOrders[idx].orderStatus = targetStatus;
    memoryOrders[idx].disputeDetails = {
      isDisputed: true,
      reason,
      status: 'open',
      raisedBy: raisedBy || memoryOrders[idx].consumerName,
      raisedAt: new Date(),
      resolutionNote: ''
    };
    memoryOrders[idx].statusHistory.push({ status: targetStatus, timestamp: new Date(), note: `Dispute raised: ${reason}` });
    memoryOrders[idx].updatedAt = new Date();
    return memoryOrders[idx];
  },

  async resolveOrderDispute(id, resolutionData) {
    const { action, resolutionNote } = resolutionData; // action: 'refund' or 'close'
    const targetStatus = action === 'refund' ? 'CANCELLED' : 'DELIVERED';

    if (getMongoStatus()) {
      let order;
      try {
        const query = mongoose.isValidObjectId(id)
          ? { $or: [{ _id: id }, { orderNumber: id }] }
          : { orderNumber: id };
        order = await Order.findOne(query);
      } catch (e) {
        return null;
      }
      if (!order) return null;

      if (action === 'refund') {
        await this.restoreOrderInventory(order.items);
        order.paymentStatus = 'refunded';
      }

      order.orderStatus = targetStatus;
      if (order.disputeDetails) {
        order.disputeDetails.status = action === 'refund' ? 'resolved' : 'closed';
        order.disputeDetails.resolutionNote = resolutionNote || `Admin resolved dispute: ${action}`;
        order.disputeDetails.resolvedAt = new Date();
      }
      order.statusHistory.push({ 
        status: targetStatus, 
        timestamp: new Date(), 
        note: `Dispute resolved by Admin (${action}): ${resolutionNote}` 
      });
      return await order.save();
    }

    await initMemoryState();
    const idx = memoryOrders.findIndex(o => o._id.toString() === id.toString() || o.orderNumber === id);
    if (idx === -1) return null;

    if (action === 'refund') {
      await this.restoreOrderInventory(memoryOrders[idx].items);
      memoryOrders[idx].paymentStatus = 'refunded';
    }

    memoryOrders[idx].orderStatus = targetStatus;
    if (memoryOrders[idx].disputeDetails) {
      memoryOrders[idx].disputeDetails.status = action === 'refund' ? 'resolved' : 'closed';
      memoryOrders[idx].disputeDetails.resolutionNote = resolutionNote || `Admin resolved dispute: ${action}`;
      memoryOrders[idx].disputeDetails.resolvedAt = new Date();
    }
    memoryOrders[idx].statusHistory.push({ 
      status: targetStatus, 
      timestamp: new Date(), 
      note: `Dispute resolved by Admin (${action}): ${resolutionNote}` 
    });
    memoryOrders[idx].updatedAt = new Date();
    return memoryOrders[idx];
  },

  // MARKETPLACE TRUST SYSTEM (REVIEWS & RATINGS)
  async checkReviewEligibility(consumerId, productId = null, farmerId = null) {
    if (!consumerId) return { eligible: false, reason: 'Authentication required' };

    const orders = await this.getOrders({ consumerId, status: 'DELIVERED' });
    if (!orders || !orders.length) {
      return { eligible: false, reason: 'Only verified purchasers with a delivered order can submit a review.' };
    }

    // If checking product eligibility
    if (productId) {
      const matchOrder = orders.find(o => 
        o.items.some(item => (item.product._id ? item.product._id.toString() : item.product.toString()) === productId.toString())
      );
      if (!matchOrder) {
        return { eligible: false, reason: 'You can only review products that have been delivered in your orders.' };
      }
      return { eligible: true, orderId: matchOrder._id };
    }

    // If checking farmer eligibility
    if (farmerId) {
      const matchOrder = orders.find(o => 
        o.items.some(item => (item.farmer._id ? item.farmer._id.toString() : item.farmer.toString()) === farmerId.toString())
      );
      if (!matchOrder) {
        return { eligible: false, reason: 'You can only rate farmers from whom you have received delivered orders.' };
      }
      return { eligible: true, orderId: matchOrder._id };
    }

    return { eligible: true };
  },

  async upsertReview(reviewData) {
    const { targetType, productId, farmerId, consumerId, consumerName, rating, comment } = reviewData;

    // Check eligibility
    const eligibility = await this.checkReviewEligibility(consumerId, productId, farmerId);
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || 'Not eligible to review this produce/farmer.');
    }

    let savedReview;
    let isUpdate = false;

    if (getMongoStatus()) {
      const query = { consumer: consumerId };
      if (productId) {
        query.product = productId;
      } else if (farmerId) {
        query.farmer = farmerId;
        query.targetType = 'farmer';
      }

      let existing = await Review.findOne(query);
      if (existing) {
        existing.rating = Number(rating);
        existing.comment = comment;
        existing.updatedAt = new Date();
        savedReview = await existing.save();
        isUpdate = true;
      } else {
        savedReview = new Review({
          targetType: targetType || (productId ? 'product' : 'farmer'),
          product: productId || null,
          farmer: farmerId,
          consumer: consumerId,
          consumerName,
          rating: Number(rating),
          comment,
          isVerifiedPurchaser: true
        });
        await savedReview.save();
      }

      // Recalculate Product Rating & Count using aggregation (1 query, not N+1)
      if (productId) {
        const [aggResult] = await Review.aggregate([
          { $match: { product: savedReview.product } },
          { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        if (aggResult) {
          await Product.findByIdAndUpdate(productId, { 
            rating: Number(aggResult.avgRating.toFixed(1)), 
            numReviews: aggResult.count 
          });
        }
      }

      // Recalculate Farmer Rating & Count using aggregation (1 query, not N+1)
      if (farmerId) {
        const [farmerAgg] = await Review.aggregate([
          { $match: { farmer: savedReview.farmer, targetType: 'farmer' } },
          { $group: { _id: '$farmer', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        if (farmerAgg) {
          await User.findByIdAndUpdate(farmerId, { 
            'farmDetails.rating': Number(farmerAgg.avgRating.toFixed(1)), 
            'farmDetails.reviewCount': farmerAgg.count 
          });
        }
      }

      return { review: savedReview, isUpdate };
    }

    await initMemoryState();
    
    // Memory DB upsert logic
    let exIdx = -1;
    if (productId) {
      exIdx = memoryReviews.findIndex(r => r.consumer.toString() === consumerId.toString() && r.product && r.product.toString() === productId.toString());
    } else if (farmerId) {
      exIdx = memoryReviews.findIndex(r => r.consumer.toString() === consumerId.toString() && r.farmer && r.farmer.toString() === farmerId.toString() && r.targetType === 'farmer');
    }

    if (exIdx !== -1) {
      memoryReviews[exIdx].rating = Number(rating);
      memoryReviews[exIdx].comment = comment;
      memoryReviews[exIdx].updatedAt = new Date();
      savedReview = memoryReviews[exIdx];
      isUpdate = true;
    } else {
      savedReview = {
        _id: '66d8e3010000000000000' + Math.floor(1000 + Math.random() * 9000),
        targetType: targetType || (productId ? 'product' : 'farmer'),
        product: productId || null,
        farmer: farmerId,
        consumer: consumerId,
        consumerName,
        rating: Number(rating),
        comment,
        isVerifiedPurchaser: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryReviews.unshift(savedReview);
    }

    // Update Product Memory Stats
    if (productId) {
      const pIdx = memoryProducts.findIndex(p => p._id.toString() === productId.toString());
      if (pIdx !== -1) {
        const prodReviews = memoryReviews.filter(r => r.product && r.product.toString() === productId.toString());
        const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
        memoryProducts[pIdx].rating = Number(avg.toFixed(1));
        memoryProducts[pIdx].numReviews = prodReviews.length;
      }
    }

    // Update Farmer Memory Stats
    if (farmerId) {
      const fIdx = memoryUsers.findIndex(u => u._id.toString() === farmerId.toString());
      if (fIdx !== -1 && memoryUsers[fIdx].farmDetails) {
        const fReviews = memoryReviews.filter(r => r.farmer && r.farmer.toString() === farmerId.toString());
        const avg = fReviews.reduce((sum, r) => sum + r.rating, 0) / fReviews.length;
        memoryUsers[fIdx].farmDetails.rating = Number(avg.toFixed(1));
        memoryUsers[fIdx].farmDetails.reviewCount = fReviews.length;
      }
    }

    return { review: savedReview, isUpdate };
  },

  async getReviewsForProduct(productId) {
    let reviews = [];
    if (getMongoStatus()) {
      reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
    } else {
      await initMemoryState();
      reviews = memoryReviews.filter(r => r.product && r.product.toString() === productId.toString());
    }

    const total = reviews.length;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach(r => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
      sum += r.rating;
    });

    const avgRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;

    return {
      reviews,
      avgRating,
      totalReviews: total,
      ratingBreakdown: breakdown
    };
  },

  async getReviewsForFarmer(farmerId) {
    let reviews = [];
    if (getMongoStatus()) {
      reviews = await Review.find({ farmer: farmerId }).sort({ createdAt: -1 });
    } else {
      await initMemoryState();
      reviews = memoryReviews.filter(r => r.farmer && r.farmer.toString() === farmerId.toString());
    }

    const total = reviews.length;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach(r => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
      sum += r.rating;
    });

    const avgRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;

    return {
      reviews,
      avgRating,
      totalReviews: total,
      ratingBreakdown: breakdown
    };
  },

  async getUserReviewForTarget(consumerId, productId = null, farmerId = null) {
    if (getMongoStatus()) {
      const query = { consumer: consumerId };
      if (productId) query.product = productId;
      else if (farmerId) { query.farmer = farmerId; query.targetType = 'farmer'; }
      return await Review.findOne(query);
    }
    await initMemoryState();
    if (productId) {
      return memoryReviews.find(r => r.consumer.toString() === consumerId.toString() && r.product && r.product.toString() === productId.toString()) || null;
    }
    if (farmerId) {
      return memoryReviews.find(r => r.consumer.toString() === consumerId.toString() && r.farmer && r.farmer.toString() === farmerId.toString() && r.targetType === 'farmer') || null;
    }
    return null;
  },

  // ADMIN OPERATIONS & COMMISSION CONFIGURATION
  getCommissionConfig() {
    return { commissionRatePercent: platformCommissionRate };
  },

  updateCommissionConfig(newRate) {
    const rate = Number(newRate);
    if (!isNaN(rate) && rate >= 0 && rate <= 30) {
      platformCommissionRate = rate;
    }
    return { commissionRatePercent: platformCommissionRate };
  },

  async getAllUsers(roleFilter = null) {
    let users = [];
    if (getMongoStatus()) {
      const query = {};
      if (roleFilter && roleFilter !== 'all') query.role = roleFilter;
      users = await User.find(query).select('-password -farmDetails.bankDetails').sort({ createdAt: -1 });
    } else {
      await initMemoryState();
      users = [...memoryUsers];
      if (roleFilter && roleFilter !== 'all') {
        users = users.filter(u => u.role === roleFilter);
      }
      users = users.map(({ password, ...rest }) => {
        if (rest.farmDetails?.bankDetails) {
          const { bankDetails, ...restFarmDetails } = rest.farmDetails;
          return { ...rest, farmDetails: restFarmDetails };
        }
        return rest;
      });
    }
    return users;
  },

  async updateUserStatus(userId, isActive) {
    if (getMongoStatus()) {
      const updated = await User.findByIdAndUpdate(userId, { isActive: Boolean(isActive) }, { new: true }).select('-password');
      return updated;
    }
    await initMemoryState();
    const idx = memoryUsers.findIndex(u => u._id.toString() === userId.toString());
    if (idx !== -1) {
      memoryUsers[idx].isActive = Boolean(isActive);
      const { password, ...rest } = memoryUsers[idx];
      return rest;
    }
    return null;
  },

  async getAdminMetrics() {
    let users = [], products = [], orders = [];

    if (getMongoStatus()) {
      users = await User.find().select('-password');
      products = await Product.find();
      orders = await Order.find();
    } else {
      await initMemoryState();
      users = memoryUsers;
      products = memoryProducts;
      orders = memoryOrders;
    }

    const totalConsumers = users.filter(u => u.role === 'consumer').length;
    const allFarmers = users.filter(u => u.role === 'farmer');
    const totalFarmers = allFarmers.length;

    const verifiedFarmers = allFarmers.filter(f => f.farmDetails?.verificationStatus === 'verified').length;
    const pendingFarmers = allFarmers.filter(f => !f.farmDetails?.verificationStatus || f.farmDetails?.verificationStatus === 'pending').length;
    const rejectedFarmers = allFarmers.filter(f => f.farmDetails?.verificationStatus === 'rejected').length;

    const totalProducts = products.length;
    const totalOrders = orders.length;

    // Fulfillment Rate
    const deliveredOrders = orders.filter(o => normalizeStatus(o.orderStatus) === 'DELIVERED').length;
    const fulfillmentRate = totalOrders > 0 ? Number(((deliveredOrders / totalOrders) * 100).toFixed(1)) : 0;

    // GMV & Financials (exclude cancelled & rejected orders)
    const validOrders = orders.filter(o => {
      const st = normalizeStatus(o.orderStatus);
      return st !== 'CANCELLED' && st !== 'REJECTED';
    });

    const totalGmv = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const platformFeeEarned = Math.round(totalGmv * (platformCommissionRate / 100));
    const netFarmerPayouts = totalGmv - platformFeeEarned;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalGmv / Math.max(1, validOrders.length)) : 0;

    // Repeat Customer Rate Calculation
    const consumerOrderCounts = {};
    validOrders.forEach(o => {
      const cId = o.consumer?.toString() || o.consumerName;
      consumerOrderCounts[cId] = (consumerOrderCounts[cId] || 0) + 1;
    });
    const repeatConsumers = Object.values(consumerOrderCounts).filter(count => count > 1).length;
    const uniqueConsumersCount = Object.keys(consumerOrderCounts).length;
    const repeatCustomerRate = uniqueConsumersCount > 0 ? Number(((repeatConsumers / uniqueConsumersCount) * 100).toFixed(1)) : 0;

    // Order status breakdown
    const orderStatusBreakdown = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      READY_FOR_DELIVERY: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      DISPUTED: 0
    };

    orders.forEach(o => {
      const st = normalizeStatus(o.orderStatus);
      if (orderStatusBreakdown[st] !== undefined) {
        orderStatusBreakdown[st]++;
      }
    });

    // Farmer Earnings Ledger
    const farmerLedgerMap = {};
    allFarmers.forEach(f => {
      farmerLedgerMap[f._id.toString()] = {
        farmerId: f._id,
        farmerName: f.name,
        farmName: f.farmDetails?.farmName || `${f.name}'s Farm`,
        verificationStatus: f.farmDetails?.verificationStatus || 'pending',
        ordersCount: 0,
        grossSales: 0,
        platformFee: 0,
        netPayout: 0
      };
    });

    validOrders.forEach(o => {
      o.items?.forEach(item => {
        const fId = item.farmer?._id ? item.farmer._id.toString() : item.farmer?.toString();
        if (fId && farmerLedgerMap[fId]) {
          const itemTotal = item.price * item.quantity;
          farmerLedgerMap[fId].ordersCount++;
          farmerLedgerMap[fId].grossSales += itemTotal;
          const fee = Math.round(itemTotal * (platformCommissionRate / 100));
          farmerLedgerMap[fId].platformFee += fee;
          farmerLedgerMap[fId].netPayout += (itemTotal - fee);
        }
      });
    });

    const farmerLedger = Object.values(farmerLedgerMap);

    return {
      consumers: totalConsumers,
      farmers: {
        total: totalFarmers,
        verified: verifiedFarmers,
        pending: pendingFarmers,
        rejected: rejectedFarmers
      },
      products: totalProducts,
      orders: {
        total: totalOrders,
        delivered: deliveredOrders,
        fulfillmentRatePercent: fulfillmentRate,
        breakdown: orderStatusBreakdown
      },
      financials: {
        totalGmv,
        commissionRatePercent: platformCommissionRate,
        platformFeeEarned,
        netFarmerPayouts,
        averageOrderValue,
        repeatCustomerRatePercent: repeatCustomerRate
      },
      farmerLedger
    };
  },

  syncToMongo
};

module.exports = dataService;
