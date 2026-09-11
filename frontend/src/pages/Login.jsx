import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Tractor, User, Lock, Mail, Eye, EyeOff, Settings, Sparkles, AlertCircle, RefreshCw, Check } from 'lucide-react';

// Official Multi-color Google SVG Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// Official Apple SVG Icon
const AppleIcon = () => (
  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.51 2.67-1.26z" />
  </svg>
);

export default function Login() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('consumer');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [submittingRegister, setSubmittingRegister] = useState(false);

  // Form Validation & Inline Errors
  const [errors, setErrors] = useState({});

  // Modals
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const { login, register, googleLogin } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateLoginForm = () => {
    const errs = {};
    if (!loginEmail.trim()) {
      errs.loginEmail = 'Email address is required.';
    } else if (!validateEmail(loginEmail)) {
      errs.loginEmail = 'Please enter a valid email address.';
    }

    if (!loginPassword) {
      errs.loginPassword = 'Password is required.';
    } else if (loginPassword.length < 6) {
      errs.loginPassword = 'Password must contain at least 6 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegisterForm = () => {
    const errs = {};
    if (!regName.trim()) errs.regName = 'Full Name is required.';
    if (!regEmail.trim()) {
      errs.regEmail = 'Email address is required.';
    } else if (!validateEmail(regEmail)) {
      errs.regEmail = 'Please enter a valid email address.';
    }
    if (!regPhone.trim()) {
      errs.regPhone = 'Mobile number is required.';
    }
    if (!regPassword) {
      errs.regPassword = 'Password is required.';
    } else if (regPassword.length < 8) {
      errs.regPassword = 'Password must contain at least 8 characters.';
    }
    if (regPassword !== regConfirmPassword) {
      errs.regConfirmPassword = 'Passwords do not match.';
    }
    if (regRole === 'farmer') {
      if (!farmName.trim()) errs.farmName = 'Farm name is required.';
      if (!farmLocation.trim()) errs.farmLocation = 'Farm location is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setSubmittingLogin(true);
    try {
      const user = await login(loginEmail.trim(), loginPassword);
      if (user?.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setSubmittingRegister(true);
    try {
      const payload = {
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        confirmPassword: regConfirmPassword,
        role: regRole
      };

      if (regRole === 'farmer') {
        payload.farmDetails = {
          farmName: farmName.trim(),
          farmLocation: farmLocation.trim(),
          isOrganicCertified: true
        };
      }

      const user = await register(payload);
      if (user?.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setSubmittingRegister(false);
    }
  };

  const handleDemoFill = (role, demoEmail, demoPass = 'Password@123') => {
    setActiveTab('login');
    setLoginEmail(demoEmail);
    setLoginPassword(demoPass);
    setErrors({});
    showToast(`Loaded ${role} credentials. Click "Sign In →"`, 'info');
  };

  const handleGoogleAuthSelect = async (account) => {
    setGoogleSubmitting(true);
    try {
      if (googleLogin) {
        const user = await googleLogin({
          email: account.email,
          name: account.name,
          avatar: account.avatar,
          role: regRole || 'consumer'
        });
        setGoogleModalOpen(false);
        if (user?.role === 'farmer') navigate('/farmer/dashboard');
        else if (user?.role === 'admin') navigate('/admin/dashboard');
        else navigate('/marketplace');
      } else {
        const user = await login(account.email, 'Password@123');
        setGoogleModalOpen(false);
        if (user?.role === 'farmer') navigate('/farmer/dashboard');
        else if (user?.role === 'admin') navigate('/admin/dashboard');
        else navigate('/marketplace');
      }
    } catch (err) {
      console.error('Google Auth error:', err);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail || !validateEmail(forgotEmail)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setForgotSubmitting(true);
    setTimeout(() => {
      setForgotSubmitting(false);
      setForgotSuccess(true);
      showToast('Password reset link sent! Check your email inbox.', 'success');
    }, 1000);
  };  return (
    <div
      className="relative w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-6 sm:py-8 lg:py-12 px-4 sm:px-8 lg:px-12 xl:px-16 overflow-hidden"
      style={{
        backgroundColor: '#E8F3EA',
        backgroundImage: `radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.9) 0%, rgba(232, 243, 234, 0.8) 50%, rgba(220, 237, 224, 0.9) 100%)`
      }}
    >
      {/* Organic ambient light blooms */}
      <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-200/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center lg:items-stretch justify-center">
          
          {/* ========================================================================= */}
          {/* LEFT SIDE: HERO MARKETING - Matches Image 1 Exactly                       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 w-full flex justify-center lg:justify-end lg:items-stretch">
            <div className="w-full max-w-[620px] relative rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(27,94,58,0.12),0_4px_12px_rgba(0,0,0,0.06)] border border-white/90 bg-white group aspect-[1042/1008] lg:aspect-auto lg:h-full">
              <img
                src="/images/krishi_hero_exact.png"
                alt="Good Food Brighter Futures - KrishiDirect Farm to Consumer"
                className="absolute inset-0 w-full h-full object-cover object-center block"
              />
              {/* Screen reader text for full accessibility & SEO */}
              <div className="sr-only">
                <h1>Good Food Brighter Futures</h1>
                <p>Access fresh, healthy and locally sourced produce directly from farmers. Support rural communities, eat better, live better.</p>
                <ul>
                  <li>Fresh & Chemical-Free</li>
                  <li>Support Local Farmers</li>
                  <li>Direct Farm to Home</li>
                  <li>Better Food Brighter Tomorrow</li>
                </ul>
                <p>Stronger Farmers, Happier Families</p>
                <div>5K+ Verified Farmers, 10K+ Happy Customers, 50+ Cities, 100% Farmer Return</div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT SIDE: AUTHENTICATION DIALOG CARD (Right ~35% width)                 */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-start">
            
            {/* Ultra-Premium Glassmorphism Card */}
            <div className="w-full max-w-[440px] bg-white/70 hover:bg-white/75 backdrop-blur-2xl rounded-[32px] border border-white/80 shadow-[0_25px_60px_-15px_rgba(27,94,58,0.18),0_10px_30px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 sm:p-6 space-y-3 relative overflow-hidden transition-all flex flex-col">
              
              {/* Internal Organic Ambient Light Blooms for Glassmorphism */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/25 rounded-full blur-3xl pointer-events-none -z-0" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none -z-0" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-300/15 rounded-full blur-2xl pointer-events-none -z-0" />

              {/* Top-Right Decorative Note ("Good Food Brighter Tomorrow" with leaf doodle) */}
              <div className="absolute top-3.5 right-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white/90 shadow-xs select-none pointer-events-none z-10">
                <svg className="w-3.5 h-3.5 text-[#2F7D4F] fill-[#2F7D4F] transform -rotate-12 drop-shadow-xs shrink-0" viewBox="0 0 32 32">
                  <path d="M6 26 C6 26, 8 16, 18 8 C25 2, 30 2, 30 2 C30 2, 30 7, 24 14 C16 22, 6 26, 6 26 Z" />
                  <path d="M6 26 Q 16 16 30 2" stroke="#1B5E3A" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
                <div className="text-right leading-none" style={{ fontFamily: "'Caveat', cursive" }}>
                  <span className="font-bold text-[13px] text-[#1B5E3A] block">
                    Good Food Brighter Tomorrow
                  </span>
                </div>
              </div>

              {/* Brand Logo & Header */}
              <div className="space-y-2 pt-0.5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1B5E3A] via-[#2F7D4F] to-[#164E2E] flex items-center justify-center text-white shadow-md shadow-[#1B5E3A]/25 ring-2 ring-white/90">
                    <Tractor className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-black text-xl tracking-tight text-[#1A1A1A] block leading-none">
                      KrishiDirect
                    </span>
                    <span className="text-[8px] font-black text-[#F5A623] tracking-widest uppercase block mt-0.5">
                      FARM TO CONSUMER
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">
                    {activeTab === 'login' ? 'Sign In to KrishiDirect' : 'Create Your Account'}
                  </h2>
                  <p className="text-[11px] text-[#525B69] mt-0.5 leading-snug">
                    {activeTab === 'login'
                      ? 'Access your account and continue your journey with fresh, healthy food.'
                      : 'Join KrishiDirect to buy or sell fresh farm produce directly.'}
                  </p>
                </div>
              </div>

              {/* Quick Demo Access (Pill Shape Buttons Above Tabs) */}
              <div className="space-y-1.5 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 px-0.5">
                  <span className="flex items-center gap-1 text-[#1B5E3A]">
                    <Sparkles className="w-3 h-3 text-[#2F7D4F]" />
                    <span>Quick Demo Access:</span>
                  </span>
                  <span className="text-[9px] text-[#2F7D4F] font-semibold">1-click fill</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Consumer */}
                  <button
                    type="button"
                    onClick={() => handleDemoFill('Consumer', 'consumer@gmail.com')}
                    className="py-1.5 px-2.5 rounded-full border border-emerald-300/70 hover:border-[#1B5E3A] bg-white/70 hover:bg-white/95 backdrop-blur-md text-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md active:scale-95 group"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[#1B5E3A] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <User className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Consumer</span>
                  </button>

                  {/* Farmer */}
                  <button
                    type="button"
                    onClick={() => handleDemoFill('Farmer', 'farmer.ramesh@agridirect.in')}
                    className="py-1.5 px-2.5 rounded-full border border-amber-300/70 hover:border-[#D97706] bg-white/70 hover:bg-white/95 backdrop-blur-md text-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md active:scale-95 group"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[#D97706] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <Tractor className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Farmer</span>
                  </button>

                  {/* Admin */}
                  <button
                    type="button"
                    onClick={() => handleDemoFill('Admin', 'admin@agridirect.in')}
                    className="py-1.5 px-2.5 rounded-full border border-indigo-300/70 hover:border-[#6366F1] bg-white/70 hover:bg-white/95 backdrop-blur-md text-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md active:scale-95 group"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[#6366F1] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <Settings className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Admin</span>
                  </button>
                </div>
              </div>

              {/* Glass Segmented Tab Switcher (Pill Shape) */}
              <div className="p-1 rounded-full bg-slate-100/80 backdrop-blur-md border border-white/80 shadow-inner flex relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrors({});
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'login'
                      ? 'bg-white text-[#1B5E3A] font-extrabold shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span>Sign In</span>
                  {activeTab === 'login' && <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D4F]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrors({});
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'register'
                      ? 'bg-white text-[#1B5E3A] font-extrabold shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span>Create Account</span>
                  {activeTab === 'register' && <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D4F]" />}
                </button>
              </div>

              {/* =================================================================== */}
              {/* TAB 1: SIGN IN FORM                                                 */}
              {/* =================================================================== */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-2.5 pt-0.5 relative z-10" noValidate>
                  
                  {/* Email Input (Pill Shape) */}
                  <div>
                    <div className="relative group">
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (errors.loginEmail) setErrors({ ...errors, loginEmail: null });
                        }}
                        placeholder="Enter your email address"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-full border text-xs font-medium text-[#1A1A1A] bg-white/75 hover:bg-white/95 focus:bg-white backdrop-blur-md transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-4 ${
                          errors.loginEmail
                            ? 'border-rose-300 focus:ring-rose-400/20 bg-rose-50/30'
                            : 'border-slate-200/80 hover:border-[#2F7D4F]/40 focus:border-[#1B5E3A] focus:ring-[#1B5E3A]/10'
                        }`}
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#1B5E3A] absolute left-3.5 top-3 transition-colors" />
                    </div>
                    {errors.loginEmail && (
                      <p className="text-[10px] text-rose-600 font-semibold pt-0.5 pl-3 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.loginEmail}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Input (Pill Shape) */}
                  <div>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (errors.loginPassword) setErrors({ ...errors, loginPassword: null });
                        }}
                        placeholder="Enter your password"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-full border text-xs font-medium text-[#1A1A1A] bg-white/75 hover:bg-white/95 focus:bg-white backdrop-blur-md transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-4 ${
                          errors.loginPassword
                            ? 'border-rose-300 focus:ring-rose-400/20 bg-rose-50/30'
                            : 'border-slate-200/80 hover:border-[#2F7D4F]/40 focus:border-[#1B5E3A] focus:ring-[#1B5E3A]/10'
                        }`}
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#1B5E3A] absolute left-3.5 top-3 transition-colors" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-2 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.loginPassword && (
                      <p className="text-[10px] text-rose-600 font-semibold pt-0.5 pl-3 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.loginPassword}</span>
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5 px-1">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#1B5E3A] border-slate-300 focus:ring-[#2F7D4F] cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotSuccess(false);
                        setForgotEmail(loginEmail || '');
                        setForgotModalOpen(true);
                      }}
                      className="font-bold text-[#2F7D4F] hover:text-[#1B5E3A] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Primary CTA Button: Sign In (Pill Shape) */}
                  <button
                    type="submit"
                    disabled={submittingLogin}
                    className="relative overflow-hidden w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#1B5E3A] via-[#236E44] to-[#1B5E3A] hover:from-[#164E2E] hover:to-[#1B5E3A] active:scale-[0.99] text-white font-extrabold text-xs shadow-[0_10px_25px_-5px_rgba(27,94,58,0.4),0_4px_10px_rgba(27,94,58,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 group"
                  >
                    {/* Top edge specular reflection */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                    {submittingLogin ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <span className="text-sm font-bold group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>

                  {/* Divider: OR */}
                  <div className="relative flex items-center justify-center my-1.5">
                    <div className="w-full border-t border-slate-200/70" />
                    <span className="bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-200/60 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest absolute shadow-2xs">
                      OR
                    </span>
                  </div>

                  {/* Social Buttons in Same Row (Pills) */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {/* Continue with Google */}
                    <button
                      type="button"
                      onClick={() => setGoogleModalOpen(true)}
                      className="w-full py-2 px-3 rounded-full border border-white/90 bg-white/80 hover:bg-white backdrop-blur-md hover:border-slate-300 text-xs font-bold text-slate-700 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <GoogleIcon />
                      <span className="truncate">Google</span>
                    </button>

                    {/* Continue with Apple */}
                    <button
                      type="button"
                      onClick={() => showToast('Apple authentication is available on Apple devices.', 'info')}
                      className="w-full py-2 px-3 rounded-full border border-white/90 bg-white/80 hover:bg-white backdrop-blur-md hover:border-slate-300 text-xs font-bold text-slate-700 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <AppleIcon />
                      <span className="truncate">Apple</span>
                    </button>
                  </div>

                  {/* Register Switch Link */}
                  <div className="pt-1 text-center text-[11px] text-[#6B7280]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="font-extrabold text-[#2F7D4F] hover:text-[#1B5E3A] hover:underline ml-1 cursor-pointer"
                    >
                      Register
                    </button>
                  </div>

                </form>
              )}

              {/* =================================================================== */}
              {/* TAB 2: CREATE ACCOUNT FORM                                          */}
              {/* =================================================================== */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-2.5 pt-0.5 relative z-10" noValidate>
                  
                  {/* Role Selector (Pill Shape) */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('consumer')}
                      className={`py-2 px-3.5 rounded-full border text-center transition-all cursor-pointer backdrop-blur-md text-xs font-bold ${
                        regRole === 'consumer'
                          ? 'border-[#1B5E3A] bg-emerald-50/90 text-[#1B5E3A] shadow-xs'
                          : 'border-white/90 bg-white/70 hover:bg-white text-slate-600'
                      }`}
                    >
                      Consumer
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('farmer')}
                      className={`py-2 px-3.5 rounded-full border text-center transition-all cursor-pointer backdrop-blur-md text-xs font-bold ${
                        regRole === 'farmer'
                          ? 'border-amber-500 bg-amber-50/90 text-amber-950 shadow-xs'
                          : 'border-white/90 bg-white/70 hover:bg-white text-slate-600'
                      }`}
                    >
                      Farmer / Grower
                    </button>
                  </div>

                  {regRole === 'farmer' && (
                    <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 backdrop-blur-md space-y-2">
                      <input
                        type="text"
                        required
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="Farm Name (e.g. Patil Organic Farms)"
                        className="w-full px-3.5 py-2 text-xs rounded-full border border-amber-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                      />
                      <input
                        type="text"
                        required
                        value={farmLocation}
                        onChange={(e) => setFarmLocation(e.target.value)}
                        placeholder="Farm Location (e.g. Ratnagiri, MH)"
                        className="w-full px-3.5 py-2 text-xs rounded-full border border-amber-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                      />
                    </div>
                  )}

                  {/* Full Name (Pill Shape) */}
                  <div>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-4 py-2.5 rounded-full border border-slate-200/80 bg-white/75 hover:bg-white/95 focus:bg-white backdrop-blur-md text-xs font-medium focus:ring-4 focus:ring-[#2F7D4F]/10 focus:border-[#2F7D4F] focus:outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                    />
                    {errors.regName && <p className="text-[10px] text-rose-600 font-bold mt-1 pl-3">{errors.regName}</p>}
                  </div>

                  {/* Email & Phone Row (Pill Shape) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full px-4 py-2.5 rounded-full border border-slate-200/80 bg-white/75 hover:bg-white/95 focus:bg-white backdrop-blur-md text-xs font-medium focus:ring-4 focus:ring-[#2F7D4F]/10 focus:border-[#2F7D4F] focus:outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                      />
                      {errors.regEmail && <p className="text-[10px] text-rose-600 font-bold mt-1 pl-3">{errors.regEmail}</p>}
                    </div>

                    <div>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="Mobile Number"
                        className="w-full px-4 py-2.5 rounded-full border border-slate-200/80 bg-white/75 hover:bg-white/95 focus:bg-white backdrop-blur-md text-xs font-medium focus:ring-4 focus:ring-[#2F7D4F]/10 focus:border-[#2F7D4F] focus:outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password Row (Pill Shape) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Password (min 8)"
                        className="w-full pl-4 pr-9 py-2.5 rounded-full border border-slate-200/80 bg-white/75 hover:bg-white/95 focus:bg-white backdrop-blur-md text-xs font-medium focus:ring-4 focus:ring-[#2F7D4F]/10 focus:border-[#2F7D4F] focus:outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full pl-4 pr-9 py-2.5 rounded-full border border-slate-200/80 bg-white/75 hover:bg-white/95 focus:bg-white backdrop-blur-md text-xs font-medium focus:ring-4 focus:ring-[#2F7D4F]/10 focus:border-[#2F7D4F] focus:outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  {errors.regConfirmPassword && (
                    <p className="text-[10px] text-rose-600 font-bold pl-3">{errors.regConfirmPassword}</p>
                  )}

                  {/* Create Account CTA (Pill Shape) */}
                  <button
                    type="submit"
                    disabled={submittingRegister}
                    className="relative overflow-hidden w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#1B5E3A] via-[#236E44] to-[#1B5E3A] hover:from-[#164E2E] hover:to-[#1B5E3A] text-white font-extrabold text-xs shadow-[0_10px_25px_-5px_rgba(27,94,58,0.4),0_4px_10px_rgba(27,94,58,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 group"
                  >
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                    {submittingRegister ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <span className="text-sm font-bold group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-1.5">
                    <div className="w-full border-t border-slate-200/70" />
                    <span className="bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-200/60 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider absolute shadow-2xs">
                      OR
                    </span>
                  </div>

                  {/* Social Buttons in Same Row (Pills) */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {/* Continue with Google */}
                    <button
                      type="button"
                      onClick={() => setGoogleModalOpen(true)}
                      className="w-full py-2 px-3 rounded-full border border-white/90 bg-white/80 hover:bg-white backdrop-blur-md text-xs font-bold text-slate-700 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <GoogleIcon />
                      <span className="truncate">Google</span>
                    </button>

                    {/* Continue with Apple */}
                    <button
                      type="button"
                      onClick={() => showToast('Apple authentication is available on Apple devices.', 'info')}
                      className="w-full py-2 px-3 rounded-full border border-white/90 bg-white/80 hover:bg-white backdrop-blur-md text-xs font-bold text-slate-700 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <AppleIcon />
                      <span className="truncate">Apple</span>
                    </button>
                  </div>

                  <div className="text-center text-[11px] text-[#6B7280] pt-0.5">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="font-extrabold text-[#2F7D4F] hover:text-[#1B5E3A] hover:underline ml-1 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>

                </form>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* GOOGLE AUTHENTICATION MODAL                                               */}
      {/* ========================================================================= */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <GoogleIcon />
                <span className="text-sm font-extrabold text-slate-900">Sign in with Google</span>
              </div>
              <button
                onClick={() => setGoogleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6B7280]">Choose an account to continue to KrishiDirect</p>

            <div className="space-y-2">
              {[
                {
                  name: 'Ananya Sharma',
                  email: 'consumer@gmail.com',
                  role: 'consumer',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                  badge: 'Consumer'
                },
                {
                  name: 'Ramesh Patil',
                  email: 'farmer.ramesh@agridirect.in',
                  role: 'farmer',
                  avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
                  badge: 'Farmer'
                }
              ].map((acc) => (
                <button
                  key={acc.email}
                  disabled={googleSubmitting}
                  onClick={() => handleGoogleAuthSelect(acc)}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-[#2F7D4F] hover:bg-[#E8F3EA]/40 text-left transition-all flex items-center gap-3 cursor-pointer"
                >
                  <img src={acc.avatar} alt={acc.name} className="w-9 h-9 rounded-full object-cover border" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{acc.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                  </div>
                  <span className="text-[10px] font-bold text-[#1B5E3A] bg-[#E8F3EA] px-2 py-0.5 rounded-full shrink-0">
                    {acc.badge}
                  </span>
                </button>
              ))}
            </div>

            {googleSubmitting && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#1B5E3A]">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating with Google...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL                                                     */}
      {/* ========================================================================= */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#1B5E3A]" />
                <span className="text-sm font-extrabold text-slate-900">Reset Your Password</span>
              </div>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E8F3EA] text-[#1B5E3A] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Reset Link Sent!</h4>
                <p className="text-xs text-[#6B7280]">
                  We have sent reset instructions to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#1B5E3A] text-white text-xs font-bold hover:bg-[#14462B]"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-[#6B7280]">
                  Enter your email address to receive password reset instructions.
                </p>
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#2F7D4F]/20 focus:border-[#2F7D4F] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="w-full py-3 rounded-xl bg-[#1B5E3A] hover:bg-[#14462B] text-white text-xs font-extrabold shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  {forgotSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
