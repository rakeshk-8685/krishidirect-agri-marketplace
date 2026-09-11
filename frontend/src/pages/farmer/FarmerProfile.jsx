import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiCall } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import FarmerNavbar from '../../components/FarmerNavbar';
import FarmerVerificationNotice from '../../components/FarmerVerificationNotice';
import { User, Mail, Phone, Tractor, MapPin, Sprout, CreditCard, ShieldCheck, AlertCircle, Clock, Edit2, Save, X, Award, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function FarmerProfile() {
  const [searchParams] = useSearchParams();
  const { user, login } = useAuth();
  const { showToast } = useNotification();

  const [isEditing, setIsEditing] = useState(searchParams.get('mode') === 'edit');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const farm = user?.farmDetails || {};

  // Form States
  // 1. Personal
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // 2. Farm
  const [farmName, setFarmName] = useState(farm.farmName || '');
  const [farmLocation, setFarmLocation] = useState(farm.farmLocation || '');
  const [district, setDistrict] = useState(farm.district || '');
  const [state, setState] = useState(farm.state || 'Maharashtra');
  const [sizeInAcres, setSizeInAcres] = useState(farm.sizeInAcres || 5);
  const [farmingMethod, setFarmingMethod] = useState(farm.farmingMethod || 'Organic');
  const [primaryCrops, setPrimaryCrops] = useState(
    Array.isArray(farm.primaryCrops) ? farm.primaryCrops.join(', ') : (farm.primaryCrops || '')
  );
  const [isOrganicCertified, setIsOrganicCertified] = useState(farm.isOrganicCertified || false);
  const [certificationNumber, setCertificationNumber] = useState(farm.certificationNumber || '');
  const [bio, setBio] = useState(farm.bio || '');

  // 3. Bank / Payout
  const [accountHolder, setAccountHolder] = useState(farm.bankDetails?.accountHolder || user?.name || '');
  const [accountNumber, setAccountNumber] = useState(farm.bankDetails?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(farm.bankDetails?.ifscCode || '');
  const [upiId, setUpiId] = useState(farm.bankDetails?.upiId || '');

  const indianStates = [
    'Maharashtra', 'Punjab', 'Karnataka', 'Gujarat', 'Uttar Pradesh', 
    'Tamil Nadu', 'Andhra Pradesh', 'Madhya Pradesh', 'Haryana', 'Kerala', 'West Bengal'
  ];

  // Sync state if user updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      const f = user.farmDetails || {};
      setFarmName(f.farmName || '');
      setFarmLocation(f.farmLocation || '');
      setDistrict(f.district || '');
      setState(f.state || 'Maharashtra');
      setSizeInAcres(f.sizeInAcres || 5);
      setFarmingMethod(f.farmingMethod || 'Organic');
      setPrimaryCrops(Array.isArray(f.primaryCrops) ? f.primaryCrops.join(', ') : (f.primaryCrops || ''));
      setIsOrganicCertified(f.isOrganicCertified || false);
      setCertificationNumber(f.certificationNumber || '');
      setBio(f.bio || '');
      setAccountHolder(f.bankDetails?.accountHolder || user.name || '');
      setAccountNumber(f.bankDetails?.accountNumber || '');
      setIfscCode(f.bankDetails?.ifscCode || '');
      setUpiId(f.bankDetails?.upiId || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      showToast('Please provide your name and contact phone.', 'error');
      return;
    }
    if (!farmName.trim() || !farmLocation.trim() || !district.trim()) {
      showToast('Please provide farm name, location, and district.', 'error');
      return;
    }

    setSaving(true);
    try {
      const cropsArray = primaryCrops
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        farmName: farmName.trim(),
        farmLocation: farmLocation.trim(),
        state,
        district: district.trim(),
        sizeInAcres: Number(sizeInAcres),
        farmingMethod,
        primaryCrops: cropsArray,
        isOrganicCertified: farmingMethod === 'Organic' ? isOrganicCertified : false,
        certificationNumber: farmingMethod === 'Organic' ? certificationNumber.trim() : '',
        bio: bio.trim(),
        bankDetails: {
          accountHolder: accountHolder.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          upiId: upiId.trim()
        }
      };

      const res = await apiCall('/farmers/profile', 'PUT', payload);
      if (res.success) {
        showToast('Farm profile and payout details updated successfully!', 'success');
        setIsEditing(false);

        // Update local session context
        if (res.farmer) {
          const storedToken = localStorage.getItem('agri_token');
          if (storedToken) {
            login(storedToken, res.farmer);
          }
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update farm profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const status = farm.verificationStatus || 'pending';

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 md:pb-12">
      <FarmerNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Verification Alert Banner */}
        <FarmerVerificationNotice farmDetails={farm} />

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'F'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user?.name}</h1>
                {status === 'verified' && (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" title="Verified Producer" />
                )}
              </div>
              <p className="text-xs text-slate-500">{farm.farmName || 'KrishiDirect Partner Farm'}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                  {farm.district || 'India'}, {farm.state || ''}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-100">
                  {farm.farmingMethod || 'Organic'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel Editing</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Farm Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* VIEW MODE vs EDIT MODE */}
        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <div className="space-y-6">
            
            {/* 1. Verification Status (Read Only) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-700" />
                <span>Marketplace Verification Status (Read-Only)</span>
              </h3>
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">Current Status:</span>
                    <span className={`px-3 py-1 rounded-full font-extrabold uppercase text-[10px] ${
                      status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : status === 'pending'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {status === 'verified'
                      ? 'Your account has been audited by regional agronomy inspectors. Verified badges are displayed to buyers.'
                      : farm.verificationNotes || 'Application submitted. Admins inspect soil certificates and identity credentials.'}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 font-medium">
                  {status === 'verified' ? '✓ Fully Verified' : '⏱ Typical review time: 24h'}
                </div>
              </div>
            </div>

            {/* 2. Personal & Farm Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Personal Credentials */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Personal Details</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Full Name</span>
                    <span className="font-extrabold text-slate-900 text-sm">{user?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone Number</span>
                    <span className="font-bold text-slate-800">{user?.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Email Address</span>
                    <span className="font-medium text-slate-700">{user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Farm Identity Details */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Tractor className="w-4 h-4 text-emerald-700" />
                  <span>Farm Identity & Land</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Farm Name</span>
                    <span className="font-extrabold text-slate-900 text-sm">{farm.farmName || `${user?.name}'s Farm`}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Location</span>
                    <span className="font-medium text-slate-800">{farm.farmLocation || 'India'}, {farm.district}, {farm.state}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Farm Size</span>
                      <span className="font-bold text-slate-900">{farm.sizeInAcres || 5} Acres</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Method</span>
                      <span className="font-bold text-emerald-800">{farm.farmingMethod || 'Organic'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. Crop Specialization & Farm Story */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <span>Crop Specialization & Farm Story</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Primary Crops Grown</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(farm.primaryCrops) ? farm.primaryCrops : (farm.primaryCrops || 'Produce').split(',')).map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-100">
                        {c.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {farm.certificationNumber && (
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Organic Certification Reg No.</span>
                    <span className="font-bold text-slate-800">{farm.certificationNumber}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">About the Farm</span>
                  <p className="text-slate-600 leading-relaxed mt-0.5">
                    {farm.bio || 'Family-operated farm practicing sustainable agriculture.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Bank / Payout Details */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Bank & Direct Payout Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Holder</span>
                  <span className="font-bold text-slate-900">{farm.bankDetails?.accountHolder || user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Number</span>
                  <span className="font-bold text-slate-900">
                    {farm.bankDetails?.accountNumber ? `•••• •••• ${farm.bankDetails.accountNumber.slice(-4)}` : 'Not configured'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">IFSC Code</span>
                  <span className="font-bold text-slate-900">{farm.bankDetails?.ifscCode || 'Not configured'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">UPI ID</span>
                  <span className="font-bold text-emerald-800">{farm.bankDetails?.upiId || 'Not configured'}</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            
            {/* Personal Details Form Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b pb-3">
                <User className="w-4 h-4 text-emerald-700" />
                <span>1. Edit Personal Contact Info</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Farm Details Form Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b pb-3">
                <Tractor className="w-4 h-4 text-emerald-700" />
                <span>2. Edit Farm Identity & Agricultural Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Farm / Orchard Name *</label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Farm Land Size (Acres) *</label>
                  <input
                    type="number"
                    required
                    min={0.5}
                    step={0.5}
                    value={sizeInAcres}
                    onChange={(e) => setSizeInAcres(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Farm Address / Village Gat No. *</label>
                <input
                  type="text"
                  required
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {indianStates.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Farming Method *</label>
                  <select
                    value={farmingMethod}
                    onChange={(e) => setFarmingMethod(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Organic">Organic (Zero Chemicals / Natural)</option>
                    <option value="Conventional">Conventional Good Agricultural Practices</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Crops Grown (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Tomatoes, Onions, Alphonso Mangoes"
                    value={primaryCrops}
                    onChange={(e) => setPrimaryCrops(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {farmingMethod === 'Organic' && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editIsOrganic"
                      checked={isOrganicCertified}
                      onChange={(e) => setIsOrganicCertified(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="editIsOrganic" className="font-bold text-emerald-950">
                      I have an Organic Certification Number (NPOP / PGS-India)
                    </label>
                  </div>

                  {isOrganicCertified && (
                    <input
                      type="text"
                      placeholder="e.g. NPOP/NAB/0014/2024"
                      value={certificationNumber}
                      onChange={(e) => setCertificationNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Farm Story / Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio about your farm traditions, soil testing, or quality practices..."
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Bank / Payout Credentials Form Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b pb-3">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>3. Bank Account & UPI Details (For Payout Transfers)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 123456789012"
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank IFSC Code</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="e.g. SBIN0001234"
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">UPI ID (Optional)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. ramesh@upi"
                    className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
