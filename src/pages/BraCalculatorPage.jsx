import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ruler, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { calculateBraSize } from '../utils/braSizeMath';
import { BRA_SIZE_CHART } from '../data/sizeChartData';

export function BraCalculatorPage() {
  const navigate = useNavigate();
  const [unit, setUnit] = useState('inches'); // 'inches' | 'cm'
  const [underbust, setUnderbust] = useState('31');
  const [bust, setBust] = useState('35');
  const [result, setResult] = useState(calculateBraSize(31, 35));


  const handleCalculate = (e) => {
    e.preventDefault();
    let u = parseFloat(underbust);
    let b = parseFloat(bust);
    if (unit === 'cm') {
      u = u / 2.54;
      b = b / 2.54;
    }
    const calc = calculateBraSize(u, b);
    setResult(calc);
  };

  const handleShopResult = () => {
    if (result) {
      navigate('/shop?cat=Bras');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
          <Ruler className="w-3.5 h-3.5 text-brand-roseGold" />
          <span>Interactive Bra Fitting Room</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-brand-charcoal">
          Calculate Your Exact Bra Size in 30 Seconds
        </h1>
        <p className="text-xs sm:text-sm text-brand-subtle leading-relaxed">
          Say goodbye to riding-up bands, strap indentations, and wire poking. Measure yourself with an ordinary tailor tape and uncover your true silhouette.
        </p>
      </div>

      {/* Two Column Calculator: Steps & Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: How to Measure & Inputs */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-brand-nude/80 shadow-soft space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-brand-nude">
            <h2 className="font-serif text-lg font-bold text-brand-charcoal">
              Your Measurements
            </h2>
            <div className="flex items-center gap-1 bg-brand-cream p-1 rounded-xl border border-brand-nude text-xs">
              <button
                type="button"
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  unit === 'inches' ? 'bg-brand-roseGold text-white shadow-xs' : 'text-brand-charcoal'
                }`}
              >
                Inches
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  unit === 'cm' ? 'bg-brand-roseGold text-white shadow-xs' : 'text-brand-charcoal'
                }`}
              >
                Centimeters
              </button>
            </div>
          </div>

          <form onSubmit={handleCalculate} className="space-y-6">
            
            {/* Step 1 Underbust */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                  Step 1: Snug Underbust (Ribcage)
                </label>
                <span className="text-[11px] text-brand-roseGold font-semibold">Around the ribcage</span>
              </div>
              <p className="text-xs text-brand-subtle">
                Wrap the tape snugly directly beneath your bust where the elastic band sits. Keep tape parallel.
              </p>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={underbust}
                  onChange={(e) => setUnderbust(e.target.value)}
                  placeholder={unit === 'inches' ? 'e.g. 31' : 'e.g. 78'}
                  className="w-full px-4 py-3 bg-brand-cream border border-brand-nude rounded-xl text-base font-semibold text-brand-charcoal focus:ring-1 focus:ring-brand-roseGold focus:outline-none"
                  required
                />
                <span className="absolute right-4 top-3.5 text-xs text-brand-subtle font-semibold">
                  {unit}
                </span>
              </div>
            </div>

            {/* Step 2 Fullest Bust */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                  Step 2: Fullest Bust (Apex)
                </label>
                <span className="text-[11px] text-brand-roseGold font-semibold">Over the nipples</span>
              </div>
              <p className="text-xs text-brand-subtle">
                Wrap the tape comfortably around the fullest projection of your bust without depressing tissue.
              </p>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={bust}
                  onChange={(e) => setBust(e.target.value)}
                  placeholder={unit === 'inches' ? 'e.g. 35' : 'e.g. 89'}
                  className="w-full px-4 py-3 bg-brand-cream border border-brand-nude rounded-xl text-base font-semibold text-brand-charcoal focus:ring-1 focus:ring-brand-roseGold focus:outline-none"
                  required
                />
                <span className="absolute right-4 top-3.5 text-xs text-brand-subtle font-semibold">
                  {unit}
                </span>
              </div>
            </div>

            <Button type="submit" variant="luxury" size="lg" fullWidth>
              Calculate My True Bra Size
            </Button>
          </form>

        </div>

        {/* Right: Results Display Card */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-gradient-to-b from-brand-nude/70 to-brand-cream p-8 rounded-3xl border border-brand-champagne/80 shadow-soft text-center space-y-5 animate-in fade-in">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-roseGold mx-auto shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-roseGold">
                  Your Perfect Fit Is
                </span>
                <div className="text-5xl font-serif font-bold text-brand-velvet mt-1">
                  {result.fullSize}
                </div>
                <p className="text-xs text-brand-subtle mt-1.5 font-medium">
                  Band Size: <strong>{result.bandSize}</strong> • Cup Volume: <strong>{result.cupLetter}</strong>
                </p>
                <p className="text-[11px] text-brand-subtle mt-2">
                  The current catalog does not publish size-specific stock; use this result as a fitting guide.
                </p>
              </div>

              {/* Sister Sizes */}
              <div className="p-4 bg-white/80 rounded-2xl border border-brand-nude text-xs text-left space-y-2">
                <span className="font-semibold text-brand-charcoal block">
                  💡 Sister Sizing Guide:
                </span>
                <p className="text-[11px] text-brand-subtle leading-relaxed">
                  Bra cups share equal volume across sister sizes. If your band feels snug or loose, try:
                </p>
                <div className="flex gap-2 pt-1">
                  {result.sisterTight && (
                    <div className="flex-1 bg-brand-cream p-2 rounded-lg border border-brand-nude text-center">
                      <span className="text-[10px] text-brand-subtle block">Tighter Band:</span>
                      <strong className="text-xs text-brand-charcoal">{result.sisterTight}</strong>
                    </div>
                  )}
                  {result.sisterLoose && (
                    <div className="flex-1 bg-brand-cream p-2 rounded-lg border border-brand-nude text-center">
                      <span className="text-[10px] text-brand-subtle block">Looser Band:</span>
                      <strong className="text-xs text-brand-charcoal">{result.sisterLoose}</strong>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="luxury"
                size="lg"
                fullWidth
                onClick={handleShopResult}
              >
                Browse Bras
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-brand-nude text-center space-y-3">
              <p className="text-xs text-brand-subtle">Enter your measurements to view your calculated size.</p>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-4 bg-white rounded-2xl border border-brand-nude/70 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-brand-subtle leading-relaxed">
              <strong>Complete Discretion:</strong> All measurements remain private on your device. Every bra you purchase is delivered in plain unbranded protective packaging.
            </p>
          </div>
        </div>

      </div>

      {/* Reference Conversion Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-nude/70 space-y-4">
        <h3 className="font-serif text-xl font-bold text-brand-charcoal">
          International Band Measurement Reference
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-charcoal">
            <thead className="bg-brand-cream border-b border-brand-nude uppercase tracking-wider font-semibold text-[10px] text-brand-subtle">
              <tr>
                <th className="p-3">Band Size</th>
                <th className="p-3">Snug Underbust (Inches)</th>
                <th className="p-3">Snug Underbust (cm)</th>
                <th className="p-3">Sister Size Tight</th>
                <th className="p-3">Sister Size Loose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-nude/60">
              {BRA_SIZE_CHART.map((row) => (
                <tr key={row.band} className="hover:bg-brand-cream/50 transition-colors">
                  <td className="p-3 font-bold text-brand-roseGold">{row.band}</td>
                  <td className="p-3">{row.underbustInches}</td>
                  <td className="p-3">{row.underbustCm}</td>
                  <td className="p-3">{row.sisterTight}</td>
                  <td className="p-3">{row.sisterLoose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
