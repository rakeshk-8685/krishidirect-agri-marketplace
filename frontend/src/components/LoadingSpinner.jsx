import React from 'react';
import { Tractor } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading fresh farm data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[350px]">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <Tractor className="w-7 h-7 text-emerald-700 absolute" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">{message}</p>
    </div>
  );
}
