/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AuthCallback from './pages/auth/Callback';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CreatorPublicProfile from './pages/CreatorPublicProfile';
import PaymentConfirm from './pages/PaymentConfirm';
import SubscriptionConfirm from './pages/SubscriptionConfirm';
import ContentView from './pages/ContentView';
import BuyerPortal from './pages/BuyerPortal';
import BuyerPurchases from './pages/BuyerPurchases';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminCreators from './pages/admin/AdminCreators';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminContents from './pages/admin/AdminContents';
import AdminDonationsMessages from './pages/admin/AdminDonationsMessages';
import AdminTestAccounts from './pages/admin/AdminTestAccounts';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cgv from './pages/Cgv';
import Pay from './pages/Pay';
import PayConfirm from './pages/PayConfirm';
import Congrat from './pages/Congrat';

// Route Guards
function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#14120F] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
      </div>
    );
  }
  
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'bigardlamine@gmail.com';
  
  if (!user || user.email !== adminEmail) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
      </div>
    );
  }
  
  if (user) {
    if (profile) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth Pages (Redirect to dashboard if already logged in) */}
            <Route path="/auth/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/auth/signup" element={<AuthRoute><Signup /></AuthRoute>} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Creator Pages */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/content" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/sales" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/withdrawals" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/subscription" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/messages" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/donations" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Protected Admin Console Pages */}
            <Route path="/admin" element={<AdminRoute><AdminLayout><AdminOverview /></AdminLayout></AdminRoute>} />
            <Route path="/admin/creators" element={<AdminRoute><AdminLayout><AdminCreators /></AdminLayout></AdminRoute>} />
            <Route path="/admin/test-accounts" element={<AdminRoute><AdminLayout><AdminTestAccounts /></AdminLayout></AdminRoute>} />
            <Route path="/admin/contents" element={<AdminRoute><AdminLayout><AdminContents /></AdminLayout></AdminRoute>} />
            <Route path="/admin/donations-messages" element={<AdminRoute><AdminLayout><AdminDonationsMessages /></AdminLayout></AdminRoute>} />
            <Route path="/admin/withdrawals" element={<AdminRoute><AdminLayout><AdminWithdrawals /></AdminLayout></AdminRoute>} />
            <Route path="/admin/subscriptions" element={<AdminRoute><AdminLayout><AdminSubscriptions /></AdminLayout></AdminRoute>} />
            <Route path="/admin/transactions" element={<AdminRoute><AdminLayout><AdminTransactions /></AdminLayout></AdminRoute>} />
            
            {/* Maketou payment return confirmation */}
            <Route path="/payment/confirm" element={<PaymentConfirm />} />
            <Route path="/subscription/confirm" element={<SubscriptionConfirm />} />

            {/* Anonymous payment routes */}
            <Route path="/pay" element={<Pay />} />
            <Route path="/pay/confirm" element={<PayConfirm />} />
            <Route path="/congrat" element={<Congrat />} />

            {/* Legal Pages */}
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/sales" element={<Cgv />} />
            <Route path="/legal/privacy" element={<Privacy />} />

            {/* Secured Content view page */}
            <Route path="/content/:contentId" element={<ContentView />} />

            {/* Buyer Portal */}
            <Route path="/portal" element={<BuyerPortal />} />
            <Route path="/portal/purchases" element={<BuyerPurchases />} />

            {/* Dynamic Public Creator Profile */}
            <Route path="/:username" element={<CreatorPublicProfile />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

