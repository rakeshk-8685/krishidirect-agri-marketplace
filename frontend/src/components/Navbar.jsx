import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Tractor, ShoppingBag, Heart, User, LogOut, Search, MapPin, ChevronDown, ShieldCheck, Sprout, Menu, X, TrendingUp, Newspaper, LayoutDashboard, Leaf, Star, Store } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Indiranagar, Bengaluru (560038)');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const locationsList = [
    'Indiranagar, Bengaluru (560038)',
    'Koramangala, Bengaluru (560034)',
    'Whitefield, Bengaluru (560066)',
    'Baner, Pune (411045)',
    'Viman Nagar, Pune (411014)',
    'South Delhi (110016)',
    'Andheri West, Mumbai (400058)'
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isLoginPage = location.pathname === '/login';

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs">

      {/* 1. Top Announcement Bar */}
      <div className="w-full bg-[#164E2E] text-white text-[11px] font-medium py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#0F3D24]">
        <div className="max-w-7xl xl:max-w-[1536px] w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <Leaf className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300 shrink-0" />
            <span className="bg-[#F5A623] text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shrink-0 shadow-xs">
              FRESH DISPATCH
            </span>
            <span className="truncate text-white/95 text-[11px] font-medium">
              Free direct farm delivery on orders over ₹4999. Daily morning harvest dispatches from local orchards & growers.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-200 text-[11px] font-bold shrink-0">
            <Leaf className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300" />
            <span>100% Direct Farmer Return</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="w-full bg-white border-b border-slate-100">
        <div className="max-w-7xl xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20 gap-4">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-[#1B5E3A] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Tractor className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-tight text-[#1B5E3A] font-sans leading-none block">
                  KrishiDirect
                </span>
              </div>
              <p className="text-[10px] font-black text-[#F5A623] uppercase tracking-widest leading-none mt-1 block">FARM TO CONSUMER</p>
            </div>
          </Link>

          {/* Location Delivery Selector (Pill) */}
          <div className="hidden lg:flex relative">
            <button
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-200/70 transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#007a48] shrink-0" />
              <div className="text-left leading-tight">
                <span className="text-[10px] text-slate-500 block">Deliver to:</span>
                <span className="truncate max-w-[160px] block font-bold text-slate-900 text-xs">{selectedLocation.split(',')[0]}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
            </button>

            {locationDropdownOpen && (
              <div
                className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs"
                onMouseLeave={() => setLocationDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 font-bold text-slate-400 uppercase text-[10px]">Select Delivery Zone</div>
                {locationsList.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setLocationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-colors ${selectedLocation === loc ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                      }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2">
            <div className="relative w-full flex items-center">
              <input
                type="text"
                placeholder="Search fresh produce, fruits, vegetables, dairy and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007a48] focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <button
                type="submit"
                className="absolute right-1 px-4 py-1.5 rounded-full bg-[#1B5E3A] hover:bg-[#14462B] text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Right Action Icons & User Dropdown */}
          <div className="hidden md:flex items-center gap-3">

            {/* Mandi Rates Button */}
            <Link
              to="/mandi-rates"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold transition-all ${
                isActive('/mandi-rates')
                  ? 'bg-[#1B5E3A] text-white border-[#1B5E3A] shadow-xs'
                  : 'bg-white text-[#1B5E3A] border-[#2F7D4F]/40 hover:bg-[#E8F3EA] hover:border-[#1B5E3A]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#2F7D4F]" />
              <span>Mandi Rates</span>
            </Link>

            {/* Govt News Button */}
            <Link
              to="/agri-news"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold transition-all ${
                isActive('/agri-news')
                  ? 'bg-[#1B5E3A] text-white border-[#1B5E3A] shadow-xs'
                  : 'bg-white text-[#1B5E3A] border-[#2F7D4F]/40 hover:bg-[#E8F3EA] hover:border-[#1B5E3A]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-[#2F7D4F]" />
              <span>Govt News</span>
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/marketplace"
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Saved Wishlist"
              aria-label="View Saved Wishlist"
            >
              <Heart className="w-5 h-5 text-slate-600" />
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#1B5E3A]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1B5E3A] text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile Button */}
            {user && location.pathname !== '/login' ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 pr-2.5 rounded-full bg-[#1B5E3A] text-white hover:bg-[#14462B] transition-all text-left cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-[#2F7D4F] flex items-center justify-center font-bold text-xs text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-white max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl py-2.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B5E3A] to-[#2F7D4F] flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-slate-900 text-xs truncate">{user.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                        <div className="mt-1">
                          {user.role === 'farmer' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                              <Tractor className="w-2.5 h-2.5 text-amber-600" />
                              <span>Farmer Portal</span>
                            </span>
                          ) : user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
                              <span>Admin Supervisor</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Leaf className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Consumer</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links according to role */}
                    <div className="py-1.5 px-1.5 space-y-0.5">
                      {user.role === 'farmer' ? (
                        <>
                          <Link
                            to="/farmer/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#1B5E3A] hover:bg-emerald-50/80 font-bold transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#2F7D4F]" />
                            <span>Farmer Dashboard</span>
                          </Link>
                          <Link
                            to="/farmer/products"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#1B5E3A] hover:bg-emerald-50/80 font-bold transition-colors"
                          >
                            <Sprout className="w-4 h-4 text-[#2F7D4F]" />
                            <span>My Produce Listings</span>
                          </Link>
                          <Link
                            to="/farmer/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#1B5E3A] hover:bg-emerald-50/80 font-bold transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-[#2F7D4F]" />
                            <span>Farm Orders</span>
                          </Link>
                          <Link
                            to="/farmer/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#1B5E3A] hover:bg-emerald-50/80 font-bold transition-colors"
                          >
                            <User className="w-4 h-4 text-[#2F7D4F]" />
                            <span>Farm Profile & Land</span>
                          </Link>
                        </>
                      ) : user.role === 'admin' ? (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#1B5E3A] hover:bg-emerald-50/80 font-bold transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link
                            to="/marketplace"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#1B5E3A] hover:bg-emerald-50/80 font-bold transition-colors"
                          >
                            <Store className="w-4 h-4 text-indigo-600" />
                            <span>Explore Marketplace</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#1B5E3A] hover:bg-emerald-50/80 font-bold transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-[#2F7D4F]" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            to="/cart"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#1B5E3A] hover:bg-emerald-50/80 font-bold transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-[#2F7D4F]" />
                            <span>Shopping Cart ({cartCount})</span>
                          </Link>
                          <Link
                            to="/marketplace"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#1B5E3A] hover:bg-emerald-50/80 font-bold transition-colors"
                          >
                            <Store className="w-4 h-4 text-[#2F7D4F]" />
                            <span>Browse Marketplace</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Sign Out Action */}
                    <div className="border-t border-slate-100 pt-1.5 px-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out Safely</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-xs font-bold text-[#1A1A1A] hover:text-[#1B5E3A] px-2 py-2 transition-colors">
                  Sign In
                </Link>
                <Link to="/login" className="text-xs font-extrabold bg-[#1B5E3A] hover:bg-[#14462B] text-white px-5 py-2.5 rounded-full shadow-md transition-all">
                  Get Started
                </Link>
              </div>
            )}

          </div>

          {/* Mobile Search & Menu Toggle */}
          <div className="md:hidden flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                mobileSearchOpen ? 'bg-emerald-50 text-[#1B5E3A]' : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-100'
              }`}
              aria-label="Toggle search bar"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link to="/cart" className="p-2 relative text-slate-700 hover:text-emerald-800 rounded-full hover:bg-slate-100 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1B5E3A] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
              className="p-2 text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-md px-4 py-2.5 border-t border-slate-200 shadow-md">
          <form
            onSubmit={(e) => {
              handleSearchSubmit(e);
              setMobileSearchOpen(false);
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              autoFocus
              placeholder="Search crops, fruits, vegetables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2 rounded-full border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <button
              type="submit"
              className="absolute right-1 px-3.5 py-1.5 rounded-full bg-[#1B5E3A] hover:bg-[#14462B] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* 3. Sub-Header Category Navigation Bar */}
      <div className="w-full bg-[#14462B] text-white text-xs font-semibold py-2.5 px-4 sm:px-6 lg:px-8 border-t border-[#0F3D24]">
        <div className="max-w-7xl xl:max-w-[1536px] w-full mx-auto flex items-center justify-between overflow-x-auto gap-4 no-scrollbar">

          <div className="flex items-center gap-7 shrink-0 text-white/95">
            <Link
              to="/marketplace"
              className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Produce Marketplace</span>
            </Link>

            <Link to="/marketplace?category=Vegetables" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fresh Vegetables</span>
            </Link>

            <Link to="/marketplace?category=Fruits" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <span className="text-emerald-400 text-xs leading-none">🍏</span>
              <span>Fruits</span>
            </Link>

            <Link to="/marketplace?category=Dairy%20%26%20Poultry" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <span className="text-emerald-400 text-xs leading-none">🥛</span>
              <span>Dairy & Honey</span>
            </Link>

            <Link to="/marketplace?isOrganic=true" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Organic</span>
            </Link>

            <Link
              to="/farmers"
              className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Verified Farms</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-200 shrink-0 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Direct Farmer Return</span>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white p-4 space-y-3 border-t">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <input
              type="text"
              placeholder="Search fresh produce..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs text-slate-900 bg-white"
            />
          </form>

          <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">
            Produce Marketplace
          </Link>
          <Link to="/farmers" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">
            Verified Farms
          </Link>
          <Link to="/mandi-rates" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-emerald-300">
            📊 Mandi Rates
          </Link>
          <Link to="/agri-news" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-emerald-300">
            📰 Govt News
          </Link>

          {user?.role === 'farmer' && (
            <Link to="/farmer/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-amber-400">
              Farmer Portal
            </Link>
          )}

          {user ? (
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-sm text-rose-400">
              Sign Out ({user.name})
            </button>
          ) : (
            <div className="pt-2 flex gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-1/2 py-2 text-center rounded-xl bg-slate-800 text-xs font-bold">
                Sign In
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-1/2 py-2 text-center rounded-xl bg-emerald-600 text-xs font-bold">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

    </header>
  );
}
