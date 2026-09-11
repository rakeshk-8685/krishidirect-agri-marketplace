import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Sprout, ShoppingBag, TrendingUp, UserCircle, Plus, ShieldCheck, Clock, AlertCircle, Tractor, ArrowUpRight } from 'lucide-react';

export default function FarmerNavbar() {
  const { user } = useAuth();
  const farm = user?.farmDetails || {};
  const isVerified = farm.verificationStatus === 'verified';
  const isPending = farm.verificationStatus === 'pending';

  const navItems = [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/farmer/products', label: 'Products', icon: Sprout },
    { to: '/farmer/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/farmer/sales', label: 'Sales Summary', icon: TrendingUp },
    { to: '/farmer/profile', label: 'My Farm Profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Desktop & Tablet Farmer Header Bar */}
      <div className="bg-emerald-900 text-white border-b border-emerald-950/60 sticky top-20 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            
            {/* Left: Farm Identity & Verification Pill */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <Tractor className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-extrabold text-white block leading-tight truncate max-w-[180px]">
                  {farm.farmName || `${user?.name}'s Farm`}
                </span>
                <span className="text-[10px] text-emerald-200 block">Farmer Portal</span>
              </div>

              {/* Verification Status Pill */}
              <div className="ml-1">
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-700/80 text-emerald-100 border border-emerald-500/40 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    <span>Verified</span>
                  </span>
                ) : isPending ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[10px] font-bold">
                    <Clock className="w-3 h-3 text-amber-300 animate-pulse" />
                    <span>Pending Verification</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/40 text-[10px] font-bold">
                    <AlertCircle className="w-3 h-3 text-rose-300" />
                    <span>Re-verify</span>
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-white text-emerald-950 shadow-sm'
                          : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right: Quick Action Button */}
            <div className="flex items-center gap-2">
              {isVerified ? (
                <Link
                  to="/farmer/products?action=new"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Produce</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              ) : (
                <Link
                  to="/farmer/profile"
                  className="px-3 py-1.5 rounded-xl bg-emerald-800/70 text-emerald-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Verification Info</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed for thumb reachability on mobile devices) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-colors min-h-[48px] py-1 ${
                    isActive
                      ? 'text-emerald-800 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-800' : ''}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] leading-tight text-center truncate px-0.5 max-w-full">
                      {item.label === 'Sales Summary' ? 'Sales' : item.label === 'My Farm Profile' ? 'Profile' : item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
}
