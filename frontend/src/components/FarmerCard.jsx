import React from 'react';
import { Link } from 'react-router-dom';
import { Tractor, MapPin, Award, Star, ArrowRight, ShieldCheck } from 'lucide-react';

export default function FarmerCard({ farmer }) {
  const farm = farmer.farmDetails || {};
  const primaryCrops = farm.primaryCrops || ['Organic Vegetables'];

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col h-full">
      {/* Farm Banner Background */}
      <div className="relative h-32 bg-gradient-to-r from-emerald-800 to-agri-dark overflow-hidden">
        <img 
          src={farm.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'} 
          alt={farm.farmName} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
        
        {farm.isOrganicCertified && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
            <Award className="w-3.5 h-3.5" />
            Certified Organic
          </span>
        )}
      </div>

      {/* Profile Header Floating Avatar */}
      <div className="px-6 relative flex justify-between items-end -mt-10 mb-3">
        <div className="w-20 h-20 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-md shrink-0">
          <img 
            src={farmer.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=250&q=80'} 
            alt={farmer.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{farm.rating || 4.9}</span>
          <span className="text-slate-400 font-normal">({farm.reviewCount || 20})</span>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-6 pt-0 flex flex-col flex-grow">
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
          <Tractor className="w-4 h-4" />
          <span>{farmer.name}</span>
          {farm.verificationStatus === 'verified' && (
            <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Farm Origin" />
          )}
        </div>

        <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-2">
          {farm.farmName || `${farmer.name}'s Farm`}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{farm.farmLocation || 'Maharashtra, India'}</span>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {farm.bio || 'Family owned traditional farm using sustainable agricultural methods.'}
        </p>

        {/* Primary Crop Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {primaryCrops.map((crop, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px] font-medium">
              {crop}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <Link 
          to={`/farmers/${farmer.id || farmer._id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow transition-all duration-200"
        >
          <span>Visit Farm & Produce</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
