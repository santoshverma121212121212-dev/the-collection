import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, History, TrendingUp, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LUXORA_PRODUCTS, POPULAR_SEARCH_TERMS } from '../data/products';
import { Product } from '../types';

export const SearchOverlay: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    navigateToProduct,
    setQuickViewProduct
  } = useStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  // Live search filtering
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const matches = LUXORA_PRODUCTS.filter((product) => {
      const matchName = product.name.toLowerCase().includes(trimmed);
      const matchCat = product.category.toLowerCase().includes(trimmed);
      const matchDesc = product.description.toLowerCase().includes(trimmed);
      const matchSub = product.subtitle.toLowerCase().includes(trimmed);
      const matchTags = product.tags.some(tag => tag.toLowerCase().includes(trimmed));
      const matchCol = product.collection.toLowerCase().includes(trimmed);
      return matchName || matchCat || matchDesc || matchSub || matchTags || matchCol;
    });

    setResults(matches);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addSearchHistory(query.trim());
    }
  };

  const handleTermClick = (term: string) => {
    setQuery(term);
    addSearchHistory(term);
  };

  const handleSelectProduct = (product: Product) => {
    if (query.trim()) {
      addSearchHistory(query.trim());
    }
    setIsSearchOpen(false);
    navigateToProduct(product);
  };

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="search-overlay-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#0c0c0e]/98 backdrop-blur-2xl flex flex-col overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="border-b border-white/10 p-6 sm:p-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="font-display text-xl sm:text-2xl tracking-[0.25em] text-white">
              LUXORA <span className="text-[10px] font-accent uppercase text-[#c9a86a] tracking-widest pl-2">SEARCH</span>
            </span>

            <button
              id="close-search-overlay-btn"
              onClick={() => setIsSearchOpen(false)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              aria-label="Close Search"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="max-w-5xl mx-auto mt-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-7 h-7 absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a86a]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search collection, outerwear, cashmere, cargos, hoodies..."
                className="w-full pl-16 pr-12 py-5 bg-transparent border-b-2 border-[#c9a86a]/40 focus:border-[#c9a86a] text-xl sm:text-3xl font-serif text-white placeholder-white/25 focus:outline-none transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-8 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Popular Searches */}
              <div>
                <div className="flex items-center gap-2 text-xs font-accent uppercase tracking-[0.25em] text-[#c9a86a] mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span>TRENDING LUXURY SEARCHES</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {POPULAR_SEARCH_TERMS.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleTermClick(term)}
                      className="px-4 py-2.5 bg-white/5 hover:bg-[#c9a86a] hover:text-[#0c0c0e] text-white/80 hover:border-[#c9a86a] border border-white/10 text-xs font-accent tracking-wider uppercase transition-all duration-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Search History */}
              <div>
                <div className="flex items-center justify-between text-xs font-accent uppercase tracking-[0.25em] text-[#c9a86a] mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    <span>RECENT SEARCHES</span>
                  </div>
                  {searchHistory.length > 0 && (
                    <button
                      onClick={clearSearchHistory}
                      className="text-[10.5px] text-white/40 hover:text-white lowercase underline"
                    >
                      clear history
                    </button>
                  )}
                </div>

                {searchHistory.length > 0 ? (
                  <div className="space-y-2">
                    {searchHistory.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleTermClick(item)}
                        className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 text-white/90 text-sm font-sans flex items-center justify-between transition-colors border border-white/5"
                      >
                        <span>{item}</span>
                        <ArrowRight className="w-4 h-4 text-white/40" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 font-sans italic">
                    No recent searches recorded.
                  </p>
                )}
              </div>

            </div>
          ) : (
            <div>
              {/* Search Results Summary */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                <p className="text-sm font-sans text-white/70">
                  Found <strong className="text-[#c9a86a] font-serif text-base">{results.length}</strong> creations for <span className="italic text-white">"{query}"</span>
                </p>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="group p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9a86a]/50 transition-all cursor-pointer flex gap-4"
                    >
                      <img
                        src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85'}
                        alt={product.name}
                        className="w-20 h-24 object-cover object-center bg-black/40 border border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <span className="text-[9.5px] font-accent uppercase tracking-widest text-[#c9a86a] block">
                            {product.category}
                          </span>
                          <h4 className="font-serif text-base text-white group-hover:text-[#c9a86a] transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs text-white/50 font-sans line-clamp-1 mt-0.5">
                            {product.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                          <span className="font-serif text-base text-[#d8ba82] font-semibold">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-accent uppercase text-white/60 group-hover:text-[#c9a86a]">
                            Select Piece →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="font-serif text-2xl text-white/80 font-light mb-2">
                    No atelier matches found for "{query}"
                  </p>
                  <p className="text-xs text-white/50 max-w-sm mx-auto mb-6">
                    Try searching for cashmere coats, raw denim, oversized tees, hoodies, or cargo trousers.
                  </p>
                  <button
                    onClick={() => setQuery('')}
                    className="px-6 py-2.5 bg-white/10 text-white font-accent text-xs uppercase tracking-widest hover:bg-[#c9a86a] hover:text-[#0c0c0e] transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
