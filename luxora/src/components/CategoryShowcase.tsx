import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES_DATA } from '../data/products';
import { useStore } from '../context/StoreContext';

export const CategoryShowcase: React.FC = () => {
  const { navigateToCategory } = useStore();

  return (
    <section id="categories-section" className="py-20 sm:py-28 bg-[#0a0a0a] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[10px] font-accent uppercase tracking-[0.35em] text-[#c5a059] block mb-2">
            CURATED UNIVERSES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl uppercase font-light text-[#fdfcfb] tracking-wider">
            Explore <span className="italic font-serif text-[#c5a059]">Categories</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base font-sans text-white/50 font-light">
            Tailored expressions across distinct aesthetics, crafted from the world’s finest natural fibers.
          </p>
        </div>

        {/* 4 Large Editorial Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES_DATA.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              onClick={() => navigateToCategory(cat.categoryFilter)}
              data-cursor="view"
              className="group relative h-[480px] sm:h-[520px] overflow-hidden cursor-pointer bg-[#111] border border-white/10 hover:border-[#c5a059]/60 transition-all duration-500 flex flex-col justify-end p-6 sm:p-8"
            >
              {/* Background Image with Zoom */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${cat.image})` }}
              />

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-85 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-[#c5a059]/0 group-hover:bg-[#c5a059]/10 transition-colors duration-500 pointer-events-none" />

              {/* Top Item Count Badge */}
              <div className="absolute top-5 right-5 z-10">
                <span className="text-[9.5px] font-accent uppercase tracking-widest text-white/70 bg-black/80 backdrop-blur-md px-3 py-1 border border-white/10">
                  {cat.itemCount}
                </span>
              </div>

              {/* Bottom Content Area */}
              <div className="relative z-10">
                <span className="text-[9.5px] font-accent uppercase tracking-[0.25em] text-[#c5a059] block mb-1">
                  Atelier Line
                </span>

                <h3 className="font-serif text-3xl sm:text-4xl text-[#fdfcfb] tracking-wider font-light mb-2 group-hover:text-[#c5a059] transition-colors duration-300">
                  {cat.title}
                </h3>

                <p className="text-xs text-white/60 font-sans line-clamp-2 mb-4 group-hover:text-white transition-colors">
                  {cat.tagline}
                </p>

                {/* Animated Arrow Link */}
                <div className="flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-white group-hover:text-[#c5a059] transition-colors">
                  <span>{cat.linkText}</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
