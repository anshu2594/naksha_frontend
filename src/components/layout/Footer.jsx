import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, RefreshCw, ShieldCheck, Truck, Ruler } from 'lucide-react';
import { api } from '../../services/api';
import { useCatalogStore } from '../../store/useCatalogStore';

const highlightIcon = (label) => {
  const value = label.toLowerCase();
  if (value.includes('shipping')) return Truck;
  if (value.includes('return')) return RefreshCw;
  if (value.includes('payment')) return CreditCard;
  return ShieldCheck;
};

const COPYRIGHT_YEAR = new Date().getFullYear();

export function Footer() {
  const categories = useCatalogStore((s) => s.categories);
  const loadCategories = useCatalogStore((s) => s.loadCategories);
  const [highlights, setHighlights] = useState([]);
  const [highlightsLoading, setHighlightsLoading] = useState(true);
  const [highlightsError, setHighlightsError] = useState('');

  useEffect(() => {
    loadCategories();
    const controller = new AbortController();
    api.get('/highlights', { signal: controller.signal })
      .then(setHighlights)
      .catch((error) => {
        if (error.name !== 'AbortError') setHighlightsError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setHighlightsLoading(false);
      });
    return () => controller.abort();
  }, [loadCategories]);

  const categoryGroups = [categories.slice(0, 3), categories.slice(3)];

  return (
    <footer className="bg-brand-charcoal text-white pt-16 pb-10 border-t border-brand-charcoal/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-gray-800 text-center">
          {highlightsError ? (
            <p role="alert" className="col-span-full text-xs text-rose-200">{highlightsError}</p>
          ) : highlights.length ? (
            highlights.map((highlight) => {
              const Icon = highlightIcon(highlight.label);
              return (
                <div key={highlight.id} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-emerald-400 mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold">{highlight.label}</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">{highlight.value}</p>
                </div>
              );
            })
          ) : highlightsLoading ? (
            <p role="status" className="col-span-full text-xs text-gray-400">Loading store information…</p>
          ) : (
            <p className="col-span-full text-xs text-gray-400">No store highlights are available right now.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          <div className="space-y-4 md:col-span-1">
            <div className="flex flex-col items-start">
              <span className="font-serif text-3xl font-bold tracking-tight text-white">NAKSHA</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-brand-roseGold font-semibold -mt-1">
                Luxury Lingerie
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explore the collections and product details maintained in the Naksha catalog.
            </p>
          </div>

          {categoryGroups.map((group, index) => (
            <div key={index}>
              <h4 className="text-xs uppercase tracking-wider text-brand-roseGold font-semibold mb-4">
                {index === 0 ? 'Shop Collections' : 'More Collections'}
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                {group.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/shop?cat=${encodeURIComponent(category.name)}`}
                      className="hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-xs uppercase tracking-wider text-brand-roseGold font-semibold mb-4">
              Account & Fitting
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link to="/account" className="hover:text-white transition-colors">Your account</Link></li>
              <li><Link to="/bra-size-calculator" className="text-rose-300 font-semibold hover:text-white transition-colors flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" />Bra Size Calculator</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Browse all products</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {COPYRIGHT_YEAR} NAKSHA Luxury Lingerie. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>Payment choices recorded at checkout</span>
            <span>UPI · Cards · COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
