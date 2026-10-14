import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ruler, ShieldCheck, Sparkles, ArrowRight, Star, Check } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProductCard } from '../features/products/ProductCard';
import { BraSizeCalculatorModal } from '../features/size-guide/BraSizeCalculatorModal';
import { useCatalogStore } from '../store/useCatalogStore';
import { getProducts, normalizeProduct } from '../services/catalog';

export function HomePage() {
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [bestSellers, setBestSellers] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const categories = useCatalogStore((s) => s.categories);
  const categoriesError = useCatalogStore((s) => s.error);
  const categoriesLoading = useCatalogStore((s) => s.isLoading);
  const loadCategories = useCatalogStore((s) => s.loadCategories);

  useEffect(() => {
    loadCategories();
    const controller = new AbortController();
    getProducts({ tag: 'Bestseller', limit: 4, signal: controller.signal })
      .then((response) => setBestSellers(response.products.map(normalizeProduct)))
      .catch((error) => {
        if (error.name !== 'AbortError') setProductsError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setProductsLoading(false);
      });
    return () => controller.abort();
  }, [loadCategories]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-nude/60 via-brand-cream to-white pt-10 sm:pt-16 pb-14 sm:pb-24 border-b border-brand-nude/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-brand-champagne/80 text-xs font-semibold text-brand-roseGold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-roseGold" />
                <span>The Luxury Intimates Boutique</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-charcoal tracking-tight leading-[1.15]">
                Uncompromising Comfort for <span className="text-brand-roseGold italic">Everyday</span>, Opulence for <span className="text-brand-velvet italic">Special Occasions</span>.
              </h1>

              <p className="text-sm sm:text-base text-brand-subtle max-w-xl leading-relaxed">
                Discover thoughtfully designed bras, lingerie, and everyday essentials selected for comfort, quality, and confidence.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start justify-start gap-3.5 pt-2">
                <Link to="/shop?cat=Bras">
                  <Button variant="luxury" size="lg">
                    Shop the Collection
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button variant="secondary" size="lg">
                    Explore All Styles
                  </Button>
                </Link>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex flex-wrap items-center justify-start gap-5 text-xs text-brand-charcoal font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Discreet Packaging</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-brand-roseGold" />
                  <span>Calculated Fit Accuracy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>
                    {bestSellers.length
                      ? `Best sellers rated ${(
                        bestSellers.reduce((sum, product) => sum + product.rating, 0) / bestSellers.length
                      ).toFixed(1)} / 5`
                      : 'Customer-rated styles'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Images Showcase */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden shadow-soft border border-brand-nude aspect-[3/4]">
                  <img
                    src="https://images.unsplash.com/photo-1596473536098-b80864ca06a8?auto=format&fit=crop&w=700&q=80"
                    alt="Comfort Cloud Wirefree Bra"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-semibold text-brand-charcoal">
                    Zero-Wire Comfort
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="relative rounded-2xl overflow-hidden shadow-soft border border-brand-nude aspect-[3/4]">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80"
                    alt="Naksha lingerie collection"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-semibold text-brand-charcoal">
                    Curated Lingerie
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Interactive Bra Finder Teaser Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-charcoal to-[#2d2f33] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-elevated">
          <div className="max-w-2xl relative z-10 space-y-4">
            <Badge variant="rose" size="sm">
              FIT FINDER TOOL
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              80% of Women Wear the Wrong Bra Size. What's Yours?
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Stop suffering from band marks, underwire pinching, or slipping straps. Our 30-second formula accurately pinpoints your exact Band & Cup dimensions.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="luxury"
                size="md"
                onClick={() => setIsCalcOpen(true)}
              >
                <Ruler className="w-4 h-4 mr-1.5" />
                Launch 30-Sec Bra Calculator
              </Button>
              <Link to="/bra-size-calculator">
                <Button variant="ghost" size="md" className="text-white hover:bg-white/10">
                  Full Measurement Guide →
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative graphic backdrop */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none hidden md:block">
            <Ruler className="w-80 h-80 text-white" />
          </div>
        </div>
      </section>

      {/* 3. Category Spotlight: Bras vs Blouses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal">
            Explore Curated Collections
          </h2>
          <p className="text-xs sm:text-sm text-brand-subtle">
            Explore the real-time collections available in the Naksha catalog.
          </p>
        </div>

        {categoriesError ? (
          <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl">{categoriesError}</p>
        ) : categoriesLoading ? (
          <p role="status" className="text-sm text-brand-subtle">Loading collections…</p>
        ) : categories.length === 0 ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-brand-subtle">No collections are available right now.</p>
            <Button variant="outline" size="sm" onClick={loadCategories}>Retry</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative rounded-3xl overflow-hidden bg-brand-cream border border-brand-nude shadow-soft aspect-[16/10] flex flex-col justify-end p-6 sm:p-8"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="relative z-10 space-y-3">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-200 line-clamp-2 max-w-md">
                  {cat.description}
                </p>
                <div className="pt-2">
                  <Link
                    to={`/shop?cat=${encodeURIComponent(cat.name)}`}
                    className="inline-flex items-center text-xs font-semibold text-rose-300 hover:text-white group-hover:underline"
                  >
                    Explore All {cat.name} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </section>

      {/* 4. Best Sellers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-nude/70 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-roseGold font-bold">
              Loved by Thousands
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal mt-1">
              Trending Best Sellers
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-semibold text-brand-roseGold hover:text-brand-terracotta flex items-center gap-1"
          >
            View Entire Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {productsError ? (
            <p role="alert" className="col-span-full text-sm text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl">{productsError}</p>
          ) : productsLoading ? (
            <p role="status" className="col-span-full text-sm text-brand-subtle">Loading best sellers…</p>
          ) : bestSellers.length ? (
            bestSellers.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="col-span-full text-sm text-brand-subtle">No best sellers are available right now.</p>
          )}
        </div>
      </section>

      {/* 5. Discreet Packaging Highlight Section */}
      <section className="bg-brand-cream/90 border-y border-brand-champagne/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-4">
              <Badge variant="discreet" size="sm">
                100% CONFIDENTIAL DELIVERIES
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal">
                Your Privacy is Our Absolute Priority.
              </h2>
              <p className="text-xs sm:text-sm text-brand-subtle leading-relaxed">
                We understand that purchasing intimate apparel and luxury designer wear requires complete discretion. That's why every order dispatched from NAKSHA adheres to strict privacy rules:
              </p>
              
              <ul className="space-y-3 text-xs sm:text-sm text-brand-charcoal pt-2">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Plain Unbranded Box:</strong> Solid neutral exterior with zero logos or descriptions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Concealed Invoices:</strong> Itemized receipts are sealed strictly inside the package.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Discreet Courier Label:</strong> Shipper is printed simply as "NAKSHA RETAIL LOGISTICS".</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-brand-nude shadow-soft text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">
                Discreet Delivery Promise
              </h3>
              <p className="text-xs text-brand-subtle leading-relaxed max-w-sm mx-auto">
                Enjoy complete peace of mind when ordering to your home, apartment lobby, or workplace.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  Verified Safe Shipping by 24,000+ Customers
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modal Dialog */}
      <BraSizeCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />

    </div>
  );
}
