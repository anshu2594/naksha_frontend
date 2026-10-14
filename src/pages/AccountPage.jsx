import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, UserRound } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/useAuthStore';

const fieldClass = 'w-full px-3.5 py-2.5 bg-brand-cream border border-brand-nude rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-roseGold';

export function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('details');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    remember_me: true,
    otp: '',
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (event) => setForm((current) => ({
    ...current,
    [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
  }));

  const continueToPreviousPage = () => {
    const from = location.state?.from;
    navigate(from ? `${from.pathname}${from.search || ''}${from.hash || ''}` : '/', { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      if (mode === 'register' && step === 'details') {
        const response = await register({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone_number: form.phone_number.trim() || null,
          password: form.password,
        });
        setStep('verify');
        setNotice(import.meta.env.DEV && response.detail
          ? `${response.message} ${response.detail}`
          : response.message);
        return;
      }

      if (mode === 'register') {
        await verifyOtp({
          email: form.email.trim(),
          otp: form.otp.trim(),
          purpose: 'verification',
        });
      } else {
        await login({
          email: form.email.trim(),
          password: form.password,
          remember_me: form.remember_me,
        });
      }
      continueToPreviousPage();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      const response = await resendOtp({ email: form.email.trim(), purpose: 'verification' });
      setNotice(import.meta.env.DEV && response.detail
        ? `${response.message} ${response.detail}`
        : response.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      setNotice('You have been signed out.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-nude shadow-soft space-y-5">
          <div className="w-12 h-12 bg-brand-cream rounded-full flex items-center justify-center text-brand-roseGold">
            <UserRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-brand-charcoal">Your Account</h1>
            <p className="text-sm text-brand-subtle mt-1">{user.first_name} {user.last_name} · {user.email}</p>
          </div>
          {error && <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">{error}</p>}
          {notice && <p role="status" className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">{notice}</p>}
          <div className="flex flex-wrap gap-3">
            <Link to="/cart" className="text-sm font-semibold text-brand-roseGold hover:underline">View shopping bag</Link>
            <button type="button" onClick={handleLogout} className="text-sm font-semibold text-brand-subtle hover:text-brand-charcoal">Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-nude shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-cream rounded-full flex items-center justify-center text-brand-roseGold mx-auto">
            <LockKeyhole className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-brand-charcoal">
            {mode === 'login' ? 'Welcome Back' : step === 'verify' ? 'Verify Your Email' : 'Create Your Account'}
          </h1>
          <p className="text-xs text-brand-subtle">
            {mode === 'login' ? 'Sign in to access your bag, wishlist, and orders.' : 'Your account keeps your bag and orders in sync.'}
          </p>
        </div>

        {error && <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">{error}</p>}
        {notice && <p role="status" className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl break-words">{notice}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && step === 'details' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-brand-charcoal space-y-1">
                First name *
                <input className={fieldClass} name="first_name" value={form.first_name} onChange={setField} required maxLength={100} autoComplete="given-name" />
              </label>
              <label className="text-xs font-semibold text-brand-charcoal space-y-1">
                Last name *
                <input className={fieldClass} name="last_name" value={form.last_name} onChange={setField} required maxLength={100} autoComplete="family-name" />
              </label>
            </div>
          )}

          {mode === 'register' && step === 'details' && (
            <label className="block text-xs font-semibold text-brand-charcoal space-y-1">
              Mobile number
              <input className={fieldClass} name="phone_number" type="tel" value={form.phone_number} onChange={setField} maxLength={30} autoComplete="tel" />
            </label>
          )}

          <label className="block text-xs font-semibold text-brand-charcoal space-y-1">
            Email address *
            <input className={fieldClass} name="email" type="email" value={form.email} onChange={setField} required autoComplete="email" readOnly={mode === 'register' && step === 'verify'} />
          </label>

          {step === 'verify' && mode === 'register' ? (
            <label className="block text-xs font-semibold text-brand-charcoal space-y-1">
              6-digit verification code *
              <input className={fieldClass} name="otp" value={form.otp} onChange={setField} required minLength={6} maxLength={6} inputMode="numeric" autoComplete="one-time-code" />
            </label>
          ) : (
            <label className="block text-xs font-semibold text-brand-charcoal space-y-1">
              Password *
              <input className={fieldClass} name="password" type="password" value={form.password} onChange={setField} required minLength={6} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </label>
          )}

          {mode === 'login' && (
            <label className="flex items-center gap-2 text-xs text-brand-subtle">
              <input type="checkbox" name="remember_me" checked={form.remember_me} onChange={setField} className="rounded border-brand-nude text-brand-roseGold focus:ring-brand-roseGold" />
              Keep me signed in
            </label>
          )}

          <Button type="submit" variant="luxury" size="lg" fullWidth isLoading={isLoading || isSubmitting}>
            {mode === 'login' ? 'Sign In' : step === 'verify' ? 'Verify & Continue' : 'Create Account'}
          </Button>
        </form>

        {mode === 'register' && step === 'verify' && (
          <button type="button" onClick={handleResendOtp} disabled={isSubmitting} className="w-full text-xs font-semibold text-brand-roseGold hover:underline disabled:opacity-50">
            Resend verification code
          </button>
        )}

        <div className="text-center text-xs text-brand-subtle">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setStep('details');
              setError('');
              setNotice('');
            }}
            className="font-semibold text-brand-roseGold hover:underline"
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
