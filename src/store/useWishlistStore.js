import { create } from 'zustand';
import { api, getStoredSession } from '../services/api';
import { normalizeProduct } from '../services/catalog';

export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  isLoading: Boolean(getStoredSession()?.access_token),
  error: '',

  loadWishlist: async () => {
    set({ isLoading: true, error: '' });
    try {
      const response = await api.get('/wishlist');
      set({
        wishlist: response.items.map((item) => normalizeProduct(item.product)),
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  toggleWishlist: async (product) => {
    set({ isLoading: true, error: '' });
    try {
      await api.post(`/wishlist/toggle/${product.id}`);
      const response = await api.get('/wishlist');
      set({
        wishlist: response.items.map((item) => normalizeProduct(item.product)),
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  isInWishlist: (productId) => get().wishlist.some((item) => item.id === productId),
  getCount: () => get().wishlist.length,
  reset: () => set({ wishlist: [], isLoading: false, error: '' }),
}));
