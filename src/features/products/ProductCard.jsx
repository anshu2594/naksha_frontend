import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { Badge } from '../../components/common/Badge';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';

export function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const user = useAuthStore((s) => s.user);

  const currentImage = product.images?.[isHovered ? 1 : 0] || product.image;
  const productPath = `/product/${product.slug || product.id}`;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-brand-nude/70 hover:shadow-soft transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-nude/30">
        <Link to={productPath} className="block w-full h-full">
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <Badge variant="accent" size="xs">
              BESTSELLER
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="rose" size="xs">
              NEW IN
            </Badge>
          )}
          {discountPercent > 0 && (
            <Badge variant="gold" size="xs">
              {discountPercent}% OFF
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setActionError('');
            if (!user) {
              navigate('/account', { state: { from: location } });
              return;
            }
            try {
              await toggleWishlist(product);
            } catch (error) {
              setActionError(error.message);
            }
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${
            isInWishlist
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-brand-charcoal hover:bg-white hover:text-rose-600 backdrop-blur-xs'
          }`}
          aria-label="Wishlist toggle"
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-rose-600' : ''}`} />
        </button>
        {actionError && <p role="alert" className="absolute top-14 right-3 z-10 max-w-[75%] rounded-lg bg-rose-50 px-2 py-1 text-[10px] text-rose-700">{actionError}</p>}

        {/* Category Specific Feature Tag on bottom-left of image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
          <span className="truncate">{product.category}</span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1">
        
        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-brand-charcoal text-xs">{product.rating}</span>
          <span className="text-brand-subtle text-[11px]">({product.reviewCount})</span>
        </div>

        {/* Title */}
        <Link to={productPath} className="group-hover:text-brand-roseGold transition-colors">
          <h3 className="text-sm font-medium text-brand-charcoal line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Sizes summary */}
        <div className="mt-1 text-[11px] text-brand-subtle">
          <span>{product.tag || 'In the collection'}</span>
        </div>

        {/* Color preview dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {product.colors.map((color, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            <span className="text-[10px] text-brand-subtle ml-1">
              {product.colors.length} shades
            </span>
          </div>
        )}

        {/* Price & CTA */}
        <div className="mt-auto pt-3 flex items-baseline justify-between border-t border-brand-nude/40">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-brand-charcoal">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-brand-subtle line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <Link
            to={productPath}
            className="text-xs font-semibold text-brand-roseGold hover:text-brand-terracotta group-hover:underline"
          >
            Select Size →
          </Link>
        </div>

      </div>
    </div>
  );
}
