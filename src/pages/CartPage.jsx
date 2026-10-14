import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { Button } from '../components/common/Button';
import { OrderSummary } from '../features/cart/OrderSummary';

export function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    isLoading,
    error,
    clearError,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotalSavings,
    getFreeShippingProgress,
    getItemCount,
    loadCart,
  } = useCartStore();

  const subtotal = getSubtotal();
  const savings = getTotalSavings();
  const shipping = getFreeShippingProgress();

  const handleCartAction = async (action) => {
    clearError();
    try {
      await action();
    } catch {
      // The cart store exposes the request error for the page to render.
    }
  };

  if (isLoading && items.length === 0) {
    return <div role="status" className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-brand-subtle">Loading your shopping bag…</div>;
  }

  if (items.length === 0) {
    if (error) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl">{error}</p>
          <Button variant="outline" onClick={() => handleCartAction(loadCart)}>Retry</Button>
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-brand-nude/70 rounded-full flex items-center justify-center text-brand-roseGold mx-auto">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm text-brand-subtle max-w-sm mx-auto">
          You haven't added any bras or designer blouses to your bag yet. Explore our bestsellers for inspiration.
        </p>
        <div className="pt-2">
          <Link to="/shop">
            <Button variant="luxury" size="lg">
              Explore Collections
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      <div className="flex items-center justify-between border-b border-brand-nude/70 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal">
            Shopping Bag ({getItemCount()})
          </h1>
          <p className="text-xs text-brand-subtle mt-0.5">
            Every item is packed in 100% discreet plain packaging.
          </p>
        </div>

        {error && <p role="alert" className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">{error}</p>}

        <Link to="/shop" className="text-xs sm:text-sm font-semibold text-brand-roseGold hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Bag Items */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Free Shipping Alert Banner */}
          <div className="bg-brand-cream p-4 rounded-2xl border border-brand-champagne/60">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2 font-medium">
              {shipping.isQualified ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  🎉 Congratulations! Your order qualifies for FREE Discreet Shipping!
                </span>
              ) : (
                <span className="text-brand-charcoal">
                  Add <strong className="text-brand-roseGold font-bold">{formatCurrency(shipping.remaining)}</strong> more to get <span className="text-emerald-700 font-bold">FREE Discreet Delivery</span>
                </span>
              )}
              <span className="text-xs font-semibold text-brand-subtle">{shipping.percentage}%</span>
            </div>
            <div className="w-full bg-brand-nude h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-roseGold h-full rounded-full transition-all duration-300"
                style={{ width: `${shipping.percentage}%` }}
              />
            </div>
          </div>

          {/* Items Table / Cards */}
          <div className="bg-white rounded-2xl border border-brand-nude/80 divide-y divide-brand-nude/60">
            {items.map((item) => (
              <div key={item.cartItemId} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-28 sm:w-24 sm:h-32 object-cover object-top rounded-xl bg-brand-cream border border-brand-nude shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-sm sm:text-base font-medium text-brand-charcoal">
                    {item.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-brand-subtle pt-1">
                    <span className="bg-brand-cream px-2 py-0.5 rounded-md border border-brand-nude text-brand-charcoal font-semibold">
                      Size: {item.selectedSize}{item.selectedCup ? item.selectedCup : ''}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-700 font-medium pt-1">
                    In Stock • Ready for Discreet Dispatch
                  </p>
                </div>

                {/* Quantity & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0">
                  <div className="flex items-center border border-brand-nude rounded-full bg-brand-cream/60">
                    <button
                      onClick={() => handleCartAction(() => updateQuantity(item.cartItemId, item.quantity - 1))}
                      className="p-1.5 hover:text-brand-roseGold transition-colors"
                      disabled={isLoading || item.quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5 text-brand-subtle" />
                    </button>
                    <span className="text-xs sm:text-sm font-semibold px-3 text-brand-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleCartAction(() => updateQuantity(item.cartItemId, item.quantity + 1))}
                      className="p-1.5 hover:text-brand-roseGold transition-colors"
                      disabled={isLoading}
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-subtle" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-brand-charcoal">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    {item.originalPrice && (
                      <span className="block text-xs text-brand-subtle line-through">
                        {formatCurrency(item.originalPrice * item.quantity)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCartAction(() => removeItem(item.cartItemId))}
                    className="p-2 text-brand-subtle hover:text-rose-600 transition-colors"
                    disabled={isLoading}
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 sticky top-28">
          <OrderSummary
            subtotal={subtotal}
            savings={savings}
            shippingFee={shipping.isQualified ? 0 : 99}
            onProceedToCheckout={() => navigate('/checkout')}
            showCheckoutBtn={true}
          />
        </div>

      </div>

    </div>
  );
}
