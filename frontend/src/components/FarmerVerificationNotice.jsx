import React from 'react';
import { ShieldCheck, AlertCircle, Clock, XCircle, FileCheck, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Reusable banner component for farmer verification status.
 * Clear, friendly, and instructive for farmers with any level of digital literacy.
 */
export default function FarmerVerificationNotice({ farmDetails, compact = false }) {
  const status = farmDetails?.verificationStatus || 'pending';
  const notes = farmDetails?.verificationNotes;

  if (status === 'verified') {
    if (compact) return null;
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-emerald-900">Verified KrishiDirect Farmer Account</h4>
            <p className="text-[11px] text-emerald-700">Your farm credentials & land documents are verified. All marketplace features are active.</p>
          </div>
        </div>
        <span className="shrink-0 px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider">
          Verified Active
        </span>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="p-5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-rose-900">Verification Action Required</h4>
            <p className="text-xs text-rose-800">
              {notes || 'Your farmer registration details or certifications could not be verified by the admin team.'}
            </p>
            <p className="text-[11px] text-rose-700">
              Please review and update your farm profile details or upload valid documents to request re-verification.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Link
            to="/farmer/profile?mode=edit"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            Update Farm Profile
          </Link>
        </div>
      </div>
    );
  }

  // Pending status
  return (
    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
          <Clock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-amber-950">Farmer Verification Pending Approval</h4>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px] uppercase">
              Under Review
            </span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Your account is currently under verification. Our agricultural onboarding team is reviewing your farm location and crop credentials.
          </p>
          <p className="text-[11px] text-amber-800 font-medium">
            🔒 <strong>Note:</strong> You can set up your farm profile and view sample metrics now. Listing new produce and order acceptance will be automatically unlocked once your verification is approved (typically 24 hours).
          </p>
        </div>
      </div>

      <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
        <Link
          to="/farmer/profile"
          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-colors text-center"
        >
          Check Profile Credentials
        </Link>
      </div>
    </div>
  );
}
