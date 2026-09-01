import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const EditorialBanner: React.FC = () => {
  const { navigateToCategory } = useStore();

  return (
    <section className="py-24 sm:py-32 bg-[#0a0a0a] relative overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Large Editorial Photo with Floating Badge */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative"
          >
            <div className="relative aspect-[4/5] sm:aspect-[16/11] overflow-hidden border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85"
                alt="Luxury Fashion Editorial"
                className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Bottom Quote Overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-4 luxury-glass border border-white/10 max-w-md hidden sm:block">
                <span className="text-[9.5px] font-accent uppercase tracking-widest text-[#c5a059] block mb-1">
                  Atelier Manifesto / Volume IV
                </span>
                <p className="text-xs text-white/90 font-serif italic">
                  “Clothing that moves with gravity, tailored with the precision of fine architecture.”
                </p>
              </div>
            </div>

            {/* Subtle floating gold seal */}
            <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full border border-[#c5a059]/40 bg-[#0a0a0a]/95 backdrop-blur-md p-3 hidden md:flex flex-col items-center justify-center text-center shadow-2xl">
              <Sparkles className="w-4 h-4 text-[#c5a059] mb-1" />
              <span className="text-[8.5px] font-accent uppercase tracking-widest text-white/80">
                100% PURE FIBERS
              </span>
            </div>
          </motion.div>

          {/* Right Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-[0.3em] text-[#c5a059] mb-4">
              <Compass className="w-3.5 h-3.5" />
              <span>THE DESIGN PHILOSOPHY</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-5xl uppercase font-light text-[#fdfcfb] tracking-wide leading-tight">
              The Art of <br />
              <span className="italic font-serif text-[#c5a059]">Movement</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg font-sans text-white/75 font-light leading-relaxed">
              “Designed with intention. Built for movement. Made to become part of your signature.”
            </p>

            <p className="mt-4 text-sm font-sans text-white/50 leading-relaxed font-light">
              Every LUXORA garment is cut with anatomical precision and hand-finished by master tailors. From 680 GSM Italian virgin wool overcoats to 300 GSM combed California Supima jerseys, we eliminate fast-fashion compromise in favor of enduring sartorial permanence.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                id="explore-editorial-collection-btn"
                onClick={() => navigateToCategory('all')}
                className="px-8 py-4 bg-[#c5a059] text-black font-accent font-bold text-xs tracking-[0.22em] uppercase hover:bg-white hover:text-black active:scale-[0.98] transition-all shadow-xl inline-flex items-center gap-2.5 group cursor-pointer"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigateToCategory('unisex')}
                className="px-6 py-4 text-white/70 hover:text-white font-accent text-xs tracking-[0.2em] uppercase transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Lookbook</span>
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
