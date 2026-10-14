import { create } from 'zustand';
import { api, getStoredSession } from '../services/api';
import { normalizeProduct } from '../services/catalog';

const FREE_SHIPPING_THRESHOLD = 999;

function normalizeCartItem(item) {
  const product = normalizeProduct(item.product);
  return {
    ...product,
    cartItemId: String(item.id),
    productId: item.product_id,
    name: item.product.name,
    image: item.product.image,
    price: item.product.price,
    originalPrice: item.product.original_price,
    selectedSize: item.size || 'M',
    selectedCup: null,
    selectedColor: null,
    quantity: item.quantity,
  };
}

function cartState(response) {
  return {
    items: response.items.map(normalizeCartItem),
    subtotal: response.subtotal,
    shippingFee: response.shipping_fee,
    freeShippingThreshold: response.free_shipping_threshold,
    qualifiesForFreeShipping: response.qualifies_for_free_shipping,
  };
}

export const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  shippingFee: 0,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
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
      const response = await api.get('/cart');
      set({ ...cartState(response), isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addItem: async (product, { selectedSize = 'M' } = {}) => {
    set({ isLoading: true, error: '' });
    try {
      const response = await api.post('/cart/items', {
        product_id: Number(product.id),
        quantity: 1,
        size: selectedSize,
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
      const response = await api.delete(`/cart/items/${cartItemId}`);
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
      const response = await api.put(`/cart/items/${cartItemId}`, {
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
      await api.delete('/cart');
      set({
        items: [],
        subtotal: 0,
        shippingFee: 0,
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
    shippingFee: 0,
    qualifiesForFreeShipping: false,
    isOpen: false,
    isLoading: false,
    error: '',
  }),

  getSubtotal: () => get().subtotal,
  getTotalSavings: () => get().items.reduce((sum, item) => (
    sum + Math.max(0, (item.originalPrice || item.price) - item.price) * item.quantity
  ), 0),
  getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
  getFreeShippingProgress: () => {
    const { subtotal, freeShippingThreshold, qualifiesForFreeShipping } = get();
    return {
      threshold: freeShippingThreshold,
      subtotal,
      remaining: Math.max(0, freeShippingThreshold - subtotal),
      percentage: Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100)),
      isQualified: qualifiesForFreeShipping,
    };
  },
}));
