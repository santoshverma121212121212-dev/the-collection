import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Layers } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LUXORA_PRODUCTS } from '../data/products';

export const FeaturedCollection: React.FC = () => {
  const { products, navigateToCategory, navigateToProduct } = useStore();

  const heroItem = products.find(p => p.id === 'LX001') || products[0] || LUXORA_PRODUCTS[0];
  const sideItem1 = products.find(p => p.id === 'LX006') || products[1] || LUXORA_PRODUCTS[1] || heroItem;
  const sideItem2 = products.find(p => p.id === 'LX004') || products[2] || LUXORA_PRODUCTS[2] || sideItem1;

  const heroImage = heroItem?.images?.[0] || heroItem?.image || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85';
  const side1Image = sideItem1?.images?.[0] || sideItem1?.image || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85';
  const side2Image = sideItem2?.images?.[0] || sideItem2?.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85';

  if (!heroItem) return null;

  return (
    <section id="featured-collection-section" className="py-20 sm:py-28 bg-[#0a0a0a] border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-[0.25em] text-[#c5a059] mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>RUNWAY ATELIER SPOTLIGHT</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl uppercase font-light text-[#fdfcfb] tracking-wider">
              LUXORA <span className="italic font-serif text-[#c5a059]">Autumn / Winter 2026</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base font-sans text-white/50 font-light max-w-xl">
              An exploration of tactile warmth, monastic brutalism, and fluid draping against sharp tailoring.
            </p>
          </div>

          <button
            id="shop-aw26-btn"
            onClick={() => navigateToCategory('all')}
            className="px-8 py-3.5 bg-[#c5a059] hover:bg-white text-black font-accent text-xs font-bold tracking-[0.2em] uppercase inline-flex items-center gap-2 self-start md:self-auto group cursor-pointer transition-all duration-300 shadow-xl"
          >
            <span>SHOP COMPLETE COLLECTION</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Asymmetric Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Large Showcase Image (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            onClick={() => heroItem && navigateToProduct(heroItem)}
            data-cursor="view"
            className="lg:col-span-7 relative h-[520px] sm:h-[620px] overflow-hidden border border-white/10 group cursor-pointer bg-[#111] flex flex-col justify-between p-6 sm:p-10"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 group-hover:opacity-85 transition-opacity" />

            {/* Top Badge */}
            <div className="relative z-10 flex justify-between items-start">
              <span className="bg-[#c5a059] text-black font-accent text-[9.5px] font-bold tracking-widest px-3 py-1 uppercase shadow-md">
                RUNWAY HERO LOOK 01
              </span>
              <span className="text-xs font-serif text-white/80 bg-black/70 backdrop-blur-md px-3 py-1 border border-white/10">
                100% Cashmere & Wool
              </span>
            </div>

            {/* Bottom Card Content */}
            <div className="relative z-10 max-w-lg">
              <span className="text-[10px] font-accent uppercase tracking-widest text-[#c5a059] block mb-1">
                {heroItem.subtitle}
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl text-[#fdfcfb] font-medium mb-2 group-hover:text-[#c5a059] transition-colors">
                {heroItem.name}
              </h3>
              <div className="flex items-center gap-4 mt-3">
                <span className="font-serif text-2xl text-[#fdfcfb] font-bold">
                  ₹{heroItem.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-accent uppercase tracking-wider text-white underline underline-offset-4 group-hover:text-[#c5a059] transition-colors">
                  View Runway Details →
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Supporting Asymmetric Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Supporting Card 1 */}
            {sideItem1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                onClick={() => navigateToProduct(sideItem1)}
                data-cursor="view"
                className="relative h-[250px] sm:h-[295px] overflow-hidden border border-white/10 group cursor-pointer bg-[#111] p-6 flex flex-col justify-between"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url(${side1Image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:opacity-85 transition-opacity" />

                <div className="relative z-10 flex justify-between">
                  <span className="text-[9px] font-accent uppercase tracking-widest text-white/80 bg-black/70 backdrop-blur-md px-2.5 py-0.5 border border-white/10">
                    LOOK 02 / SILK TAILORING
                  </span>
                </div>

                <div className="relative z-10">
                  <h4 className="font-serif text-xl sm:text-2xl text-[#fdfcfb] font-medium group-hover:text-[#c5a059] transition-colors">
                    {sideItem1.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-serif text-lg text-[#fdfcfb] font-semibold">
                      ₹{sideItem1.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10.5px] font-accent uppercase tracking-wider text-white/80 group-hover:text-[#c5a059]">
                      Explore Piece →
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Supporting Card 2 */}
            {sideItem2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                onClick={() => navigateToProduct(sideItem2)}
                data-cursor="view"
                className="relative h-[250px] sm:h-[295px] overflow-hidden border border-white/10 group cursor-pointer bg-[#111] p-6 flex flex-col justify-between"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url(${side2Image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:opacity-85 transition-opacity" />

                <div className="relative z-10 flex justify-between">
                  <span className="text-[9px] font-accent uppercase tracking-widest text-white/80 bg-black/70 backdrop-blur-md px-2.5 py-0.5 border border-white/10">
                    LOOK 03 / MERINO SHEARLING
                  </span>
                </div>

                <div className="relative z-10">
                  <h4 className="font-serif text-xl sm:text-2xl text-[#fdfcfb] font-medium group-hover:text-[#c5a059] transition-colors">
                    {sideItem2.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-serif text-lg text-[#fdfcfb] font-semibold">
                      ₹{sideItem2.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10.5px] font-accent uppercase tracking-wider text-white/80 group-hover:text-[#c5a059]">
                      Explore Piece →
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};
