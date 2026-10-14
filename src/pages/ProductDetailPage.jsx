import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Heart, ShieldCheck, Truck } from 'lucide-react';
import { getProduct, normalizeProduct } from '../services/catalog';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StarRating } from '../components/common/StarRating';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../utils/formatCurrency';

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(Number(productId)));

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getProduct(productId, { signal: controller.signal })
      .then((response) => setProduct(normalizeProduct(response)))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError({ productId, message: requestError.message });
      });
    return () => controller.abort();
  }, [productId]);

  const requireAccount = () => navigate('/account', { state: { from: location } });

  const handleAddToCart = async (goToCheckout = false) => {
    if (!user) {
      requireAccount();
      return;
    }
    setIsAdding(true);
    setActionMessage('');
    try {
      await addItem(product, { selectedSize: 'M' });
      if (goToCheckout) navigate('/checkout');
      else setActionMessage('Added to your shopping bag.');
    } catch (requestError) {
      setActionMessage(requestError.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      requireAccount();
      return;
    }
    setActionMessage('');
    try {
      await toggleWishlist(product);
      setActionMessage(isInWishlist ? 'Removed from your wishlist.' : 'Saved to your wishlist.');
    } catch (requestError) {
      setActionMessage(requestError.message);
    }
  };

  const isLoading = !product || String(product.id) !== productId;
  const currentError = error?.productId === productId ? error.message : '';

  if (isLoading && !currentError) {
    return <div role="status" className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-brand-subtle">Loading product…</div>;
  }

  if (currentError || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Product unavailable</h1>
        <p role="alert" className="text-sm text-rose-700">{currentError || 'This product could not be loaded.'}</p>
        <Link to="/shop" className="text-sm font-semibold text-brand-roseGold hover:underline">Return to the collection</Link>
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <nav className="flex items-center gap-2 text-xs text-brand-subtle">
        <Link to="/" className="hover:text-brand-charcoal">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?cat=${encodeURIComponent(product.category)}`} className="hover:text-brand-charcoal">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-brand-charcoal font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7">
          <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-brand-cream border border-brand-nude shadow-soft">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.tag && <Badge variant={product.isBestSeller ? 'accent' : 'rose'}>{product.tag.toUpperCase()}</Badge>}
              {discountPercent > 0 && <Badge variant="gold">{discountPercent}% OFF</Badge>}
            </div>
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-200 ${
                isInWishlist ? 'bg-rose-50 text-rose-600 shadow-md' : 'bg-white/90 text-brand-charcoal hover:bg-white hover:text-rose-600 shadow-sm'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-600' : ''}`} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            </div>
            <p className="text-xs uppercase tracking-wider text-brand-roseGold font-semibold">{product.category}</p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal mt-1">{product.name}</h1>
            {product.description && <p className="text-xs sm:text-sm text-brand-subtle mt-2 leading-relaxed">{product.description}</p>}
          </div>

          <div className="flex items-baseline gap-3 pb-4 border-b border-brand-nude/70">
            <span className="text-3xl font-serif font-bold text-brand-charcoal">{formatCurrency(product.price)}</span>
            {product.originalPrice && <span className="text-base text-brand-subtle line-through">{formatCurrency(product.originalPrice)}</span>}
            {discountPercent > 0 && <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">Save {discountPercent}%</span>}
          </div>

          <div className="p-4 bg-brand-cream rounded-2xl border border-brand-nude/70 space-y-1">
            <span className="text-xs font-semibold text-brand-charcoal">Catalog sizing</span>
            <p className="text-xs text-brand-subtle">
              This catalog does not publish size variants. The cart records the API's standard size (M) for this item.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button variant="luxury" size="lg" fullWidth onClick={() => handleAddToCart()} isLoading={isAdding}>
              Add to Bag · {formatCurrency(product.price)}
            </Button>
            <Button variant="dark" size="lg" fullWidth onClick={() => handleAddToCart(true)} isLoading={isAdding}>
              Buy Now
            </Button>
            {actionMessage && (
              <p role="status" className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl text-center font-medium">
                {actionMessage}
              </p>
            )}
          </div>

          <div className="p-3.5 bg-brand-cream rounded-2xl border border-brand-champagne/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-brand-charcoal block">Discreet packaging</span>
              <p className="text-brand-subtle mt-0.5 leading-snug">Your order is packed in neutral, unbranded packaging.</p>
            </div>
          </div>

          <div className="p-4 border border-brand-nude/70 rounded-2xl flex items-start gap-3">
            <Truck className="w-5 h-5 text-brand-roseGold shrink-0" />
            <p className="text-xs text-brand-subtle">
              {product.is_in_stock
                ? `In stock${product.stock_quantity ? ` · ${product.stock_quantity} available` : ''}. Shipping is calculated by the server at checkout.`
                : 'Currently out of stock.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
