import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { AddressForm } from '../features/checkout/AddressForm';
import { PaymentSelector } from '../features/checkout/PaymentSelector';
import { OrderSummary } from '../features/cart/OrderSummary';
import {
  createOrder,
  createOrderPayment,
  quoteCoupon,
  verifyOrderPayment,
} from '../services/commerce';
import { Button } from '../components/common/Button';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-razorpay-checkout]');
    const script = existingScript || document.createElement('script');
    const onLoad = () => {
      script.dataset.razorpayLoaded = 'true';
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error('Razorpay checkout did not initialize. Please retry.'));
    };
    const onError = () => {
      script.remove();
      reject(new Error('Unable to load the Razorpay checkout. Check your connection and retry.'));
    };

    if (existingScript?.dataset.razorpayLoaded === 'true') {
      reject(new Error('Razorpay checkout did not initialize. Please refresh and retry.'));
      return;
    }
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (!existingScript) {
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset.razorpayCheckout = 'true';
      document.body.appendChild(script);
    }
  });
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, shippingFee, isLoading, error: cartError, loadCart, getSubtotal, getTotalSavings, reset } = useCartStore();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    discreetPackage: true,
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const paymentIdempotencyKeys = useRef(new Map());

  const subtotal = Number(getSubtotal()) || 0;
  const savings = getTotalSavings();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCartRetry = async () => {
    try {
      await loadCart();
    } catch {
      // The cart store exposes the request error for the checkout page.
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCodeInput.trim().toUpperCase();
    setErrorMsg('');
    if (!code) {
      setAppliedCouponCode('');
      setCouponDiscount(0);
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const quote = await quoteCoupon(code);
      setAppliedCouponCode(quote.couponCode || code);
      setCouponDiscount(Number(quote.discountAmount) || 0);
    } catch (error) {
      setAppliedCouponCode('');
      setCouponDiscount(0);
      setErrorMsg(error.message);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const startRazorpayPayment = async (order) => {
    const orderId = order.id;
    let idempotencyKey = paymentIdempotencyKeys.current.get(String(orderId));
    if (!idempotencyKey) {
      idempotencyKey = crypto.randomUUID();
      paymentIdempotencyKeys.current.set(String(orderId), idempotencyKey);
    }

    const payment = await createOrderPayment(orderId, idempotencyKey);
    const Razorpay = await loadRazorpay();
    const checkout = new Razorpay({
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency,
      name: 'Naksha',
      description: `Order ${order.order_number || orderId}`,
      order_id: payment.razorpayOrderId,
      theme: { color: '#C06C64' },
      handler: async (response) => {
        setIsCheckoutOpen(false);
        setErrorMsg('');
        try {
          await verifyOrderPayment(orderId, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }, { guest: true });
          setPendingPaymentOrder(null);
          paymentIdempotencyKeys.current.delete(String(orderId));
          reset();
          navigate(`/order-success?id=${orderId}`);
        } catch (error) {
          setErrorMsg(`Payment verification is not confirmed yet. Your order ${order.order_number || orderId} remains available; retry or check its status before paying again. ${error.message}`);
        }
      },
      modal: {
        ondismiss: () => {
          setIsCheckoutOpen(false);
          setErrorMsg(`Payment was not completed. Order ${order.order_number || orderId} is saved and can be paid again below.`);
        },
      },
    });
    checkout.on('payment.failed', (event) => {
      setIsCheckoutOpen(false);
      const failure = event?.error?.description || 'Payment was not completed.';
      setErrorMsg(`${failure} Your order ${order.order_number || orderId} remains saved and can be paid again below.`);
    });
    setIsCheckoutOpen(true);
    checkout.open();
  };

  const handleRetryPayment = async () => {
    if (!pendingPaymentOrder || isProcessing || isCheckoutOpen) return;
    setIsProcessing(true);
    setErrorMsg('');
    try {
      await startRazorpayPayment(pendingPaymentOrder);
    } catch (error) {
      setErrorMsg(`Unable to start payment for order ${pendingPaymentOrder.order_number || pendingPaymentOrder.id}. ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setErrorMsg('');

    // Simple validation
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()
      || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      setErrorMsg('Please complete all required shipping fields before placing your order.');
      return;
    }

    if (formData.phone.replace(/\D/g, '').length < 7 || formData.pincode.trim().length < 4) {
      setErrorMsg('Enter a valid phone number and PIN code.');
      return;
    }

    if (items.length === 0) {
      navigate('/shop');
      return;
    }

    setIsProcessing(true);
    let createdOrder = null;
    try {
      const order = await createOrder({
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          discreetPackage: formData.discreetPackage,
        },
        paymentMethod,
        couponCode: appliedCouponCode,
      });
      createdOrder = order;
      if (!order?.id) {
        setErrorMsg('The order was created, but its response did not include an order ID. Contact the store before retrying to avoid placing a duplicate order.');
        setIsProcessing(false);
        return;
      }
      if (paymentMethod === 'cod') {
        reset();
        setPendingPaymentOrder(null);
        setIsProcessing(false);
        navigate(`/order-success?id=${order.id}`, { state: { order } });
        return;
      }
      setPendingPaymentOrder(order);
      await startRazorpayPayment(order);
      setIsProcessing(false);
    } catch (error) {
      setErrorMsg(createdOrder
        ? `Order ${createdOrder.order_number || createdOrder.id} was created, but payment could not be started. Retry payment below. ${error.message}`
        : error.message);
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    if (isLoading) {
      return <div role="status" className="max-w-2xl mx-auto px-4 py-20 text-center text-sm text-brand-subtle">Loading your shopping bag…</div>;
    }
    if (cartError) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl">{cartError}</p>
          <Button variant="outline" onClick={handleCartRetry}>Retry</Button>
        </div>
      );
    }
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-brand-charcoal">Your bag is empty</h2>
        <p className="text-xs text-brand-subtle">Add products to your bag before proceeding to checkout.</p>
        <Link to="/shop" className="text-brand-roseGold font-semibold hover:underline block text-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Checkout Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-nude/70 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-roseGold font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Secure order checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal mt-1">
            Express Checkout
          </h1>
        </div>

        <Link to="/cart" className="text-xs sm:text-sm font-semibold text-brand-subtle hover:text-brand-charcoal flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Review Bag Items
        </Link>
      </div>

      {errorMsg && (
        <div role="alert" className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
          {errorMsg}
        </div>
      )}
      {pendingPaymentOrder && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-950">Order {pendingPaymentOrder.order_number || pendingPaymentOrder.id} is awaiting payment. Retry payment for this order instead of placing it again.</p>
          {!isCheckoutOpen && <Button onClick={handleRetryPayment} isLoading={isProcessing}>Retry payment</Button>}
        </div>
      )}

      {/* Main Grid */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Shipping & Payment */}
        <div className="lg:col-span-8 space-y-8">
          <AddressForm formData={formData} onChange={handleInputChange} />
          <PaymentSelector
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />
          <div className="rounded-2xl border border-brand-nude bg-white p-5 shadow-xs">
            <label htmlFor="coupon-code" className="block text-sm font-semibold text-brand-charcoal">Promotion code</label>
            <div className="mt-3 flex gap-2">
              <input
                id="coupon-code"
                value={couponCodeInput}
                onChange={(event) => {
                  const nextCode = event.target.value.toUpperCase();
                  setCouponCodeInput(nextCode);
                  if (nextCode.trim() !== appliedCouponCode) {
                    setAppliedCouponCode('');
                    setCouponDiscount(0);
                  }
                }}
                maxLength={40}
                autoComplete="off"
                placeholder="Enter coupon code"
                className="min-w-0 flex-1 rounded-xl border border-brand-nude bg-brand-cream px-3.5 py-2.5 text-sm outline-none focus:border-brand-roseGold focus:ring-2 focus:ring-brand-blush/40"
              />
              <Button type="button" variant="outline" onClick={handleApplyCoupon} isLoading={isApplyingCoupon}>Apply</Button>
            </div>
            {appliedCouponCode && <p role="status" className="mt-2 text-xs font-medium text-emerald-700">Coupon {appliedCouponCode} applied.</p>}
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <OrderSummary
            subtotal={subtotal}
            savings={savings}
            shippingFee={shippingFee}
            discountAmount={couponDiscount}
            couponCode={appliedCouponCode}
            onProceedToCheckout={handlePlaceOrder}
            showCheckoutBtn={!pendingPaymentOrder}
            isCheckingOut={isProcessing}
          />
        </div>

      </form>

    </div>
  );
}
