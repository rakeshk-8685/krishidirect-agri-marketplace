import React from 'react';
import { Link } from 'react-router-dom';
import { Tractor, ShieldCheck, HeartHandshake, Leaf, PhoneCall, Mail, MapPin, Truck, Award, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-slate-300 border-t border-emerald-900 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1. Top Trust Guarantee Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-emerald-900">
          
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 shrink-0 font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs">95%+ Direct Farmer Payouts</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Direct bank transfer to grower</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800">
            <div className="w-10 h-10 rounded-xl bg-amber-900/40 flex items-center justify-center text-amber-400 shrink-0 font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs">No Middleman Margin</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Fair farm pricing index</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 shrink-0 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs">NPOP & FSSAI Certified</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">120-residue lab test verified</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800">
            <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center text-blue-300 shrink-0 font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs">Same Day Harvest Dispatch</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero cold storage transit</p>
            </div>
          </div>

        </div>

        {/* 2. Main Footer Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-extrabold">
                <Tractor className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">KrishiDirect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering regional agriculturalists through direct technology platforms. Connecting conscious urban households directly with rural farming communities.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-300 pt-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Helpline: +91 1800-419-8800</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-b border-emerald-900 pb-2">Marketplace</h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link to="/marketplace?category=Vegetables" className="hover:text-emerald-400">Fresh Veggies</Link></li>
              <li><Link to="/marketplace?category=Fruits" className="hover:text-emerald-400">Native Fruits</Link></li>
              <li><Link to="/marketplace?category=Dairy%20%26%20Poultry" className="hover:text-emerald-400">A2 Dairy & Ghee</Link></li>
              <li><Link to="/marketplace?category=Grains%20%26%20Pulses" className="hover:text-emerald-400">Ancient Millets</Link></li>
              <li><Link to="/marketplace?isOrganic=true" className="hover:text-emerald-400">Certified Organic</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-b border-emerald-900 pb-2">For Customers</h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link to="/marketplace" className="hover:text-emerald-400">Browse Harvests</Link></li>
              <li><Link to="/farmers" className="hover:text-emerald-400">Meet Farm Families</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-400">Order Tracking</Link></li>
              <li><Link to="/cart" className="hover:text-emerald-400">Shopping Basket</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-b border-emerald-900 pb-2">For Farmers</h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link to="/register?role=farmer" className="text-amber-400 font-bold hover:underline">Become a Partner Farmer</Link></li>
              <li><Link to="/farmer/dashboard" className="hover:text-emerald-400">Farmer Dashboard</Link></li>
              <li><Link to="/farmer/products" className="hover:text-emerald-400">List Crop Harvest</Link></li>
              <li><Link to="/farmer/orders" className="hover:text-emerald-400">Order Fulfillment</Link></li>
            </ul>
          </div>

        </div>

        {/* 3. Bottom Legal & Copyright Bar */}
        <div className="pt-8 border-t border-emerald-900 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} KrishiDirect Technologies Inc. All Rights Reserved.</p>
          <div className="mt-4 sm:mt-0 flex justify-center gap-6 text-[11px]">
            <span className="hover:text-white cursor-pointer">Ethical Fair Price Policy</span>
            <span className="hover:text-white cursor-pointer">Organic Certification Standard</span>
            <span className="hover:text-white cursor-pointer">Privacy & Data Security</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
