import { create } from 'zustand';
import { getStoredSession } from '../services/api';
import {
  addCartItem,
  clearCart as clearCartRequest,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../services/commerce';
import { normalizeProduct } from '../services/catalog';

const FREE_SHIPPING_THRESHOLD = 999;

function normalizeCartItem(item) {
  const product = normalizeProduct(item.product || item);
  return {
    ...product,
    cartItemId: String(item.id ?? item.cartItemId),
    productId: item.product_id ?? item.productId ?? product.id,
    name: product.name,
    image: product.image || item.productImage || item.product_image || '',
    price: Number(item.unitPrice ?? item.unit_price ?? product.price) || 0,
    originalPrice: product.originalPrice ?? item.originalPrice,
    selectedSize: item.size || item.selectedSize || 'M',
    selectedCup: item.selectedCup ?? item.selected_cup ?? null,
    selectedColor: item.selectedColor ?? item.selected_color ?? null,
    colorHex: item.colorHex ?? item.color_hex ?? null,
    quantity: Number(item.quantity) || 0,
  };
}

function cartState(response) {
  const items = response.items || response.results || [];
  const freeShipping = response.freeShipping || response.free_shipping || {};
  return {
    items: items.map(normalizeCartItem),
    subtotal: Number(response.subtotal) || 0,
    totalSavings: Number(response.totalSavings ?? response.total_savings) || 0,
    shippingFee: Number(response.shippingFee ?? response.shipping_fee) || 0,
    freeShippingThreshold: Number(freeShipping.threshold ?? response.freeShippingThreshold ?? response.free_shipping_threshold) || FREE_SHIPPING_THRESHOLD,
    freeShippingRemaining: freeShipping.remaining == null ? null : Number(freeShipping.remaining),
    freeShippingPercentage: freeShipping.percentage == null ? null : Number(freeShipping.percentage),
    qualifiesForFreeShipping: Boolean(freeShipping.isQualified ?? freeShipping.is_qualified ?? response.qualifiesForFreeShipping ?? response.qualifies_for_free_shipping),
  };
}

export const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  totalSavings: 0,
  shippingFee: 0,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  freeShippingRemaining: null,
  freeShippingPercentage: null,
  qualifiesForFreeShipping: false,
  isOpen: false,
  isLoading: Boolean(getStoredSession()?.access_token),
  error: '',

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  clearError: () => set({ error: '' }),

  loadCart: async () => {
    set({ isLoading: true, error: '' });
    try {
      const response = await getCart();
      set({ ...cartState(response), isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addItem: async (product, { selectedSize = 'M', selectedCup, selectedColor, quantity = 1 } = {}) => {
    set({ isLoading: true, error: '' });
    try {
      const response = await addCartItem({
        productId: Number(product.id),
        selectedSize,
        ...(selectedCup ? { selectedCup } : {}),
        ...(selectedColor ? { selectedColor } : {}),
        quantity,
      });
      set({ ...cartState(response), isLoading: false, isOpen: true });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeItem: async (cartItemId) => {
    set({ isLoading: true, error: '' });
    try {
      const response = await removeCartItem(cartItemId);
      set({ ...cartState(response), isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (cartItemId, newQty) => {
    if (newQty <= 0) return get().removeItem(cartItemId);
    set({ isLoading: true, error: '' });
    try {
      const response = await updateCartItem(cartItemId, {
        quantity: Math.min(newQty, 50),
      });
      set({ ...cartState(response), isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: '' });
    try {
      await clearCartRequest();
      set({
        items: [],
        subtotal: 0,
        totalSavings: 0,
        shippingFee: 0,
        freeShippingRemaining: 0,
        freeShippingPercentage: 100,
        qualifiesForFreeShipping: true,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  reset: () => set({
    items: [],
    subtotal: 0,
    totalSavings: 0,
    shippingFee: 0,
    freeShippingRemaining: null,
    freeShippingPercentage: null,
    qualifiesForFreeShipping: false,
    isOpen: false,
    isLoading: false,
    error: '',
  }),

  getSubtotal: () => get().subtotal,
  getTotalSavings: () => get().totalSavings ?? get().items.reduce((sum, item) => (
    sum + Math.max(0, (item.originalPrice || item.price) - item.price) * item.quantity
  ), 0),
  getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
  getFreeShippingProgress: () => {
    const { subtotal, freeShippingThreshold, qualifiesForFreeShipping } = get();
    return {
      threshold: freeShippingThreshold,
      subtotal,
      remaining: get().freeShippingRemaining ?? Math.max(0, freeShippingThreshold - subtotal),
      percentage: get().freeShippingPercentage ?? Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100)),
      isQualified: qualifiesForFreeShipping,
    };
  },
}));
