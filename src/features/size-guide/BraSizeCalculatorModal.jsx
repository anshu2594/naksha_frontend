import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { calculateBraSize } from '../../utils/braSizeMath';

export function BraSizeCalculatorModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [unit, setUnit] = useState('inches'); // 'inches' | 'cm'
  const [underbust, setUnderbust] = useState('');
  const [bust, setBust] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');


  const handleCalculate = (e) => {
    e.preventDefault();
    setError('');

    let uInches = parseFloat(underbust);
    let bInches = parseFloat(bust);

    if (unit === 'cm') {
      uInches = uInches / 2.54;
      bInches = bInches / 2.54;
    }

    if (!uInches || !bInches) {
      setError('Please enter both Underbust and Bust measurements.');
      return;
    }

    if (bInches <= uInches) {
      setError('Fullest Bust measurement must be larger than Underbust.');
      return;
    }

    const calculated = calculateBraSize(uInches, bInches);
    if (calculated) {
      setResult(calculated);
    } else {
      setError('Unable to calculate size with the provided measurements.');
    }
  };

  const handleApplySizeAndShop = () => {
    if (result) {
      onClose();
      navigate('/shop?cat=Bras');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="30-Second Bra Size Finder"
      subtitle="Find your true band and cup size to eliminate underwire pinch and strap slippage."
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        
        {/* Unit Selector */}
        <div className="flex items-center justify-between p-1 bg-brand-cream rounded-xl border border-brand-nude text-xs">
          <span className="text-brand-subtle px-3 font-medium">Measurement Unit:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                unit === 'inches' ? 'bg-brand-roseGold text-white shadow-xs' : 'text-brand-charcoal hover:bg-brand-nude/40'
              }`}
            >
              Inches (in)
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                unit === 'cm' ? 'bg-brand-roseGold text-white shadow-xs' : 'text-brand-charcoal hover:bg-brand-nude/40'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
              Step 1: Underbust (Ribcage)
            </label>
            <p className="text-[11px] text-brand-subtle mb-1.5">
              Measure snug directly under your breasts where your bra band rests.
            </p>
            <input
              type="number"
              step="0.5"
              placeholder={unit === 'inches' ? 'e.g. 30.5' : 'e.g. 77'}
              value={underbust}
              onChange={(e) => setUnderbust(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-brand-nude rounded-xl text-sm text-brand-charcoal focus:ring-1 focus:ring-brand-roseGold focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
              Step 2: Fullest Bust (Apex)
            </label>
            <p className="text-[11px] text-brand-subtle mb-1.5">
              Measure loosely around the fullest part of your bust without pulling tight.
            </p>
            <input
              type="number"
              step="0.5"
              placeholder={unit === 'inches' ? 'e.g. 35' : 'e.g. 89'}
              value={bust}
              onChange={(e) => setBust(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-brand-nude rounded-xl text-sm text-brand-charcoal focus:ring-1 focus:ring-brand-roseGold focus:outline-none"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          <Button type="submit" variant="luxury" fullWidth size="md">
            Calculate My Size
          </Button>
        </form>

        {/* Result Area */}
        {result && (
          <div className="bg-brand-cream/80 p-5 rounded-2xl border border-brand-champagne/60 space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-brand-roseGold font-bold">
                Your Recommended Size
              </span>
              <div className="text-4xl font-serif font-bold text-brand-charcoal mt-1 text-brand-velvet">
                {result.fullSize}
              </div>
              <p className="text-xs text-brand-subtle mt-1">
                Band: <strong>{result.bandSize}</strong> • Cup: <strong>{result.cupLetter}</strong>
              </p>
              <p className="text-[11px] text-brand-subtle mt-2">
                The current catalog does not publish size-specific stock; use this result as a fitting guide.
              </p>
            </div>

            {/* Sister Sizes */}
            {(result.sisterTight || result.sisterLoose) && (
              <div className="pt-3 border-t border-brand-nude text-xs">
                <span className="font-semibold text-brand-charcoal block mb-1">
                  💡 Sister Sizes (Alternative Fits):
                </span>
                <div className="flex gap-2">
                  {result.sisterTight && (
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-brand-nude text-brand-charcoal">
                      Tight Snug Fit: <strong>{result.sisterTight}</strong>
                    </span>
                  )}
                  {result.sisterLoose && (
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-brand-nude text-brand-charcoal">
                      Relaxed Lounge Fit: <strong>{result.sisterLoose}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={handleApplySizeAndShop}
              className="mt-2"
            >
              Browse Bras
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

      </div>
    </Modal>
  );
}
