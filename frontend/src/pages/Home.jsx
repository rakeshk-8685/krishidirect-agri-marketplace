import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Tractor, Search, ArrowRight, ShieldCheck, HeartHandshake, Sparkles, Leaf, TrendingUp, CheckCircle, Truck, Award, QrCode, Star, ChevronRight, MapPin, ChevronDown, ChevronUp, BarChart2, Newspaper, PhoneCall, X, Carrot, Apple, Milk, Wheat, Sprout, Landmark, Radio, Plus, Heart, ShoppingBag } from 'lucide-react';

// Live mandi ticker items (scrolling)
const TICKER_ITEMS = [
  { label: 'Tomato', price: '₹2,000/Qtl', change: '+8%', up: true },
  { label: 'Onion (Nashik)', price: '₹1,200/Qtl', change: '+3%', up: true },
  { label: 'Wheat (Sharbati)', price: '₹2,200/Qtl', change: '0%', up: null },
  { label: 'Basmati 1121', price: '₹4,100/Qtl', change: '+5%', up: true },
  { label: 'Turmeric', price: '₹8,500/Qtl', change: '+12%', up: true },
  { label: 'Potato', price: '₹850/Qtl', change: '-4%', up: false },
  { label: 'Chilli (Guntur)', price: '₹9,500/Qtl', change: '0%', up: null },
  { label: 'Soybean', price: '₹3,900/Qtl', change: '+6%', up: true },
  { label: 'Cotton', price: '₹6,800/Qtl', change: '-2%', up: false },
  { label: 'Maize', price: '₹1,700/Qtl', change: '0%', up: null },
  { label: 'Pomegranate', price: '₹7,000/Qtl', change: '+9%', up: true },
  { label: 'Groundnut', price: '₹5,200/Qtl', change: '+4%', up: true },
  { label: 'Mustard', price: '₹4,800/Qtl', change: '0%', up: null },
  { label: 'Garlic', price: '₹7,200/Qtl', change: '+15%', up: true },
  { label: 'Banana (G9)', price: '₹600/Qtl', change: '-1%', up: false },
];

// Category pills for horizontal scroll
const CATEGORY_PILLS = [
  { label: 'All Produce',       category: '',                      icon: '🌾' },
  { label: 'Grains & Cereals',  category: 'Grains & Pulses',       icon: '🌾' },
  { label: 'Vegetables',        category: 'Vegetables',            icon: '🥦' },
  { label: 'Fruits',            category: 'Fruits',                icon: '🍎' },
  { label: 'Spices',            category: 'Organic & Special',     icon: '🌶️' },
  { label: 'Dairy & Eggs',      category: 'Dairy & Poultry',       icon: '🥛' },
  { label: 'Pulses & Legumes',  category: 'Grains & Pulses',       icon: '🫘' },
  { label: 'Organic Certified', category: '',                      icon: '✅', isOrganic: true },
  { label: 'Flowers',           category: 'Organic & Special',     icon: '🌸' },
  { label: 'Coffee & Tea',      category: 'Organic & Special',     icon: '☕' },
];

const INDIA_STATES = ['All States', 'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [harvestFilter, setHarvestFilter] = useState('all');
  const [showAllHarvests, setShowAllHarvests] = useState(false);
  const navigate = useNavigate();
  const tickerRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodData = await apiCall('/products?status=in_stock&sort=rating&limit=12');
        if (prodData.success) {
          setProducts(prodData.products);
        }
      } catch (err) {
        console.error('Home data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedState !== 'All States') params.set('location', selectedState);
    navigate(`/marketplace?${params.toString()}`);
  };

  const handleCategoryPill = (pill) => {
    setActiveCategory(pill.category);
    const params = new URLSearchParams();
    if (pill.category) params.set('category', pill.category);
    if (pill.isOrganic) params.set('isOrganic', 'true');
    navigate(`/marketplace?${params.toString()}`);
  };

  // Category Collections (16 Curated Farm Fresh Harvest Collections)
  const categoryCollections = [
    {
      title: 'Fresh Organic Vegetables',
      category: 'Vegetables',
      filterGroup: 'greens',
      badge: 'ORGANIC',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      subtitle: 'Crisp root vegetables & greens harvested at sunrise',
      count: '45+ Varieties',
      startingPrice: 'From ₹20/kg',
      origin: 'Nashik & Pune Belt',
      sampleTags: ['Desi Tomato', 'Baby Spinach', 'Broccoli'],
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Vegetables'
    },
    {
      title: 'Native Orchard Fruits',
      category: 'Fruits',
      filterGroup: 'fruits',
      badge: 'SEASONAL',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      subtitle: 'Tree-ripened authentic GI-tagged heritage fruits',
      count: '32 Varieties',
      startingPrice: 'From ₹45/kg',
      origin: 'Ratnagiri & Nagpur',
      sampleTags: ['Alphonso Mango', 'Nagpur Orange', 'Pomegranate'],
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Fruits'
    },
    {
      title: 'Pure A2 Dairy & Bilona Ghee',
      category: 'Dairy & Poultry',
      filterGroup: 'dairy-oils',
      badge: 'PURE A2',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      subtitle: 'Pasture-fed Gir & Sahiwal cow milk, curd & Vedic ghee',
      count: '14 Items',
      startingPrice: 'From ₹85/L',
      origin: 'Wayanad & Gir Hills',
      sampleTags: ['Bilona Ghee', 'Raw A2 Milk', 'Desi Paneer'],
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Dairy%20%26%20Poultry'
    },
    {
      title: 'Ancient Millets & Supergrains',
      category: 'Grains & Pulses',
      filterGroup: 'grains',
      badge: 'TRADITIONAL',
      badgeColor: 'bg-amber-900/10 text-amber-900 border-amber-200',
      subtitle: 'Gluten-free traditional climate-resilient nutrition',
      count: '18 Varieties',
      startingPrice: 'From ₹65/kg',
      origin: 'Karnataka & MP',
      sampleTags: ['Ragi / Finger Millet', 'Foxtail', 'Barnyard'],
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Grains%20%26%20Pulses'
    },
    {
      title: 'Unpolished Pulses & Dals',
      category: 'Grains & Pulses',
      filterGroup: 'grains',
      badge: 'UNPOLISHED',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      subtitle: 'Stone-milled pesticide-free protein staples',
      count: '24 Varieties',
      startingPrice: 'From ₹95/kg',
      origin: 'Latur & Gulbarga',
      sampleTags: ['Desi Toor Dal', 'Moong Chilka', 'Kabuli Chana'],
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Grains%20%26%20Pulses'
    },
    {
      title: 'Stone-Ground Single-Origin Spices',
      category: 'Organic & Special',
      filterGroup: 'spices-honey',
      badge: 'HIGH CURCUMIN',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      subtitle: 'High essential oil concentration directly from planters',
      count: '30 Items',
      startingPrice: 'From ₹120/pkt',
      origin: 'Meghalaya & Kerala',
      sampleTags: ['Lakadong Turmeric', 'Guntur Chilli', 'Bold Cardamom'],
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Organic%20%26%20Special'
    },
    {
      title: '100% NPOP Certified Organic',
      category: 'Organic & Special',
      filterGroup: 'organic',
      badge: 'NPOP TESTED',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      subtitle: 'Zero chemical fertilizers with traceable lab test reports',
      count: '50+ Items',
      startingPrice: 'From ₹35/kg',
      origin: 'Western Ghats & Sikkim',
      sampleTags: ['Zero Residue', 'FSSAI Certified', 'QR Traceable'],
      image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?isOrganic=true'
    },
    {
      title: 'Wood-Pressed Kachi Ghani Oils',
      category: 'Organic & Special',
      filterGroup: 'dairy-oils',
      badge: 'WOOD-PRESSED',
      badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      subtitle: 'Traditional wooden kolhu slow-crushed virgin cooking oils',
      count: '12 Items',
      startingPrice: 'From ₹180/L',
      origin: 'Rajasthan & Saurashtra',
      sampleTags: ['Yellow Mustard', 'Groundnut', 'Black Sesame'],
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Organic%20%26%20Special'
    },
    {
      title: 'Exotic Hydroponic Greens & Herbs',
      category: 'Vegetables',
      filterGroup: 'greens',
      badge: 'PESTICIDE FREE',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      subtitle: 'Soil-less clean cultivated crisp greens & cooking herbs',
      count: '16 Varieties',
      startingPrice: 'From ₹40/bunch',
      origin: 'Pune & Bengaluru Greens',
      sampleTags: ['Italian Basil', 'Romaine Lettuce', 'Baby Kale'],
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Vegetables'
    },
    {
      title: 'Raw Forest Wildflower Honey',
      category: 'Organic & Special',
      filterGroup: 'spices-honey',
      badge: 'RAW & UNFILTERED',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      subtitle: 'Direct from ethical wild bee boxes with natural pollen & enzymes',
      count: '8 Batches',
      startingPrice: 'From ₹350/jar',
      origin: 'Sundarbans & Wayanad',
      sampleTags: ['Multifloral Honey', 'Neem Nectar', 'Forest Bee'],
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Organic%20%26%20Special'
    },
    {
      title: 'Kashmiri Dry Fruits & Walnuts',
      category: 'Organic & Special',
      filterGroup: 'spices-honey',
      badge: 'PREMIUM GI',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      subtitle: 'Snow-water nourished dry fruits, almonds & Kashmiri saffron',
      count: '15 Varieties',
      startingPrice: 'From ₹450/pkt',
      origin: 'Pampore & Sopore, J&K',
      sampleTags: ['Kagzi Walnuts', 'Mamra Almonds', 'Kesar Saffron'],
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Organic%20%26%20Special'
    },
    {
      title: 'Chemical-Free Desi Gur & Jaggery',
      category: 'Organic & Special',
      filterGroup: 'organic',
      badge: 'UNREFINED',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      subtitle: 'Traditional clarifying with okra stem, rich in bio-available iron',
      count: '10 Varieties',
      startingPrice: 'From ₹70/kg',
      origin: 'Kolhapur & Mandya',
      sampleTags: ['Kolhapuri Block', 'Liquid Kakvi', 'Desi Khand'],
      image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Organic%20%26%20Special'
    },
    {
      title: 'High-Altitude Tea & Single-Estate Coffee',
      category: 'Organic & Special',
      filterGroup: 'spices-honey',
      badge: 'SHADE GROWN',
      badgeColor: 'bg-emerald-900/10 text-emerald-900 border-emerald-300',
      subtitle: 'Handpicked orthodox tea leaves & micro-lot Arabica beans',
      count: '14 Blends',
      startingPrice: 'From ₹220/pkt',
      origin: 'Coorg & Nilgiris',
      sampleTags: ['Coorg Arabica', 'Assam Orthodox', 'First Flush Tea'],
      image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Organic%20%26%20Special'
    },
    {
      title: 'Fresh Cultivated Mushrooms',
      category: 'Vegetables',
      filterGroup: 'greens',
      badge: 'DAY HARVEST',
      badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
      subtitle: 'Temperature controlled humidity farmed spotless white buttons',
      count: '9 Varieties',
      startingPrice: 'From ₹55/punnet',
      origin: 'Solan & Ooty Farms',
      sampleTags: ['White Button', 'King Oyster', 'Milky Mushroom'],
      image: 'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Vegetables'
    },
    {
      title: 'Aged Basmati & Heritage Rice',
      category: 'Grains & Pulses',
      filterGroup: 'grains',
      badge: 'AGED 12 MO',
      badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      subtitle: 'Extra-long aromatic 1121 Basmati, Navara & Chak-Hao black paddy',
      count: '16 Varieties',
      startingPrice: 'From ₹110/kg',
      origin: 'Ludhiana & Burdwan',
      sampleTags: ['1121 Basmati', 'Govindobhog', 'Black Rice'],
      image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Grains%20%26%20Pulses'
    },
    {
      title: 'Himalayan Apples & Stone Fruits',
      category: 'Fruits',
      filterGroup: 'fruits',
      badge: 'ALPINE ORCHARD',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      subtitle: 'Cold mountain elevation juicy Royal Delicious & Kinnaur fruits',
      count: '12 Varieties',
      startingPrice: 'From ₹130/kg',
      origin: 'Shimla & Kinnaur Valley',
      sampleTags: ['Royal Delicious', 'Golden Apple', 'Kinnaur Plums'],
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
      link: '/marketplace?category=Fruits'
    }
  ];

  const HARVEST_FILTER_TABS = [
    { id: 'all', label: 'All Harvests', count: 16, icon: '🌾' },
    { id: 'greens', label: 'Vegetables & Greens', count: 3, icon: '🥦' },
    { id: 'fruits', label: 'Native Fruits', count: 2, icon: '🍎' },
    { id: 'dairy-oils', label: 'A2 Dairy & Oils', count: 2, icon: '🥛' },
    { id: 'grains', label: 'Millets, Dals & Basmati', count: 3, icon: '🌾' },
    { id: 'spices-honey', label: 'Spices, Honey & Nuts', count: 4, icon: '🌶️' },
    { id: 'organic', label: '100% Certified Organic', count: 2, icon: '🌿' },
  ];

  const filteredHarvestCollections = categoryCollections.filter(col => {
    if (harvestFilter === 'all') return true;
    if (harvestFilter === 'greens') return col.filterGroup === 'greens';
    if (harvestFilter === 'fruits') return col.filterGroup === 'fruits';
    if (harvestFilter === 'dairy-oils') return col.filterGroup === 'dairy-oils';
    if (harvestFilter === 'grains') return col.filterGroup === 'grains';
    if (harvestFilter === 'spices-honey') return col.filterGroup === 'spices-honey';
    if (harvestFilter === 'organic') return col.filterGroup === 'organic';
    return true;
  });

  const displayedHarvestCollections = (harvestFilter === 'all' && !showAllHarvests)
    ? filteredHarvestCollections.slice(0, 8)
    : filteredHarvestCollections;

  const processSteps = [
    { number: '01', title: 'Browse', desc: 'Choose fruits, greens & staples directly from verified farmers in your regional zone.', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { number: '02', title: 'Order & Customize', desc: 'Select your preferred harvest date and quantity. Farmers receive instant order notification.', badgeColor: 'bg-amber-100 text-amber-800' },
    { number: '03', title: 'Direct Harvest', desc: 'Farmers harvest fresh early morning at sunrise and pack in eco-friendly crates.', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { number: '04', title: 'Fast Route Delivery', desc: 'Shipped directly to your doorstep within 18 hours of harvest with zero cold storage.', badgeColor: 'bg-indigo-100 text-indigo-800' },
  ];

  const farmerSpotlights = [
    { id: '66d8e0010000000000000002', name: 'Ramesh Kumar', farm: 'Patil Organic Farms, Ratnagiri', experience: '3rd Gen Orchardist • 12 Acres Farm', rating: 4.9, reviews: 48, bio: 'Family-owned farm specializing in GI-Tagged Ratnagiri Alphonso Mangoes and organic vegetables. Zero synthetic pesticide usage for over 15 years.', tags: ['ZBNF Certified', 'Direct Payee', 'Orchard Special'], image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80' },
    { id: '66d8e0010000000000000004', name: 'Lakshmi Bai', farm: 'Green Valley Dairy, Wayanad', experience: 'Organic Agroforestry • 8 Acres', rating: 4.95, reviews: 64, bio: 'Pasture-raised indigenous Gir cows producing pure A2 milk, raw honey, and high-curcumin Wayanad turmeric.', tags: ['A2 Certified', 'Zero Residue', 'Forest Edge'], image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
    { id: '66d8e0010000000000000003', name: 'Gurpreet Singh', farm: 'Golden Grain Acres, Ludhiana', experience: 'Traditional Grain Specialist • 25 Acres', rating: 4.8, reviews: 32, bio: 'Pioneering traditional extra-long 1121 Basmati Rice & Desi Sharbati Wheat using canal irrigation and green manure crops.', tags: ['Aged Basmati', 'Unpolished Grain', 'Canal Irrigated'], image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', location: 'Indiranagar, Bengaluru', rating: 5, comment: 'The produce quality from Patil Organic Farms is extraordinary. The Alphonso mangoes had that authentic tree-ripened aroma that you never find in supermarket chains.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { name: 'Vikram Mehta', location: 'Whitefield, Bengaluru', rating: 5, comment: 'Direct farmer pricing is completely transparent. Knowing 95%+ of my payment goes straight to Lakshmi Bai in Wayanad makes me feel proud of every weekly order.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
    { name: 'Dr. Ananya Swaminathan', location: 'Koramangala, Bengaluru', rating: 5, comment: 'As a nutritionist, batch-wise 120-residue lab reports give me complete peace of mind. The A2 Gir cow milk and ancient millets are staples in our kitchen.', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80' },
  ];


  const filteredProducts = products.filter(p => {
    if (activeFilter === 'organic') return p.isOrganic;
    if (activeFilter === 'grains') return p.category === 'Grains & Pulses';
    if (activeFilter === 'specials') return p.category === 'Fruits' || p.category === 'Organic & Special';
    return true;
  });

  return (
    <div className="space-y-0 bg-slate-50/50">

      {/* ====================== MOBILE STITCH VIEW (Phone < 768px) ====================== */}
      <div className="md:hidden pb-12 bg-white text-slate-900">

        {/* 1. Mobile Top Search Bar & Popular Tags Row */}
        <div className="bg-white px-4 pt-3 pb-2 border-b border-slate-100">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-white border border-slate-200 rounded-full shadow-xs px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search crop, spice, or variety..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <div className="shrink-0 flex items-center gap-1 pl-2 border-l border-slate-200 ml-1">
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1 max-w-[85px] truncate"
              >
                {INDIA_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="shrink-0 ml-1.5 w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

          {/* Popular tags row */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
              POPULAR:
            </span>
            {[
              { name: 'Alphonso Mango', active: true },
              { name: 'Desi Tomato', active: false },
              { name: 'Nashik Onion', active: false },
              { name: 'Sharbati Wheat', active: false },
              { name: 'Guntur Chilli', active: false },
              { name: 'Kashmiri Apple', active: false },
            ].map((tag) => (
              <button
                key={tag.name}
                type="button"
                onClick={() => {
                  setSearchQuery(tag.name);
                  navigate(`/marketplace?search=${encodeURIComponent(tag.name)}`);
                }}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  tag.active
                    ? 'bg-[#104b2b] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Mobile Hero Card */}
        <div className="px-4 pt-3 pb-1">
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#124d2c] via-[#0d3f23] to-[#072614] text-white p-5 shadow-lg">
            {/* Ambient glows */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 pointer-events-none blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-amber-500/10 pointer-events-none blur-xl" />

            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-extrabold tracking-wide text-emerald-300 mb-3 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DIRECT FARM TO CONSUMER
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-black tracking-tight leading-tight mb-2">
              India's <span className="text-[#6ee7b7]">No.1 Agro</span> Marketplace
            </h2>

            {/* Subtitle */}
            <p className="text-xs text-emerald-100/85 leading-relaxed mb-5 font-medium">
              Buy & sell farm produce, grains, and spices directly with zero broker commissions.
            </p>

            {/* 2x2 Trust Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-emerald-800/60">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold leading-tight text-white">Verified Farmers</div>
                  <div className="text-[10px] text-emerald-200/75 leading-tight">KYC Authenticated</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold leading-tight text-white">0% Commission</div>
                  <div className="text-[10px] text-emerald-200/75 leading-tight">Direct Mandi Price</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold leading-tight text-white">28+ States</div>
                  <div className="text-[10px] text-emerald-200/75 leading-tight">Pan-India Express</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold leading-tight text-white">FSSAI Certified</div>
                  <div className="text-[10px] text-emerald-200/75 leading-tight">& NPOP Organic</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. APMC Live Mandi Rates Section */}
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
              <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>APMC Live Mandi Rates</span>
            </div>
            <Link
              to="/mandi-rates"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              View All Mandis <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { location: 'Nashik, MH', change: '+3%', name: 'Onion (Red)', price: '₹1,200', unit: '/Qtl', positive: true },
              { location: 'Sehore, MP', change: '0%', name: 'Wheat (Sharbati)', price: '₹2,200', unit: '/Qtl', positive: null },
              { location: 'Karnal, HR', change: '+5%', name: 'Basmati 1121', price: '₹4,100', unit: '/Qtl', positive: true },
              { location: 'Guntur, AP', change: '+8%', name: 'Chilli (Teja)', price: '₹9,800', unit: '/Qtl', positive: true },
              { location: 'Shimla, HP', change: '+4%', name: 'Royal Apple', price: '₹6,500', unit: '/Qtl', positive: true },
            ].map((mandi, idx) => (
              <div
                key={idx}
                className="min-w-[145px] shrink-0 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">{mandi.location}</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    mandi.positive === true
                      ? 'bg-emerald-100 text-emerald-700'
                      : mandi.positive === false
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {mandi.change}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate mb-1">{mandi.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-emerald-800">{mandi.price}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{mandi.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Market Categories (8 Departments) */}
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-slate-900">Market Categories</h3>
            <span className="text-xs font-bold text-slate-400">8 Departments</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {[
              { title: 'Fresh Veggies', icon: Carrot, color: 'text-emerald-700 bg-emerald-50', link: '/marketplace?category=Vegetables' },
              { title: 'Orchard Fruits', icon: Apple, color: 'text-amber-700 bg-amber-50', link: '/marketplace?category=Fruits' },
              { title: 'Dairy & Honey', icon: Milk, color: 'text-sky-700 bg-sky-50', link: '/marketplace?category=Dairy %26 Poultry' },
              { title: '100% Organic', icon: Leaf, color: 'text-emerald-800 bg-emerald-100', link: '/marketplace?isOrganic=true' },
              { title: 'Grains & Pulses', icon: Wheat, color: 'text-amber-800 bg-amber-100', link: '/marketplace?category=Grains %26 Pulses' },
              { title: 'Seeds & Bio', icon: Sprout, color: 'text-teal-700 bg-teal-50', link: '/marketplace?category=Seeds %26 Fertilizer' },
              { title: 'Verified Farms', icon: Tractor, color: 'text-green-700 bg-green-50', link: '/marketplace' },
              { title: 'Govt Schemes', icon: Landmark, color: 'text-indigo-700 bg-indigo-50', link: '/marketplace' },
            ].map((dept, idx) => {
              const Icon = dept.icon;
              return (
                <Link
                  key={idx}
                  to={dept.link}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-emerald-200 transition-all text-center group cursor-pointer active:scale-95 shadow-2xs"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform ${dept.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">
                    {dept.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 5. Direct From Verified Farmers Produce Feed */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-end justify-between mb-3.5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Direct From Verified Farmers
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Harvested this morning • Zero middleman markups
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
              {products.length ? `${products.length * 28}+ Lots` : '340+ Lots'}
            </span>
          </div>

          <div className="space-y-3">
            {(products.length > 0 ? products : [
              {
                _id: 'sample-1',
                title: 'Original Alphonso Mango (Hapus)',
                description: 'Naturally ripened, export grade, sweet pulp',
                price: 749,
                originalPrice: 960,
                unit: 'Dozen',
                category: 'Fruits',
                farmer: { name: 'R. Patil Farms', location: 'Ratnagiri, MH' },
                grade: 'Grade A+',
                badge: 'GI TAGGED',
                images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80'],
              },
              {
                _id: 'sample-2',
                title: 'Sharbati Golden Whole Wheat',
                description: 'Sehore certified, heavy grains, high protein',
                price: 52,
                originalPrice: 65,
                unit: 'Kg',
                category: 'Grains & Pulses',
                farmer: { name: 'Verma Krishi Farm', location: 'Sehore, MP' },
                grade: 'Grade A',
                badge: 'DIRECT APMC',
                images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'],
              },
              {
                _id: 'sample-3',
                title: 'Pure Wild Forest Raw Honey',
                description: 'Unheated, raw filtered, indigenous bee hives',
                price: 480,
                originalPrice: 590,
                unit: '500g',
                category: 'Organic & Special',
                farmer: { name: 'Wayanad Forest Co-op', location: 'Wayanad, KL' },
                grade: '100% Pure',
                badge: 'ORGANIC',
                images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80'],
              }
            ]).map((prod) => (
              <div
                key={prod._id}
                onClick={() => navigate(`/product/${prod._id}`)}
                className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md transition-all flex items-center gap-3 cursor-pointer relative"
              >
                {/* Left: Square image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden relative bg-slate-100">
                  <img
                    src={prod.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80'}
                    alt={prod.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Tag pill */}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider">
                    {prod.isOrganic ? 'ORGANIC' : prod.badge || 'DIRECT LOT'}
                  </span>
                </div>

                {/* Right: Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mb-0.5">
                      <span>🏡 {prod.farmer?.name || 'Verified Farm'}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{prod.grade || 'Grade A+'}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 truncate">
                      {prod.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                      {prod.description || 'Farm-fresh harvest direct to consumer'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-slate-900">₹{prod.price}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">/{prod.unit || 'Kg'}</span>
                      </div>
                      {prod.originalPrice && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          ({Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF)
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod, 1);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#114b2b] hover:bg-[#0c3920] active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lot</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Farmer Guarantee Banner */}
        <div className="px-4 py-3">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950 to-[#0b3c20] text-white p-4 flex items-center justify-between shadow-md border border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/60 border border-emerald-600/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">100% Quality Assurance</div>
                <div className="text-[10px] text-emerald-200/80 leading-tight mt-0.5">Full refund if produce differs from inspection report</div>
              </div>
            </div>
            <Link
              to="/about"
              className="px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0 hover:bg-amber-400 transition-colors"
            >
              Read
            </Link>
          </div>
        </div>

      </div>

      {/* ====================== DESKTOP VIEW (md: and above - 100% untouched) ====================== */}
      <div className="hidden md:block">

      {/* ====================== 1. FULL-WIDTH PREMIUM HERO ====================== */}
      <section className="relative overflow-hidden min-h-[520px]">

        {/* ── Layer 1: Real Farm Background Image ── */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />

        {/* ── Layer 2: Rich Dark-Green Gradient Overlay (multi-stop) ── */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, rgba(5,30,14,0.96) 0%, rgba(10,61,32,0.91) 35%, rgba(12,70,37,0.85) 60%, rgba(5,30,14,0.94) 100%)',
          }}
        />

        {/* ── Layer 3: Radial Glow Orbs (depth & warmth) ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top-left warm amber glow */}
          <div
            className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #a16207 0%, transparent 70%)' }}
          />
          {/* Center-right emerald glow */}
          <div
            className="absolute top-10 right-0 w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)' }}
          />
          {/* Bottom-center soft lime glow */}
          <div
            className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, #16a34a 0%, transparent 70%)' }}
          />
        </div>

        {/* ── Layer 4: Subtle Diagonal Grid Texture ── */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #fff 0px, #fff 1px,
              transparent 1px, transparent 60px
            )`,
          }}
        />

        {/* ── Layer 5: Decorative SVG Wheat & Leaf Silhouettes ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Large wheat stalk — top right */}
          <svg className="absolute top-0 right-8 w-48 h-64 opacity-[0.07] text-emerald-300" viewBox="0 0 80 200" fill="currentColor">
            <rect x="38" y="0" width="4" height="200" rx="2"/>
            <ellipse cx="40" cy="30" rx="16" ry="8" transform="rotate(-30 40 30)"/>
            <ellipse cx="40" cy="30" rx="16" ry="8" transform="rotate(30 40 30)"/>
            <ellipse cx="40" cy="55" rx="14" ry="7" transform="rotate(-30 40 55)"/>
            <ellipse cx="40" cy="55" rx="14" ry="7" transform="rotate(30 40 55)"/>
            <ellipse cx="40" cy="78" rx="12" ry="6" transform="rotate(-30 40 78)"/>
            <ellipse cx="40" cy="78" rx="12" ry="6" transform="rotate(30 40 78)"/>
            <ellipse cx="40" cy="98" rx="10" ry="5" transform="rotate(-30 40 98)"/>
            <ellipse cx="40" cy="98" rx="10" ry="5" transform="rotate(30 40 98)"/>
          </svg>

          {/* Medium wheat stalk — bottom left */}
          <svg className="absolute bottom-0 left-6 w-32 h-48 opacity-[0.06] text-amber-300" viewBox="0 0 80 200" fill="currentColor">
            <rect x="38" y="40" width="4" height="160" rx="2"/>
            <ellipse cx="40" cy="60" rx="13" ry="6" transform="rotate(-25 40 60)"/>
            <ellipse cx="40" cy="60" rx="13" ry="6" transform="rotate(25 40 60)"/>
            <ellipse cx="40" cy="82" rx="11" ry="5.5" transform="rotate(-25 40 82)"/>
            <ellipse cx="40" cy="82" rx="11" ry="5.5" transform="rotate(25 40 82)"/>
            <ellipse cx="40" cy="102" rx="9" ry="4.5" transform="rotate(-25 40 102)"/>
            <ellipse cx="40" cy="102" rx="9" ry="4.5" transform="rotate(25 40 102)"/>
          </svg>

          {/* Large leaf — top-left corner */}
          <svg className="absolute -top-8 left-1/4 w-40 h-40 opacity-[0.05] text-green-300" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 90 Q10 50 30 10 Q50 30 70 10 Q90 50 50 90Z"/>
            <line x1="50" y1="90" x2="50" y2="20" stroke="currentColor" strokeWidth="2"/>
          </svg>

          {/* Small leaf — right side mid */}
          <svg className="absolute top-1/2 right-4 w-24 h-24 opacity-[0.06] text-emerald-200 rotate-45" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 90 Q10 50 30 10 Q50 30 70 10 Q90 50 50 90Z"/>
          </svg>

          {/* Dotted circle pattern — bottom right */}
          <svg className="absolute -bottom-16 -right-16 w-64 h-64 opacity-[0.06] text-emerald-400" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="100" cy="100" r="50"/>
            <circle cx="100" cy="100" r="70"/>
            <circle cx="100" cy="100" r="90"/>
          </svg>

          {/* Grain dots pattern — top center */}
          <svg className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-20 opacity-[0.05] text-amber-200" viewBox="0 0 200 60" fill="currentColor">
            {[0,20,40,60,80,100,120,140,160,180].map(x =>
              [0,20,40].map(y => (
                <circle key={`${x}-${y}`} cx={x+10} cy={y+10} r="2"/>
              ))
            )}
          </svg>
        </div>


        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center relative z-10">

          {/* Badge Pill — with glowing ring */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-xs font-bold mb-6 backdrop-blur-md relative"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 0 20px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            Pan-India Agro Marketplace
          </div>

          {/* Main Heading — gradient shimmer on key word */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4">
            <span className="text-white">India's </span>
            <span style={{ background: 'linear-gradient(90deg, #6ee7b7 0%, #fcd34d 50%, #6ee7b7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>No.1</span>
            <span className="text-white"> Agro Marketplace</span>
          </h1>

          <p className="text-emerald-100 text-base sm:text-lg font-medium mb-8 max-w-2xl mx-auto leading-relaxed">
            Buy & sell{' '}
            <span className="underline decoration-emerald-400 underline-offset-2">agricultural produce</span>,{' '}
            <span className="underline decoration-emerald-400 underline-offset-2">grains</span>, fruits, vegetables, and seeds directly from farmers across all Indian states with{' '}
            <strong className="text-white">zero broker commissions</strong>.
          </p>

          {/* ── Multi-Parameter Search Bar — Pro Mobile App Ergonomics ── */}
          <div className="max-w-2xl mx-auto w-full">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white/95 backdrop-blur-md rounded-full border border-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.25)] p-1.5 sm:p-2 transition-all duration-300 focus-within:ring-4 focus-within:ring-emerald-400/25 focus-within:border-emerald-500 focus-within:bg-white"
            >
              {/* Crop Search Icon & Input */}
              <div className="flex items-center flex-1 min-w-0 pl-1.5 sm:pl-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 text-[#1B5E3A] flex items-center justify-center shrink-0 shadow-2xs">
                  <Search className="w-4 h-4 text-[#1B5E3A]" />
                </div>
                <input
                  type="text"
                  placeholder="Search crop, spice, or variety..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-2 sm:pl-3 pr-1 py-2 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none bg-transparent placeholder-slate-400 truncate"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors mr-1 shrink-0 cursor-pointer"
                    aria-label="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* State Select (Desktop & Tablet) */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border-l border-slate-200 min-w-[145px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="flex-1 py-1.5 text-xs font-bold text-slate-700 focus:outline-none bg-transparent cursor-pointer"
                >
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </div>

              {/* Search CTA (Tactile Pill Button) */}
              <button
                type="submit"
                className="shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#e55a2b] via-[#ea580c] to-[#d14d22] hover:from-[#d14d22] hover:to-[#b83d16] text-white font-extrabold text-xs sm:text-sm rounded-full shadow-[0_4px_14px_rgba(229,90,43,0.45)] hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Search</span>
              </button>
            </form>

            {/* Mobile State Selector & Popular Quick-Filter Chips */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 text-left">
              {/* Mobile State Filter Chip */}
              <div className="sm:hidden shrink-0 flex items-center">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold shadow-xs">
                  <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-transparent text-white text-[11px] font-bold focus:outline-none cursor-pointer pr-1"
                    style={{ colorScheme: 'dark' }}
                  >
                    {INDIA_STATES.map(s => (
                      <option key={s} value={s} className="bg-slate-900 text-white font-normal">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Popular Tags */}
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-200/90 shrink-0">Popular:</span>
              {['Alphonso Mango', 'Desi Tomato', 'Nashik Onion', 'Sharbati Wheat', 'Mustard Oil'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    navigate(`/marketplace?search=${encodeURIComponent(tag)}`);
                  }}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/20 text-white/95 hover:text-white text-[11px] font-medium transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Badge Glassmorphism Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {[
              { icon: ShieldCheck, label: 'Verified Farmers', color: 'text-emerald-300', glow: 'rgba(16,185,129,0.3)' },
              { icon: TrendingUp,  label: 'Zero Broker Commission', color: 'text-amber-300', glow: 'rgba(245,158,11,0.3)' },
              { icon: Truck,       label: '28+ States Covered', color: 'text-sky-300', glow: 'rgba(14,165,233,0.3)' },
              { icon: Award,       label: 'FSSAI & NPOP Certified', color: 'text-orange-300', glow: 'rgba(251,146,60,0.3)' },
            ].map(({ icon: Icon, label, color, glow }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white backdrop-blur-md transition-transform hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: `0 2px 16px ${glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
                }}
              >
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                {label}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ====================== 2. LIVE MANDI RATES TICKER ====================== */}
      <section className="bg-slate-900 border-b border-slate-800 overflow-hidden">
        <div className="flex items-stretch">
          {/* "Live" label */}
          <Link
            to="/mandi-rates"
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 transition-colors text-white text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap border-r border-emerald-600"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <BarChart2 className="w-3.5 h-3.5" />
            Mandi Rates
          </Link>

          {/* Scrolling ticker */}
          <div className="overflow-hidden flex-1 relative">
            <div
              className="flex items-center gap-0 animate-ticker whitespace-nowrap py-2.5"
              style={{ animation: 'ticker 40s linear infinite' }}
            >
              {/* Duplicate for seamless loop */}
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 px-5 text-xs font-semibold text-slate-200 border-r border-slate-700 last:border-0">
                  <span className="font-bold text-white">{item.label}</span>
                  <span>{item.price}</span>
                  <span className={`font-bold text-[11px] ${item.up === true ? 'text-emerald-400' : item.up === false ? 'text-rose-400' : 'text-slate-400'}`}>
                    {item.change}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* View All link */}
          <Link
            to="/mandi-rates"
            className="shrink-0 flex items-center gap-1 px-4 py-2.5 text-[11px] font-bold text-emerald-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border-l border-slate-700 whitespace-nowrap"
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ====================== 3. CATEGORY PILLS HORIZONTAL SCROLL ====================== */}
      <section className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            {CATEGORY_PILLS.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleCategoryPill(pill)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  activeCategory === pill.category && !pill.isOrganic
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                    : idx === 0 && activeCategory === ''
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span className="text-sm leading-none">{pill.icon}</span>
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-20 pb-20">

        {/* ====================== 4. VALUE PROPS BAR ====================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start gap-4 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 font-bold">
                <Tractor className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Verified Farmers</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Direct background check and soil tests for verified local growers.</p>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start gap-4 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Direct Farm Dispatch</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Harvested immediately upon order and shipped via cold route.</p>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start gap-4 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Fair Farm Prices</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Farmers set their price. Zero middleman commission cuts.</p>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start gap-4 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0 font-bold">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Zero Cold Storage</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">No artificial gas or chemical preservation; true natural freshness.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ====================== 5. MANDI RATES + AGRI NEWS QUICK ACCESS ====================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Mandi Rates Card */}
            <Link to="/mandi-rates" className="group relative bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-3xl p-8 text-white shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-700/30 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700/60 border border-emerald-600/50 flex items-center justify-center mb-4">
                  <BarChart2 className="w-6 h-6 text-emerald-300" />
                </div>
                <h3 className="text-xl font-extrabold">Mandi Market Rates</h3>
                <p className="text-emerald-300 text-sm mt-1 font-medium">Live APMC wholesale prices from 1,271 mandis across India</p>
                <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-emerald-800">
                  {[['1,271', 'Mandis'], ['4,793', 'Reports'], ['30+', 'Commodities']].map(([val, lbl]) => (
                    <div key={lbl}>
                      <div className="text-lg font-black text-white">{val}</div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase">{lbl}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                  View Live Rates <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Agri News Card */}
            <Link to="/agri-news" className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-slate-700/30 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-700 border border-slate-600/50 flex items-center justify-center mb-4">
                  <Newspaper className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-extrabold">Govt Agri News</h3>
                <p className="text-slate-300 text-sm mt-1 font-medium">MSP updates, PMFBY deadlines, subsidies & weather advisories from PIB & IMD</p>
                <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-700">
                  {['MSP Rates', 'PM-KISAN', 'PMFBY', 'Weather Alerts', 'Subsidies'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                  Read Latest News <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ====================== 6. EXPLORE FARM FRESH HARVESTS ====================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700">HANDPICKED SEASONAL BATCHES</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  {categoryCollections.length} Curated Collections
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1">Explore Farm Fresh Harvests</h2>
              <p className="text-xs text-slate-500 mt-1">Sourced directly from regional organic cooperatives, GI orchards, and independent generational growers.</p>
            </div>
            <Link to="/marketplace" className="text-xs font-extrabold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 shrink-0">
              <span>Browse All Marketplace Produce</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Interactive Collection Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {HARVEST_FILTER_TABS.map(tab => {
              const countInGroup = tab.id === 'all'
                ? categoryCollections.length
                : categoryCollections.filter(c => tab.id === 'organic' ? (c.filterGroup === 'organic') : c.filterGroup === tab.id).length;
              const isActive = harvestFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setHarvestFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-800 hover:bg-emerald-50/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {countInGroup}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Harvest Collections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedHarvestCollections.map((col, idx) => (
              <Link
                key={idx}
                to={col.link || `/marketplace?category=${encodeURIComponent(col.category)}`}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-600/40 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col relative"
              >
                {/* Image Container with Badges */}
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Subtle Gradient Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow backdrop-blur-md ${col.badgeColor}`}>
                      {col.badge}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white bg-black/60 backdrop-blur-md border border-white/20 shadow">
                      {col.startingPrice}
                    </span>
                  </div>

                  {/* Bottom On-Image Details */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold pointer-events-none">
                    <span className="flex items-center gap-1 bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-emerald-300 text-[10px]">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate max-w-[130px]">{col.origin}</span>
                    </span>
                    <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-500/30">
                      {col.count}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-800 transition-colors leading-snug">
                      {col.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {col.subtitle}
                    </p>

                    {/* Sample produce tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {col.sampleTags?.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-800 text-[10px] font-semibold transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1 group-hover:text-emerald-950">
                      <span>Explore Harvests</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Direct Farm
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Show All / Show Less Toggle when 'all' filter is selected */}
          {harvestFilter === 'all' && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowAllHarvests(!showAllHarvests)}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white hover:bg-emerald-50 border-2 border-emerald-700/20 hover:border-emerald-700 text-emerald-900 font-extrabold text-xs transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <span>
                  {showAllHarvests
                    ? 'Show Top 8 Featured Collections'
                    : `Explore All 16 Farm Fresh Harvest Collections (${categoryCollections.length})`}
                </span>
                {showAllHarvests ? (
                  <ChevronUp className="w-4 h-4 text-emerald-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-emerald-700" />
                )}
              </button>
            </div>
          )}
        </section>

        {/* ====================== 7. TODAY'S FEATURED HARVESTS ====================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">FRESH BATCH ARRIVALS</span>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1">Today's Featured Harvests</h2>
              <p className="text-xs text-slate-500 mt-1">Ready for same-day dispatch directly from farm gates.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Harvests' },
                { id: 'specials', label: "Today's Daily Pick" },
                { id: 'organic', label: 'Organic Certified' },
                { id: 'grains', label: 'Staples & Grains' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeFilter === tab.id
                      ? 'bg-slate-950 text-white shadow'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <LoadingSpinner message="Fetching today's harvest produce..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.slice(0, 8).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="flex justify-center pt-2">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-emerald-800 text-white text-xs font-extrabold transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
            >
              <span>Explore All Fresh Harvest Produce in Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ====================== 8. HOW IT WORKS STEPPER ====================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-10 text-center">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">HOW KRISHIDIRECT WORKS</span>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1">Direct From Earth to Dining Table</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">We eliminated wholesale markets, chemical preservatives, and 10 days of transit loss.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {processSteps.map((step, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-3 group hover:bg-emerald-50/50 transition-colors">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-md ${step.badgeColor}`}>
                    {step.number}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================== 9. MEET THE FARMERS ====================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between border-b pb-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700">SUPPORT REAL FARM FAMILIES</span>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1">Meet the Farmers Behind Your Food</h2>
              <p className="text-xs text-slate-500 mt-1">Know the hands that nourish your family. Every order supports a specific farm household.</p>
            </div>
            <Link to="/farmers" className="text-xs font-extrabold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
              <span>Explore Verified Farms</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {farmerSpotlights.map(farmer => (
              <div key={farmer.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="h-56 bg-slate-200 overflow-hidden relative">
                  <img src={farmer.image} alt={farmer.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-xl">{farmer.name}</h3>
                      <span className="flex items-center gap-1 font-bold text-amber-400 bg-slate-950/60 px-2 py-0.5 rounded-lg text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {farmer.rating}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5">{farmer.farm}</p>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{farmer.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {farmer.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">{tag}</span>
                    ))}
                  </div>
                  <Link to={`/farmers/${farmer.id}`} className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-emerald-800 hover:text-white text-slate-900 text-xs font-extrabold text-center transition-colors shadow-sm block">
                    View Farm & Available Crops →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================== 10. TRACEABILITY BANNER ====================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0a3d20] via-emerald-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs font-bold border border-emerald-600/50">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Lab Verified NPOP Standard</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                  Radical Traceability: Scan Any Batch for 120-Residue Testing
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Every crop batch carries a unique QR fingerprint. Scan with your phone camera to view soil test reports, heavy metal analysis, water purity metrics, and government laboratory verification before consuming.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[['0.00%', 'Chemicals Detected'], ['100%', 'Soil-Tested Farms'], ['100%', 'Batch Traceability']].map(([val, lbl]) => (
                    <div key={lbl} className="p-3 rounded-2xl bg-emerald-900/60 border border-emerald-700/50">
                      <div className="text-xl font-extrabold text-emerald-300">{val}</div>
                      <div className="text-[10px] text-slate-300 font-bold">{lbl}</div>
                    </div>
                  ))}
                </div>
                <Link to="/marketplace?isOrganic=true" className="px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-lg">
                  <span>Explore NPOP Organic Range</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border-2 border-emerald-500/40 text-center space-y-4">
                <div className="w-48 h-48 bg-slate-900 p-4 rounded-2xl mx-auto flex items-center justify-center shadow-md">
                  <div className="bg-white p-2 rounded-xl text-center">
                    <QrCode className="w-36 h-36 text-slate-950 mx-auto" />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">Scan with camera for test report</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">Batch #2026-8941 • Patil Organic Hapus</p>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex justify-center gap-3">
                    <span>Harvest: 06:00 AM</span>
                    <span>Pesticide Score: <strong className="text-emerald-700 font-extrabold">PASS 0.00%</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================== 11. TESTIMONIALS ====================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700">CUSTOMER TESTIMONIALS</span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Real Stories from Mindful Kitchens</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex text-amber-500">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"{test.comment}"</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full object-cover border" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">{test.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{test.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================== 12. FARMER ONBOARDING CALLOUT ====================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-950 via-[#0a3d20] to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800">
                  We Feature Farmer Families
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                  Are You a Farmer? Sell Directly to Conscious Urban Households
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Get fair guaranteed prices for your produce without exploitative middleman cuts. We provide doorstep crates, verified harvest logistics, and direct bank payouts.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link to="/register?role=farmer" className="px-6 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-transform hover:-translate-y-0.5">
                    Register Farm / Start Selling →
                  </Link>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <span>Farmer Helpdesk: 1800-419-8800</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 bg-emerald-900/60 p-6 rounded-2xl border border-emerald-700/50 space-y-3 text-xs">
                <h4 className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">Quick Farmer Benefits</h4>
                <ul className="space-y-2 text-slate-200 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> 95% Producer Payout Share</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Timely Direct Bank Transfers</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Free Soil Certification &amp; Profile</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </div>
      </div>

      {/* ── Ticker Keyframe CSS ── */}
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker { animation: ticker 40s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
}
