import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LUXORA_PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';
import { useStore } from '../context/StoreContext';

const FILTER_TABS = [
  { label: 'ALL ATELIER', value: 'all' },
  { label: 'JACKETS & COATS', value: 'Jackets' },
  { label: 'OVERSIZED TEES', value: 'Oversized T-Shirts' },
  { label: 'HOODIES', value: 'Hoodies' },
  { label: 'CARGOS & TROUSERS', value: 'Cargo Pants' },
  { label: 'ACCESSORIES', value: 'Accessories' }
];

export const NewArrivals: React.FC = () => {
  const { products, navigateToCategory } = useStore();
  const [activeTab, setActiveTab] = useState('all');

  const sourceProducts = products && products.length > 0 ? products : LUXORA_PRODUCTS;

  const filteredProducts = activeTab === 'all'
    ? sourceProducts.slice(0, 8)
    : sourceProducts.filter(p => p.category === activeTab).slice(0, 8);

  return (
    <section id="new-arrivals-section" className="py-20 sm:py-28 bg-[#0a0a0a] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-accent uppercase tracking-[0.35em] text-[#c5a059] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autumn / Winter 2026</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider font-light text-[#fdfcfb]">
              New <span className="italic font-serif text-[#c5a059]">Arrivals</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base font-sans text-white/50 font-light max-w-xl">
              Fresh from the atelier. Sculptural cuts, architectural tailoring, and tactile pure fibers for the discerning collector.
            </p>
          </div>

          {/* View All Button */}
          <button
            id="view-all-new-arrivals-btn"
            onClick={() => navigateToCategory('new')}
            className="inline-flex items-center gap-2 text-xs font-accent tracking-[0.2em] uppercase text-[#c5a059] hover:text-white transition-colors group pb-1 border-b border-[#c5a059]/40 hover:border-white self-start md:self-auto cursor-pointer"
          >
            <span>Explore All 2026 Pieces</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2 text-xs font-accent uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.value
                  ? 'bg-[#c5a059] text-black font-bold shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner Prompt */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigateToCategory('all')}
            className="px-10 py-4 bg-transparent border border-white/20 hover:border-white text-white hover:text-white font-accent text-xs tracking-[0.25em] uppercase transition-all duration-300 inline-flex items-center gap-3 group cursor-pointer"
          >
            <span>BROWSE ALL {LUXORA_PRODUCTS.length} ATELIER CREATIONS</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};
