/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardLayout from './layout/DashboardLayout';
import MarketplacePage from '../pages/MarketplacePage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import SellerDashboard from '../pages/SellerDashboard';
import BuyerDashboard from '../pages/BuyerDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import TermsPage from '../pages/TermsPage';
import SuppliersPage from '../pages/SuppliersPage';
import SolutionsPage from '../pages/SolutionsPage';
import AboutPage from '../pages/AboutPage';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'buyer' | 'seller' | 'admin' }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && profile?.role !== role && profile?.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="overview" />} />
            <Route path="overview" element={<BuyerDashboard />} />
            <Route path="seller" element={
              <ProtectedRoute role="seller">
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
