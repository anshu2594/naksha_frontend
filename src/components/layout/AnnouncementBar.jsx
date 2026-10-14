import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ANNOUNCEMENTS = [
  {
    icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
    text: '100% Discreet Packaging — Plain Box, Zero External Product Labels',
  },
  {
    icon: <Truck className="w-3.5 h-3.5 text-amber-300" />,
    text: 'Free Shipping on Orders Above ₹999',
  },
  {
    icon: <Sparkles className="w-3.5 h-3.5 text-rose-300" />,
    text: 'Not sure of your size? Try our 30-Second Bra Fit Calculator',
    link: '/bra-size-calculator',
    linkText: 'Check Size',
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = ANNOUNCEMENTS[currentIndex];

  return (
    <div className="bg-brand-charcoal text-brand-nude py-2 px-4 text-xs font-medium tracking-wide transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <span>{current.icon}</span>
        <span className="truncate">{current.text}</span>
        {current.link && (
          <Link
            to={current.link}
            className="inline-flex items-center text-rose-300 hover:text-white underline ml-1 font-semibold group"
          >
            {current.linkText}
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
