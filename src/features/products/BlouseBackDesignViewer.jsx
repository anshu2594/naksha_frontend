import React from 'react';
import { Eye, Sparkles } from 'lucide-react';

export function BlouseBackDesignViewer({
  frontImage: _frontImage,
  backImage: _backImage,
  activeView, // 'front' | 'back'
  onToggleView,
  backDesignTitle,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-charcoal flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-brand-roseGold" />
          Interactive Angle View:
        </span>
        {backDesignTitle && (
          <span className="text-[11px] text-brand-roseGold font-medium truncate max-w-[200px]">
            {backDesignTitle}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onToggleView('front')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
            activeView === 'front'
              ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-xs'
              : 'bg-white text-brand-charcoal border-brand-nude hover:border-brand-roseGold/60'
          }`}
        >
          Front Neckline
        </button>

        <button
          type="button"
          onClick={() => onToggleView('back')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
            activeView === 'back'
              ? 'bg-brand-roseGold text-white border-brand-roseGold shadow-xs'
              : 'bg-white text-brand-charcoal border-brand-nude hover:border-brand-roseGold/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Back & Dori Design
        </button>
      </div>
    </div>
  );
}
