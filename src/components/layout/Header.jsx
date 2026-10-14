import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, Ruler, UserRound } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useFilterStore } from '../../store/useFilterStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCatalogStore } from '../../store/useCatalogStore';

export function Header({ onOpenMobileNav }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const openCart = useCartStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);
  const categories = useCatalogStore((s) => s.categories);
  const user = useAuthStore((s) => s.user);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim());
      navigate('/shop');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Shop All', path: '/shop' },
    ...categories.slice(0, 3).map((category) => ({
      name: category.name,
      path: `/shop?cat=${encodeURIComponent(category.name)}`,
    })),
    { name: 'Fit Calculator', path: '/bra-size-calculator', icon: <Ruler className="w-3.5 h-3.5 mr-1 text-brand-roseGold" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-cream/95 backdrop-blur-md border-b border-brand-champagne/40 transition-shadow duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={onOpenMobileNav}
              className="p-2 text-brand-charcoal hover:text-brand-roseGold transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col items-start group">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-brand-charcoal group-hover:text-brand-roseGold transition-colors">
                NAKSHA
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-brand-roseGold font-semibold -mt-1">
                Lingerie & Blouses
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center text-sm font-medium transition-colors hover:text-brand-roseGold relative py-1 ${
                    isActive ? 'text-brand-roseGold font-semibold' : 'text-brand-charcoal'
                  }`}
                >
                  {link.icon}
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-roseGold rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Search, Wishlist, Cart */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Search Trigger */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search bras, blouses, sizes..."
                    autoFocus
                    className="w-48 sm:w-64 pl-3 pr-8 py-1.5 text-xs sm:text-sm bg-white border border-brand-roseGold/60 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-roseGold"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-2.5 text-brand-subtle hover:text-brand-charcoal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-brand-charcoal hover:text-brand-roseGold hover:bg-brand-nude/40 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Wishlist Link */}
            <button
              type="button"
              onClick={() => user
                ? navigate('/shop?filter=wishlist')
                : navigate('/account', { state: { from: { pathname: '/shop', search: '?filter=wishlist' } } })}
              className="p-2 text-brand-charcoal hover:text-brand-roseGold hover:bg-brand-nude/40 rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                  {wishlistCount}
                </span>
              )}
            </button>

            <Link
              to="/account"
              className="p-2 text-brand-charcoal hover:text-brand-roseGold hover:bg-brand-nude/40 rounded-full transition-colors"
              aria-label={user ? 'Your account' : 'Sign in'}
            >
              <UserRound className="w-5 h-5" />
            </Link>

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={() => user
                ? openCart()
                : navigate('/account', { state: { from: { pathname: '/cart' } } })}
              className="p-2 text-brand-charcoal hover:text-brand-roseGold hover:bg-brand-nude/40 rounded-full transition-colors relative"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-roseGold text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
