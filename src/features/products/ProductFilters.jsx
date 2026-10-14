import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw } from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';
import { useCatalogStore } from '../../store/useCatalogStore';

const tags = [
  { id: '', label: 'All products' },
  { id: 'Bestseller', label: 'Bestsellers' },
  { id: 'New', label: 'New arrivals' },
  { id: 'Trending', label: 'Trending' },
  { id: 'Off', label: 'On sale' },
];

export function ProductFilters() {
  const { selectedTag, setSelectedTag, resetFilters } = useFilterStore();
  const categories = useCatalogStore((s) => s.categories);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategory = searchParams.get('cat') || 'all';
  const category = requestedCategory === 'bra' ? 'Bras' : requestedCategory === 'blouse' ? 'all' : requestedCategory;

  const selectCategory = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') params.delete('cat');
    else params.set('cat', value);
    setSearchParams(params);
  };

  const clearFilters = () => {
    resetFilters();
    const params = new URLSearchParams(searchParams);
    params.delete('cat');
    setSearchParams(params);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-brand-nude/70 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-brand-nude">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-roseGold" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-charcoal">Filters</h3>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs text-brand-roseGold hover:text-brand-terracotta flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-subtle mb-2.5">Collection</h4>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-brand-cream rounded-xl border border-brand-champagne/40 text-xs">
          {[{ name: 'all', label: 'All' }, ...categories.map((item) => ({ name: item.name, label: item.name }))].map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => selectCategory(item.name)}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                category === item.name
                  ? 'bg-brand-roseGold text-white shadow-xs'
                  : 'text-brand-charcoal hover:bg-brand-nude/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-brand-nude/50">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-subtle mb-2.5">Style</h4>
        <div className="space-y-1.5 text-xs">
          {tags.map((tag) => (
            <label key={tag.id || 'all-tags'} className="flex items-center gap-2 cursor-pointer py-1 text-brand-charcoal hover:text-brand-roseGold">
              <input
                type="radio"
                name="product-tag"
                checked={selectedTag === tag.id}
                onChange={() => setSelectedTag(tag.id)}
                className="w-3.5 h-3.5 text-brand-roseGold focus:ring-brand-roseGold"
              />
              <span>{tag.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-3 bg-brand-nude/40 rounded-xl border border-brand-champagne/40 text-[11px] text-brand-subtle">
        <span className="font-semibold text-brand-charcoal block mb-0.5">🔒 Privacy First Guarantee</span>
        Every order is packed in a neutral brown box with no product descriptions on courier slips.
      </div>
    </div>
  );
}
