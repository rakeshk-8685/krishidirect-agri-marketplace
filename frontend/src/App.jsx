import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// ─── Eagerly load only critical above-the-fold pages ─────────────────────────
// Home and auth pages are on the critical path — load immediately.
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// ─── Lazy-load all other routes ───────────────────────────────────────────────
// Each lazy() boundary creates a separate chunk that is only downloaded
// when the user actually navigates to that route.
const Marketplace    = lazy(() => import('./pages/Marketplace'));
const ProductDetail  = lazy(() => import('./pages/ProductDetail'));
const VerifiedFarms  = lazy(() => import('./pages/VerifiedFarms'));
const FarmerProfile  = lazy(() => import('./pages/FarmerProfile'));
const Cart           = lazy(() => import('./pages/Cart'));
const Checkout       = lazy(() => import('./pages/Checkout'));
const Orders         = lazy(() => import('./pages/Orders'));
const OrderTracking  = lazy(() => import('./pages/OrderTracking'));
const MandiRates     = lazy(() => import('./pages/MandiRates'));
const AgriNews       = lazy(() => import('./pages/AgriNews'));

// Role-specific portals — heaviest chunks, always lazy
const FarmerDashboard   = lazy(() => import('./pages/farmer/FarmerDashboard'));
const FarmerProducts    = lazy(() => import('./pages/farmer/FarmerProducts'));
const FarmerOrders      = lazy(() => import('./pages/farmer/FarmerOrders'));
const FarmerSales       = lazy(() => import('./pages/farmer/FarmerSales'));
const FarmerFarmProfile = lazy(() => import('./pages/farmer/FarmerProfile'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const NotFound          = lazy(() => import('./pages/NotFound'));

// Minimal page-level fallback — intentionally lightweight
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner message="Loading..." />
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-agri-cream text-agri-slate">
      <Navbar />
      <main className="flex-grow pb-16 md:pb-0">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Consumer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/farmers" element={<VerifiedFarms />} />
            <Route path="/farmers/:id" element={<FarmerProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/mandi-rates" element={<MandiRates />} />
            <Route path="/agri-news" element={<AgriNews />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Consumer Routes */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <OrderTracking />
              </ProtectedRoute>
            } />

            {/* Protected Farmer Portal Routes */}
            <Route path="/farmer/dashboard" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/farmer/products" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerProducts />
              </ProtectedRoute>
            } />
            <Route path="/farmer/orders" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerOrders />
              </ProtectedRoute>
            } />
            <Route path="/farmer/sales" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerSales />
              </ProtectedRoute>
            } />
            <Route path="/farmer/profile" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerFarmProfile />
              </ProtectedRoute>
            } />
            <Route path="/farmer/settings" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerFarmProfile />
              </ProtectedRoute>
            } />

            {/* Protected Admin Portal Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
