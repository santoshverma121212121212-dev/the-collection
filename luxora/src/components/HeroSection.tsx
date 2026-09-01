import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowUpRight, Sparkles, Play } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroSection: React.FC = () => {
  const { navigateToCategory } = useStore();
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 800], [0, 180]);
  const opacityParallax = useTransform(scrollY, [0, 600], [1, 0.2]);

  // Slideshow images for ultra-luxurious visual interest
  const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=90',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=90',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2000&q=90'
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [HERO_IMAGES.length]);

  const scrollToNewArrivals = () => {
    const section = document.getElementById('new-arrivals-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero-cinematic-section"
      className="relative min-h-[92vh] sm:min-h-[94vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a]"
    >
      {/* Decorative Editorial Side Marker */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[9px] tracking-[0.6em] text-white/20 uppercase font-light pointer-events-none select-none z-20">
        EST. TWENTY TWENTY-SIX &bull; LUXORA ATELIER
      </div>

      {/* Decorative Right Marker */}
      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 rotate-90 origin-right text-[9px] tracking-[0.6em] text-white/20 uppercase font-light pointer-events-none select-none z-20">
        HAUTE COUTURE &bull; VOLUME IV
      </div>

      {/* Background Image Carousel with Parallax & Cinematic Vignette */}
      <motion.div 
        style={{ y: yParallax, opacity: opacityParallax }}
        className="absolute inset-0 z-0 scale-105 pointer-events-none"
      >
        {HERO_IMAGES.map((img, idx) => (
          <motion.div
            key={img}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: activeSlide === idx ? 0.65 : 0,
              scale: activeSlide === idx ? 1.04 : 1.12
            }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        {/* Deep Atmospheric Gradients & Artistic Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]/75" />
        <div className="absolute inset-0 artistic-radial-glow opacity-80" />
      </motion.div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-20 flex flex-col items-center">
        
        {/* Artistic Runway Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-4"
        >
          <span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full" />
          <span className="text-xs uppercase tracking-[0.4em] font-medium text-[#c5a059]">
            Autumn / Winter 2026
          </span>
          <span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full" />
        </motion.div>

        {/* Main Headline with Artistic Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[96px] tracking-tight font-normal uppercase text-[#fdfcfb] leading-[0.92] max-w-4xl"
        >
          Define <br />
          Your <br />
          <span className="italic font-serif text-[#c5a059] font-light">Style.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 text-sm sm:text-base md:text-lg font-sans text-white/50 font-light tracking-wide max-w-lg leading-relaxed"
        >
          Contemporary luxury tailored for those who move differently. Architectural drape, pure organic fibers, and uncompromising craft.
        </motion.p>

        {/* Action Buttons with High-Contrast Artistic Flair */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
        >
          {/* SHOP MEN */}
          <button
            id="hero-shop-men-btn"
            onClick={() => navigateToCategory('men')}
            className="w-full sm:w-auto px-10 py-4 bg-[#c5a059] text-black font-accent font-bold text-xs tracking-[0.22em] uppercase hover:bg-white hover:text-black active:scale-[0.98] transition-all duration-300 shadow-2xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>SHOP MEN</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {/* SHOP WOMEN */}
          <button
            id="hero-shop-women-btn"
            onClick={() => navigateToCategory('women')}
            className="w-full sm:w-auto px-10 py-4 bg-transparent hover:bg-white text-white hover:text-black border border-white/20 hover:border-white font-accent font-bold text-xs tracking-[0.22em] uppercase active:scale-[0.98] transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>SHOP WOMEN</span>
            <ArrowUpRight className="w-4 h-4 text-white/60 group-hover:text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </motion.div>

        {/* Slide Indicator Dots */}
        <div className="mt-12 flex items-center gap-2.5">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                activeSlide === idx ? 'w-8 bg-[#c5a059]' : 'w-2 bg-white/20 hover:bg-white/50'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer group"
        onClick={scrollToNewArrivals}
      >
        <span className="text-[9px] font-accent uppercase tracking-[0.4em] text-white/40 group-hover:text-[#c5a059] transition-colors">
          SCROLL TO EXPLORE
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-9 rounded-full border border-white/20 flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 bg-[#c5a059] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};
