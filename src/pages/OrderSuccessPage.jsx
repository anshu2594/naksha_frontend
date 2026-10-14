import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { Button } from '../components/common/Button';

export function OrderSuccessPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order && Boolean(orderId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId || order) return undefined;
    const controller = new AbortController();
    api.get(`/orders/${orderId}`, { signal: controller.signal })
      .then(setOrder)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [orderId, order]);

  if (!orderId) return <Navigate to="/shop" replace />;
  if (loading) return <div role="status" className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-brand-subtle">Loading your order…</div>;
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Unable to load this order</h1>
        <p role="alert" className="text-sm text-rose-700">{error || 'Order details are unavailable.'}</p>
        <Link to="/shop" className="text-sm font-semibold text-brand-roseGold hover:underline">Return to shop</Link>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9 stroke-[2]" />
        </div>
        <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Order {order.status.toLowerCase()} · Payment {order.payment_status.toLowerCase()}
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal">Thank You For Your Order!</h1>
        <p className="text-xs sm:text-sm text-brand-subtle max-w-md mx-auto">
          Your order has been saved. Payment status and fulfillment updates are provided by the store.
        </p>
      </div>

      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3.5">
        <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 space-y-0.5">
          <span className="font-bold block text-sm">Discreet packaging</span>
          <p className="text-emerald-900 leading-relaxed">Your order will be prepared in neutral, discreet packaging.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-nude/80 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-brand-nude/60 gap-2 text-xs">
          <div>
            <span className="text-brand-subtle block">Order Reference:</span>
            <strong className="text-sm font-bold text-brand-charcoal">{order.order_number}</strong>
          </div>
          <div>
            <span className="text-brand-subtle block">Order Date:</span>
            <strong className="text-brand-charcoal">{orderDate}</strong>
          </div>
          <div>
            <span className="text-brand-subtle block">Order Status:</span>
            <strong className="text-brand-roseGold flex items-center gap-1 uppercase">
              <Truck className="w-3.5 h-3.5" /> {order.status}
            </strong>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-serif text-base font-semibold text-brand-charcoal">Items in This Shipment</h3>
          <div className="divide-y divide-brand-nude/50">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-4">
                <img src={item.product_image} alt={item.product_name} className="w-14 h-18 object-cover rounded-lg bg-brand-cream border border-brand-nude shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-brand-charcoal truncate">{item.product_name}</h4>
                  <div className="text-[11px] text-brand-subtle mt-0.5 flex gap-2">
                    {item.size && <span>Size: <strong>{item.size}</strong></span>}
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right text-xs sm:text-sm font-bold text-brand-charcoal">{formatCurrency(item.subtotal)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-brand-nude/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-brand-subtle uppercase tracking-wider font-semibold block mb-1">Shipping Destination</span>
            <p className="font-semibold text-brand-charcoal">{order.shipping_name}</p>
            <p className="text-brand-subtle">{order.shipping_address}</p>
            <p className="text-brand-subtle">{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
          </div>
          <div className="sm:text-right space-y-1">
            <span className="text-brand-subtle uppercase tracking-wider font-semibold block">Payment Summary</span>
            <p className="text-brand-subtle">Method: <strong className="uppercase text-brand-charcoal">{order.payment_method}</strong></p>
            <p className="text-brand-subtle">Status: <strong className="uppercase text-brand-charcoal">{order.payment_status}</strong></p>
            <div className="text-lg font-serif font-bold text-brand-charcoal pt-1">Order total: {formatCurrency(order.total_amount)}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Link to="/shop">
          <Button variant="luxury" size="lg">
            Continue Shopping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
