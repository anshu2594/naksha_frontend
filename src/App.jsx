import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { CartDrawer } from './components/layout/CartDrawer';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { BraCalculatorPage } from './pages/BraCalculatorPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AccountPage } from './pages/AccountPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { api } from './services/api';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { useWishlistStore } from './store/useWishlistStore';
import { useCatalogStore } from './store/useCatalogStore';
import { AdminApp } from './admin/AdminApp';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const session = useAuthStore((s) => s.session);
  const setUser = useAuthStore((s) => s.setUser);
  const setProfileLoading = useAuthStore((s) => s.setProfileLoading);
  const setProfileError = useAuthStore((s) => s.setProfileError);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const loadCart = useCartStore((s) => s.loadCart);
  const resetCart = useCartStore((s) => s.reset);
  const loadWishlist = useWishlistStore((s) => s.loadWishlist);
  const resetWishlist = useWishlistStore((s) => s.reset);
  const loadCategories = useCatalogStore((s) => s.loadCategories);
  const accessToken = session?.access_token;

  useEffect(() => {
    if (isAdminRoute) return;
    loadCategories();
  }, [isAdminRoute, loadCategories]);

  useEffect(() => {
    const handleExpiredSession = () => {
      clearAuth();
      resetCart();
      resetWishlist();
    };
    window.addEventListener('naksha:session-expired', handleExpiredSession);
    return () => window.removeEventListener('naksha:session-expired', handleExpiredSession);
  }, [clearAuth, resetCart, resetWishlist]);

  useEffect(() => {
    if (!accessToken) {
      resetCart();
      resetWishlist();
      return;
    }

    let cancelled = false;
    setProfileLoading();
    api.get('/auth/me/')
      .then((user) => {
        if (!cancelled) setUser(user);
      })
      .catch((error) => {
        if (!cancelled) {
          if ([401, 403, 404].includes(error.status)) {
            clearAuth();
            resetCart();
            resetWishlist();
          } else {
            setProfileError(error.message);
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, setUser, setProfileLoading, setProfileError, clearAuth, resetCart, resetWishlist]);

  useEffect(() => {
    if (isAdminRoute || !accessToken) return undefined;
    Promise.allSettled([loadCart(), loadWishlist()]);
    return undefined;
  }, [isAdminRoute, accessToken, loadCart, loadWishlist]);

  if (isAdminRoute) {
    return (
      <>
        <ScrollToTop />
        <AdminApp />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-charcoal antialiased">
      <ScrollToTop />
      
      {/* Top Banner & Header */}
      <AnnouncementBar />
      <Header onOpenMobileNav={() => setMobileNavOpen(true)} />

      {/* Slide-out Drawers */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <CartDrawer />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/bra-size-calculator" element={<BraCalculatorPage />} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
