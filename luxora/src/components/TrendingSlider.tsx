import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Flame, ArrowRight } from 'lucide-react';
import { LUXORA_PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';
import { useStore } from '../context/StoreContext';

export const TrendingSlider: React.FC = () => {
  const { products, navigateToCategory } = useStore();
  const sliderRef = useRef<HTMLDivElement>(null);

  const sourceProducts = products && products.length > 0 ? products : LUXORA_PRODUCTS;
  const trendingProducts = sourceProducts.filter(p => p.isTrending);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="trending-section" className="py-20 sm:py-28 bg-[#0a0a0a] border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Slider Navigation Controls */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-accent uppercase tracking-[0.35em] text-[#c5a059] mb-2">
              <span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full" />
              <span>High Demand Editorials</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl uppercase font-light text-[#fdfcfb] tracking-wide">
              Trending <span className="italic font-serif text-[#c5a059]">Now</span>
            </h2>
          </div>

          {/* Desktop Slider Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white transition-all active:scale-95 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white transition-all active:scale-95 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontally Scrollable Slider */}
        <div
          ref={sliderRef}
          data-cursor="drag"
          className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory no-scrollbar"
        >
          {trendingProducts.map((product) => (
            <div
              key={product.id}
              className="min-w-[280px] sm:min-w-[320px] lg:min-w-[340px] max-w-[340px] snap-start shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View All Trending CTA */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigateToCategory('all')}
            className="text-xs font-accent uppercase tracking-[0.25em] text-white/70 hover:text-[#c5a059] transition-colors flex items-center gap-2 border-b border-white/20 hover:border-[#c5a059] pb-1 cursor-pointer"
          >
            <span>Explore All Trending Pieces</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
