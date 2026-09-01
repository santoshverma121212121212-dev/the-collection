import React from 'react';
import { motion } from 'motion/react';
import { Scissors, ShieldCheck, Sparkles, RefreshCw, Box } from 'lucide-react';

const VALUES = [
  {
    icon: Scissors,
    title: 'HAUTE TAILORING',
    desc: 'Patterned with architectural precision and finished by master craftspersons in limited runs.'
  },
  {
    icon: ShieldCheck,
    title: 'ETHICAL RAW FIBERS',
    desc: 'Uncompromising standard of Californian Supima, Mongolian Cashmere, and Kojima Selvedge denim.'
  },
  {
    icon: Box,
    title: 'WHITE-GLOVE LOGISTICS',
    desc: 'Complimentary insured shipping in signature matte wooden boxes and breathable garment bags.'
  },
  {
    icon: RefreshCw,
    title: 'BESPOKE CONCIERGE & RETURNS',
    desc: 'Complimentary 15-day exchanges, sizing alterations voucher, and dedicated private stylist concierge.'
  }
];

export const BrandValues: React.FC = () => {
  return (
    <section className="py-16 bg-[#0a0a0a] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES.map((val, idx) => {
            const IconComponent = val.icon;
            return (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center sm:items-start text-center sm:text-left p-4 border-l-0 sm:border-l border-white/10 first:border-l-0"
              >
                <div className="w-11 h-11 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] mb-4">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h4 className="font-accent text-xs tracking-[0.2em] uppercase text-white font-bold mb-1.5">
                  {val.title}
                </h4>
                <p className="text-xs font-sans text-white/50 leading-relaxed font-light">
                  {val.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
