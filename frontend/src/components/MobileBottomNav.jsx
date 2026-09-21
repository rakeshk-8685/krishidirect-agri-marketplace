import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Compass, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  // Determine account link based on auth status
  const accountLink = user 
    ? (user.role === 'farmer' ? '/farmer/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/orders')
    : '/login';

  const navItems = [
    { label: 'Home', icon: Home, to: '/' },
    { label: 'Mandi', icon: TrendingUp, to: '/mandi-rates' },
    { label: 'Explore', icon: Compass, to: '/marketplace' },
    { label: 'Cart', icon: ShoppingBag, to: '/cart', badge: cartCount },
    { label: 'Account', icon: User, to: accountLink }
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 relative ${
                isActive 
                  ? 'text-[#104b2b] font-bold' 
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`} 
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#e55a2b] text-white text-[9px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-extrabold text-[#104b2b]' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#104b2b] mt-0.5 absolute -bottom-0.5" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
