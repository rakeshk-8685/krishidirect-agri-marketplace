import React from 'react';
import { Sprout, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ 
  title = 'No items found', 
  description = 'We could not find any produce matching your criteria.',
  actionLabel,
  actionPath,
  onReset
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100/80 flex items-center justify-center text-emerald-700 mb-4">
        <Sprout className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed">{description}</p>

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold text-xs shadow hover:bg-emerald-900 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Filters</span>
        </button>
      )}

      {actionPath && actionLabel && (
        <Link
          to={actionPath}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold text-xs shadow hover:bg-emerald-900 transition-colors"
        >
          <span>{actionLabel}</span>
        </Link>
      )}
    </div>
  );
}
