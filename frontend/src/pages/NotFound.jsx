import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-24 h-24 bg-agri-green-50 text-agri-green rounded-full flex items-center justify-center text-4xl font-black mb-6 shadow-inner border border-agri-green-100">
        404
      </div>
      <h1 className="text-3xl sm:text-4xl font-black text-agri-dark mb-3">
        Field Not Found
      </h1>
      <p className="text-agri-slate max-w-md text-base sm:text-lg mb-8 leading-relaxed">
        The harvest trail you are following doesn't exist or has moved to another farm plot. Let's get you back to the fresh produce.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-agri-green text-white font-bold rounded-xl shadow-md hover:bg-agri-green-600 transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-agri-green font-bold rounded-xl border-2 border-agri-green shadow-sm hover:bg-agri-green-50 transition-all active:scale-95"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Marketplace
        </Link>
      </div>
    </div>
  );
}
