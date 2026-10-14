import { create } from 'zustand';
import { getCategories } from '../services/catalog';

export const useCatalogStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: '',

  loadCategories: async () => {
    if (get().categories.length || get().isLoading) return;
    set({ isLoading: true, error: '' });
    try {
      const categories = await getCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
