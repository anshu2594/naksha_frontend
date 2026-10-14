import { api } from './api';

export function normalizeCartResponse(response) {
  const freeShipping = response.freeShipping || {};
  return {
    ...response,
    total_savings: response.totalSavings ?? response.total_savings,
    free_shipping: {
      threshold: freeShipping.threshold,
      remaining: freeShipping.remaining,
      percentage: freeShipping.percentage,
      is_qualified: freeShipping.isQualified,
    },
    items: (response.items || response.results || []).map((item) => ({
      ...item,
      id: item.cartItemId ?? item.id,
      product_id: item.productId ?? item.product_id,
      size: item.selectedSize ?? item.size,
      selected_cup: item.selectedCup ?? item.selected_cup,
      selected_color: item.selectedColor ?? item.selected_color,
      color_hex: item.colorHex ?? item.color_hex,
      unit_price: item.price ?? item.unitPrice ?? item.unit_price,
      original_price: item.originalPrice ?? item.original_price,
      product_image: item.image ?? item.productImage ?? item.product_image,
    })),
  };
}

export function normalizeOrderResponse(order) {
  if (!order) return order;
  const address = order.shippingAddress || {};
  return {
    ...order,
    id: order.orderId ?? order.id,
    order_number: order.orderNumber || order.order_number || order.orderId || order.id,
    created_at: order.date || order.createdAt || order.created_at,
    payment_status: order.paymentStatus || order.payment_status,
    payment_method: order.paymentMethod || order.payment_method,
    total_amount: order.total ?? order.totalAmount ?? order.total_amount,
    discount_amount: order.discountAmount ?? order.discount_amount,
    shipping_name: address.fullName ?? order.shipping_name ?? order.shippingName,
    shipping_phone: address.phone ?? order.shipping_phone ?? order.shippingPhone,
    shipping_address: address.address ?? order.shipping_address,
    shipping_city: address.city ?? order.shipping_city ?? order.shippingCity,
    shipping_state: address.state ?? order.shipping_state ?? order.shippingState,
    shipping_pincode: address.pincode ?? order.shipping_pincode ?? order.shippingPincode,
    discreet_package: address.discreetPackage ?? order.discreetPackage ?? order.discreet_package,
    items: (order.items || []).map((item) => ({
      ...item,
      id: item.id ?? item.productId ?? item.name,
      product_name: item.name ?? item.productName ?? item.product_name,
      product_image: item.image ?? item.productImage ?? item.product_image,
      size: item.selectedSize ?? item.size,
      subtotal: item.subtotal ?? Number(item.price || 0) * Number(item.quantity || 0),
    })),
  };
}

export function getCart(options) {
  return api.get('/cart', { ...options, guest: true }).then(normalizeCartResponse);
}

export function addCartItem(payload) {
  return api.post('/cart/items', payload, { guest: true }).then(normalizeCartResponse);
}

export function updateCartItem(itemId, payload) {
  return api.patch(`/cart/items/${itemId}`, payload, { guest: true }).then(normalizeCartResponse);
}

export function removeCartItem(itemId) {
  return api.delete(`/cart/items/${itemId}`, { guest: true }).then(normalizeCartResponse);
}

export function clearCart() {
  return api.delete('/cart', { guest: true }).then(normalizeCartResponse);
}

export function quoteCoupon(couponCode) {
  return api.post('/cart/quote/', { couponCode }, { guest: true });
}

export function createOrder({ shippingAddress, paymentMethod, couponCode }) {
  return api.post('/orders', {
    shippingAddress,
    paymentMethod,
    ...(couponCode ? { couponCode } : {}),
  }, { guest: true }).then(normalizeOrderResponse);
}

export function getOrder(orderId, options) {
  return api.get(`/orders/${orderId}`, { ...options, guest: true }).then(normalizeOrderResponse);
}

export function createOrderPayment(orderId, idempotencyKey) {
  return api.post(`/orders/${orderId}/payment/`, undefined, {
    guest: true,
    headers: { 'Idempotency-Key': idempotencyKey },
  });
}

export function verifyOrderPayment(orderId, payload) {
  return api.post(`/orders/${orderId}/payment/verify/`, payload, { guest: true });
}
