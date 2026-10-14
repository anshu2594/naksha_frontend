import React from 'react';
import { CreditCard, Banknote, Smartphone, ShieldCheck } from 'lucide-react';

export function PaymentSelector({ selectedMethod, onSelectMethod }) {
  const methods = [
    {
      id: 'upi',
      name: 'UPI Instant Payment',
      desc: 'Google Pay, PhonePe, Paytm, BHIM UPI · Razorpay sandbox',
      icon: <Smartphone className="w-5 h-5 text-emerald-600" />,
      badge: 'Sandbox',
    },
    {
      id: 'card',
      name: 'Credit / Debit Card',
      desc: 'Visa, MasterCard, RuPay · Razorpay sandbox checkout',
      icon: <CreditCard className="w-5 h-5 text-brand-roseGold" />,
    },
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      desc: 'Pay safely with cash or QR scanner at your doorstep',
      icon: <Banknote className="w-5 h-5 text-amber-600" />,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-nude/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-brand-nude/60 pb-3">
        <h3 className="font-serif text-lg font-semibold text-brand-charcoal">
          Payment Method
        </h3>
        <span className="text-[11px] text-brand-subtle font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Payment preference
        </span>
      </div>

      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <label
              key={method.id}
              className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-brand-roseGold bg-rose-50/40 shadow-xs ring-1 ring-brand-roseGold'
                  : 'border-brand-nude/80 bg-white hover:bg-brand-cream/50'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={isSelected}
                onChange={() => onSelectMethod(method.id)}
                className="w-4 h-4 mt-1 text-brand-roseGold focus:ring-brand-roseGold"
              />
              <div className="p-2 bg-brand-cream rounded-lg shrink-0">
                {method.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-brand-charcoal">
                    {method.name}
                  </span>
                  {method.badge && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {method.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-subtle mt-0.5">{method.desc}</p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="text-[11px] text-brand-subtle bg-brand-cream p-3 rounded-xl border border-brand-nude/50">
        UPI and card payments are processed in the Razorpay sandbox. No card details are handled or stored by Naksha. Cash on Delivery is recorded with your order.
      </div>
    </div>
  );
}
