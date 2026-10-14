import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductFilters } from '../features/products/ProductFilters';
import { ProductGrid } from '../features/products/ProductGrid';
import { SortDropdown } from '../features/products/SortDropdown';
import { BraSizeCalculatorModal } from '../features/size-guide/BraSizeCalculatorModal';
import { useFilterStore } from '../store/useFilterStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useAuthStore } from '../store/useAuthStore';
import { getProducts, normalizeProduct } from '../services/catalog';
import { Ruler, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../components/common/Button';

const PAGE_SIZE = 24;

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadedQuery, setLoadedQuery] = useState('');
  const [loadingMoreQuery, setLoadingMoreQuery] = useState('');
  const [requestError, setRequestError] = useState(null);
  const loadMoreController = useRef(null);

  const { selectedTag, sortBy, searchQuery, setSearchQuery, resetFilters } = useFilterStore();
  const wishlist = useWishlistStore((s) => s.wishlist);
  const wishlistError = useWishlistStore((s) => s.error);
  const wishlistLoading = useWishlistStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const categoriesError = useCatalogStore((s) => s.error);
  const loadCategories = useCatalogStore((s) => s.loadCategories);
  const isWishlistFilter = searchParams.get('filter') === 'wishlist';
  const requestedCategory = searchParams.get('cat') || 'all';
  const category = requestedCategory === 'bra' ? 'Bras' : requestedCategory === 'blouse' ? 'all' : requestedCategory;
  const queryKey = `${category}|${selectedTag}|${sortBy}|${searchQuery}`;
  const isLoading = !isWishlistFilter && loadedQuery !== queryKey;
  const isLoadingMore = loadingMoreQuery === queryKey;
  const error = requestError?.query === queryKey ? requestError.message : '';

  const handleResetFilters = () => {
    resetFilters();
    const params = new URLSearchParams(searchParams);
    params.delete('cat');
    setSearchParams(params);
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadMoreController.current?.abort();
    if (isWishlistFilter) return undefined;

    const controller = new AbortController();
    getProducts({
      category: category === 'all' ? undefined : category,
      search: searchQuery.trim() || undefined,
      tag: selectedTag || undefined,
      sortBy,
      limit: PAGE_SIZE,
      offset: 0,
      signal: controller.signal,
    })
      .then((response) => {
        setProducts(response.products.map(normalizeProduct));
        setTotal(response.total);
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setProducts([]);
          setTotal(0);
          setRequestError({ query: queryKey, message: requestError.message });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedQuery(queryKey);
      });
    return () => controller.abort();
  }, [category, selectedTag, sortBy, searchQuery, isWishlistFilter, queryKey]);

  const handleLoadMore = useCallback(async () => {
    loadMoreController.current?.abort();
    const controller = new AbortController();
    loadMoreController.current = controller;
    setLoadingMoreQuery(queryKey);
    try {
      const response = await getProducts({
        category: category === 'all' ? undefined : category,
        search: searchQuery.trim() || undefined,
        tag: selectedTag || undefined,
        sortBy,
        limit: PAGE_SIZE,
        offset: products.length,
        signal: controller.signal,
      });
      setProducts((current) => [...current, ...response.products.map(normalizeProduct)]);
      setTotal(response.total);
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setRequestError({ query: queryKey, message: requestError.message });
      }
    } finally {
      if (loadMoreController.current === controller) setLoadingMoreQuery('');
    }
  }, [category, searchQuery, selectedTag, sortBy, products.length, queryKey]);

  const wishlistProducts = useMemo(() => {
    let result = [...wishlist];
    if (category !== 'all') result = result.filter((product) => product.category === category);
    if (selectedTag) result = result.filter((product) => product.tag?.toLowerCase().includes(selectedTag.toLowerCase()));
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((product) => (
        product.name.toLowerCase().includes(query)
        || product.description?.toLowerCase().includes(query)
        || product.category.toLowerCase().includes(query)
      ));
    }
    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortBy === 'popular') result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    return result;
  }, [wishlist, category, selectedTag, searchQuery, sortBy]);

  const visibleProducts = isWishlistFilter ? wishlistProducts : products;
  const title = isWishlistFilter
    ? 'My Saved Wishlist'
    : category === 'all'
      ? 'All Boutique Collections'
      : category;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-nude/70 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-brand-charcoal">{title}</h1>
          <p className="text-xs sm:text-sm text-brand-subtle mt-1">
            Showing {isWishlistFilter ? visibleProducts.length : total} styles · Discreet packaging on every order
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsCalcOpen(true)} className="hidden sm:inline-flex">
            <Ruler className="w-3.5 h-3.5 text-brand-roseGold mr-1.5" />
            Size Calculator
          </Button>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-nude rounded-xl text-xs font-semibold text-brand-charcoal"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-roseGold" />
            Filters
          </button>
          <SortDropdown />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="hidden lg:block lg:col-span-1 sticky top-28">
          <ProductFilters />
        </aside>

        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setMobileFilterOpen(false)} />
            <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white p-6 shadow-2xl overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-lg font-bold">Filter Collections</h3>
                <button type="button" onClick={() => setMobileFilterOpen(false)} aria-label="Close filters">
                  <X className="w-5 h-5 text-brand-subtle" />
                </button>
              </div>
              <ProductFilters />
              <Button variant="luxury" fullWidth size="md" onClick={() => setMobileFilterOpen(false)} className="mt-6">
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        <main className="lg:col-span-3">
          {searchQuery && (
            <div className="mb-4 flex items-center justify-between bg-brand-cream px-4 py-2.5 rounded-xl border border-brand-nude text-xs">
              <span>Search results for: <strong>"{searchQuery}"</strong></span>
              <button type="button" onClick={() => setSearchQuery('')} className="text-brand-roseGold font-semibold hover:underline">Clear Search</button>
            </div>
          )}

          {(error || (isWishlistFilter && wishlistError) || categoriesError) && (
            <p role="alert" className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {error || wishlistError || categoriesError}
            </p>
          )}
          {isWishlistFilter && !user ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-brand-subtle">Sign in to view your saved products.</p>
              <Link to="/account" className="text-sm font-semibold text-brand-roseGold hover:underline">Sign in to your account</Link>
            </div>
          ) : isLoading || (isWishlistFilter && wishlistLoading) ? (
            <p role="status" className="py-12 text-center text-sm text-brand-subtle">Loading collection…</p>
          ) : (
            <>
              <ProductGrid products={visibleProducts} onResetFilters={handleResetFilters} />
              {!isWishlistFilter && products.length < total && (
                <div className="text-center pt-8">
                  <Button variant="outline" size="md" onClick={handleLoadMore} isLoading={isLoadingMore}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <BraSizeCalculatorModal isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
    </div>
  );
}
