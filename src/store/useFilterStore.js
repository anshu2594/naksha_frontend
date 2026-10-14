import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  selectedTag: '',
  sortBy: 'popular',
  searchQuery: '',

  setSelectedTag: (selectedTag) => set({ selectedTag }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  resetFilters: () => set({
    selectedTag: '',
    sortBy: 'popular',
    searchQuery: '',
  })
}));
