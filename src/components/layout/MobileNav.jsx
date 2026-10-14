import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Ruler, Heart, ShieldCheck } from 'lucide-react';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCatalogStore } from '../../store/useCatalogStore';
import { useAuthStore } from '../../store/useAuthStore';

export function MobileNav({ isOpen, onClose }) {
  const navigate = useNavigate();
  const wishlistCount = useWishlistStore((s) => s.getCount());
  const categories = useCatalogStore((s) => s.categories);
  const user = useAuthStore((s) => s.user);

  if (!isOpen) return null;

  const handleNavClick = () => onClose();

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-nude">
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-brand-charcoal">
              NAKSHA
            </span>
            <p className="text-[10px] uppercase tracking-widest text-brand-roseGold font-semibold">
              Luxury Lingerie
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-subtle hover:text-brand-charcoal hover:bg-brand-nude/40 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-subtle">
              Categories
            </p>
            <Link
              to="/shop"
              onClick={() => handleNavClick('all')}
              className="block text-base font-medium text-brand-charcoal hover:text-brand-roseGold py-1"
            >
              All Collections
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?cat=${encodeURIComponent(category.name)}`}
                onClick={() => handleNavClick(category.name)}
                className="block text-base font-medium text-brand-charcoal hover:text-brand-roseGold py-1"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-brand-nude/60 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-subtle">
              Fitting & Tools
            </p>
            <Link
              to="/bra-size-calculator"
              onClick={onClose}
              className="flex items-center gap-2 text-base font-medium text-brand-roseGold py-1"
            >
              <Ruler className="w-4 h-4" />
              Interactive Bra Calculator
            </Link>
            <Link
              to={user ? '/shop?filter=wishlist' : '/account'}
              onClick={(event) => {
                if (!user) {
                  event.preventDefault();
                  navigate('/account', { state: { from: { pathname: '/shop', search: '?filter=wishlist' } } });
                }
                onClose();
              }}
              className="flex items-center justify-between text-base font-medium text-brand-charcoal py-1"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                My Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>

          {/* Discreet Badge */}
          <div className="pt-6 border-t border-brand-nude/60">
            <div className="p-3.5 bg-brand-cream rounded-xl border border-brand-champagne/40 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-brand-charcoal">Discreet Packaging</p>
                <p className="text-[11px] text-brand-subtle mt-0.5 leading-snug">
                  100% confidential delivery in plain unmarked boxes.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
