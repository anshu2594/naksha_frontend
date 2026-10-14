import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';

export function SortDropdown() {
  const { sortBy, setSortBy } = useFilterStore();

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      <ArrowDownUp className="w-4 h-4 text-brand-subtle" />
      <span className="text-brand-subtle hidden sm:inline">Sort by:</span>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="bg-white border border-brand-nude/80 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-roseGold cursor-pointer"
      >
        <option value="popular">Popular</option>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
