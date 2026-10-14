import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Trash2, Plus, Minus } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../utils/formatCurrency';

export function CartDrawer() {
  const navigate = useNavigate();
  const {
    isOpen,
    closeCart,
    items,
    error,
    isLoading,
    clearError,
    loadCart,
    getItemCount,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotalSavings,
    getFreeShippingProgress,
  } = useCartStore();

  const subtotal = getSubtotal();
  const savings = getTotalSavings();
  const shipping = getFreeShippingProgress();

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleCartAction = async (action) => {
    clearError();
    try {
      await action();
    } catch {
      // The cart store exposes request failures for display in this drawer.
    }
  };

  const handleViewCartClick = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      title="Shopping Bag"
      subtitle={`${getItemCount()} ${getItemCount() === 1 ? 'item' : 'items'} in your cart`}
    >
      {items.length === 0 && isLoading ? (
        <p role="status" className="py-16 text-center text-sm text-brand-subtle">Loading your shopping bag…</p>
      ) : items.length === 0 && error ? (
        <div className="text-center py-16 space-y-3">
          <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">{error}</p>
          <Button variant="outline" size="sm" onClick={() => handleCartAction(loadCart)}>Retry</Button>
        </div>
      ) : items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 bg-brand-nude/70 rounded-full flex items-center justify-center text-brand-roseGold mb-4">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-serif font-semibold text-brand-charcoal">Your bag is empty</h3>
          <p className="text-xs text-brand-subtle max-w-xs mt-1 mb-6">
            Explore the latest styles in the Naksha collection.
          </p>
          <Button variant="luxury" size="sm" onClick={closeCart}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {error && (
            <div className="mb-3 p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
              <p role="alert">{error}</p>
              <button
                type="button"
                onClick={() => handleCartAction(loadCart)}
                className="mt-1 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Free Shipping Tracker */}
          <div className="bg-brand-cream p-3 rounded-xl border border-brand-champagne/40 mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              {shipping.isQualified ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  🎉 You unlocked FREE Discreet Delivery!
                </span>
              ) : (
                <span className="text-brand-charcoal">
                  Add <strong className="text-brand-roseGold">{formatCurrency(shipping.remaining)}</strong> for <span className="font-semibold text-emerald-700">FREE Shipping</span>
                </span>
              )}
              <span className="text-[11px] text-brand-subtle">{shipping.percentage}%</span>
            </div>
            <div className="w-full bg-brand-nude h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-roseGold h-full rounded-full transition-all duration-300"
                style={{ width: `${shipping.percentage}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-brand-nude/50 pr-1 space-y-3">
            {items.map((item) => (
              <div key={item.cartItemId} className="pt-3 flex gap-3.5 items-start">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-18 h-22 sm:w-20 sm:h-26 object-cover rounded-lg bg-brand-nude/30 border border-brand-nude/60 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-medium text-brand-charcoal truncate">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => handleCartAction(() => removeItem(item.cartItemId))}
                      disabled={isLoading}
                      className="text-brand-subtle hover:text-rose-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Variation Details: Size, Cup, Color */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-brand-subtle">
                    <span className="bg-brand-nude/60 px-1.5 py-0.5 rounded text-brand-charcoal font-medium">
                      Size: {item.selectedSize}{item.selectedCup ? item.selectedCup : ''}
                    </span>
                  </div>

                  {/* Price & Quantity Adjuster */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-brand-nude rounded-full bg-white">
                      <button
                        onClick={() => handleCartAction(() => updateQuantity(item.cartItemId, item.quantity - 1))}
                        disabled={isLoading || item.quantity <= 1}
                        className="p-1 hover:text-brand-roseGold transition-colors"
                      >
                        <Minus className="w-3 h-3 text-brand-subtle" />
                      </button>
                      <span className="text-xs font-semibold px-2 text-brand-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleCartAction(() => updateQuantity(item.cartItemId, item.quantity + 1))}
                        disabled={isLoading}
                        className="p-1 hover:text-brand-roseGold transition-colors"
                      >
                        <Plus className="w-3 h-3 text-brand-subtle" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-bold text-brand-charcoal">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      {item.originalPrice && (
                        <span className="block text-[10px] text-brand-subtle line-through">
                          {formatCurrency(item.originalPrice * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Drawer Footer Checkout Area */}
          <div className="pt-4 border-t border-brand-nude/70 mt-3 space-y-3">
            {savings > 0 && (
              <div className="flex justify-between text-xs text-emerald-700 bg-emerald-50/70 px-3 py-1.5 rounded-lg font-medium">
                <span>You're saving on this order</span>
                <span>{formatCurrency(savings)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-brand-charcoal">Subtotal</span>
              <span className="text-lg font-bold text-brand-charcoal">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-brand-subtle">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Ships in 100% plain, discreet packaging.</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" size="md" onClick={handleViewCartClick}>
                View Bag
              </Button>
              <Button variant="luxury" size="md" onClick={handleCheckoutClick}>
                Checkout
              </Button>
            </div>
          </div>

        </div>
      )}
    </Drawer>
  );
}
