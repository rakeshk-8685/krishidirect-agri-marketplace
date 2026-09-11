import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Tractor, User, Mail, Phone, Lock, MapPin, Award, Sprout, FileText, CheckCircle2, ShieldAlert, ArrowRight, Upload } from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'farmer' ? 'farmer' : 'consumer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Farmer Specific Fields
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');
  const [sizeInAcres, setSizeInAcres] = useState(5);
  const [farmingMethod, setFarmingMethod] = useState('Organic');
  const [primaryCrops, setPrimaryCrops] = useState('Tomatoes, Onions, Wheat');
  const [documentFileName, setDocumentFileName] = useState('');
  const [isOrganicCertified, setIsOrganicCertified] = useState(true);
  const [certificationNumber, setCertificationNumber] = useState('');
  const [bio, setBio] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const indianStates = [
    'Maharashtra', 'Punjab', 'Karnataka', 'Gujarat', 'Uttar Pradesh', 
    'Tamil Nadu', 'Andhra Pradesh', 'Madhya Pradesh', 'Haryana', 'Kerala', 'West Bengal'
  ];

  const handleSimulatedDocUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFileName(file.name);
      showToast(`Document attached: ${file.name}`, 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      showToast('Please fill in all basic account credentials.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    if (role === 'farmer') {
      if (!farmName.trim() || !farmLocation.trim() || !district.trim()) {
        showToast('Please provide your farm name, village/area, and district.', 'error');
        return;
      }
      if (Number(sizeInAcres) <= 0) {
        showToast('Farm size must be greater than 0 acres.', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      const cropsArray = primaryCrops
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role,
        farmingMethod,
        cropTypes: cropsArray,
        farmDetails: role === 'farmer' ? {
          farmName: farmName.trim() || `${name.trim()}'s Farm`,
          farmLocation: farmLocation.trim() || `${district}, ${state}`,
          state,
          district: district.trim(),
          sizeInAcres: Number(sizeInAcres),
          farmingMethod,
          primaryCrops: cropsArray.length ? cropsArray : ['Fresh Produce'],
          isOrganicCertified: farmingMethod === 'Organic' ? isOrganicCertified : false,
          certificationNumber: farmingMethod === 'Organic' ? certificationNumber.trim() : '',
          bio: bio.trim() || `Family-owned farm growing fresh ${primaryCrops} using ${farmingMethod} methods.`,
          verificationDocumentName: documentFileName || 'Self-attested land record'
        } : null
      };

      const user = await register(payload);
      if (user.role === 'farmer') {
        showToast('Farmer registered successfully! Verification status: Pending.', 'success');
        navigate('/farmer/dashboard');
      } else {
        showToast('Welcome to KrishiDirect Marketplace!', 'success');
        navigate('/marketplace');
      }
    } catch (err) {
      showToast(err.message || 'Registration failed. Please check inputs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md">
            <Tractor className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {role === 'farmer' ? 'Register as a Farmer Grower' : 'Create KrishiDirect Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {role === 'farmer' 
              ? 'Connect directly with consumer households. Zero middlemen commissions, guaranteed transparent payouts.'
              : 'Buy fresh farm produce directly harvested from certified growers.'}
          </p>
        </div>

        {/* Role Switcher Pills */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('farmer')}
            className={`py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              role === 'farmer' ? 'bg-white text-amber-900 shadow-md border border-amber-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tractor className="w-4 h-4 text-amber-600" />
            <span>Farmer / Producer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('consumer')}
            className={`py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              role === 'consumer' ? 'bg-white text-emerald-800 shadow-md border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Consumer / Buyer</span>
          </button>
        </div>

        {role === 'farmer' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Farmer Verification Process</strong>
              <p className="text-[11px] text-amber-800 mt-0.5">
                All farmer accounts default to <strong>Pending Verification</strong> upon registration to protect consumer quality. Once your farm details are approved, you can immediately list produce lots and fulfill direct orders.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Account & Contact Credentials */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Account & Contact Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. farmer.ramesh@agridirect.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password * (min 6 characters)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:outline-none ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40' 
                        : 'border-slate-200 focus:ring-emerald-600'
                    }`}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-rose-600 mt-1 font-semibold">Passwords do not match.</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Farm Identity & Agronomy Details (Farmer Only) */}
          {role === 'farmer' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>2. Farm Identity & Agricultural Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farm Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sahyadri Organic Orchards"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farm Size (in Acres) *</label>
                  <input
                    type="number"
                    required
                    min={0.5}
                    step={0.5}
                    placeholder="e.g. 5"
                    value={sizeInAcres}
                    onChange={(e) => setSizeInAcres(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Farm Location / Village Area *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gat No. 42, Dindori Taluka"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                  >
                    {indianStates.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nashik"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farming Method *</label>
                  <select
                    value={farmingMethod}
                    onChange={(e) => setFarmingMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                  >
                    <option value="Organic">Organic (Pesticide-Free / Natural)</option>
                    <option value="Conventional">Conventional (Standard GAP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Crops Grown * (Comma-separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomatoes, Onions, Wheat, Mangoes"
                    value={primaryCrops}
                    onChange={(e) => setPrimaryCrops(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {farmingMethod === 'Organic' && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isOrganicCertified"
                      checked={isOrganicCertified}
                      onChange={(e) => setIsOrganicCertified(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="isOrganicCertified" className="text-xs font-bold text-emerald-950">
                      I have an Organic Certification / NPOP / PGS-India Registration
                    </label>
                  </div>

                  {isOrganicCertified && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Certification Number / Agency
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. NPOP/NAB/0014/2024"
                        value={certificationNumber}
                        onChange={(e) => setCertificationNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Optional Document Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Government ID / 7/12 Land Record / Certification Document (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-dashed border-emerald-500 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-800 font-bold text-xs flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Choose File (PDF/Image)</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleSimulatedDocUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-500 truncate max-w-[200px]">
                    {documentFileName || 'No document chosen yet'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Uploading land documents expedites verification within 12 hours.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brief Farm Story / Bio (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Share a short note about your farm tradition, soil care, or produce quality..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Creating your account...</span>
            ) : (
              <>
                <span>{role === 'farmer' ? 'Register & Submit Farm Application' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 font-bold hover:underline">
              Sign In Here
            </Link>
          </div>

        </form>

      </div>
    </div>
  );
}
