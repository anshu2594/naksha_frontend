import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BadgePercent,
  Boxes,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
  X,
} from 'lucide-react';
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import { getAdminDashboard } from '../services/admin';
import { useAuthStore } from '../store/useAuthStore';
import {
  AdminCategories,
  AdminCustomers,
  AdminDashboardPage,
  AdminOffers,
  AdminOrders,
  AdminPayments,
  AdminProducts,
} from './AdminPages';

const navigation = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Boxes },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/payments', label: 'Payments', icon: CircleDollarSign },
  { to: '/admin/offers', label: 'Promotions', icon: BadgePercent },
];

function LoadingState({ message }) {
  return (
    <div role="status" className="flex min-h-[45vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-nude border-t-brand-roseGold" />
      <p className="text-sm text-brand-subtle">{message}</p>
    </div>
  );
}

function AdminProfileRetry({ message }) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setProfileLoading = useAuthStore((state) => state.setProfileLoading);
  const setProfileError = useAuthStore((state) => state.setProfileError);
  const [isRetrying, setIsRetrying] = useState(false);

  const retryProfile = async () => {
    setIsRetrying(true);
    setProfileLoading();
    try {
      const user = await api.get('/auth/me/');
      setUser(user);
    } catch (error) {
      if ([401, 403, 404].includes(error.status)) {
        clearAuth();
      } else {
        setProfileError(error.message);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <ShieldCheck className="mb-4 h-10 w-10 text-brand-roseGold" />
      <h1 className="font-serif text-2xl font-semibold text-brand-charcoal">Unable to verify your access</h1>
      <p role="alert" className="mt-2 text-sm text-brand-subtle">{message}</p>
      <Button className="mt-6" onClick={retryProfile} isLoading={isRetrying}>Retry verification</Button>
      <Link className="mt-4 text-sm font-semibold text-brand-roseGold hover:underline" to="/">
        Return to storefront
      </Link>
    </div>
  );
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.adminLogin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.access_token && user?.isStaff === true) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [session?.access_token, user?.isStaff, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login({ username: username.trim(), password });
      navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-brand-nude bg-white p-7 shadow-soft sm:p-9">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-roseGold text-white shadow-soft">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="mt-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-roseGold">Naksha Store Admin</p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-brand-charcoal">Staff sign in</h1>
          <p className="mt-2 text-sm leading-6 text-brand-subtle">Sign in with your authorized staff account to manage the store.</p>
        </div>
        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5 text-xs font-semibold text-brand-charcoal">
            Username
            <input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-xl border border-brand-nude bg-brand-cream px-3.5 py-3 text-sm font-normal outline-none transition focus:border-brand-roseGold focus:ring-2 focus:ring-brand-blush/50" />
          </label>
          <label className="block space-y-1.5 text-xs font-semibold text-brand-charcoal">
            Password
            <input autoComplete="current-password" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-brand-nude bg-brand-cream px-3.5 py-3 text-sm font-normal outline-none transition focus:border-brand-roseGold focus:ring-2 focus:ring-brand-blush/50" />
          </label>
          <Button type="submit" fullWidth isLoading={isLoading}>Sign in securely</Button>
        </form>
        <Link to="/" className="mt-5 block text-center text-sm font-semibold text-brand-roseGold hover:underline">Return to storefront</Link>
      </div>
    </div>
  );
}

function AdminAccessGate() {
  const location = useLocation();
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const isProfileLoading = useAuthStore((state) => state.isProfileLoading);
  const profileError = useAuthStore((state) => state.profileError);

  if (!session?.access_token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (isProfileLoading) {
    return <LoadingState message="Verifying your administrator access…" />;
  }

  if (profileError) return <AdminProfileRetry message={profileError} />;

  if (user?.isStaff !== true) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        <ShieldCheck className="mb-4 h-10 w-10 text-brand-roseGold" />
        <h1 className="font-serif text-2xl font-semibold text-brand-charcoal">Administrator access required</h1>
        <p className="mt-2 text-sm leading-6 text-brand-subtle">
          This area is available to authorized store staff only. Your storefront account remains unchanged.
        </p>
        <Link className="mt-6 text-sm font-semibold text-brand-roseGold hover:underline" to="/">
          Return to storefront
        </Link>
      </div>
    );
  }

  return <AdminLayout />;
}

function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setLogoutError('');
    setIsSigningOut(true);
    try {
      await logout();
    } catch (error) {
      setLogoutError(error.message);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-brand-charcoal lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-brand-nude/80 bg-white lg:flex">
        <AdminBrand />
        <AdminNavigation onNavigate={() => setIsMenuOpen(false)} />
        <div className="mt-auto border-t border-brand-nude/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream text-brand-roseGold">
              <Store className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.username || 'Store administrator'}</p>
              <p className="text-xs text-brand-subtle">Staff account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-brand-subtle transition hover:bg-brand-cream hover:text-brand-charcoal disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[4.5rem] items-center justify-between border-b border-brand-nude/80 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-brand-charcoal hover:bg-brand-cream lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden items-center gap-2 text-sm text-brand-subtle sm:flex">
            <span>Store administration</span>
            <ChevronDown className="h-4 w-4 -rotate-90" />
            <span className="font-semibold text-brand-charcoal">Naksha</span>
          </div>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-brand-nude px-4 py-2 text-xs font-semibold text-brand-charcoal transition hover:border-brand-roseGold/50 hover:text-brand-roseGold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">View storefront</span>
            <span className="sm:hidden">Store</span>
          </Link>
        </header>

        {isMenuOpen && (
          <div className="fixed inset-0 z-20 bg-brand-charcoal/30 lg:hidden" onClick={() => setIsMenuOpen(false)}>
            <aside
              className="flex h-full w-[min(18rem,85vw)] flex-col bg-white shadow-elevated"
              onClick={(event) => event.stopPropagation()}
            >
              <AdminBrand />
              <AdminNavigation onNavigate={() => setIsMenuOpen(false)} />
              <div className="mt-auto border-t border-brand-nude/70 p-5">
                <p className="truncate text-sm font-semibold">{user?.username || 'Store administrator'}</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  className="mt-4 flex items-center gap-2 text-sm text-brand-subtle hover:text-brand-charcoal disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {logoutError && (
            <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {logoutError}
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminBrand() {
  return (
    <Link to="/admin/dashboard" className="flex items-center gap-3 border-b border-brand-nude/70 px-6 py-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-roseGold text-white shadow-soft">
        <ShoppingBag className="h-5 w-5" />
      </div>
      <div>
        <span className="block font-serif text-lg font-semibold tracking-wide">Naksha</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-subtle">Store admin</span>
      </div>
    </Link>
  );
}

function AdminNavigation({ onNavigate }) {
  return (
    <nav aria-label="Administration" className="space-y-1 px-3 py-5">
      {navigation.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) => (
            `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-brand-cream text-brand-terracotta'
                : 'text-brand-subtle hover:bg-brand-cream/70 hover:text-brand-charcoal'
            }`
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function PageHeading({ eyebrow = 'Store management', title, description, icon: Icon }) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-brand-nude/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-roseGold shadow-soft">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-roseGold">{eyebrow}</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-brand-charcoal">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-brand-subtle">{description}</p>
        </div>
      </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live store tools
        </span>
    </div>
    );
}
export function AdminApp() {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<AdminAccessGate />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage loadDashboard={getAdminDashboard} />} />
          <Route path="/admin/products" element={<><PageHeading title="Products" description="Manage catalog details, inventory, product images, and visibility." icon={Package} /><AdminProducts /></>} />
          <Route path="/admin/categories" element={<><PageHeading title="Categories" description="Organize the storefront catalog and control category visibility." icon={Boxes} /><AdminCategories /></>} />
          <Route path="/admin/customers" element={<><PageHeading title="Customers" description="Review customer profiles and their order activity." icon={Users} /><AdminCustomers /></>} />
          <Route path="/admin/orders" element={<><PageHeading title="Orders" description="Track fulfillment and payment status across customer orders." icon={ClipboardList} /><AdminOrders /></>} />
          <Route path="/admin/payments" element={<><PageHeading title="Payments" description="Review payment outcomes and manage eligible refunds." icon={CircleDollarSign} /><AdminPayments /></>} />
          <Route path="/admin/offers" element={<><PageHeading title="Promotions" description="Schedule time-bound offers and manage coupon availability." icon={BadgePercent} /><AdminOffers /></>} />
        </Route>
      <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
