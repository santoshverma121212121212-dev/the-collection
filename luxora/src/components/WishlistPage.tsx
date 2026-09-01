import React from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowRight, Sparkles, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlist, clearWishlist, setCurrentView } = useStore();

  return (
    <div id="wishlist-curation-page" className="min-h-screen bg-[#0a0a0c] pt-8 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="py-8 sm:py-12 border-b border-white/10 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-accent uppercase tracking-[0.3em] text-[#c5a059] block mb-2">
              CURATED PRIVATE SELECTIONS
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl uppercase font-light tracking-wide text-white">
              Your <span className="italic font-serif text-[#c5a059]">Wishlist</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm font-sans text-white/60">
              Personalized curation of pieces saved for your wardrobe.
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={clearWishlist}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-[#ff6b6b] border border-white/10 text-xs font-accent uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {wishlist.length === 0 ? (
          <div className="py-24 text-center border border-white/10 p-8 bg-[#111114] max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c5a059] mx-auto mb-4">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-light mb-2">
              Your wishlist is pristine
            </h3>
            <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto mb-8 font-sans leading-relaxed">
              Explore our current runway collection and tap the heart icon on any piece to save it to your private salon curation.
            </p>
            <button
              onClick={() => setCurrentView('shop')}
              className="px-8 py-3.5 bg-[#c5a059] text-[#0c0c0e] font-accent text-xs tracking-widest uppercase font-bold hover:bg-[#dfc38a] transition-all cursor-pointer"
            >
              DISCOVER RUNWAY PIECES
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <ProductCard key={item.productId} product={item.product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
