import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../../components/common/Button';

export function OrderSummary({
  subtotal,
  savings = 0,
  shippingFee,
  discountAmount = 0,
  couponCode = '',
  onProceedToCheckout,
  showCheckoutBtn = true,
  isCheckingOut = false,
}) {
  subtotal = Number(subtotal) || 0;
  savings = Number(savings) || 0;
  discountAmount = Number(discountAmount) || 0;
  const deliveryFee = Number(shippingFee ?? (subtotal >= 999 ? 0 : 99)) || 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-nude/80 shadow-xs space-y-5">
      <h3 className="font-serif text-lg font-semibold text-brand-charcoal border-b border-brand-nude/60 pb-3">
        Order Summary
      </h3>

      {/* Line Items */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-brand-subtle">
          <span>Bag Subtotal</span>
          <span className="font-semibold text-brand-charcoal">{formatCurrency(subtotal)}</span>
        </div>

        {savings > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Special Style Discount</span>
            <span>-{formatCurrency(savings)}</span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Coupon discount{couponCode ? ` (${couponCode})` : ''}</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-brand-subtle">
          <span>Discreet Delivery</span>
          <span>
            {deliveryFee === 0 ? (
              <span className="text-emerald-700 font-semibold uppercase text-xs">FREE</span>
            ) : (
              formatCurrency(deliveryFee)
            )}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-brand-nude flex items-baseline justify-between">
        <div>
          <span className="text-base font-bold text-brand-charcoal block">Total Amount</span>
          <span className="text-[11px] text-brand-subtle">Includes all taxes</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-serif font-bold text-brand-charcoal">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      {/* Discreet Packaging Assurance */}
      <div className="p-3 bg-brand-cream rounded-xl border border-brand-champagne/40 flex items-start gap-2.5 text-xs text-brand-charcoal">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span className="text-[11px] text-brand-subtle leading-snug">
          <strong>Privacy Promise:</strong> Invoices inside the package only. Plain exterior packaging with zero intimates branding.
        </span>
      </div>

      {/* Checkout Button */}
      {showCheckoutBtn && onProceedToCheckout && (
        <Button
          variant="luxury"
          size="lg"
          fullWidth
          onClick={onProceedToCheckout}
          isLoading={isCheckingOut}
        >
          Proceed to Checkout
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
